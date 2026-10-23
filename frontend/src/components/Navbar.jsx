import React from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Play, 
  RotateCcw, 
  Download, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Database
} from "lucide-react";
import { ExecutionModeBadge } from "./Badge";

export const Navbar = ({
  backendConnected,
  isDemoMode,
  toggleExecutionMode,
  onRunBenchmark,
  onResetSimulation,
  onOpenReport,
  overview,
  circuit,
  isBenchmarking
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090E]/90 border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-violet-600/30 to-purple-600/10 border border-cyan-500/40 glow-cyan">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                Q-GUARD
              </span>
              <span className="text-[10px] tracking-widest font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Track 4: Quantum + AI
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium">
              Hybrid Quantum-Classical Fraud Detection Engine
            </p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-mono font-medium">
          <a
            href="#overview"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
          >
            Overview
          </a>
          <a
            href="#terminal"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
          >
            Analyze
          </a>
          <a
            href="#benchmarks"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
          >
            Benchmarks
          </a>
          <a
            href="#circuit"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
          >
            Circuit
          </a>
          <a
            href="#transactions"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
          >
            Transactions
          </a>
        </nav>

        {/* Right: Telemetry & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <ExecutionModeBadge
            isDemoMode={isDemoMode}
            onClick={toggleExecutionMode}
          />

          {/* Backend Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-rose-400"
              }`}
            />
            <span>{backendConnected ? "Backend 127.0.0.1:8000" : "Backend Offline"}</span>
          </div>

          {/* Quick Action: Benchmark Suite */}
          <button
            onClick={() => onRunBenchmark("medium")}
            disabled={isBenchmarking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold font-mono transition-all duration-150 shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isBenchmarking ? "animate-spin" : ""}`} />
            <span>{isBenchmarking ? "Benchmarking..." : "Run Suite"}</span>
          </button>

          {/* Quick Action: Reset */}
          <button
            onClick={onResetSimulation}
            title="Reset Simulation State"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Action: Export Report */}
          <button
            onClick={onOpenReport}
            title="Export Scientific Audit Report"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Telemetry Secondary Status Bar */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/40 hidden lg:flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">Simulator:</span>
            <span className="text-slate-300">{overview?.simulator_name || "Qiskit Statevector"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Qubits:</span>
            <span className="text-cyan-400 font-bold">{circuit?.num_qubits || 4} Q</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Hilbert Dim:</span>
            <span className="text-purple-400 font-bold">2^{circuit?.num_qubits || 4} = 16</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Feature Map:</span>
            <span className="text-emerald-400">{circuit?.name || "ZZFeatureMap"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Circuit Depth:</span>
            <span className="text-slate-300">{circuit?.circuit_depth || 11}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Qiskit 2.6.0</span>
          <span>•</span>
          <span>FidelityQuantumKernel</span>
          <span>•</span>
          <span>precomputed SVC</span>
        </div>
      </div>
    </header>
  );
};
