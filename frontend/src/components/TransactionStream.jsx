import React, { useState } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Clock,
  Layers,
  X
} from "lucide-react";
import { RiskBadge } from "./Badge";
import { formatCurrency, formatLatency, formatScore, formatTimestamp } from "../utils/formatters";

export const TransactionStream = ({
  transactions,
  totalCount,
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
  onSelectTransaction,
  selectedTransaction
}) => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalTxn, setModalTxn] = useState(null);

  const handleRowClick = (txn) => {
    setModalTxn(txn);
    setDetailModalOpen(true);
    if (onSelectTransaction) onSelectTransaction(txn);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <section id="transactions" className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Live Transaction Stream & Audit Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of evaluated transactions with quantum state fidelity classifications and risk scores.
          </p>
        </div>

        {/* Search & Risk Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-52"
            />
          </div>

          {/* Filter Risk Pills */}
          <div className="flex items-center gap-1 bg-[#0F172A] border border-slate-800 p-1 rounded-xl text-xs font-mono">
            {["ALL", "FRAUDULENT", "SUSPICIOUS", "CLEAR"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterRisk(cat);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterRisk === cat
                    ? "bg-slate-800 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-xl bg-[#0F172A] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th 
                  onClick={() => handleSort("timestamp")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Transaction ID</th>
                <th 
                  onClick={() => handleSort("amount")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Classification</th>
                <th 
                  onClick={() => handleSort("risk_score")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("processing_time_ms")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Latency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t.transaction_id}
                    onClick={() => handleRowClick(t)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatTimestamp(t.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {t.transaction_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-300">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge riskClass={t.risk_class} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{formatScore(t.risk_score)}</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${
                              t.risk_class === "FRAUDULENT"
                                ? "bg-rose-500"
                                : t.risk_class === "SUSPICIOUS"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, t.risk_score * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatLatency(t.processing_time_ms)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {t.model_used || "QSVC"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No transactions match the current query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing <strong className="text-white">{transactions.length}</strong> of{" "}
            <strong className="text-white">{totalCount}</strong> transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {detailModalOpen && modalTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-700 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">INSPECTION REPORT</span>
                <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <span>{modalTxn.transaction_id}</span>
                  <RiskBadge riskClass={modalTxn.risk_class} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">AMOUNT</span>
                <div className="text-white font-bold text-sm">{formatCurrency(modalTxn.amount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">VELOCITY SCORE</span>
                <div className="text-purple-300 font-bold text-sm">{modalTxn.velocity} / 100</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">NETWORK ANOMALY</span>
                <div className="text-emerald-300 font-bold text-sm">{modalTxn.network_anomaly?.toFixed(3)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">DEVICE / GEO DEVIATION</span>
                <div className="text-amber-300 font-bold text-sm">{modalTxn.device_risk?.toFixed(3)}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Normalized Risk Index:</span>
                <span className="font-bold text-white">{formatScore(modalTxn.risk_score)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Raw SVM Margin f(x):</span>
                <span className="font-bold text-cyan-400">{modalTxn.raw_decision_score}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Inference Duration:</span>
                <span>{formatLatency(modalTxn.processing_time_ms)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Execution Mode:</span>
                <span className="text-purple-400">{modalTxn.mode || "Simulation"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
