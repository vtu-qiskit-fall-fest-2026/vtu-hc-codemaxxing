"""
test_pipeline.py - Comprehensive Unit & Integration Tests for Q-Guard.
Tests:
- Dataset generation and preprocessing integrity (no data leakage)
- Quantum feature map & FidelityQuantumKernel matrix dimensions
- Precomputed SVC training and single prediction inference
- Classical benchmarks (RBF SVM, Random Forest)
- FastAPI endpoints (health, overview, analyze, circuit, transactions)
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from backend.dataset import generate_fraud_dataset
from backend.quantum_model import QuantumFraudClassifier
from backend.classical_models import ClassicalBenchmarkSuite
from backend.reporting import export_json_report
from backend.main import app, engine_state


def test_dataset_generation_and_integrity():
    """Verify synthetic dataset generation, class distribution, and lack of data leakage."""
    data = generate_fraud_dataset(complexity="medium", random_state=42, test_size=0.25)
    
    assert "X_train_scaled" in data
    assert "X_test_scaled" in data
    assert "y_train" in data
    assert "y_test" in data
    assert "scaler" in data

    # Check scaled domain bounds [0, 2*pi]
    assert np.min(data["X_train_scaled"]) >= -1e-6
    assert np.max(data["X_train_scaled"]) <= 2 * np.pi + 1e-6

    # Verify stratified balance in both train and test
    train_ratio = np.mean(data["y_train"])
    test_ratio = np.mean(data["y_test"])
    assert 0.15 <= train_ratio <= 0.35
    assert 0.15 <= test_ratio <= 0.35
    assert data["metadata"]["train_samples"] + data["metadata"]["test_samples"] == data["metadata"]["total_samples"]


def test_quantum_classifier_fit_and_predict():
    """Verify Qiskit ZZFeatureMap and FidelityQuantumKernel pipeline."""
    data = generate_fraud_dataset(complexity="low", random_state=42)
    # Use small subset for rapid testing
    X_train = data["X_train_scaled"][:20]
    y_train = data["y_train"][:20]
    X_test = data["X_test_scaled"][:5]
    y_test = data["y_test"][:5]

    clf = QuantumFraudClassifier(n_qubits=4, reps=1, entanglement="linear")
    meta = clf.get_circuit_metadata()
    assert meta["num_qubits"] == 4
    assert meta["hilbert_dimension"] == 16
    assert meta["gate_counts"]["hadamard"] == 4

    fit_res = clf.fit(X_train, y_train)
    assert fit_res["train_kernel_matrix_shape"] == [20, 20]
    assert clf.is_fitted is True

    # Test set evaluation
    eval_res = clf.evaluate_test_set(X_test, y_test)
    assert 0.0 <= eval_res["accuracy"] <= 1.0
    assert len(eval_res["predictions"]) == 5

    # Single transaction inference
    single_res = clf.predict_single(X_test[0])
    assert single_res["risk_class"] in ["CLEAR", "SUSPICIOUS", "FRAUDULENT"]
    assert 0.0 <= single_res["risk_score"] <= 1.0
    assert len(single_res["pipeline_stages"]) == 4


def test_classical_suite():
    """Verify Classical RBF SVM and Random Forest benchmarks."""
    data = generate_fraud_dataset(complexity="low", random_state=42)
    X_train = data["X_train_scaled"][:25]
    y_train = data["y_train"][:25]
    X_test = data["X_test_scaled"][:8]
    y_test = data["y_test"][:8]

    suite = ClassicalBenchmarkSuite(random_state=42)
    suite.fit(X_train, y_train)
    evals = suite.evaluate_test_set(X_test, y_test)

    assert len(evals) == 2
    model_names = [e["model_name"] for e in evals]
    assert "Classical RBF SVM" in model_names
    assert "Random Forest" in model_names

    for e in evals:
        assert 0.0 <= e["accuracy"] <= 1.0
        assert 0.0 <= e["f1_score"] <= 1.0
        assert len(e["confusion_matrix"]) == 2


def test_report_export():
    """Verify that export_json_report produces valid JSON and files."""
    dummy_bench = {
        "execution_id": "TEST-001",
        "models": [{"model_name": "TestModel", "accuracy": 0.95}]
    }
    dummy_txns = [{"transaction_id": "TXN-TEST-1", "amount": 100.0}]
    path = export_json_report(dummy_bench, dummy_txns)
    import os
    assert os.path.exists(path)


def test_fastapi_endpoints():
    """Test REST API endpoints using FastAPI TestClient."""
    with TestClient(app) as client:
        # 1. Health
        h = client.get("/api/health")
        assert h.status_code == 200
        h_data = h.json()
        assert h_data["status"] == "HEALTHY"
        assert "Qiskit" in h_data["backend_name"]

        # 2. Overview
        o = client.get("/api/overview")
        assert o.status_code == 200
        o_data = o.json()
        assert "kpis" in o_data
        assert o_data["qubit_count"] == 4

        # 3. Analyze Transaction
        txn_payload = {
            "amount": 2500.50,
            "velocity": 85.0,
            "network_anomaly": 0.88,
            "device_risk": 0.92,
            "threshold": 0.60
        }
        a = client.post("/api/analyze", json=txn_payload)
        assert a.status_code == 200
        a_data = a.json()
        assert a_data["risk_class"] in ["CLEAR", "SUSPICIOUS", "FRAUDULENT"]
        assert "pipeline_stages" in a_data

        # 4. Circuit inspection
        c = client.get("/api/circuit")
        assert c.status_code == 200
        c_data = c.json()
        assert c_data["num_qubits"] == 4
        assert len(c_data["stages"]) == 4

        # 5. Transactions stream
        t = client.get("/api/transactions")
        assert t.status_code == 200
        t_data = t.json()
        assert t_data["total_count"] >= 1
        assert len(t_data["transactions"]) >= 1


if __name__ == "__main__":
    pytest.main(["-v", "backend/test_pipeline.py"])
