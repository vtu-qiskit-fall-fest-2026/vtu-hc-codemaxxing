import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroMetrics } from "./components/HeroMetrics";
import { AnalysisTerminal } from "./components/AnalysisTerminal";
import { BenchmarkSuite } from "./components/BenchmarkSuite";
import { CircuitVisualizer } from "./components/CircuitVisualizer";
import { TransactionStream } from "./components/TransactionStream";
import { ReportModal } from "./components/ReportModal";
import { useQuantumEngine } from "./hooks/useQuantumEngine";
import { ShieldCheck, Cpu, ExternalLink } from "lucide-react";

export function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const {
    backendConnected,
    isDemoMode,
    executionModeLabel,
    healthInfo,
    overview,
    benchmarks,
    circuit,
    transactions,
    totalTxnCount,
    isAnalyzing,
    isBenchmarking,
    analysisError,
    lastAnalysis,
    selectedTransaction,
    setSelectedTransaction,
    filterRisk,
    setFilterRisk,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    analyzeTransaction,
    runBenchmarkSuite,
    toggleExecutionMode,
    resetSimulation
  } = useQuantumEngine();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Quantum Grid Pattern */}
      <div className="fixed inset-0 bg-quantum-grid pointer-events-none opacity-40 z-0" />

      {/* Top Sticky Navigation */}
      <Navbar
        backendConnected={backendConnected}
        isDemoMode={isDemoMode}
        toggleExecutionMode={toggleExecutionMode}
        onRunBenchmark={runBenchmarkSuite}
        onResetSimulation={resetSimulation}
        onOpenReport={() => setReportModalOpen(true)}
        overview={overview}
        circuit={circuit}
        isBenchmarking={isBenchmarking}
      />

      {/* Main Single Page Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-12">
        {/* Section A & B: Hero Dashboard & KPIs */}
        <HeroMetrics overview={overview} isDemoMode={isDemoMode} />

        {/* Section C: Interactive Transaction Analysis Terminal */}
        <AnalysisTerminal
          onAnalyze={analyzeTransaction}
          isAnalyzing={isAnalyzing}
          lastAnalysis={lastAnalysis}
          analysisError={analysisError}
        />

        {/* Section D: Benchmark Comparison Laboratory */}
        <BenchmarkSuite
          benchmarks={benchmarks}
          onRunBenchmark={runBenchmarkSuite}
          isBenchmarking={isBenchmarking}
        />

        {/* Section E: Quantum Circuit and Kernel Visualizer */}
        <CircuitVisualizer circuit={circuit} />

        {/* Section F: Live Transaction Stream */}
        <TransactionStream
          transactions={transactions}
          totalCount={totalTxnCount}
          filterRisk={filterRisk}
          setFilterRisk={setFilterRisk}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          page={page}
          setPage={setPage}
          onSelectTransaction={setSelectedTransaction}
          selectedTransaction={selectedTransaction}
        />
      </main>

      {/* Audit Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        benchmarks={benchmarks}
        overview={overview}
        isDemoMode={isDemoMode}
      />

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-slate-800/80 bg-[#07090E] py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">Q-GUARD</span>
            <span>• Track 4: Quantum + AI & ML Hackathon</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Qiskit 2.6.0 &amp; QML</span>
            <span>•</span>
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React &amp; Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
