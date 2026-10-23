"""
quantum_model.py - Qiskit-based Quantum-Kernel Fraud Detection Pipeline.

SCIENTIFIC INTEGRITY & ARCHITECTURAL FOUNDATION:
1. Feature Encoding:
   Classical transaction features x in [0, 2*pi]^4 are encoded into a 4-qubit Hilbert space
   via ZZFeatureMap: |Phi(x)> = U_{Phi}(x) |0>^{otimes 4}.
   The dimension of the quantum feature space is 2^n = 16 for n=4 qubits.

2. Fidelity Quantum Kernel:
   Computes the transition amplitude / state overlap between pairs of feature-mapped states:
   K(x_i, x_j) = |<Phi(x_i) | Phi(x_j)>|^2.
   Evaluated using Qiskit's FidelityQuantumKernel on a statevector simulation backend.

3. Quantum-Kernel Classification (QSVC):
   The precomputed quantum kernel matrix is passed to sklearn.svm.SVC(kernel='precomputed').
   Decision function: f(x) = sum_{i in SV} alpha_i y_i K(x_i, x) + b.

4. Calibrated Risk Indicators:
   An SVM decision function represents geometric margin distance, not an automatic fraud probability.
   We map f(x) via a logistic sigmoid to produce a bounded Risk Score in [0, 1].
   Configurable decision thresholds govern risk stratification:
   - CLEAR: Risk Score < 0.40
   - SUSPICIOUS: 0.40 <= Risk Score < threshold (review band)
   - FRAUDULENT: Risk Score >= threshold
"""

import time
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Qiskit imports
from qiskit.circuit.library import zz_feature_map, z_feature_map, pauli_feature_map
from qiskit_machine_learning.kernels import FidelityQuantumKernel


