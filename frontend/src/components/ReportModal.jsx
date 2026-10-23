import React from "react";
import { Download, Printer, X, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { apiService } from "../services/api";
import { formatPercent, formatLatency } from "../utils/formatters";

export const ReportModal = ({ isOpen, onClose, benchmarks, overview, isDemoMode }) => {
  if (!isOpen) return null;

  const models = benchmarks?.models || [];
  const meta = benchmarks?.dataset_metadata || {};

  const handleDownloadJson = () => {
    if (!isDemoMode) {
      window.open(apiService.getReportDownloadUrl(), "_blank");
    } else {
      const demoReport = {
        project: "Q-Guard: Quantum-Enhanced Financial Fraud Detection Engine",
        execution_mode: "Demo Preview",
        timestamp: new Date().toISOString(),
        benchmarks,
        overview
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(demoReport, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `qguard_demo_report_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-mono">
              Q-Guard Scientific Audit & Benchmark Report
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Track 4: Quantum + AI & ML • Hackathon Final Report
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 text-[10px]">EXECUTION MODE:</span>
              <div className="text-cyan-300 font-bold">{isDemoMode ? "Demo Preview" : "Live Quantum Simulation"}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">SIMULATOR ENGINE:</span>
              <div className="text-white font-bold">{overview?.simulator_name || "Qiskit Statevector"}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">HILBERT SPACE DIMENSION:</span>
              <div className="text-purple-300 font-bold">2⁴ = 16 (4 Qubits)</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">FEATURE ENCODING:</span>
              <div className="text-emerald-300 font-bold">ZZFeatureMap (Linear Entanglement)</div>
            </div>
          </div>

          {/* Model Summary Table */}
          <div className="space-y-2">
            <div className="text-slate-300 font-bold">Model Performance Summary (Held-Out Test Set):</div>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Model</th>
                    <th className="p-2.5">Accuracy</th>
                    <th className="p-2.5">Recall</th>
                    <th className="p-2.5">F1-Score</th>
                    <th className="p-2.5">Inference (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {models.map(m => (
                    <tr key={m.model_name}>
                      <td className={`p-2.5 font-bold ${m.is_quantum ? "text-cyan-300" : "text-white"}`}>
                        {m.model_name}
                      </td>
                      <td className="p-2.5 text-slate-200">{formatPercent(m.accuracy)}</td>
                      <td className="p-2.5 text-slate-200">{formatPercent(m.recall)}</td>
                      <td className="p-2.5 text-slate-200">{formatPercent(m.f1_score)}</td>
                      <td className="p-2.5 text-slate-400">{formatLatency(m.per_sample_inference_ms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
            <strong className="text-white">Scientific Integrity Note:</strong> The SVM decision boundary represents a geometric hyper-margin in quantum Hilbert space. Single-transaction scores are normalized margin indicators. Preprocessing was fitted strictly on training data to prevent data leakage.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / Save as PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
