import React, { useState } from "react";
import { 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Layers, 
  Terminal, 
  Info, 
  Sparkles,
  Grid
} from "lucide-react";
import { formatScore } from "../utils/formatters";

export const CircuitVisualizer = ({ circuit }) => {
  const [activeStage, setActiveStage] = useState(1);
  const [showAscii, setShowAscii] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const stages = circuit?.stages || [];
  const currentStage = stages.find(s => s.stage === activeStage) || stages[0] || {};
  const sampleMatrix = circuit?.sample_kernel_matrix || [];

  const handleNext = () => {
    setActiveStage(prev => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    setActiveStage(prev => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setActiveStage(1);
  };

  // Helper for matrix heatmap coloring
  const getFidelityColor = (val) => {
    if (val >= 0.85) return "bg-cyan-500 text-black font-bold";
    if (val >= 0.65) return "bg-cyan-600/70 text-white";
    if (val >= 0.45) return "bg-indigo-600/60 text-slate-200";
    if (val >= 0.25) return "bg-purple-900/40 text-slate-300";
    return "bg-slate-900 text-slate-500";
  };

  return (
    <section id="circuit" className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Quantum Circuit & Kernel Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Interactive educational walkthrough of Qiskit feature map embedding, entangling unitaries, and state fidelity estimation.
          </p>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeStage === 1}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-cyan-400 font-bold px-2">
            Stage {activeStage} of 4
          </span>
          <button
            onClick={handleNext}
            disabled={activeStage === 4}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset to Stage 1"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Stage Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { stage: 1, name: "1. Classical Encoding", badge: "Angle Mapping" },
          { stage: 2, name: "2. ZZ Feature Map", badge: "Hilbert Space" },
          { stage: 3, name: "3. Fidelity Kernel", badge: "Gram Matrix" },
          { stage: 4, name: "4. SVC Classifier", badge: "Dual Hyperplane" }
        ].map((s) => (
          <button
            key={s.stage}
            onClick={() => setActiveStage(s.stage)}
            className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              activeStage === s.stage
                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 glow-cyan/10"
                : "bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="text-[10px] text-slate-500 uppercase">{s.badge}</div>
            <div className="text-xs font-bold mt-0.5">{s.name}</div>
          </button>
        ))}
      </div>

      {/* Main Interactive Stage Container */}
      <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-5 space-y-6">
        {/* Stage Explanation Banner */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              {currentStage.concept || "Stage Concept"}
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              {currentStage.title || "Stage Title"}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {currentStage.explanation}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500">HILBERT DIMENSION</span>
            <div className="text-lg font-bold font-mono text-purple-400">
              2⁴ = 16 States
            </div>
          </div>
        </div>

        {/* Stage 1: Classical Normalization View */}
        {activeStage === 1 && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-slate-300 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Classical Feature Vector to Qubit Phase Angle Mapping
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { qubit: "q_0", feature: "Transaction Amount ($)", param: "x[0] ∈ [0, 2π]", formula: "θ₀ = 2π · (amt - min) / range" },
                { qubit: "q_1", feature: "Velocity Score (1-100)", param: "x[1] ∈ [0, 2π]", formula: "θ₁ = 2π · (vel - 1) / 99" },
                { qubit: "q_2", feature: "Network Anomaly (0-1)", param: "x[2] ∈ [0, 2π]", formula: "θ₂ = 2π · anomaly_net" },
                { qubit: "q_3", feature: "Device Risk (0-1)", param: "x[3] ∈ [0, 2π]", formula: "θ₃ = 2π · anomaly_device" }
              ].map((q) => (
                <div key={q.qubit} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">{q.qubit}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">{q.param}</span>
                  </div>
                  <div className="text-white font-bold">{q.feature}</div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">{q.formula}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 2: Quantum Circuit Visualizer (SVG Interactive Schematic) */}
        {activeStage === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold">Qiskit ZZFeatureMap(n=4, reps=1, entanglement='linear') Circuit Schematic</span>
              <button
                onClick={() => setShowAscii(!showAscii)}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{showAscii ? "Hide Raw QASM/ASCII" : "View Qiskit ASCII"}</span>
              </button>
            </div>

            {/* Visual SVG Circuit Diagram */}
            <div className="overflow-x-auto rounded-xl bg-slate-950 p-4 border border-slate-800">
              <svg viewBox="0 0 880 220" className="w-full min-w-[700px] h-48">
                {/* 4 Qubit Wires */}
                {[0, 1, 2, 3].map((i) => {
                  const y = 35 + i * 45;
                  return (
                    <g key={i}>
                      <text x="15" y={y + 5} fill="#00F2FE" fontSize="12" fontFamily="monospace" fontWeight="bold">
                        q_{i}
                      </text>
                      <line x1="50" y1={y} x2="840" y2={y} stroke="#334155" strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Layer 1: Hadamard Gates (H) */}
                {[0, 1, 2, 3].map((i) => {
                  const y = 35 + i * 45;
                  return (
                    <g key={`h-${i}`}>
                      <rect x="75" y={y - 14} width="28" height="28" rx="4" fill="#1E293B" stroke="#00F2FE" strokeWidth="1.5" />
                      <text x="89" y={y + 5} fill="#FFFFFF" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        H
                      </text>
                    </g>
                  );
                })}

                {/* Layer 2: Single-Qubit RZ / Phase Rotations */}
                {[0, 1, 2, 3].map((i) => {
                  const y = 35 + i * 45;
                  const label = `P(2x${i})`;
                  return (
                    <g key={`rz-${i}`}>
                      <rect x="135" y={y - 14} width="58" height="28" rx="4" fill="#1E293B" stroke="#7C3AED" strokeWidth="1.5" />
                      <text x="164" y={y + 4} fill="#C084FC" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Layer 3: Entangling CNOT + RZ Pairs (linear: q0-q1, q1-q2, q2-q3) */}
                {/* Pair 1: q0 - q1 */}
                <g>
                  {/* Control dot on q0 */}
                  <circle cx="230" cy="35" r="4.5" fill="#00F2FE" />
                  <line x1="230" y1="35" x2="230" y2="80" stroke="#00F2FE" strokeWidth="2" />
                  {/* Target cross on q1 */}
                  <circle cx="230" cy="80" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="230" y1="73" x2="230" y2="87" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="223" y1="80" x2="237" y2="80" stroke="#00F2FE" strokeWidth="2" />

                  {/* Two-qubit interaction RZ on q1 */}
                  <rect x="260" y="66" width="115" height="28" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                  <text x="317" y="84" fill="#34D399" fontSize="9.5" fontFamily="monospace" textAnchor="middle">
                    P(2(π-x₀)(π-x₁))
                  </text>

                  {/* Reverse CNOT */}
                  <circle cx="395" cy="35" r="4.5" fill="#00F2FE" />
                  <line x1="395" y1="35" x2="395" y2="80" stroke="#00F2FE" strokeWidth="2" />
                  <circle cx="395" cy="80" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="395" y1="73" x2="395" y2="87" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="388" y1="80" x2="402" y2="80" stroke="#00F2FE" strokeWidth="2" />
                </g>

                {/* Pair 2: q1 - q2 */}
                <g>
                  <circle cx="435" cy="80" r="4.5" fill="#00F2FE" />
                  <line x1="435" y1="80" x2="435" y2="125" stroke="#00F2FE" strokeWidth="2" />
                  <circle cx="435" cy="125" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="435" y1="118" x2="435" y2="132" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="428" y1="125" x2="442" y2="125" stroke="#00F2FE" strokeWidth="2" />

                  <rect x="465" y="111" width="115" height="28" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                  <text x="522" y="129" fill="#34D399" fontSize="9.5" fontFamily="monospace" textAnchor="middle">
                    P(2(π-x₁)(π-x₂))
                  </text>

                  <circle cx="600" cy="80" r="4.5" fill="#00F2FE" />
                  <line x1="600" y1="80" x2="600" y2="125" stroke="#00F2FE" strokeWidth="2" />
                  <circle cx="600" cy="125" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="600" y1="118" x2="600" y2="132" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="593" y1="125" x2="607" y2="125" stroke="#00F2FE" strokeWidth="2" />
                </g>

                {/* Pair 3: q2 - q3 */}
                <g>
                  <circle cx="640" cy="125" r="4.5" fill="#00F2FE" />
                  <line x1="640" y1="125" x2="640" y2="170" stroke="#00F2FE" strokeWidth="2" />
                  <circle cx="640" cy="170" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="640" y1="163" x2="640" y2="177" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="633" y1="170" x2="647" y2="170" stroke="#00F2FE" strokeWidth="2" />

                  <rect x="670" y="156" width="115" height="28" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                  <text x="727" y="174" fill="#34D399" fontSize="9.5" fontFamily="monospace" textAnchor="middle">
                    P(2(π-x₂)(π-x₃))
                  </text>

                  <circle cx="805" cy="125" r="4.5" fill="#00F2FE" />
                  <line x1="805" y1="125" x2="805" y2="170" stroke="#00F2FE" strokeWidth="2" />
                  <circle cx="805" cy="170" r="10" fill="none" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="805" y1="163" x2="805" y2="177" stroke="#00F2FE" strokeWidth="2" />
                  <line x1="798" y1="170" x2="812" y2="170" stroke="#00F2FE" strokeWidth="2" />
                </g>
              </svg>
            </div>

            {/* ASCII Drawer */}
            {showAscii && circuit?.circuit_ascii && (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-tight">
                {circuit.circuit_ascii}
              </pre>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">TOTAL GATES</span>
                <div className="text-white font-bold">{circuit?.gate_counts?.total_gates || 17}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">HADAMARDS (H)</span>
                <div className="text-cyan-400 font-bold">{circuit?.gate_counts?.hadamard || 4}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">PHASE ROTATIONS (P)</span>
                <div className="text-purple-400 font-bold">{circuit?.gate_counts?.phase_rotations || 7}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">CNOT ENTANGLERS (CX)</span>
                <div className="text-emerald-400 font-bold">{circuit?.gate_counts?.entanglers_cx || 6}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Fidelity Quantum Kernel Matrix Inspection */}
        {activeStage === 3 && (
          <div className="space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                Quantum Kernel Gram Matrix K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|²
              </span>
              <span className="text-slate-400 text-[11px]">
                Hover over matrix cells to inspect state overlap fidelity
              </span>
            </div>

            {/* Matrix Heatmap Grid */}
            {sampleMatrix.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-block p-4 rounded-xl bg-slate-950 border border-slate-800 min-w-full">
                  <div className="grid grid-cols-8 gap-1.5 w-max mx-auto">
                    {sampleMatrix.map((row, i) =>
                      row.map((val, j) => {
                        const isHovered = hoveredCell && hoveredCell.i === i && hoveredCell.j === j;
                        return (
                          <div
                            key={`${i}-${j}`}
                            onMouseEnter={() => setHoveredCell({ i, j, val })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-11 h-11 flex items-center justify-center rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                              isHovered
                                ? "ring-2 ring-cyan-400 border-white scale-110 z-10"
                                : "border-slate-800/60"
                            } ${getFidelityColor(val)}`}
                          >
                            {val.toFixed(2)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                Kernel matrix is computing...
              </div>
            )}

            {/* Cell Inspection Detail Tooltip / Callout */}
            {hoveredCell ? (
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Sample Pair: </span>
                  <span className="text-white font-bold">x_{hoveredCell.i} ↔ x_{hoveredCell.j}</span>
                </div>
                <div>
                  <span className="text-slate-400">Overlap Fidelity: </span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {hoveredCell.val.toFixed(4)} ({formatPercent(hoveredCell.val)})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {hoveredCell.i === hoveredCell.j ? "Self-inner product = 1.000" : "Quantum Hilbert angle similarity"}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 text-center">
                Diagonal values K(x_i, x_i) = 1.00 represent identical state overlaps. Off-diagonal elements measure relative quantum similarity.
              </div>
            )}
          </div>
        )}

        {/* Stage 4: Classification Hyperplane */}
        {activeStage === 4 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="text-slate-300 font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Precomputed Dual Support Vector Machine Decision Process
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-cyan-400 font-bold text-sm">
                Dual Optimization Formulation:
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                The quantum kernel matrix K replaces the standard linear or RBF kernel in the dual SVM formulation:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 text-center font-mono">
                max_α  ∑ α_i - ½ ∑∑ α_i α_j y_i y_j · K_Q(x_i, x_j)   subject to  0 ≤ α_i ≤ C
              </div>
              <p className="text-slate-400 leading-relaxed font-sans text-xs">
                During transaction inference, the decision function computes the signed margin distance:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 text-center font-mono">
                f(x) = ∑_(i ∈ SV) α_i y_i · |⟨Φ(x)|Φ(x_i)⟩|² + b
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
