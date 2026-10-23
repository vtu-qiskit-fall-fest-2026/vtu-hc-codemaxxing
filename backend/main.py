"""
main.py - FastAPI Application Server for Q-Guard Fraud Detection Engine.
"""

import sys
import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import numpy as np
import qiskit

from backend.schemas import (
    HealthResponse,
    OverviewResponse,
    TransactionInput,
    TransactionRecord,
    BenchmarkRequest,
    BenchmarkSuiteResponse,
    CircuitInspectionResponse,
    TransactionListResponse
)
from backend.dataset import generate_fraud_dataset, FEATURE_NAMES
from backend.quantum_model import QuantumFraudClassifier
from backend.classical_models import ClassicalBenchmarkSuite
from backend.reporting import generate_benchmark_figures, export_json_report, FIGURES_DIR, REPORTS_DIR


# Application State Store
class EngineState:
    def __init__(self):
        self.execution_mode = "Quantum Simulation"
        self.backend_name = "Qiskit Statevector Simulator (Aer/Reference Engine)"
        self.is_ready = False
        self.is_benchmarking = False
        self.last_benchmark_result: Optional[Dict[str, Any]] = None
        self.dataset_data: Optional[Dict[str, Any]] = None
        self.quantum_classifier: Optional[QuantumFraudClassifier] = None
        self.classical_suite: Optional[ClassicalBenchmarkSuite] = None
        self.transactions: List[Dict[str, Any]] = []
        self.lock = asyncio.Lock()


engine_state = EngineState()


