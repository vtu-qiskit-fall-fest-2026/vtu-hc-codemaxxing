/**
 * demoData.js - Deterministic Research Preview Data for Mode B (Demo Preview).
 * 
 * SCIENTIFIC INTEGRITY:
 * These values are strictly labeled as illustrative demo presets when the live
 * Qiskit Python backend is offline.
 */

export const TRANSACTION_PRESETS = [
  {
    name: "Regular Coffee Purchase",
    description: "Low amount, normal velocity, zero network anomaly, known device",
    amount: 14.50,
    velocity: 18.0,
    network_anomaly: 0.08,
    device_risk: 0.05,
    expected_class: "CLEAR"
  },
  {
    name: "Card-Testing Velocity Surge",
    description: "Rapid micropayments from high-risk VPN IP cluster",
    amount: 65.00,
    velocity: 92.0,
    network_anomaly: 0.89,
    device_risk: 0.62,
    expected_class: "FRAUDULENT"
  },
  {
    name: "High-Value Account Takeover",
    description: "Large transfer with new foreign hardware fingerprint",
    amount: 3450.00,
    velocity: 45.0,
    network_anomaly: 0.74,
    device_risk: 0.95,
    expected_class: "FRAUDULENT"
  },
  {
    name: "Borderline Travel Anomaly",
    description: "Legitimate user traveling abroad with moderate device risk",
    amount: 320.00,
    velocity: 35.0,
    network_anomaly: 0.42,
    device_risk: 0.58,
    expected_class: "SUSPICIOUS"
  }
];

export const DEMO_OVERVIEW = {
  kpis: {
    transactions_analyzed: 48,
    fraud_alerts_detected: 11,
    fraud_detection_recall: 0.857,
    qsvc_accuracy: 0.880,
    quantum_feature_dim: 16
  },
  dataset_metadata: {
    total_samples: 140,
    train_samples: 105,
    test_samples: 35,
    fraud_samples_total: 30,
    fraud_ratio_actual: 0.214,
    complexity: "medium",
    noise_level: 0.15,
    encoding_range: "[0, 2*pi]",
    synthetic_disclaimer: "Mode B Demo Preview Data - Synthetic illustrative baseline."
  },
  simulator_name: "Qiskit Statevector Simulator (Aer/Reference Engine)",
  qubit_count: 4,
  quantum_feature_dim: 16,
  circuit_depth: 11,
  execution_mode: "Demo Preview",
  last_benchmark_timestamp: new Date().toISOString()
};

export const DEMO_BENCHMARKS = {
  execution_id: "DEMO-BENCH-2026",
  timestamp: new Date().toISOString(),
  complexity: "medium",
  dataset_metadata: {
    total_samples: 140,
    train_samples: 105,
    test_samples: 35,
    fraud_samples_total: 30,
    fraud_ratio_actual: 0.214,
    complexity: "medium"
  },
  models: [
    {
      model_name: "Quantum-Kernel SVC (QSVC)",
      is_quantum: true,
      accuracy: 0.8800,
      precision: 0.8333,
      recall: 0.8571,
      f1_score: 0.8450,
      confusion_matrix: [
        [25, 2],
        [1, 7]
      ],
      test_samples: 35,
      total_inference_time_ms: 1845.2,
      per_sample_inference_ms: 52.72,
      train_time_ms: 4820.5
    },
    {
      model_name: "Classical RBF SVM",
      is_quantum: false,
      accuracy: 0.8571,
      precision: 0.8000,
      recall: 0.8000,
      f1_score: 0.8000,
      confusion_matrix: [
        [24, 3],
        [2, 6]
      ],
      test_samples: 35,
      total_inference_time_ms: 3.2,
      per_sample_inference_ms: 0.09,
      train_time_ms: 8.5
    },
    {
      model_name: "Random Forest",
      is_quantum: false,
      accuracy: 0.8857,
      precision: 0.8571,
      recall: 0.8571,
      f1_score: 0.8571,
      confusion_matrix: [
        [25, 2],
        [1, 7]
      ],
      test_samples: 35,
      total_inference_time_ms: 12.8,
      per_sample_inference_ms: 0.36,
      train_time_ms: 34.2,
      feature_importances: [0.38, 0.28, 0.20, 0.14]
    }
  ],
  best_model_by_metric: {
    best_accuracy: "Random Forest",
    best_f1: "Random Forest",
    lowest_latency: "Classical RBF SVM"
  },
  hardware_env: {
    simulator: "Qiskit Statevector Simulator",
    qiskit_version: "2.6.0",
    python_version: "3.12.7",
    qubit_count: 4,
    hilbert_dimension: 16
  },
  scientific_notes: [
    "Demo Preview: Illustrative benchmark baseline generated for browser preview.",
    "Quantum kernel computed via simulated Statevector state overlap |<Phi(x)|Phi(z)>|^2.",
    "Classical baselines demonstrate higher computational efficiency on low-dimensional data."
  ]
};

