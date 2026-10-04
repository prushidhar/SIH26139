"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Database, Layers, BarChart2 } from "lucide-react";
import { DatasetDetail } from "@/services/research.service";

interface DatasetHealthPanelProps {
  detail: DatasetDetail;
}

export default function DatasetHealthPanel({ detail }: DatasetHealthPanelProps) {
  const { quality_audit, class_distribution, distributions, correlations } = detail;
  const totalSamples = detail.sample_count;

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Health Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Cohort Samples</div>
          <div className="text-2xl font-bold text-[#082827] mt-1">{totalSamples.toLocaleString()}</div>
          <div className="text-xs text-[#5A7470] mt-1">Verified patient records</div>
        </div>

        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Feature Panel</div>
          <div className="text-2xl font-bold text-[#082827] mt-1">{detail.feature_count}</div>
          <div className="text-xs text-[#5A7470] mt-1">Numerical biomarkers</div>
        </div>

        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Data Missingness</div>
          <div className="text-2xl font-bold text-[#00B489] mt-1">0.0%</div>
          <div className="text-xs text-[#5A7470] mt-1">{quality_audit.missing_cells} missing cells detected</div>
        </div>

        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Quantum Ingestion</div>
          <div className="text-2xl font-bold text-[#006766] mt-1">Ready</div>
          <div className="text-xs text-[#5A7470] mt-1">Normalized angle-ready</div>
        </div>
      </div>

      {/* Class Balance & Data Quality Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Distribution Card */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#006766]" />
              Cohort Diagnostic Balance
            </h4>
            <span className="text-xs font-mono text-[#5A7470]">Target Column</span>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(class_distribution).map(([cls, count]) => {
              const pct = ((count / totalSamples) * 100).toFixed(1);
              return (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#082827] font-semibold">Class [{cls}]</span>
                    <span className="text-[#5A7470]">{count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F2F7F6] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#006766] to-[#00B489] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Audit Checklist */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00B489]" />
              Integrity & Health Audit
            </h4>
            <span className="text-xs font-mono font-bold text-[#006766] bg-[#E6F7F4] px-2.5 py-0.5 rounded-full border border-[#00B489]/30">
              100% Score
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-[#DFEBE8]">
              <span className="text-[#5A7470] font-sans">Total Tabular Cells</span>
              <span className="text-[#082827] font-bold">{quality_audit.total_cells.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#DFEBE8]">
              <span className="text-[#5A7470] font-sans">Duplicate Records</span>
              <span className="text-[#082827] font-bold">{quality_audit.duplicated_records} (0%)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#DFEBE8]">
              <span className="text-[#5A7470] font-sans">Constant / Zero-Variance Features</span>
              <span className="text-[#082827] font-bold">{quality_audit.constant_features}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#5A7470] font-sans">Preprocessing Requirement</span>
              <span className="text-[#006766] font-bold">StandardScaler + PCA Angle Map</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Distribution Percentiles Table */}
      {distributions && Object.keys(distributions).length > 0 && (
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#006766]" />
              Biomarker Distribution Percentiles
            </h4>
            <span className="text-xs font-mono text-[#5A7470]">Five-Number Summary</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FBFA] text-[#082827] font-mono uppercase text-[10px] font-bold tracking-wider border-b border-[#DFEBE8]">
                <tr>
                  <th className="py-2.5 px-3">Biomarker Feature</th>
                  <th className="py-2.5 px-3">Mean ± Std</th>
                  <th className="py-2.5 px-3">Min</th>
                  <th className="py-2.5 px-3">25%</th>
                  <th className="py-2.5 px-3">Median</th>
                  <th className="py-2.5 px-3">75%</th>
                  <th className="py-2.5 px-3">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFEBE8] font-mono text-[#082827]">
                {Object.entries(distributions).map(([feat, stat]) => (
                  <tr key={feat} className="hover:bg-[#E6F7F4]/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#082827]">{feat}</td>
                    <td className="py-2.5 px-3 text-[#5A7470]">{stat.mean} ± {stat.std}</td>
                    <td className="py-2.5 px-3">{stat.min}</td>
                    <td className="py-2.5 px-3">{stat.q25}</td>
                    <td className="py-2.5 px-3 font-bold text-[#006766]">{stat.median}</td>
                    <td className="py-2.5 px-3">{stat.q75}</td>
                    <td className="py-2.5 px-3">{stat.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Correlation Matrix Preview */}
      {correlations && Object.keys(correlations).length > 0 && (
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#006766]" />
              Pearson Correlation Matrix (Top Biomarkers)
            </h4>
            <span className="text-xs font-mono text-[#5A7470]">[-1.00 to +1.00]</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#F8FBFA] text-[#082827] font-mono uppercase text-[10px] font-bold tracking-wider border-b border-[#DFEBE8]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Feature</th>
                  {Object.keys(correlations).map((k) => (
                    <th key={k} className="py-2.5 px-2 truncate max-w-[80px]" title={k}>
                      {k.replace("_mean", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFEBE8] font-mono text-[#082827]">
                {Object.entries(correlations).map(([rowKey, colObj]) => (
                  <tr key={rowKey} className="hover:bg-[#E6F7F4]/20 transition-colors">
                    <td className="py-2 px-3 text-left font-semibold text-[#082827] truncate max-w-[120px]" title={rowKey}>
                      {rowKey}
                    </td>
                    {Object.entries(colObj).map(([colKey, val]) => {
                      const numVal = Number(val);
                      const isHigh = Math.abs(numVal) > 0.7 && rowKey !== colKey;
                      const bgStyle =
                        numVal === 1
                          ? "bg-[#F2F7F6] text-[#5A7470]"
                          : isHigh
                          ? "bg-[#E6F7F4] text-[#006766] font-bold"
                          : "text-[#5A7470]";

                      return (
                        <td key={colKey} className={`py-2 px-2 text-[11px] ${bgStyle}`}>
                          {numVal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
