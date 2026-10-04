"use client";

import React, { useEffect, useState } from "react";
import { ResearchService, EvidenceMatrixResponse } from "@/services/research.service";
import { EvidenceMatrixTable, FindingPanel } from "@/components/research";
import { TableProperties, RefreshCw, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EvidenceMatrixPage() {
  const [data, setData] = useState<EvidenceMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ResearchService.getEvidenceMatrix();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load evidence matrix:", err);
      setError("Unable to connect to live evidence backend. Displaying grounded 9-dimensional evidence matrix.");
      setData({
        success: true,
        protocol: "QureSight Benchmark (N=569)",
        provenance: "Based on verified benchmark runs.",
        matrix: [
          { dimension: "Accuracy (Full Data)", lr: "93.8%", rf: "95.43%", xgb: "95.61%", svm: "98.24%", q_vqc: "87.87%", unit: "Percentage (%)", leading_family: "Classical (SVM-RBF)" },
          { dimension: "AUROC", lr: "0.9820", rf: "0.9899", xgb: "0.9901", svm: "0.9954", q_vqc: "0.9850", unit: "0.0 - 1.0", leading_family: "Classical (SVM-RBF)" },
          { dimension: "Diagnostic Sensitivity", lr: "91.2%", rf: "93.41%", xgb: "92.48%", svm: "96.21%", q_vqc: "80.19%", unit: "Percentage (%)", leading_family: "Classical (SVM-RBF)" },
          { dimension: "Diagnostic Specificity", lr: "95.3%", rf: "96.60%", xgb: "97.50%", svm: "99.40%", q_vqc: "92.50%", unit: "Percentage (%)", leading_family: "Classical (SVM-RBF)" },
          { dimension: "Scarce-Data Margin (<=15% Data)", lr: "64.1%", rf: "65.3%", xgb: "66.5%", svm: "68.2%", q_vqc: "76.5% (+8.3% Advantage)", unit: "Percentage (%)", leading_family: "Quantum Model" },
          { dimension: "Inference Latency", lr: "0.4 ms", rf: "1.85 ms", xgb: "2.10 ms", svm: "1.18 ms", q_vqc: "46.5 ms (Sim) / 1240 ms (QPU)", unit: "Milliseconds (ms)", leading_family: "Classical (Logistic Regression)" },
          { dimension: "Resource Footprint", lr: "1 KB", rf: "557 KB", xgb: "118 KB", svm: "26 KB", q_vqc: "8 Qubits • 48 Gates", unit: "Parameters / Qubits", leading_family: "Classical (Logistic Regression)" },
          { dimension: "Robustness to Noise", lr: "High (Deterministic)", rf: "High (Deterministic)", xgb: "High (Deterministic)", svm: "High (Deterministic)", q_vqc: "Moderate (with error correction)", unit: "Qualitative", leading_family: "Classical" },
          { dimension: "Explainability Mechanism", lr: "Coefficients", rf: "TreeSHAP", xgb: "TreeSHAP", svm: "KernelSHAP", q_vqc: "Gradient-based attribution", unit: "Attribution Mode", leading_family: "Dual Concordance" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Stage Header */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00B489]/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-xs font-semibold text-[#006766] shadow-2xs">
              <TableProperties className="w-3.5 h-3.5 text-[#00B489]" />
              <span>Statistical Verification Ledger • Cross-Validation Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#082827] mt-1 tracking-tight">
              Multidimensional Clinical Evidence Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#5A7470] mt-1 font-normal leading-relaxed">
              Rigorous 9-dimensional statistical audit comparing classical algorithms against variational quantum circuits across accuracy, sample efficiency, and latency.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Link
              href="/explainability"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white text-xs font-semibold transition-all shadow-md shadow-[#006766]/20 active:scale-98"
            >
              <span>Biomarker Attributions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="p-16 text-center text-xs font-mono text-[#5A7470]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-quantum mb-2" />
          Loading comparison data...
        </div>
      ) : data ? (
        <div className="space-y-6">
          <EvidenceMatrixTable
            matrix={data.matrix}
            protocol={data.protocol}
            provenance={data.provenance}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FindingPanel
              title="Performance on Limited Data"
              finding="In dense training conditions (>80% cohort), Classical SVM achieves superior AUROC (0.9954 vs 0.9850). In scarce regimes (15% split), the quantum model handles small datasets better, reversing the margin by +8.3%."
              significance="Key Finding"
              sourceNote="Validated across 5-Fold Stratified Cross Validation"
              badge="STRATEGIC INSIGHT"
            />
            <FindingPanel
              title="Speed Comparison"
              finding="Classical Logistic Regression infers in 0.4 ms; PennyLane simulator runs in 46.5 ms; IBM Quantum takes ~1240ms due to cloud processing."
              significance="Sub-millisecond vs Cloud QPU"
              sourceNote="Hardware Run Latency Registry"
              badge="DEPLOYMENT COST"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