class QuantumFraudClassifier:
    """
    Quantum-Enhanced Fraud Classifier using Qiskit's ZZFeatureMap and FidelityQuantumKernel.
    """

    def __init__(
        self,
        n_qubits: int = 4,
        reps: int = 1,
        entanglement: str = "linear",
        feature_map_type: str = "zz",
        c_param: float = 1.0,
        decision_threshold: float = 0.60
    ):
        self.n_qubits = n_qubits
        self.reps = reps
        self.entanglement = entanglement
        self.feature_map_type = feature_map_type
        self.c_param = c_param
        self.decision_threshold = decision_threshold

        # Initialize Circuit
        self.circuit = self._build_feature_map()
        self.kernel = FidelityQuantumKernel(feature_map=self.circuit)
        self.classifier = SVC(kernel="precomputed", C=self.c_param, random_state=42)

        # Training artifacts cache
        self.X_train_scaled: Optional[np.ndarray] = None
        self.y_train: Optional[np.ndarray] = None
        self.K_train: Optional[np.ndarray] = None
        self.is_fitted: bool = False

        # Profiling telemetry
        self.last_train_kernel_time_ms: float = 0.0
        self.last_fit_time_ms: float = 0.0
        self.last_total_train_time_ms: float = 0.0

    def _build_feature_map(self):
        """Constructs the requested Qiskit quantum feature map."""
        if self.feature_map_type == "z":
            return z_feature_map(
                feature_dimension=self.n_qubits,
                reps=self.reps
            )
        elif self.feature_map_type == "pauli":
            return pauli_feature_map(
                feature_dimension=self.n_qubits,
                reps=self.reps,
                paulis=["Z", "ZZ"]
            )
        else:  # default 'zz'
            return zz_feature_map(
                feature_dimension=self.n_qubits,
                reps=self.reps,
                entanglement=self.entanglement
            )

    def get_circuit_metadata(self) -> Dict[str, Any]:
        """Returns deep structural inspection metadata of the quantum circuit."""
        ops = dict(self.circuit.count_ops())
        depth = int(self.circuit.depth())
        num_qubits = int(self.circuit.num_qubits)
        hilbert_dimension = int(2 ** num_qubits)

        # Gate breakdown
        h_gates = ops.get("h", 0)
        p_gates = ops.get("p", 0) + ops.get("rz", 0)
        cx_gates = ops.get("cx", 0) + ops.get("cz", 0)

        # Simplified ASCII representation
        circuit_str = str(self.circuit.draw(output="text"))

        return {
            "name": f"{self.feature_map_type.upper()}FeatureMap",
            "type": self.feature_map_type,
            "num_qubits": num_qubits,
            "circuit_depth": depth,
            "hilbert_dimension": hilbert_dimension,
            "entanglement": self.entanglement,
            "reps": self.reps,
            "gate_counts": {
                "hadamard": h_gates,
                "phase_rotations": p_gates,
                "entanglers_cx": cx_gates,
                "total_gates": sum(ops.values())
            },
            "raw_operations": ops,
            "circuit_ascii": circuit_str,
            "explanation": (
                f"Encodes {num_qubits} classical fraud features into {hilbert_dimension}-dimensional "
                f"complex Hilbert space using {self.reps} repetition(s) of single-qubit rotations "
                f"and {self.entanglement} entangling two-qubit CX gates."
            )
        }

    def fit(self, X_train_scaled: np.ndarray, y_train: np.ndarray) -> Dict[str, Any]:
        """
        Computes the quantum training kernel matrix K(X_train, X_train)
        and trains the precomputed SVC classifier.
        """
        self.X_train_scaled = np.asarray(X_train_scaled, dtype=np.float64)
        self.y_train = np.asarray(y_train, dtype=int)

        # 1. Compute Quantum Kernel Matrix with wall-clock profiling
        t0 = time.perf_counter()
        self.K_train = self.kernel.evaluate(self.X_train_scaled)
        t1 = time.perf_counter()
        self.last_train_kernel_time_ms = round((t1 - t0) * 1000.0, 2)

        # 2. Fit Precomputed SVC
        t2 = time.perf_counter()
        self.classifier.fit(self.K_train, self.y_train)
        t3 = time.perf_counter()
        self.last_fit_time_ms = round((t3 - t2) * 1000.0, 2)
        self.last_total_train_time_ms = round((t3 - t0) * 1000.0, 2)

        self.is_fitted = True

        return {
            "train_samples": len(self.y_train),
            "train_kernel_matrix_shape": list(self.K_train.shape),
            "kernel_time_ms": self.last_train_kernel_time_ms,
            "svm_fit_time_ms": self.last_fit_time_ms,
            "total_train_time_ms": self.last_total_train_time_ms,
            "n_support_vectors": int(len(self.classifier.support_)),
            "support_vector_indices": self.classifier.support_.tolist()
        }

    def evaluate_test_set(
        self,
        X_test_scaled: np.ndarray,
        y_test: np.ndarray
    ) -> Dict[str, Any]:
        """
        Evaluates test dataset against training kernel matrix: K(X_test, X_train).
        """
        if not self.is_fitted or self.X_train_scaled is None:
            raise ValueError("QuantumFraudClassifier must be fitted before evaluating test set.")

        X_test_scaled = np.asarray(X_test_scaled, dtype=np.float64)
        y_test = np.asarray(y_test, dtype=int)

        t0 = time.perf_counter()
        K_test = self.kernel.evaluate(X_test_scaled, self.X_train_scaled)
        raw_decision = self.classifier.decision_function(K_test)
        preds = self.classifier.predict(K_test)
        t1 = time.perf_counter()

        inference_time_ms = round((t1 - t0) * 1000.0, 2)
        per_sample_ms = round(inference_time_ms / len(y_test), 3)

        # Calculate standard evaluation metrics (zero-division safe)
        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, zero_division=0))
        rec = float(recall_score(y_test, preds, zero_division=0))
        f1 = float(f1_score(y_test, preds, zero_division=0))
        cm = confusion_matrix(y_test, preds).tolist()

        # Risk scores via sigmoid mapping
        risk_scores = (1.0 / (1.0 + np.exp(-raw_decision))).tolist()

        return {
            "model_name": "Quantum-Kernel SVC (QSVC)",
            "is_quantum": True,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
            "test_samples": len(y_test),
            "total_inference_time_ms": inference_time_ms,
            "per_sample_inference_ms": per_sample_ms,
            "train_time_ms": self.last_total_train_time_ms,
            "raw_decision_scores": [round(float(d), 4) for d in raw_decision],
            "risk_scores": [round(float(s), 4) for s in risk_scores],
            "predictions": preds.tolist()
        }

    def predict_single(
        self,
        x_scaled: np.ndarray,
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Infers a single transaction x_scaled in [0, 2*pi]^4 against the cached training set.
        """
        if not self.is_fitted or self.X_train_scaled is None:
            raise ValueError("QuantumFraudClassifier must be fitted before single transaction prediction.")

        x_vec = np.asarray(x_scaled, dtype=np.float64).reshape(1, -1)
        active_threshold = threshold if threshold is not None else self.decision_threshold

        t0 = time.perf_counter()
        # Evaluate 1xN quantum kernel slice
        k_vec = self.kernel.evaluate(x_vec, self.X_train_scaled)
        raw_decision = float(self.classifier.decision_function(k_vec)[0])
        t1 = time.perf_counter()

        proc_time_ms = round((t1 - t0) * 1000.0, 2)

        # Logistic mapping of geometric margin to [0, 1] risk score
        risk_score = float(1.0 / (1.0 + np.exp(-raw_decision)))

        # Categorization logic
        if risk_score >= active_threshold:
            risk_class = "FRAUDULENT"
            predicted_label = 1
        elif risk_score >= 0.40:
            risk_class = "SUSPICIOUS"
            predicted_label = 1 if risk_score >= 0.50 else 0
        else:
            risk_class = "CLEAR"
            predicted_label = 0

        # Mean kernel fidelity against fraud vs legit training clusters
        legit_mask = (self.y_train == 0)
        fraud_mask = (self.y_train == 1)
        mean_fidelity_legit = float(np.mean(k_vec[0, legit_mask])) if np.any(legit_mask) else 0.0
        mean_fidelity_fraud = float(np.mean(k_vec[0, fraud_mask])) if np.any(fraud_mask) else 0.0

        return {
            "risk_class": risk_class,
            "predicted_label": predicted_label,
            "risk_score": round(risk_score, 4),
            "raw_decision_score": round(raw_decision, 4),
            "decision_threshold": active_threshold,
            "processing_time_ms": proc_time_ms,
            "quantum_fidelities": {
                "mean_fidelity_to_legit_samples": round(mean_fidelity_legit, 4),
                "mean_fidelity_to_fraud_samples": round(mean_fidelity_fraud, 4),
                "kernel_vector_dim": k_vec.shape[1]
            },
            "pipeline_stages": [
                {
                    "stage": 1,
                    "name": "Feature Encoding",
                    "status": "COMPLETED",
                    "details": f"Scaled 4 classical features to [0, 2*pi] angle range"
                },
                {
                    "stage": 2,
                    "name": "Quantum State Mapping",
                    "status": "COMPLETED",
                    "details": f"Applied {self.feature_map_type.upper()}FeatureMap with {self.reps} rep(s) across 4 qubits"
                },
                {
                    "stage": 3,
                    "name": "Fidelity Kernel Computation",
                    "status": "COMPLETED",
                    "details": f"Computed state overlap |<Phi(x)|Phi(x_i)>|^2 against {len(self.y_train)} training states"
                },
                {
                    "stage": 4,
                    "name": "Hyperplane Classification",
                    "status": "COMPLETED",
                    "details": f"Evaluated precomputed SVM decision boundary (f(x)={raw_decision:+.3f})"
                }
            ]
        }
