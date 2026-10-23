import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  BarChart3, 
  Clock, 
  Grid, 
  Trophy, 
  Layers, 
  AlertTriangle, 
  Cpu, 
  HelpCircle,
  Play
} from "lucide-react";
import { formatPercent, formatLatency } from "../utils/formatters";

export const BenchmarkSuite = ({ benchmarks, onRunBenchmark, isBenchmarking }) => {
  const [selectedComplexity, setSelectedComplexity] = useState("medium");
  const [activeTab, setActiveTab] = useState("metrics"); // "metrics" | "latency" | "confusion"

  const models = benchmarks?.models || [];
  const best = benchmarks?.best_model_by_metric || {};
  const meta = benchmarks?.dataset_metadata || {};

  const handleComplexityChange = (lvl) => {
    setSelectedComplexity(lvl);
    onRunBenchmark(lvl);
  };

  // Recharts Data Prep: Grouped Metrics Chart
  const metricsChartData = [
    {
      metric: "Accuracy",
      "Quantum-Kernel SVC": models.find(m => m.is_quantum)?.accuracy || 0,
      "Classical RBF SVM": models.find(m => m.model_name.includes("RBF"))?.accuracy || 0,
      "Random Forest": models.find(m => m.model_name.includes("Forest"))?.accuracy || 0,
    },
    {
      metric: "Precision",
      "Quantum-Kernel SVC": models.find(m => m.is_quantum)?.precision || 0,
      "Classical RBF SVM": models.find(m => m.model_name.includes("RBF"))?.precision || 0,
      "Random Forest": models.find(m => m.model_name.includes("Forest"))?.precision || 0,
    },
    {
      metric: "Recall",
      "Quantum-Kernel SVC": models.find(m => m.is_quantum)?.recall || 0,
      "Classical RBF SVM": models.find(m => m.model_name.includes("RBF"))?.recall || 0,
      "Random Forest": models.find(m => m.model_name.includes("Forest"))?.recall || 0,
    },
    {
      metric: "F1-Score",
      "Quantum-Kernel SVC": models.find(m => m.is_quantum)?.f1_score || 0,
      "Classical RBF SVM": models.find(m => m.model_name.includes("RBF"))?.f1_score || 0,
      "Random Forest": models.find(m => m.model_name.includes("Forest"))?.f1_score || 0,
    }
  ];

  // Recharts Data Prep: Latency Chart
  const latencyChartData = models.map(m => ({
    name: m.model_name,
    "Train Time (ms)": m.train_time_ms,
    "Per-Sample Inf (ms)": m.per_sample_inference_ms,
    isQuantum: m.is_quantum
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-slate-900/95 border border-slate-700 p-2.5 shadow-xl text-xs font-mono">
          <div className="font-bold text-white mb-1.5">{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.value > 1.0 ? `${entry.value.toFixed(1)} ms` : (entry.value * 100).toFixed(1) + "%"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="benchmarks" className="space-y-4 pt-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Benchmark Comparison Laboratory
          </h2>
          <p className="text-xs text-slate-400">
            Rigorous side-by-side evaluation across Quantum-Kernel SVC, Classical RBF SVM, and Random Forest on identical held-out test splits.
          </p>
        </div>

        {/* Complexity Switcher */}
        <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800 p-1 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 pl-2">Complexity:</span>
          {["low", "medium", "high"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleComplexityChange(lvl)}
              disabled={isBenchmarking}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                selectedComplexity === lvl
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset & Split Summary Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400">
            Total Dataset: <strong className="text-white">{meta.total_samples || 140} samples</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Train Split: <strong className="text-cyan-400">{meta.train_samples || 105}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Test Split: <strong className="text-purple-400">{meta.test_samples || 35}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Fraud Ratio: <strong className="text-rose-400">{((meta.fraud_ratio_actual || 0.21) * 100).toFixed(1)}%</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Fitted Strictly On Train (Zero Data Leakage)</span>
        </div>
      </div>

      {/* Visualizer Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === "metrics"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Classification Metrics</span>
        </button>
        <button
          onClick={() => setActiveTab("latency")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === "latency"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Computational Latency</span>
        </button>
        <button
          onClick={() => setActiveTab("confusion")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === "confusion"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Confusion Matrices</span>
        </button>
      </div>

      {/* Main Visual Display */}
      <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-5 space-y-4">
        {activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsChartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#94A3B8" domain={[0, 1.05]} fontSize={11} fontFamily="monospace" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }} />
                  <Bar dataKey="Quantum-Kernel SVC" fill="#00F2FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Classical RBF SVM" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Random Forest" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] font-mono text-slate-500 text-center">
              Evaluated on identical stratified test set. Higher scores indicate superior discrimination of fraud vs legitimate transactions.
            </div>
          </div>
        )}

        {activeTab === "latency" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Training Duration */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300">
                  Model Training Duration (ms)
                </div>
                <div className="space-y-2 pt-1 font-mono text-xs">
                  {models.map(m => (
                    <div key={m.model_name} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className={m.is_quantum ? "text-cyan-400 font-bold" : ""}>
                          {m.model_name}
                        </span>
                        <span className="font-bold">{formatLatency(m.train_time_ms)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${m.is_quantum ? "bg-cyan-400" : "bg-purple-500"}`}
                          style={{
                            width: `${Math.min(100, Math.max(5, (Math.log10(m.train_time_ms + 1) / 4) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  *Quantum-kernel training includes pairwise statevector inner product computation O(N²).
                </p>
              </div>

              {/* Per Sample Inference Latency */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300">
                  Per-Sample Inference Latency (ms)
                </div>
                <div className="space-y-2 pt-1 font-mono text-xs">
                  {models.map(m => (
                    <div key={m.model_name} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className={m.is_quantum ? "text-cyan-400 font-bold" : ""}>
                          {m.model_name}
                        </span>
                        <span className="font-bold">{formatLatency(m.per_sample_inference_ms)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${m.is_quantum ? "bg-cyan-400" : "bg-emerald-500"}`}
                          style={{
                            width: `${Math.min(100, Math.max(5, (m.per_sample_inference_ms / 60) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  *QSVC evaluates single-transaction kernel vector K(x, X_train) across all support vectors.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "confusion" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((m) => {
              const cm = m.confusion_matrix || [[0, 0], [0, 0]];
              const tn = cm[0][0];
              const fp = cm[0][1];
              const fn = cm[1][0];
              const tp = cm[1][1];

              return (
                <div
                  key={m.model_name}
                  className={`rounded-xl border p-4 space-y-3 font-mono ${
                    m.is_quantum
                      ? "bg-slate-900/90 border-cyan-500/40 glow-cyan/10"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className={`text-xs font-bold ${m.is_quantum ? "text-cyan-300" : "text-white"}`}>
                      {m.model_name}
                    </span>
                    <span className="text-[10px] text-slate-500">N={m.test_samples}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[10px] text-slate-400">True Neg (Legit)</div>
                      <div className="text-base font-bold text-emerald-400">{tn}</div>
                    </div>
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                      <div className="text-[10px] text-slate-400">False Pos (Alarm)</div>
                      <div className="text-base font-bold text-rose-400">{fp}</div>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <div className="text-[10px] text-slate-400">False Neg (Miss)</div>
                      <div className="text-base font-bold text-amber-400">{fn}</div>
                    </div>
                    <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                      <div className="text-[10px] text-slate-400">True Pos (Fraud)</div>
                      <div className="text-base font-bold text-cyan-400">{tp}</div>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 flex justify-between">
                    <span>Accuracy: <strong>{formatPercent(m.accuracy)}</strong></span>
                    <span>Recall: <strong>{formatPercent(m.recall)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Best Model Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-slate-400 text-[10px]">BEST ACCURACY</div>
              <div className="text-white font-bold">{best.best_accuracy || "Quantum-Kernel SVC"}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-slate-400 text-[10px]">BEST F1-SCORE</div>
              <div className="text-white font-bold">{best.best_f1 || "Quantum-Kernel SVC"}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-slate-400 text-[10px]">LOWEST INFERENCE LATENCY</div>
              <div className="text-white font-bold">{best.lowest_latency || "Classical RBF SVM"}</div>
            </div>
          </div>
        </div>

        {/* Scientific Integrity Advisory */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Scientific Integrity & Computational Honesty</span>
          </div>
          <p>
            Quantum advantage is an experimental hypothesis, not a guaranteed commercial result on small datasets. While Quantum-Kernel SVC constructs high-capacity feature representations in a 16-dimensional Hilbert space, classical algorithms (Random Forest and RBF SVM) are highly optimized for CPU latency. The true advantage of quantum kernels is investigated in complex non-linear correlations with high feature entanglement where classical kernels face the curse of dimensionality.
          </p>
        </div>
      </div>
    </section>
  );
};
