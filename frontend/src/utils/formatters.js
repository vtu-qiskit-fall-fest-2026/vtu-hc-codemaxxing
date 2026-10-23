/**
 * formatters.js - Data formatting utilities for Q-Guard.
 */

export const formatCurrency = (val) => {
  if (val === undefined || val === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPercent = (val, decimals = 1) => {
  if (val === undefined || val === null) return "0.0%";
  return `${(val * 100).toFixed(decimals)}%`;
};

export const formatScore = (val) => {
  if (val === undefined || val === null) return "0.000";
  return Number(val).toFixed(3);
};

export const formatLatency = (ms) => {
  if (ms === undefined || ms === null) return "0 ms";
  if (ms < 1) return "< 1 ms";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${Math.round(ms)} ms`;
};

export const formatTimestamp = (isoStr) => {
  if (!isoStr) return "--";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return isoStr;
  }
};
