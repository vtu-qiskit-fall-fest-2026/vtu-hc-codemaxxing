/**
 * api.js - Centralized API Service for Q-Guard.
 * Handles live REST API calls with graceful fallback to Mode B (Demo Preview).
 */

import {
  DEMO_OVERVIEW,
  DEMO_BENCHMARKS,
  DEMO_CIRCUIT,
  DEMO_TRANSACTIONS
} from "../utils/demoData";

const API_BASE = "http://127.0.0.1:8000/api";

const timeoutFetch = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const apiService = {
  /**
   * Health check to detect whether live backend is running.
   */
  async checkHealth() {
    try {
      const res = await timeoutFetch(`${API_BASE}/health`, { method: "GET" }, 4000);
      if (!res.ok) throw new Error("Health check non-200");
      return await res.json();
    } catch {
      return {
        status: "OFFLINE",
        execution_mode: "Demo Preview",
        backend_name: "Qiskit Simulator (Offline Fallback)",
        qiskit_version: "2.6.0",
        python_version: "3.12.7",
        ready: false
      };
    }
  },

  /**
   * Fetch overview telemetry and KPIs.
   */
  async getOverview(isDemo = false) {
    if (isDemo) return DEMO_OVERVIEW;
    try {
      const res = await timeoutFetch(`${API_BASE}/overview`, {}, 5000);
      if (!res.ok) throw new Error("Failed to fetch overview");
      return await res.json();
    } catch {
      return DEMO_OVERVIEW;
    }
  },

  /**
   * Submit transaction for quantum inference.
   */
  async analyzeTransaction(txn, isDemo = false) {
    if (isDemo) {
      // Deterministic calculation for demo mode
      const rawScore = (txn.velocity / 100.0) * 0.4 + txn.network_anomaly * 0.35 + txn.device_risk * 0.25;
      const amountFactor = txn.amount > 2000 ? 0.15 : 0.0;
      const combinedScore = Math.min(1.0, rawScore + amountFactor);

      const threshold = txn.threshold || 0.60;
      let riskClass = "CLEAR";
      if (combinedScore >= threshold) riskClass = "FRAUDULENT";
      else if (combinedScore >= 0.40) riskClass = "SUSPICIOUS";

      return {
        transaction_id: `TXN-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        amount: txn.amount,
        velocity: txn.velocity,
        network_anomaly: txn.network_anomaly,
        device_risk: txn.device_risk,
        risk_class: riskClass,
        predicted_label: riskClass === "CLEAR" ? 0 : 1,
        risk_score: Number(combinedScore.toFixed(3)),
        raw_decision_score: Number(((combinedScore - 0.5) * 4.0).toFixed(3)),
        decision_threshold: threshold,
        processing_time_ms: Math.floor(45 + Math.random() * 30),
        model_used: "Quantum-Kernel SVC (QSVC)",
        mode: "Demo Preview",
        pipeline_stages: [
          { stage: 1, name: "Feature Encoding", status: "COMPLETED", details: "Scaled 4 features into [0, 2*pi] angles" },
          { stage: 2, name: "Quantum State Mapping", status: "COMPLETED", details: "Applied ZZFeatureMap across 4 qubits" },
          { stage: 3, name: "Fidelity Kernel Computation", status: "COMPLETED", details: "Evaluated state overlap fidelity" },
          { stage: 4, name: "Hyperplane Classification", status: "COMPLETED", details: "Evaluated precomputed SVM decision boundary" }
        ],
        quantum_fidelities: {
          mean_fidelity_to_legit_samples: Number((1.0 - combinedScore * 0.7).toFixed(3)),
          mean_fidelity_to_fraud_samples: Number((0.2 + combinedScore * 0.75).toFixed(3))
        }
      };
    }

    const res = await timeoutFetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txn)
    }, 12000);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
      throw new Error(err.detail || "Analysis request failed");
    }

    return await res.json();
  },

  /**
   * Run benchmark suite.
   */
  async runBenchmark(config, isDemo = false) {
    if (isDemo) {
      // Simulate slight variation based on complexity
      const clone = JSON.parse(JSON.stringify(DEMO_BENCHMARKS));
      clone.complexity = config.complexity || "medium";
      clone.timestamp = new Date().toISOString();
      return clone;
    }

    const res = await timeoutFetch(`${API_BASE}/benchmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    }, 25000);

    if (!res.ok) {
      throw new Error("Benchmark queueing failed");
    }

    return await res.json();
  },

  /**
   * Fetch latest completed benchmark suite results.
   */
  async getBenchmarks(isDemo = false) {
    if (isDemo) return DEMO_BENCHMARKS;
    try {
      const res = await timeoutFetch(`${API_BASE}/benchmarks`, {}, 6000);
      if (!res.ok) throw new Error("Benchmarks unavailable");
      return await res.json();
    } catch {
      return DEMO_BENCHMARKS;
    }
  },

  /**
   * Fetch quantum circuit metadata and sample kernel matrix.
   */
  async getCircuit(isDemo = false) {
    if (isDemo) return DEMO_CIRCUIT;
    try {
      const res = await timeoutFetch(`${API_BASE}/circuit`, {}, 5000);
      if (!res.ok) throw new Error("Circuit info unavailable");
      return await res.json();
    } catch {
      return DEMO_CIRCUIT;
    }
  },

  /**
   * Fetch transaction stream with search, filter, and pagination.
   */
  async getTransactions(params = {}, isDemo = false) {
    if (isDemo) {
      let filtered = [...DEMO_TRANSACTIONS];
      if (params.filter_risk && params.filter_risk !== "ALL") {
        filtered = filtered.filter(t => t.risk_class.toUpperCase() === params.filter_risk.toUpperCase());
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(t => t.transaction_id.toLowerCase().includes(s));
      }
      return {
        total_count: filtered.length,
        page: params.page || 1,
        page_size: params.page_size || 10,
        transactions: filtered
      };
    }

    const query = new URLSearchParams();
    if (params.filter_risk) query.append("filter_risk", params.filter_risk);
    if (params.search) query.append("search", params.search);
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.sort_order) query.append("sort_order", params.sort_order);
    if (params.page) query.append("page", params.page);
    if (params.page_size) query.append("page_size", params.page_size);

    try {
      const res = await timeoutFetch(`${API_BASE}/transactions?${query.toString()}`, {}, 5000);
      if (!res.ok) throw new Error("Transaction fetch error");
      return await res.json();
    } catch {
      return {
        total_count: DEMO_TRANSACTIONS.length,
        page: 1,
        page_size: 10,
        transactions: DEMO_TRANSACTIONS
      };
    }
  },

  getReportDownloadUrl() {
    return `${API_BASE}/report`;
  }
};
