"""
dataset.py - Synthetic Financial Fraud Dataset Generator for Q-Guard.

IMPORTANT SCIENTIFIC INTEGRITY NOTICE:
This dataset is purely synthetic and generated for experimental benchmarking of
quantum-kernel and classical classifiers under Track 4: Quantum + AI & ML.
It is NOT real financial or customer data.

The generator simulates realistic non-linear fraud patterns:
- High transaction velocity paired with high network anomaly
- Large transaction amounts with atypical device risk
- Configurable noise and non-linear feature interactions
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler


FEATURE_NAMES = [
    "amount",
    "velocity",
    "network_anomaly",
    "device_risk"
]

FEATURE_DESCRIPTIONS = {
    "amount": "Transaction amount in USD ($5.00 - $5,000.00)",
    "velocity": "Transaction velocity frequency index (1 - 100 events/hour)",
    "network_anomaly": "Graph & IP network topology risk score (0.0 - 1.0)",
    "device_risk": "Hardware fingerprint & geolocation deviation score (0.0 - 1.0)"
}


def generate_fraud_dataset(
    complexity: str = "medium",
    random_state: int = 42,
    test_size: float = 0.25
) -> Dict[str, Any]:
    """
    Generates a reproducible synthetic fraud dataset with realistic non-linear interactions.

    Parameters:
    - complexity: 'low', 'medium', or 'high'.
        * 'low': 100 samples, low noise (5%), clearly separable fraud boundaries.
        * 'medium': 140 samples, moderate noise (15%), realistic class overlap.
        * 'high': 180 samples, high noise (25%), severe non-linear boundary & overlap.
    - random_state: integer seed for deterministic reproducibility.
    - test_size: ratio for stratified train/test split (default 0.25).

    Returns:
        Dictionary containing raw and scaled train/test splits, labels, scaler, and metadata.
    """
    rng = np.random.RandomState(random_state)

    if complexity == "low":
        n_samples = 100
        noise_level = 0.05
        fraud_ratio = 0.20
    elif complexity == "high":
        n_samples = 180
        noise_level = 0.25
        fraud_ratio = 0.25
    else:  # medium
        n_samples = 140
        noise_level = 0.15
        fraud_ratio = 0.22

    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud

    # 1. Generate Legitimate Transactions (Class 0)
    # Typically lower/moderate amounts, low velocity, low network anomaly, low device risk
    legit_amount = rng.exponential(scale=120.0, size=n_legit) + 10.0
    legit_amount = np.clip(legit_amount, 5.0, 1500.0)
    legit_velocity = rng.normal(loc=25.0, scale=12.0, size=n_legit)
    legit_velocity = np.clip(legit_velocity, 1.0, 60.0)
    legit_net_anomaly = rng.beta(a=1.5, b=5.0, size=n_legit) * 0.5
    legit_device_risk = rng.beta(a=1.2, b=4.0, size=n_legit) * 0.45

    X_legit = np.column_stack([
        legit_amount,
        legit_velocity,
        legit_net_anomaly,
        legit_device_risk
    ])
    y_legit = np.zeros(n_legit, dtype=int)

    # 2. Generate Fraudulent Transactions (Class 1)
    # Simulated fraud typologies:
    # Subtype A: High-velocity card testing (moderate amount, extreme velocity, high network anomaly)
    # Subtype B: Account takeover / large transfer (high amount, moderate velocity, high device risk)
    # Subtype C: Distributed botnet attack (unusual network + device risk with moderate amount)
    half_fraud = n_fraud // 2
    rem_fraud = n_fraud - half_fraud

    # Subtype A (Velocity surge)
    f_amount_a = rng.uniform(40.0, 600.0, size=half_fraud)
    f_velocity_a = rng.normal(loc=78.0, scale=10.0, size=half_fraud)
    f_net_anomaly_a = rng.uniform(0.60, 0.98, size=half_fraud)
    f_device_risk_a = rng.uniform(0.40, 0.85, size=half_fraud)

    # Subtype B (High-value takeover)
    f_amount_b = rng.uniform(1200.0, 4800.0, size=rem_fraud)
    f_velocity_b = rng.normal(loc=55.0, scale=15.0, size=rem_fraud)
    f_net_anomaly_b = rng.uniform(0.45, 0.92, size=rem_fraud)
    f_device_risk_b = rng.uniform(0.70, 0.99, size=rem_fraud)

    f_amount = np.concatenate([f_amount_a, f_amount_b])
    f_velocity = np.clip(np.concatenate([f_velocity_a, f_velocity_b]), 10.0, 100.0)
    f_net_anomaly = np.clip(np.concatenate([f_net_anomaly_a, f_net_anomaly_b]), 0.0, 1.0)
    f_device_risk = np.clip(np.concatenate([f_device_risk_a, f_device_risk_b]), 0.0, 1.0)

    X_fraud = np.column_stack([
        f_amount,
        f_velocity,
        f_net_anomaly,
        f_device_risk
    ])
    y_fraud = np.ones(n_fraud, dtype=int)

    # Combine datasets
    X_raw = np.vstack([X_legit, X_fraud])
    y = np.concatenate([y_legit, y_fraud])

    # Add realistic stochastic perturbation / non-linear noise based on complexity
    noise = rng.normal(loc=0.0, scale=noise_level, size=X_raw.shape)
    # Apply noise proportionally to feature dimensions
    ranges = np.ptp(X_raw, axis=0)
    X_raw = X_raw + noise * ranges * 0.1
    # Enforce realistic feature domain bounds
    X_raw[:, 0] = np.clip(X_raw[:, 0], 5.0, 5000.0)
    X_raw[:, 1] = np.clip(X_raw[:, 1], 1.0, 100.0)
    X_raw[:, 2] = np.clip(X_raw[:, 2], 0.0, 1.0)
    X_raw[:, 3] = np.clip(X_raw[:, 3], 0.0, 1.0)

    # Stratified Train/Test Split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y,
        test_size=test_size,
        stratify=y,
        random_state=random_state
    )

    # PREPROCESSING INTEGRITY:
    # Fit scaler strictly on X_train to prevent data leakage.
    # Scale features to [0, 2*pi] for quantum angle/ZZ-feature encoding.
    scaler = MinMaxScaler(feature_range=(0.0, 2.0 * np.pi))
    X_train_scaled = scaler.fit_transform(X_train_raw)
    X_test_scaled = scaler.transform(X_test_raw)

    return {
        "X_train_raw": X_train_raw,
        "X_test_raw": X_test_raw,
        "X_train_scaled": X_train_scaled,
        "X_test_scaled": X_test_scaled,
        "y_train": y_train,
        "y_test": y_test,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "metadata": {
            "total_samples": n_samples,
            "train_samples": int(len(y_train)),
            "test_samples": int(len(y_test)),
            "fraud_samples_total": int(np.sum(y)),
            "fraud_samples_train": int(np.sum(y_train)),
            "fraud_samples_test": int(np.sum(y_test)),
            "fraud_ratio_actual": float(np.mean(y)),
            "complexity": complexity,
            "noise_level": noise_level,
            "random_state": random_state,
            "encoding_range": "[0, 2*pi]",
            "synthetic_disclaimer": "Synthetic research data generated for algorithmic benchmark."
        }
    }
