import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Sparkles } from "lucide-react";

export const RiskBadge = ({ riskClass, size = "md" }) => {
  const normalized = (riskClass || "CLEAR").toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-mono",
    md: "px-3 py-1 text-xs font-mono font-medium",
    lg: "px-4 py-1.5 text-sm font-mono font-bold"
  }[size] || "px-3 py-1 text-xs font-mono font-medium";

  if (normalized === "FRAUDULENT") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 glow-rose ${sizeClasses}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        FRAUDULENT
      </span>
    );
  }

  if (normalized === "SUSPICIOUS") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 glow-amber ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        SUSPICIOUS
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 glow-emerald ${sizeClasses}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      CLEAR
    </span>
  );
};

export const ExecutionModeBadge = ({ isDemoMode, onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Click to toggle between Quantum Simulation and Demo Preview"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all duration-200 border cursor-pointer ${
        !isDemoMode
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 glow-cyan hover:bg-cyan-500/25"
          : "bg-purple-500/15 text-purple-300 border-purple-500/40 glow-violet hover:bg-purple-500/25"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${!isDemoMode ? "bg-cyan-400 animate-ping" : "bg-purple-400"}`} />
      <span className="font-semibold">
        {!isDemoMode ? "MODE A: QUANTUM SIMULATION" : "MODE B: DEMO PREVIEW"}
      </span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
        ({!isDemoMode ? "LIVE CPU" : "OFFLINE/SYNTH"})
      </span>
    </button>
  );
};
