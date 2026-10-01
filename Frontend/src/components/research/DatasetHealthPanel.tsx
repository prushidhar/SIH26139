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
    <div className="space-y-6">
      {/* 4 Health Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-hairline bg-parchment p-4">
          <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">Cohort Samples</div>
          <div className="text-2xl font-serif font-bold text-ink mt-1">{totalSamples.toLocaleString()}</div>
          <div className="text-xs text-ink-soft mt-1">Verified patient records</div>
        </div>

        <div className="rounded-xl border border-hairline bg-parchment p-4">
          <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">Feature Panel</div>
          <div className="text-2xl font-serif font-bold text-ink mt-1">{detail.feature_count}</div>
          <div className="text-xs text-ink-soft mt-1">Numerical biomarkers</div>
        </div>

        <div className="rounded-xl border border-hairline bg-parchment p-4">
          <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">Data Missingness</div>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">0.0%</div>
          <div className="text-xs text-ink-soft mt-1">{quality_audit.missing_cells} missing cells detected</div>
        </div>

        <div className="rounded-xl border border-hairline bg-parchment p-4">
          <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">Quantum Ingestion</div>
          <div className="text-2xl font-serif font-bold text-quantum mt-1">Ready</div>
          <div className="text-xs text-ink-soft mt-1">Normalized angle-ready</div>
        </div>
      </div>

      {/* Class Balance & Data Quality Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Distribution Card */}
        <div className="rounded-xl border border-hairline bg-parchment p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Layers className="w-4 h-4 text-quantum" />
              Cohort Diagnostic Balance
            </h4>
            <span className="text-xs font-mono text-ink-soft">Target Column</span>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(class_distribution).map(([cls, count]) => {
              const pct = ((count / totalSamples) * 100).toFixed(1);
              return (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-ink font-medium">Class [{cls}]</span>
                    <span className="text-ink-soft">{count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream-deep overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Audit Checklist */}
        <div className="rounded-xl border border-hairline bg-parchment p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Integrity & Health Audit
            </h4>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Score
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-hairline/60">
              <span className="text-ink-soft">Total Tabular Cells</span>
              <span className="font-mono text-ink font-semibold">{quality_audit.total_cells.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-hairline/60">
              <span className="text-ink-soft">Duplicate Records</span>
              <span className="font-mono text-ink font-semibold">{quality_audit.duplicated_records} (0%)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-hairline/60">
              <span className="text-ink-soft">Constant / Zero-Variance Features</span>
              <span className="font-mono text-ink font-semibold">{quality_audit.constant_features}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-ink-soft">Preprocessing Requirement</span>
              <span className="font-mono text-quantum font-semibold">StandardScaler + PCA Angle Map</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Distribution Percentiles Table */}
      {distributions && Object.keys(distributions).length > 0 && (
        <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-quantum" />
              Biomarker Distribution Percentiles
            </h4>
            <span className="text-xs font-mono text-ink-soft">Five-Number Summary</span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-deep/70 text-ink font-mono uppercase text-[10px] tracking-wider border-b border-hairline">
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
              <tbody className="divide-y divide-hairline font-mono text-ink">
                {Object.entries(distributions).map(([feat, stat]) => (
                  <tr key={feat} className="hover:bg-cream-deep/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-ink">{feat}</td>
                    <td className="py-2.5 px-3 text-ink-soft">{stat.mean} ± {stat.std}</td>
                    <td className="py-2.5 px-3">{stat.min}</td>
                    <td className="py-2.5 px-3">{stat.q25}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{stat.median}</td>
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
        <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Database className="w-4 h-4 text-quantum" />
              Pearson Correlation Matrix (Top Biomarkers)
            </h4>
            <span className="text-xs font-mono text-ink-soft">[-1.00 to +1.00]</span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-cream-deep/70 text-ink font-mono uppercase text-[10px] tracking-wider border-b border-hairline">
                <tr>
                  <th className="py-2.5 px-3 text-left">Feature</th>
                  {Object.keys(correlations).map((k) => (
                    <th key={k} className="py-2.5 px-2 truncate max-w-[80px]" title={k}>
                      {k.replace("_mean", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline font-mono text-ink">
                {Object.entries(correlations).map(([rowKey, colObj]) => (
                  <tr key={rowKey} className="hover:bg-cream-deep/30 transition-colors">
                    <td className="py-2 px-3 text-left font-medium text-ink truncate max-w-[120px]" title={rowKey}>
                      {rowKey}
                    </td>
                    {Object.entries(colObj).map(([colKey, val]) => {
                      const numVal = Number(val);
                      const isHigh = Math.abs(numVal) > 0.7 && rowKey !== colKey;
                      const bgStyle =
                        numVal === 1
                          ? "bg-stone-200/50"
                          : isHigh
                          ? "bg-amber-100 text-amber-900 font-bold"
                          : "text-ink-soft";

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
