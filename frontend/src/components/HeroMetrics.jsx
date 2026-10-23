import React from "react";
import { 
  Activity, 
  ShieldAlert, 
  Target, 
  Sparkles, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  Binary
} from "lucide-react";
import { formatPercent } from "../utils/formatters";

export const HeroMetrics = ({ overview, isDemoMode }) => {
  const kpis = overview?.kpis || {
    transactions_analyzed: 48,
    fraud_alerts_detected: 11,
    fraud_detection_recall: 0.857,
    qsvc_accuracy: 0.880,
    quantum_feature_dim: 16
  };

  const pipelineSteps = [
    { title: "Transaction Data", desc: "4 Raw Features ($ USD, Velocity, Network, Device)" },
    { title: "Feature Normalization", desc: "MinMax Angle Range [0, 2π]" },
    { title: "ZZ Quantum Feature Map", desc: "4 Qubits, 16-D Hilbert Embedding, CX Entangled" },
    { title: "Fidelity Quantum Kernel", desc: "State Overlap |⟨Φ(x)|Φ(z)⟩|² Gram Matrix" },
    { title: "Dual SVC Classification", desc: "Hyperplane Optimization & Margin Scoring" },
    { title: "Fraud Risk Stratification", desc: "CLEAR / SUSPICIOUS / FRAUDULENT Bands" }
  ];

  return (
    <section id="overview" className="space-y-6 pt-2 pb-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0F172A] border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>QISKIT QUANTUM-KERNEL RESEARCH PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Quantum-Enhanced <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
              Financial Fraud Detection
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Leveraging <span className="text-cyan-300 font-mono font-medium">Qiskit FidelityQuantumKernel</span> to project non-linear multi-variable transaction patterns into a 16-dimensional quantum Hilbert space, evaluating state-overlap fidelity for superior fraud boundary resolution.
          </p>

          {isDemoMode && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                ⚠️ MODE B ACTIVE: Displaying reproducible synthetic demo baseline data. Start backend for live quantum simulations.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2 hover:border-cyan-500/40 transition-all glow-cyan/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVITY</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {kpis.transactions_analyzed}
          </div>
          <p className="text-[11px] text-slate-400">
            Transactions Analyzed (Cumulative Session Activity)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>THREAT ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {kpis.fraud_alerts_detected}
          </div>
          <p className="text-[11px] text-slate-400">
            High-Risk Fraud Interceptions Flagged
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TEST RECALL</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
            {formatPercent(kpis.fraud_detection_recall)}
          </div>
          <p className="text-[11px] text-slate-400">
            Held-Out Test Set Fraud Recall Rate
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>QSVC ACCURACY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
            {formatPercent(kpis.qsvc_accuracy)}
          </div>
          <p className="text-[11px] text-slate-400">
            Precomputed Quantum Kernel SVC Score
          </p>
        </div>

        {/* Metric 5 */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>FEATURE DIMENSION</span>
            <Binary className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            2⁴ = {kpis.quantum_feature_dim}
          </div>
          <p className="text-[11px] text-slate-400">
            Hilbert Space Capacity (4 Qubits)
          </p>
        </div>
      </div>

      {/* Pipeline Flow Visualization Banner */}
      <div className="rounded-xl bg-[#0F172A]/80 border border-slate-800 p-4">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span className="text-cyan-400 font-semibold">End-to-End Quantum-Classical Pipeline Architecture</span>
          <span className="text-[11px] text-slate-500">Stratified Training Split → No Data Leakage</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineSteps.map((step, idx) => (
            <div 
              key={idx} 
              className="relative rounded-lg bg-slate-900/90 border border-slate-800/80 p-2.5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400">0{idx + 1}</span>
                <h2 className="text-xs font-bold text-white mt-0.5">{step.title}</h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
