"""
reporting.py - Export and Figure Generation for Q-Guard.

Generates:
1. Comprehensive structured JSON audit reports.
2. Publication-quality Matplotlib/Seaborn visualization figures for hackathon presentation.
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import numpy as np

# Non-interactive backend for server-side plot rendering
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns


FIGURES_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts", "figures")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts", "reports")

os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_benchmark_figures(
    benchmark_data: Dict[str, Any],
    sample_kernel_matrix: Optional[np.ndarray] = None
) -> Dict[str, str]:
    """
    Generates high-contrast cyberpunk research-grade figures using Matplotlib and Seaborn.
    Returns dictionary of generated relative file paths.
    """
    # Styling configuration matching Obsidian / Quantum Cyan palette
    plt.style.use("dark_background")
    palette = {
        "obsidian": "#07090E",
        "surface": "#0F172A",
        "cyan": "#00F2FE",
        "violet": "#7C3AED",
        "emerald": "#10B981",
        "amber": "#F59E0B",
        "rose": "#F43F5E",
        "text": "#E2E8F0"
    }

    generated_files = {}
    models = benchmark_data.get("models", [])
    if not models:
        return generated_files

    model_names = [m["model_name"] for m in models]
    colors = [palette["cyan"], palette["violet"], palette["emerald"]]

    # ---------------- 1. Grouped Metrics Comparison Chart ----------------
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=palette["obsidian"])
    ax.set_facecolor(palette["surface"])

    metrics = ["accuracy", "precision", "recall", "f1_score"]
    metric_labels = ["Accuracy", "Precision", "Recall", "F1-Score"]
    x = np.arange(len(metrics))
    bar_width = 0.25

    for i, model in enumerate(models):
        scores = [model[m] for m in metrics]
        offset = (i - 1) * bar_width
        bars = ax.bar(
            x + offset,
            scores,
            bar_width,
            label=model["model_name"],
            color=colors[i % len(colors)],
            alpha=0.88,
            edgecolor=colors[i % len(colors)],
            linewidth=1.2
        )
        # Value labels above bars
        for bar in bars:
            height = bar.get_height()
            ax.annotate(
                f"{height:.2f}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha="center", va="bottom",
                fontsize=8.5, color=palette["text"], weight="bold"
            )

    ax.set_title("Model Performance Benchmarks: Quantum vs Classical Baselines", fontsize=13, weight="bold", color=palette["cyan"], pad=14)
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=10.5, color=palette["text"], weight="bold")
    ax.set_ylabel("Score (0.00 - 1.00)", fontsize=10, color=palette["text"])
    ax.set_ylim(0, 1.15)
    ax.grid(axis="y", linestyle="--", alpha=0.15)
    ax.legend(facecolor=palette["surface"], edgecolor="#334155", fontsize=9.5)

    chart1_path = os.path.join(FIGURES_DIR, "benchmark_metrics.png")
    plt.tight_layout()
    plt.savefig(chart1_path, dpi=200, facecolor=fig.get_facecolor(), bbox_inches="tight")
    plt.close(fig)
    generated_files["benchmark_metrics"] = chart1_path

    # ---------------- 2. Wall-Clock Execution Time Comparison ----------------
    fig, (ax_train, ax_inf) = plt.subplots(1, 2, figsize=(11, 4.5), facecolor=palette["obsidian"])
    ax_train.set_facecolor(palette["surface"])
    ax_inf.set_facecolor(palette["surface"])

    train_times = [m["train_time_ms"] for m in models]
    inf_times = [m["per_sample_inference_ms"] for m in models]

    # Training times
    ax_train.bar(model_names, train_times, color=colors, alpha=0.85, edgecolor="#ffffff", linewidth=0.8)
    ax_train.set_title("Training Duration (Wall-Clock ms)", fontsize=11, weight="bold", color=palette["text"])
    ax_train.set_ylabel("Milliseconds (ms)", fontsize=9.5)
    ax_train.set_yscale("log")
    ax_train.grid(axis="y", linestyle="--", alpha=0.2)
    ax_train.tick_params(axis="x", rotation=15, labelsize=8.5)

    # Per-sample inference times
    ax_inf.bar(model_names, inf_times, color=colors, alpha=0.85, edgecolor="#ffffff", linewidth=0.8)
    ax_inf.set_title("Per-Sample Inference Latency (ms)", fontsize=11, weight="bold", color=palette["text"])
    ax_inf.set_ylabel("Milliseconds (ms)", fontsize=9.5)
    ax_inf.grid(axis="y", linestyle="--", alpha=0.2)
    ax_inf.tick_params(axis="x", rotation=15, labelsize=8.5)

    plt.suptitle("Computational Complexity & Latency Analysis (Log Training / Linear Inference)", fontsize=12, color=palette["cyan"], weight="bold")
    chart2_path = os.path.join(FIGURES_DIR, "timing_comparison.png")
    plt.tight_layout()
    plt.savefig(chart2_path, dpi=200, facecolor=fig.get_facecolor(), bbox_inches="tight")
    plt.close(fig)
    generated_files["timing_comparison"] = chart2_path

    # ---------------- 3. Confusion Matrices Heatmap ----------------
    fig, axes = plt.subplots(1, 3, figsize=(13, 3.8), facecolor=palette["obsidian"])
    cm_cmaps = ["Blues", "Purples", "Greens"]

    for i, (ax, model) in enumerate(zip(axes, models)):
        ax.set_facecolor(palette["surface"])
        cm = np.array(model["confusion_matrix"])
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap=cm_cmaps[i % len(cm_cmaps)],
            cbar=False,
            ax=ax,
            xticklabels=["Legit (0)", "Fraud (1)"],
            yticklabels=["Legit (0)", "Fraud (1)"]
        )
        ax.set_title(model["model_name"], fontsize=11, weight="bold", color=colors[i % len(colors)], pad=10)
        ax.set_xlabel("Predicted Label", fontsize=9, color=palette["text"])
        ax.set_ylabel("True Label", fontsize=9, color=palette["text"])

    plt.suptitle("Test Set Confusion Matrix Comparison", fontsize=12, color=palette["cyan"], weight="bold")
    chart3_path = os.path.join(FIGURES_DIR, "confusion_matrices.png")
    plt.tight_layout()
    plt.savefig(chart3_path, dpi=200, facecolor=fig.get_facecolor(), bbox_inches="tight")
    plt.close(fig)
    generated_files["confusion_matrices"] = chart3_path

    # ---------------- 4. Quantum Fidelity Kernel Matrix (if provided) ----------------
    if sample_kernel_matrix is not None and len(sample_kernel_matrix) > 0:
        fig, ax = plt.subplots(figsize=(6, 5), facecolor=palette["obsidian"])
        ax.set_facecolor(palette["surface"])
        sub_k = sample_kernel_matrix[:30, :30]  # Plot first 30x30 for visual clarity
        sns.heatmap(
            sub_k,
            cmap="mako",
            vmin=0.0,
            vmax=1.0,
            cbar=True,
            ax=ax,
            cbar_kws={"label": "Fidelity |<Phi(x_i)|Phi(x_j)>|^2"}
        )
        ax.set_title("Quantum Kernel Gram Matrix Heatmap (Sub-block)", fontsize=11, weight="bold", color=palette["cyan"], pad=10)
        ax.set_xlabel("Sample index j", fontsize=9, color=palette["text"])
        ax.set_ylabel("Sample index i", fontsize=9, color=palette["text"])

        chart4_path = os.path.join(FIGURES_DIR, "quantum_kernel_matrix.png")
        plt.tight_layout()
        plt.savefig(chart4_path, dpi=200, facecolor=fig.get_facecolor(), bbox_inches="tight")
        plt.close(fig)
        generated_files["quantum_kernel_matrix"] = chart4_path

    return generated_files


def export_json_report(
    benchmark_data: Dict[str, Any],
    transactions: List[Dict[str, Any]],
    execution_mode: str = "Quantum Simulation"
) -> str:
    """Exports structured full benchmark and transaction audit report as JSON."""
    report = {
        "project": "Q-Guard: Quantum-Enhanced Financial Fraud Detection Engine",
        "track": "Track 4: Quantum + AI & ML",
        "version": "1.0.0-hackathon-prod",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "execution_mode": execution_mode,
        "scientific_disclaimer": (
            "Quantum-kernel simulations run on CPU statevector simulators. "
            "SVM decision functions are normalized risk indicators, not direct calibrated probabilities. "
            "Quantum advantage remains an experimental hypothesis."
        ),
        "benchmark_summary": benchmark_data,
        "recent_transactions": transactions[:50]
    }

    timestamp_slug = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    report_filename = f"qguard_audit_report_{timestamp_slug}.json"
    report_path = os.path.join(REPORTS_DIR, report_filename)

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report_path