export const DEMO_CIRCUIT = {
  name: "ZZFeatureMap",
  type: "zz",
  num_qubits: 4,
  circuit_depth: 11,
  hilbert_dimension: 16,
  entanglement: "linear",
  reps: 1,
  gate_counts: {
    hadamard: 4,
    phase_rotations: 7,
    entanglers_cx: 6,
    total_gates: 17
  },
  raw_operations: { "h": 4, "p": 7, "cx": 6 },
  circuit_ascii: `
     ┌───┐┌──────────┐                                                              
q_0: ┤ H ├┤ P(2.0*x) ├──■─────────────────────■────────────────────────────────────
     ├───┤├──────────┤┌─┴─┐┌───────────────┐┌─┴─┐                                  
q_1: ┤ H ├┤ P(2.0*y) ├┤ X ├┤ P(2*(π-x)(π-y))├┤ X ├──■───────────────────■─────────
     ├───┤├──────────┤└───┘└───────────────┘└───┘┌─┴─┐┌───────────────┐┌─┴─┐       
q_2: ┤ H ├┤ P(2.0*z) ├────────────────────────────┤ X ├┤ P(2*(π-y)(π-z))├┤ X ├──■──
     ├───┤├──────────┤                            └───┘└───────────────┘└───┘┌─┴─┐ 
q_3: ┤ H ├┤ P(2.0*w) ├────────────────────────────────────────────────────────┤ X ├
     └───┘└──────────┘                                                        └───┘ 
  `,
  explanation: "Encodes 4 classical fraud features into 16-dimensional complex Hilbert space using Hadamard superposition and linear CX entanglement.",
  stages: [
    {
      stage: 1,
      title: "Classical Feature Normalization",
      concept: "Angle Range Scaling [0, 2π]",
      explanation: "Normalizes transaction amount, velocity, network anomaly, and device risk into rotation angles.",
      qubit_mapping: [
        { qubit: 0, feature: "amount", angle_param: "x[0]" },
        { qubit: 1, feature: "velocity", angle_param: "x[1]" },
        { qubit: 2, feature: "network_anomaly", angle_param: "x[2]" },
        { qubit: 3, feature: "device_risk", angle_param: "x[3]" }
      ]
    },
    {
      stage: 2,
      title: "Quantum Feature Map (ZZFeatureMap)",
      concept: "Non-Linear Hilbert Space Embedding",
      explanation: "Applies Hadamard gates to generate equal superposition, single-qubit Rz(x_i) phase rotations, and CNOT-entangled Rz(2(π-x_i)(π-x_j)) gates.",
      hilbert_dimension: 16,
      depth: 11,
      gates: { hadamard: 4, phase_rotations: 7, entanglers_cx: 6, total_gates: 17 }
    },
    {
      stage: 3,
      title: "Fidelity Quantum Kernel",
      concept: "Transition Probability Overlap",
      explanation: "Calculates quantum state overlap fidelity K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|² as an inner-product measure of similarity.",
      matrix_shape: "4x4"
    },
    {
      stage: 4,
      title: "Hyperplane Classification (QSVC)",
      concept: "Precomputed Dual SVM Optimization",
      explanation: "Finds the maximal separating margin in the quantum Hilbert space to stratify CLEAR, SUSPICIOUS, and FRAUDULENT transactions."
    }
  ],
  sample_kernel_matrix: [
    [1.000, 0.428, 0.125, 0.089, 0.312, 0.890, 0.145, 0.220],
    [0.428, 1.000, 0.098, 0.114, 0.245, 0.380, 0.082, 0.165],
    [0.125, 0.098, 1.000, 0.875, 0.650, 0.112, 0.910, 0.742],
    [0.089, 0.114, 0.875, 1.000, 0.580, 0.075, 0.865, 0.795],
    [0.312, 0.245, 0.650, 0.580, 1.000, 0.290, 0.612, 0.510],
    [0.890, 0.380, 0.112, 0.075, 0.290, 1.000, 0.130, 0.195],
    [0.145, 0.082, 0.910, 0.865, 0.612, 0.130, 1.000, 0.812],
    [0.220, 0.165, 0.742, 0.795, 0.510, 0.195, 0.812, 1.000]
  ]
};