def initialize_default_models():
    """Initializes models on a standard synthetic dataset on startup."""
    print("[Q-Guard] Initializing default quantum & classical fraud pipeline...")
    # Generate default medium-complexity dataset
    data = generate_fraud_dataset(complexity="medium", random_state=42)
    engine_state.dataset_data = data

    # Train Quantum Classifier (use 60 training samples for fast, deterministic startup)
    n_train_sub = 60
    n_test_sub = 25
    X_train_sub = data["X_train_scaled"][:n_train_sub]
    y_train_sub = data["y_train"][:n_train_sub]
    X_test_sub = data["X_test_scaled"][:n_test_sub]
    y_test_sub = data["y_test"][:n_test_sub]

    q_clf = QuantumFraudClassifier(n_qubits=4, reps=1, entanglement="linear")
    q_clf.fit(X_train_sub, y_train_sub)
    q_eval = q_clf.evaluate_test_set(X_test_sub, y_test_sub)
    engine_state.quantum_classifier = q_clf

    # Train Classical Suite
    c_suite = ClassicalBenchmarkSuite(random_state=42)
    c_suite.fit(X_train_sub, y_train_sub)
    c_evals = c_suite.evaluate_test_set(X_test_sub, y_test_sub)
    engine_state.classical_suite = c_suite

    # Compile initial benchmark result
    all_models = [q_eval] + c_evals
    best_acc = max(all_models, key=lambda m: m["accuracy"])["model_name"]
    best_f1 = max(all_models, key=lambda m: m["f1_score"])["model_name"]
    best_latency = min(all_models, key=lambda m: m["per_sample_inference_ms"])["model_name"]

    benchmark_dict = {
        "execution_id": f"INIT-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "complexity": "medium",
        "dataset_metadata": data["metadata"],
        "models": all_models,
        "best_model_by_metric": {
            "best_accuracy": best_acc,
            "best_f1": best_f1,
            "lowest_latency": best_latency
        },
        "hardware_env": {
            "simulator": engine_state.backend_name,
            "qiskit_version": qiskit.__version__,
            "python_version": sys.version.split()[0],
            "qubit_count": 4,
            "hilbert_dimension": 16
        },
        "scientific_notes": [
            "All models evaluated on identical stratified train/test split.",
            "Preprocessing transformations fitted strictly on training data to prevent data leakage.",
            "Quantum-kernel simulated using Statevector overlap fidelity K(x, z) = |<Phi(x)|Phi(z)>|^2.",
            "Risk scores represent normalized margin distances rather than uncalibrated probabilities."
        ]
    }
    engine_state.last_benchmark_result = benchmark_dict

    # Seed initial transaction records
    # Sample 8 records from the test set
    for i in range(min(8, len(X_test_sub))):
        x_raw = data["X_test_raw"][i]
        x_scaled = X_test_sub[i]
        res = q_clf.predict_single(x_scaled)
        engine_state.transactions.append({
            "transaction_id": f"TXN-INIT-{1000 + i}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "amount": float(x_raw[0]),
            "velocity": float(x_raw[1]),
            "network_anomaly": float(x_raw[2]),
            "device_risk": float(x_raw[3]),
            "risk_class": res["risk_class"],
            "predicted_label": res["predicted_label"],
            "risk_score": res["risk_score"],
            "raw_decision_score": res["raw_decision_score"],
            "decision_threshold": res["decision_threshold"],
            "processing_time_ms": res["processing_time_ms"],
            "model_used": "Quantum-Kernel SVC (QSVC)",
            "mode": engine_state.execution_mode,
            "pipeline_stages": res["pipeline_stages"],
            "quantum_fidelities": res["quantum_fidelities"]
        })

    # Generate initial benchmark figures
    try:
        generate_benchmark_figures(
            benchmark_dict,
            sample_kernel_matrix=q_clf.K_train
        )
    except Exception as e:
        print(f"[Q-Guard] Figure generation warning: {e}")

    engine_state.is_ready = True
    print("[Q-Guard] Engine initialized successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_default_models()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="Q-Guard Quantum Fraud Detection Engine API",
    description="REST API for Qiskit-based Quantum-Kernel and Classical Fraud Detection",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- API Endpoints ----------------

@app.get("/api/health", response_model=HealthResponse)
def get_health():
    """Returns engine health, execution mode, and Qiskit environment status."""
    return {
        "status": "HEALTHY",
        "execution_mode": engine_state.execution_mode,
        "backend_name": engine_state.backend_name,
        "qiskit_version": qiskit.__version__,
        "python_version": sys.version.split()[0],
        "simulator_info": "CPU Statevector Quantum Simulator (FidelityQuantumKernel)",
        "ready": engine_state.is_ready,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/overview", response_model=OverviewResponse)
def get_overview():
    """Provides high-level dashboard KPIs and operational telemetry."""
    if not engine_state.is_ready:
        raise HTTPException(status_code=503, detail="Quantum engine is initializing...")

    q_clf = engine_state.quantum_classifier
    bench = engine_state.last_benchmark_result
    qsvc_metrics = next(
        (m for m in bench.get("models", []) if m["is_quantum"]),
        {"accuracy": 0.85, "recall": 0.80}
    )

    total_analyzed = len(engine_state.transactions)
    fraud_count = sum(1 for t in engine_state.transactions if t["risk_class"] == "FRAUDULENT")

    meta = q_clf.get_circuit_metadata() if q_clf else {}

    return {
        "kpis": {
            "transactions_analyzed": total_analyzed,
            "fraud_alerts_detected": fraud_count,
            "fraud_detection_recall": qsvc_metrics.get("recall", 0.80),
            "qsvc_accuracy": qsvc_metrics.get("accuracy", 0.85),
            "quantum_feature_dim": meta.get("hilbert_dimension", 16)
        },
        "dataset_metadata": engine_state.dataset_data["metadata"] if engine_state.dataset_data else {},
        "simulator_name": engine_state.backend_name,
        "qubit_count": meta.get("num_qubits", 4),
        "quantum_feature_dim": meta.get("hilbert_dimension", 16),
        "circuit_depth": meta.get("circuit_depth", 11),
        "execution_mode": engine_state.execution_mode,
        "last_benchmark_timestamp": bench.get("timestamp")
    }


@app.post("/api/analyze", response_model=TransactionRecord)
def analyze_transaction(txn: TransactionInput):
    """
    Submits a transaction for real-time quantum feature mapping and classification.
    """
    if not engine_state.is_ready or engine_state.quantum_classifier is None:
        raise HTTPException(status_code=503, detail="Quantum engine is not ready.")

    scaler = engine_state.dataset_data["scaler"]

    # Raw input vector
    raw_vec = np.array([[txn.amount, txn.velocity, txn.network_anomaly, txn.device_risk]])

    # Transform using pre-fitted training scaler
    scaled_vec = scaler.transform(raw_vec)[0]

    # Predict via Quantum Classifier
    try:
        pred_res = engine_state.quantum_classifier.predict_single(
            scaled_vec,
            threshold=txn.threshold
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum inference error: {str(e)}")

    record = {
        "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "amount": round(txn.amount, 2),
        "velocity": round(txn.velocity, 1),
        "network_anomaly": round(txn.network_anomaly, 3),
        "device_risk": round(txn.device_risk, 3),
        "risk_class": pred_res["risk_class"],
        "predicted_label": pred_res["predicted_label"],
        "risk_score": pred_res["risk_score"],
        "raw_decision_score": pred_res["raw_decision_score"],
        "decision_threshold": pred_res["decision_threshold"],
        "processing_time_ms": pred_res["processing_time_ms"],
        "model_used": "Quantum-Kernel SVC (QSVC)",
        "mode": engine_state.execution_mode,
        "pipeline_stages": pred_res["pipeline_stages"],
        "quantum_fidelities": pred_res["quantum_fidelities"]
    }

    # Prepend to transaction audit log
    engine_state.transactions.insert(0, record)

    return record


def run_benchmark_job(config: BenchmarkRequest):
    """Worker task to train and evaluate quantum & classical models."""
    engine_state.is_benchmarking = True
    try:
        data = generate_fraud_dataset(
            complexity=config.complexity,
            test_size=config.test_size,
            random_state=42
        )
        engine_state.dataset_data = data

        # Train quantum classifier
        # Select sample count suitable for standard CPU execution
        if config.complexity == "low":
            n_train = 50
            n_test = 20
        elif config.complexity == "high":
            n_train = 75
            n_test = 30
        else:
            n_train = 60
            n_test = 25

        X_train_sub = data["X_train_scaled"][:n_train]
        y_train_sub = data["y_train"][:n_train]
        X_test_sub = data["X_test_scaled"][:n_test]
        y_test_sub = data["y_test"][:n_test]

        q_clf = QuantumFraudClassifier(
            n_qubits=4,
            reps=config.reps,
            entanglement=config.entanglement
        )
        q_clf.fit(X_train_sub, y_train_sub)
        q_eval = q_clf.evaluate_test_set(X_test_sub, y_test_sub)
        engine_state.quantum_classifier = q_clf

        # Classical models
        c_suite = ClassicalBenchmarkSuite(random_state=42)
        c_suite.fit(X_train_sub, y_train_sub)
        c_evals = c_suite.evaluate_test_set(X_test_sub, y_test_sub)
        engine_state.classical_suite = c_suite

        all_models = [q_eval] + c_evals
        best_acc = max(all_models, key=lambda m: m["accuracy"])["model_name"]
        best_f1 = max(all_models, key=lambda m: m["f1_score"])["model_name"]
        best_latency = min(all_models, key=lambda m: m["per_sample_inference_ms"])["model_name"]

        bench_result = {
            "execution_id": f"BENCH-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "complexity": config.complexity,
            "dataset_metadata": data["metadata"],
            "models": all_models,
            "best_model_by_metric": {
                "best_accuracy": best_acc,
                "best_f1": best_f1,
                "lowest_latency": best_latency
            },
            "hardware_env": {
                "simulator": engine_state.backend_name,
                "qiskit_version": qiskit.__version__,
                "python_version": sys.version.split()[0],
                "qubit_count": 4,
                "hilbert_dimension": 16
            },
            "scientific_notes": [
                "All models evaluated on identical stratified train/test split.",
                "Preprocessing transformations fitted strictly on training data to prevent data leakage.",
                "Quantum-kernel simulated using Statevector overlap fidelity K(x, z) = |<Phi(x)|Phi(z)>|^2.",
                "Notice: Quantum advantage is an experimental hypothesis; classical RF/SVM can excel on low-dimensional data."
            ]
        }

        engine_state.last_benchmark_result = bench_result

        # Update figures
        try:
            generate_benchmark_figures(bench_result, sample_kernel_matrix=q_clf.K_train)
        except Exception as e:
            print(f"[Q-Guard] Figure error: {e}")

    finally:
        engine_state.is_benchmarking = False


@app.post("/api/benchmark")
async def start_benchmark(config: BenchmarkRequest, background_tasks: BackgroundTasks):
    """
    Triggers a full re-evaluation benchmark suite across quantum & classical models.
    Runs asynchronously to prevent UI freeze and enforces single-execution guard.
    """
    if engine_state.is_benchmarking:
        return JSONResponse(
            status_code=409,
            content={"status": "BUSY", "message": "A benchmark suite is already executing. Please wait."}
        )

    background_tasks.add_task(run_benchmark_job, config)
    return {
        "status": "QUEUED",
        "message": f"Benchmark suite queued with '{config.complexity}' complexity setting.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/benchmarks", response_model=BenchmarkSuiteResponse)
def get_benchmarks():
    """Returns the latest completed benchmark results."""
    if not engine_state.last_benchmark_result:
        raise HTTPException(status_code=404, detail="No completed benchmarks found.")
    return engine_state.last_benchmark_result


@app.get("/api/circuit", response_model=CircuitInspectionResponse)
def get_circuit_details():
    """Returns detailed circuit structure and quantum kernel explanation."""
    if not engine_state.quantum_classifier:
        raise HTTPException(status_code=503, detail="Quantum engine is not ready.")

    q_clf = engine_state.quantum_classifier
    meta = q_clf.get_circuit_metadata()

    # Provide educational stage walkthrough
    stages = [
        {
            "stage": 1,
            "title": "Classical Feature Normalization",
            "concept": "Angle Range Scaling [0, 2pi]",
            "explanation": "Normalizes fraud features (amount, velocity, network anomaly, device risk) into rotation angles for unitary operations.",
            "qubit_mapping": [
                {"qubit": 0, "feature": "amount", "angle_param": "x[0]"},
                {"qubit": 1, "feature": "velocity", "angle_param": "x[1]"},
                {"qubit": 2, "feature": "network_anomaly", "angle_param": "x[2]"},
                {"qubit": 3, "feature": "device_risk", "angle_param": "x[3]"}
            ]
        },
        {
            "stage": 2,
            "title": "Quantum Feature Map (ZZFeatureMap)",
            "concept": "Non-Linear Hilbert Space Embedding",
            "explanation": "Applies Hadamard superposition, single-qubit Rz(x_i) phase rotations, and CNOT-entangled Rz(2*(pi - x_i)(pi - x_j)) two-qubit interactions.",
            "hilbert_dimension": meta["hilbert_dimension"],
            "depth": meta["circuit_depth"],
            "gates": meta["gate_counts"]
        },
        {
            "stage": 3,
            "title": "Fidelity Quantum Kernel",
            "concept": "Transition Probability Overlap",
            "explanation": "Evaluates inner product fidelity K(x_i, x_j) = |<0| U_Phi^dagger(x_j) U_Phi(x_i) |0>|^2 as the natural geometric similarity metric.",
            "matrix_shape": f"{meta['num_qubits']}x{meta['num_qubits']}"
        },
        {
            "stage": 4,
            "title": "Hyperplane Classification (QSVC)",
            "concept": "Precomputed Dual SVM Optimization",
            "explanation": "Maximizes the soft margin in the quantum-induced reproducing kernel Hilbert space (RKHS) to separate fraud from legitimate transactions."
        }
    ]

    sample_mat = None
    if q_clf.K_train is not None:
        # Take top 8x8 submatrix for quick inspection
        sample_mat = q_clf.K_train[:8, :8].tolist()

    return {
        "name": meta["name"],
        "type": meta["type"],
        "num_qubits": meta["num_qubits"],
        "circuit_depth": meta["circuit_depth"],
        "hilbert_dimension": meta["hilbert_dimension"],
        "entanglement": meta["entanglement"],
        "reps": meta["reps"],
        "gate_counts": meta["gate_counts"],
        "raw_operations": meta["raw_operations"],
        "circuit_ascii": meta["circuit_ascii"],
        "explanation": meta["explanation"],
        "stages": stages,
        "sample_kernel_matrix": sample_mat
    }


@app.get("/api/transactions", response_model=TransactionListResponse)
def get_transactions(
    filter_risk: Optional[str] = Query(None, description="CLEAR, SUSPICIOUS, or FRAUDULENT"),
    search: Optional[str] = Query(None, description="Search by transaction ID"),
    sort_by: Optional[str] = Query("timestamp", description="Field to sort by"),
    sort_order: Optional[str] = Query("desc", description="'asc' or 'desc'"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """Returns filtered, sorted, and paginated transaction stream records."""
    records = list(engine_state.transactions)

    # Filter
    if filter_risk and filter_risk.upper() != "ALL":
        records = [r for r in records if r["risk_class"].upper() == filter_risk.upper()]

    if search:
        s = search.strip().lower()
        records = [r for r in records if s in r["transaction_id"].lower()]

    # Sort
    reverse = (sort_order.lower() == "desc")
    if sort_by in ["amount", "risk_score", "processing_time_ms", "timestamp"]:
        records = sorted(records, key=lambda r: r.get(sort_by, 0), reverse=reverse)

    total_count = len(records)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = records[start_idx:end_idx]

    return {
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "transactions": paginated
    }


@app.get("/api/report")
def download_report():
    """Generates and serves a comprehensive JSON audit report."""
    if not engine_state.last_benchmark_result:
        raise HTTPException(status_code=400, detail="No benchmark data available to export.")

    report_path = export_json_report(
        engine_state.last_benchmark_result,
        engine_state.transactions,
        execution_mode=engine_state.execution_mode
    )

    return FileResponse(
        report_path,
        media_type="application/json",
        filename=os.path.basename(report_path)
    )


@app.get("/api/figures/{figure_name}")
def get_figure(figure_name: str):
    """Serves generated Matplotlib/Seaborn figures."""
    filename = f"{figure_name}.png"
    filepath = os.path.join(FIGURES_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Figure not found.")
    return FileResponse(filepath, media_type="image/png")
