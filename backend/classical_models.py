"""
classical_models.py - Benchmark Classical Machine Learning Models.

Trains and evaluates:
1. Classical Support Vector Classifier with Radial Basis Function kernel (RBF SVM)
2. Random Forest Classifier (Ensemble decision trees)

Both models are trained on the exact same scaled training split and evaluated
on the identical held-out test split as the Quantum-Kernel SVC.
"""

import time
from typing import Dict, Any, List
import numpy as np
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix


class ClassicalBenchmarkSuite:
    """
    Evaluator for classical baseline models.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.svm_rbf = SVC(
            kernel="rbf",
            C=1.0,
            gamma="scale",
            random_state=self.random_state
        )
        self.rf = RandomForestClassifier(
            n_estimators=60,
            max_depth=5,
            random_state=self.random_state
        )

        self.svm_rbf_fit_time_ms: float = 0.0
        self.rf_fit_time_ms: float = 0.0
        self.is_fitted: bool = False

    def fit(self, X_train_scaled: np.ndarray, y_train: np.ndarray) -> Dict[str, float]:
        """Trains both classical models and records wall-clock fit times."""
        # Train Classical RBF SVM
        t0 = time.perf_counter()
        self.svm_rbf.fit(X_train_scaled, y_train)
        t1 = time.perf_counter()
        self.svm_rbf_fit_time_ms = round((t1 - t0) * 1000.0, 2)

        # Train Random Forest
        t2 = time.perf_counter()
        self.rf.fit(X_train_scaled, y_train)
        t3 = time.perf_counter()
        self.rf_fit_time_ms = round((t3 - t2) * 1000.0, 2)

        self.is_fitted = True

        return {
            "svm_rbf_fit_time_ms": self.svm_rbf_fit_time_ms,
            "rf_fit_time_ms": self.rf_fit_time_ms
        }

    def evaluate_test_set(
        self,
        X_test_scaled: np.ndarray,
        y_test: np.ndarray
    ) -> List[Dict[str, Any]]:
        """
        Evaluates both classical models on the test set.
        Returns detailed metric dictionaries for each model.
        """
        if not self.is_fitted:
            raise ValueError("Classical models must be fitted before evaluating test set.")

        results = []

        # 1. Classical RBF SVM Evaluation
        t0 = time.perf_counter()
        svm_preds = self.svm_rbf.predict(X_test_scaled)
        svm_decision = self.svm_rbf.decision_function(X_test_scaled)
        t1 = time.perf_counter()
        svm_inf_ms = round((t1 - t0) * 1000.0, 2)

        results.append({
            "model_name": "Classical RBF SVM",
            "is_quantum": False,
            "accuracy": round(float(accuracy_score(y_test, svm_preds)), 4),
            "precision": round(float(precision_score(y_test, svm_preds, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, svm_preds, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, svm_preds, zero_division=0)), 4),
            "confusion_matrix": confusion_matrix(y_test, svm_preds).tolist(),
            "test_samples": len(y_test),
            "total_inference_time_ms": svm_inf_ms,
            "per_sample_inference_ms": round(svm_inf_ms / len(y_test), 3),
            "train_time_ms": self.svm_rbf_fit_time_ms,
            "raw_decision_scores": [round(float(d), 4) for d in svm_decision],
            "risk_scores": [round(float(1.0 / (1.0 + np.exp(-d))), 4) for d in svm_decision],
            "predictions": svm_preds.tolist()
        })

        # 2. Random Forest Evaluation
        t0 = time.perf_counter()
        rf_preds = self.rf.predict(X_test_scaled)
        rf_probs = self.rf.predict_proba(X_test_scaled)[:, 1]
        t1 = time.perf_counter()
        rf_inf_ms = round((t1 - t0) * 1000.0, 2)

        results.append({
            "model_name": "Random Forest",
            "is_quantum": False,
            "accuracy": round(float(accuracy_score(y_test, rf_preds)), 4),
            "precision": round(float(precision_score(y_test, rf_preds, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, rf_preds, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, rf_preds, zero_division=0)), 4),
            "confusion_matrix": confusion_matrix(y_test, rf_preds).tolist(),
            "test_samples": len(y_test),
            "total_inference_time_ms": rf_inf_ms,
            "per_sample_inference_ms": round(rf_inf_ms / len(y_test), 3),
            "train_time_ms": self.rf_fit_time_ms,
            "feature_importances": [round(float(fi), 4) for fi in self.rf.feature_importances_],
            "risk_scores": [round(float(p), 4) for p in rf_probs],
            "predictions": rf_preds.tolist()
        })

        return results