export const DEMO_TRANSACTIONS = [
  {
    transaction_id: "TXN-DEMO-901",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    amount: 2450.00,
    velocity: 88.0,
    network_anomaly: 0.92,
    device_risk: 0.89,
    risk_class: "FRAUDULENT",
    predicted_label: 1,
    risk_score: 0.934,
    raw_decision_score: 2.65,
    decision_threshold: 0.60,
    processing_time_ms: 78.4,
    model_used: "Quantum-Kernel SVC (QSVC)",
    mode: "Demo Preview"
  },
  {
    transaction_id: "TXN-DEMO-902",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    amount: 32.50,
    velocity: 12.0,
    network_anomaly: 0.04,
    device_risk: 0.08,
    risk_class: "CLEAR",
    predicted_label: 0,
    risk_score: 0.115,
    raw_decision_score: -2.04,
    decision_threshold: 0.60,
    processing_time_ms: 62.1,
    model_used: "Quantum-Kernel SVC (QSVC)",
    mode: "Demo Preview"
  },
  {
    transaction_id: "TXN-DEMO-903",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    amount: 410.00,
    velocity: 52.0,
    network_anomaly: 0.45,
    device_risk: 0.52,
    risk_class: "SUSPICIOUS",
    predicted_label: 1,
    risk_score: 0.542,
    raw_decision_score: 0.17,
    decision_threshold: 0.60,
    processing_time_ms: 69.8,
    model_used: "Quantum-Kernel SVC (QSVC)",
    mode: "Demo Preview"
  },
  {
    transaction_id: "TXN-DEMO-904",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    amount: 1850.00,
    velocity: 76.0,
    network_anomaly: 0.81,
    device_risk: 0.77,
    risk_class: "FRAUDULENT",
    predicted_label: 1,
    risk_score: 0.871,
    raw_decision_score: 1.91,
    decision_threshold: 0.60,
    processing_time_ms: 74.2,
    model_used: "Quantum-Kernel SVC (QSVC)",
    mode: "Demo Preview"
  },
  {
    transaction_id: "TXN-DEMO-905",
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    amount: 88.00,
    velocity: 22.0,
    network_anomaly: 0.12,
    device_risk: 0.15,
    risk_class: "CLEAR",
    predicted_label: 0,
    risk_score: 0.184,
    raw_decision_score: -1.49,
    decision_threshold: 0.60,
    processing_time_ms: 60.5,
    model_used: "Quantum-Kernel SVC (QSVC)",
    mode: "Demo Preview"
  }
];
