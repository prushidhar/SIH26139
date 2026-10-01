"use client";

import React from "react";
import { EvidenceMatrixRow } from "@/services/research.service";
import { TableProperties, CheckCircle2, ShieldAlert, Award } from "lucide-react";

interface EvidenceMatrixTableProps {
  matrix: EvidenceMatrixRow[];
  protocol: string;
  provenance: string;
}

export default function EvidenceMatrixTable({
  matrix,
  protocol,
  provenance,
}: EvidenceMatrixTableProps) {
  return (
    <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Multicriteria Decision Matrix
          </span>
          <h3 className="text-base font-serif font-bold text-ink">
            Head-to-Head 9-Dimensional Evidence Ledger
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-soft">
          {protocol}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-cream-deep/70 text-ink font-mono uppercase text-[10px] tracking-wider border-b border-hairline">
            <tr>
              <th className="py-3 px-3">Evaluation Axis</th>
              <th className="py-3 px-3 font-semibold text-ink">Logistic Reg</th>
              <th className="py-3 px-3 font-semibold text-ink">Random Forest</th>
              <th className="py-3 px-3 font-semibold text-ink">XGBoost</th>
              <th className="py-3 px-3 font-bold text-stone-900">SVM-RBF (Baseline)</th>
              <th className="py-3 px-3 font-bold text-quantum">Quantum VQC</th>
              <th className="py-3 px-3 text-right">Leading Family</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline font-mono text-ink">
            {matrix.map((row) => {
              const isQuantumLeader = row.leading_family.includes("Quantum");
              const isClassicalLeader = row.leading_family.includes("Classical");

              return (
                <tr key={row.dimension} className="hover:bg-cream-deep/30 transition-colors">
                  <td className="py-3 px-3 font-medium font-sans text-ink">
                    <div className="font-semibold text-xs">{row.dimension}</div>
                    <div className="text-[10px] text-ink-soft font-mono">{row.unit}</div>
                  </td>
                  <td className="py-3 px-3 text-ink-soft">{row.lr}</td>
                  <td className="py-3 px-3 text-ink-soft">{row.rf}</td>
                  <td className="py-3 px-3 text-ink-soft">{row.xgb}</td>
                  <td className="py-3 px-3 font-semibold text-ink">{row.svm}</td>
                  <td className="py-3 px-3 font-bold text-quantum">{row.q_vqc}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        isQuantumLeader
                          ? "bg-quantum/10 text-quantum border border-quantum/20"
                          : isClassicalLeader
                          ? "bg-stone-100 text-ink border border-hairline"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {row.leading_family}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-hairline/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-ink-soft gap-2">
        <span>Provenance: {provenance}</span>
        <span className="font-mono text-[11px]">Verified Empirical Telemetry</span>
      </div>
    </div>
  );
}
