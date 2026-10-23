/**
 * useQuantumEngine.js - Custom React Hook for Quantum Engine State & API Coordination.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../services/api";
import { DEMO_TRANSACTIONS } from "../utils/demoData";

export const useQuantumEngine = () => {
  const [backendConnected, setBackendConnected] = useState(false);
  const [isManualDemo, setIsManualDemo] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  const [overview, setOverview] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const [circuit, setCircuit] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalTxnCount, setTotalTxnCount] = useState(0);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filters & sorting for transaction stream
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Active execution mode computation
  const isDemoMode = isManualDemo || !backendConnected;
  const executionModeLabel = isDemoMode ? "Demo Preview" : "Quantum Simulation";

  // Check health on mount and periodically
  const checkBackendHealth = useCallback(async () => {
    try {
      const h = await apiService.checkHealth();
      const isOnline = h.status === "HEALTHY";
      setBackendConnected(isOnline);
      setHealthInfo(h);
      return isOnline;
    } catch {
      setBackendConnected(false);
      return false;
    }
  }, []);

  // Load all telemetry & initial data
  const loadInitialData = useCallback(async () => {
    const online = await checkBackendHealth();
    const demo = isManualDemo || !online;

    try {
      const [ov, bm, cr, txns] = await Promise.all([
        apiService.getOverview(demo),
        apiService.getBenchmarks(demo),
        apiService.getCircuit(demo),
        apiService.getTransactions({ page: 1, page_size: 15 }, demo)
      ]);

      setOverview(ov);
      setBenchmarks(bm);
      setCircuit(cr);
      setTransactions(txns.transactions || []);
      setTotalTxnCount(txns.total_count || 0);

      // Pre-select first transaction for inspector
      if (txns.transactions && txns.transactions.length > 0) {
        setSelectedTransaction(txns.transactions[0]);
      }
    } catch (err) {
      console.warn("Data loading notice:", err);
    }
  }, [checkBackendHealth, isManualDemo]);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, [loadInitialData, checkBackendHealth]);

  // Reload transactions when filters or pagination changes
  const reloadTransactions = useCallback(async () => {
    const demo = isManualDemo || !backendConnected;
    try {
      const res = await apiService.getTransactions({
        filter_risk: filterRisk,
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: 15
      }, demo);
      setTransactions(res.transactions || []);
      setTotalTxnCount(res.total_count || 0);
    } catch (err) {
      console.warn("Reload txns error:", err);
    }
  }, [filterRisk, searchTerm, sortBy, sortOrder, page, isManualDemo, backendConnected]);

  useEffect(() => {
    reloadTransactions();
  }, [reloadTransactions]);

  // Single transaction analysis handler
  const analyzeTransaction = async (formData) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    const demo = isManualDemo || !backendConnected;

    try {
      const result = await apiService.analyzeTransaction(formData, demo);
      setLastAnalysis(result);
      setSelectedTransaction(result);

      // Update transactions stream
      setTransactions(prev => [result, ...prev]);
      setTotalTxnCount(prev => prev + 1);

      // Update overview KPIs
      setOverview(prev => {
        if (!prev) return prev;
        const isFraud = result.risk_class === "FRAUDULENT";
        return {
          ...prev,
          kpis: {
            ...prev.kpis,
            transactions_analyzed: prev.kpis.transactions_analyzed + 1,
            fraud_alerts_detected: prev.kpis.fraud_alerts_detected + (isFraud ? 1 : 0)
          }
        };
      });

      return result;
    } catch (err) {
      setAnalysisError(err.message || "Quantum analysis failed.");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run benchmark suite
  const runBenchmarkSuite = async (complexity = "medium") => {
    setIsBenchmarking(true);
    const demo = isManualDemo || !backendConnected;

    try {
      const res = await apiService.runBenchmark({ complexity }, demo);
      if (demo) {
        setBenchmarks(res);
      } else {
        // Poll for results if async job
        setTimeout(async () => {
          try {
            const updated = await apiService.getBenchmarks(false);
            setBenchmarks(updated);
            const ov = await apiService.getOverview(false);
            setOverview(ov);
          } catch {
            // ignore
          } finally {
            setIsBenchmarking(false);
          }
        }, 6000);
        return res;
      }
    } catch (err) {
      console.error("Benchmark error:", err);
    } finally {
      if (demo) setIsBenchmarking(false);
    }
  };

  // Toggle demo/live mode
  const toggleExecutionMode = () => {
    setIsManualDemo(prev => !prev);
  };

  // Reset simulation state
  const resetSimulation = () => {
    setLastAnalysis(null);
    setAnalysisError(null);
    loadInitialData();
  };

  return {
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
    resetSimulation,
    refreshData: loadInitialData
  };
};
