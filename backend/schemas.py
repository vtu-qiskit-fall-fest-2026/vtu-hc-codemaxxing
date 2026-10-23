"""
schemas.py - Pydantic Request and Response Schemas for Q-Guard API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ---------------- Health & Overview ----------------

class HealthResponse(BaseModel):
    status: str
    execution_mode: str
    backend_name: str
    qiskit_version: str
    python_version: str
    simulator_info: str
    ready: bool
    timestamp: str


class OverviewResponse(BaseModel):
    kpis: Dict[str, Any]
    dataset_metadata: Dict[str, Any]
    simulator_name: str
    qubit_count: int
    quantum_feature_dim: int
    circuit_depth: int
    execution_mode: str
    last_benchmark_timestamp: Optional[str] = None


# ---------------- Transaction Analysis ----------------

class TransactionInput(BaseModel):
    amount: float = Field(..., gt=0.0, le=100000.0, description="Transaction amount in USD ($)")
    velocity: float = Field(..., ge=1.0, le=100.0, description="Velocity score index (1 - 100)")
    network_anomaly: float = Field(..., ge=0.0, le=1.0, description="Network anomaly score (0.0 - 1.0)")
    device_risk: float = Field(..., ge=0.0, le=1.0, description="Device/Location deviation score (0.0 - 1.0)")
    feature_map: Optional[str] = Field("zz", description="Quantum feature map type: 'zz', 'z', or 'pauli'")
    threshold: Optional[float] = Field(0.60, ge=0.1, le=0.99, description="Fraud classification cutoff threshold")


class PipelineStageInfo(BaseModel):
    stage: int
    name: str
    status: str
    details: str


class TransactionRecord(BaseModel):
    transaction_id: str
    timestamp: str
    amount: float
    velocity: float
    network_anomaly: float
    device_risk: float
    risk_class: str  # CLEAR, SUSPICIOUS, FRAUDULENT
    predicted_label: int  # 0 or 1
    risk_score: float
    raw_decision_score: float
    decision_threshold: float
    processing_time_ms: float
    model_used: str
    mode: str  # Quantum Simulation vs Demo Preview
    pipeline_stages: Optional[List[PipelineStageInfo]] = None
    quantum_fidelities: Optional[Dict[str, Any]] = None


# ---------------- Benchmarking ----------------

class BenchmarkRequest(BaseModel):
    complexity: str = Field("medium", description="'low', 'medium', or 'high'")
    reps: int = Field(1, ge=1, le=3, description="Number of feature map repetitions")
    entanglement: str = Field("linear", description="'linear', 'full', or 'circular'")
    test_size: float = Field(0.25, ge=0.15, le=0.40, description="Holdout test set fraction")


class ModelMetricResult(BaseModel):
    model_name: str
    is_quantum: bool
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    test_samples: int
    total_inference_time_ms: float
    per_sample_inference_ms: float
    train_time_ms: float
    feature_importances: Optional[List[float]] = None


class BenchmarkSuiteResponse(BaseModel):
    execution_id: str
    timestamp: str
    complexity: str
    dataset_metadata: Dict[str, Any]
    models: List[ModelMetricResult]
    best_model_by_metric: Dict[str, str]
    hardware_env: Dict[str, Any]
    scientific_notes: List[str]


# ---------------- Quantum Circuit & Inspection ----------------

class CircuitInspectionResponse(BaseModel):
    name: str
    type: str
    num_qubits: int
    circuit_depth: int
    hilbert_dimension: int
    entanglement: str
    reps: int
    gate_counts: Dict[str, int]
    raw_operations: Dict[str, int]
    circuit_ascii: str
    explanation: str
    stages: List[Dict[str, Any]]
    sample_kernel_matrix: Optional[List[List[float]]] = None


# ---------------- Stream Query & Export ----------------

class TransactionListResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    transactions: List[TransactionRecord]
