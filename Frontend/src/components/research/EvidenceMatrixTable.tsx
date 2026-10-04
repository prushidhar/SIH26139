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
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Multicriteria Decision Matrix
          </span>
          <h3 className="text-base font-bold text-[#082827] mt-0.5">
            Head-to-Head 9-Dimensional Evidence Ledger
          </h3>
        </div>
        <div className="text-xs font-mono text-[#5A7470]">
          {protocol}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[#F8FBFA] text-[#082827] font-mono uppercase text-[10px] font-bold tracking-wider border-b border-[#DFEBE8]">
            <tr>
              <th className="py-3 px-3">Evaluation Axis</th>
              <th className="py-3 px-3 font-semibold text-[#082827]">Logistic Reg</th>
              <th className="py-3 px-3 font-semibold text-[#082827]">Random Forest</th>
              <th className="py-3 px-3 font-semibold text-[#082827]">XGBoost</th>
              <th className="py-3 px-3 font-bold text-[#082827]">SVM-RBF (Baseline)</th>
              <th className="py-3 px-3 font-bold text-[#006766]">Quantum VQC</th>
              <th className="py-3 px-3 text-right">Leading Family</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFEBE8] font-mono text-[#082827]">
            {matrix.map((row) => {
              const isQuantumLeader = row.leading_family.includes("Quantum");
              const isClassicalLeader = row.leading_family.includes("Classical");

              return (
                <tr key={row.dimension} className="hover:bg-[#E6F7F4]/20 transition-colors">
                  <td className="py-3 px-3 font-medium font-sans text-[#082827]">
                    <div className="font-bold text-xs">{row.dimension}</div>
                    <div className="text-[10px] text-[#5A7470] font-mono">{row.unit}</div>
                  </td>
                  <td className="py-3 px-3 text-[#5A7470]">{row.lr}</td>
                  <td className="py-3 px-3 text-[#5A7470]">{row.rf}</td>
                  <td className="py-3 px-3 text-[#5A7470]">{row.xgb}</td>
                  <td className="py-3 px-3 font-bold text-[#082827]">{row.svm}</td>
                  <td className="py-3 px-3 font-bold text-[#006766]">{row.q_vqc}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                        isQuantumLeader
                          ? "bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30"
                          : isClassicalLeader
                          ? "bg-[#F2F7F6] text-[#082827] border border-[#DFEBE8]"
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

      <div className="mt-4 pt-3 border-t border-[#DFEBE8] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#5A7470] gap-2">
        <span>Provenance: {provenance}</span>
        <span className="font-mono text-[10.5px] font-bold text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/20">Verified Empirical Telemetry</span>
      </div>
    </div>
  );
}
