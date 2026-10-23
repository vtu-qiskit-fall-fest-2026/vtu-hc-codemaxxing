import React, { useState } from "react";
import { 
  Zap, 
  RotateCcw, 
  Shuffle, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Info, 
  Sliders,
  DollarSign,
  Gauge,
  Wifi,
  Smartphone
} from "lucide-react";
import { RiskBadge } from "./Badge";
import { TRANSACTION_PRESETS } from "../utils/demoData";
import { formatCurrency, formatLatency, formatScore } from "../utils/formatters";

export const AnalysisTerminal = ({ onAnalyze, isAnalyzing, lastAnalysis, analysisError }) => {
  const [formData, setFormData] = useState({
    amount: 1450.00,
    velocity: 78.0,
    network_anomaly: 0.82,
    device_risk: 0.75,
    feature_map: "zz",
    threshold: 0.60
  });

  const [activePreset, setActivePreset] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActivePreset(null);
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      amount: preset.amount,
      velocity: preset.velocity,
      network_anomaly: preset.network_anomaly,
      device_risk: preset.device_risk,
      feature_map: "zz",
      threshold: 0.60
    });
    setActivePreset(preset.name);
  };

  const handleRandomize = () => {
    const isFraud = Math.random() > 0.6;
    if (isFraud) {
      setFormData({
        amount: Number((500 + Math.random() * 4000).toFixed(2)),
        velocity: Number((60 + Math.random() * 38).toFixed(1)),
        network_anomaly: Number((0.65 + Math.random() * 0.32).toFixed(3)),
        device_risk: Number((0.60 + Math.random() * 0.38).toFixed(3)),
        feature_map: "zz",
        threshold: 0.60
      });
    } else {
      setFormData({
        amount: Number((10 + Math.random() * 350).toFixed(2)),
        velocity: Number((5 + Math.random() * 40).toFixed(1)),
        network_anomaly: Number((0.02 + Math.random() * 0.35).toFixed(3)),
        device_risk: Number((0.02 + Math.random() * 0.30).toFixed(3)),
        feature_map: "zz",
        threshold: 0.60
      });
    }
    setActivePreset("Random Generated");
  };

  const handleReset = () => {
    setFormData({
      amount: 120.00,
      velocity: 25.0,
      network_anomaly: 0.15,
      device_risk: 0.10,
      feature_map: "zz",
      threshold: 0.60
    });
    setActivePreset(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <section id="terminal" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Interactive Transaction Analysis Terminal
          </h2>
          <p className="text-xs text-slate-400">
            Real-time inference using Qiskit statevector kernel matrix overlap calculation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Test</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Presets:</span>
        {TRANSACTION_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activePreset === preset.name
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 glow-cyan"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Terminal Grid: Inputs on Left, Staged Scanner & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 5 Columns */}
        <div className="lg:col-span-5 rounded-xl bg-[#0F172A] border border-slate-800 p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  Transaction Amount (USD)
                </label>
                <span className="text-cyan-400 font-bold">{formatCurrency(formData.amount)}</span>
              </div>
              <input
                type="number"
                min="1.0"
                max="50000.0"
                step="0.5"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              <input
                type="range"
                min="5"
                max="5000"
                step="10"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Field 2: Velocity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  Velocity Score (1 - 100)
                </label>
                <span className="text-purple-400 font-bold">{formData.velocity} / 100</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={formData.velocity}
                onChange={(e) => handleInputChange("velocity", parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Frequency index of transaction attempts within the past hour.
              </p>
            </div>

            {/* Field 3: Network Anomaly */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Network Anomaly Score (0 - 1.0)
                </label>
                <span className="text-emerald-400 font-bold">{formData.network_anomaly.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formData.network_anomaly}
                onChange={(e) => handleInputChange("network_anomaly", parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Graph risk index based on IP reputation, ASN cluster, and proxy tunneling.
              </p>
            </div>

            {/* Field 4: Device Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  Device / Geo Anomaly Score (0 - 1.0)
                </label>
                <span className="text-amber-400 font-bold">{formData.device_risk.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formData.device_risk}
                onChange={(e) => handleInputChange("device_risk", parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Hardware fingerprint variance and impossible travel distance indicator.
              </p>
            </div>

            {/* Advanced Configuration: Feature Map & Threshold */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Feature Map</label>
                <select
                  value={formData.feature_map}
                  onChange={(e) => handleInputChange("feature_map", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="zz">ZZFeatureMap (Linear CX)</option>
                  <option value="z">ZFeatureMap (Unentangled)</option>
                  <option value="pauli">PauliFeatureMap [Z, ZZ]</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <label>Cutoff Threshold</label>
                  <span className="text-cyan-400">{formData.threshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.85"
                  step="0.05"
                  value={formData.threshold}
                  onChange={(e) => handleInputChange("threshold", parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold font-mono text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Computing Quantum Kernel..." : "Analyze Transaction"}</span>
            </button>
          </form>
        </div>

        {/* Right Output: 7 Columns */}
        <div className="lg:col-span-7 rounded-xl bg-[#0F172A] border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          {/* Analysis Error State */}
          {analysisError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Staged Execution Scanner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold">HYBRID QUANTUM-CLASSICAL PIPELINE EXECUTION</span>
              <span>{lastAnalysis ? formatLatency(lastAnalysis.processing_time_ms) : "--"}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { stage: 1, title: "1. Encoding", desc: "Angle Map [0, 2π]" },
                { stage: 2, title: "2. State Map", desc: "4 Qubit Hilbert" },
                { stage: 3, title: "3. Kernel Gram", desc: "Fidelity Overlap" },
                { stage: 4, title: "4. SVC Decision", desc: "Hyperplane Cutoff" }
              ].map((s) => {
                const isCurrentActive = isAnalyzing;
                return (
                  <div
                    key={s.stage}
                    className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                      isCurrentActive
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 animate-pulse"
                        : lastAnalysis
                        ? "bg-slate-900 border-emerald-500/30 text-slate-200"
                        : "bg-slate-900/60 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="font-bold">{s.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Card */}
          {lastAnalysis ? (
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono text-slate-400">PREDICTED RISK CLASSIFICATION</div>
                  <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                    <RiskBadge riskClass={lastAnalysis.risk_class} size="lg" />
                    <span className="text-xs text-slate-400 font-normal">
                      (Label: {lastAnalysis.predicted_label === 1 ? "Positive / Fraud" : "Negative / Legit"})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">TXN REFERENCE</span>
                  <div className="text-xs font-mono text-cyan-400 font-bold">{lastAnalysis.transaction_id}</div>
                </div>
              </div>

              {/* Risk Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Normalized Risk Index (Sigmoid Decision Margin):</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formatScore(lastAnalysis.risk_score)}
                  </span>
                </div>

                {/* Multi-tier Risk Bar */}
                <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      lastAnalysis.risk_class === "FRAUDULENT"
                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                        : lastAnalysis.risk_class === "SUSPICIOUS"
                        ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                        : "bg-gradient-to-r from-cyan-500 to-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, lastAnalysis.risk_score * 100))}%` }}
                  />
                  {/* Decision threshold indicator line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                    style={{ left: `${(lastAnalysis.decision_threshold || 0.6) * 100}%` }}
                    title={`Decision threshold: ${lastAnalysis.decision_threshold}`}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                  <span>0.00 (CLEAR &lt; 0.40)</span>
                  <span className="text-amber-400/80">0.40 - {lastAnalysis.decision_threshold} (SUSPICIOUS)</span>
                  <span className="text-rose-400/80">&gt;= {lastAnalysis.decision_threshold} (FRAUDULENT)</span>
                </div>
              </div>

              {/* Quantum Fidelity Diagnostics */}
              {lastAnalysis.quantum_fidelities && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Fidelity to Legit Subspace</span>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {formatScore(lastAnalysis.quantum_fidelities.mean_fidelity_to_legit_samples)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Fidelity to Fraud Subspace</span>
                    <div className="text-sm font-mono font-bold text-rose-400">
                      {formatScore(lastAnalysis.quantum_fidelities.mean_fidelity_to_fraud_samples)}
                    </div>
                  </div>
                </div>
              )}

              {/* Scientific Note */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Model Output Verification</span>
                </div>
                <p>
                  Raw decision margin: <span className="font-mono text-white">{lastAnalysis.raw_decision_score > 0 ? `+${lastAnalysis.raw_decision_score}` : lastAnalysis.raw_decision_score}</span>.
                  The risk score is a bounded margin distance mapped via logistic sigmoid. High fraud alert is triggered when the transaction state has dominant Hilbert overlap with fraudulent training statevectors.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
              <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
              <div className="text-sm font-mono font-bold text-slate-400">
                Awaiting Transaction Input
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Select a preset above or adjust the parameter sliders and click <span className="text-cyan-400">Analyze Transaction</span> to evaluate the quantum feature-map kernel.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
