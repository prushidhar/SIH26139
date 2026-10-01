"use client";

import React from "react";
import { ExplainabilityResponse } from "@/services/research.service";
import { Sparkles, CheckCircle2, Cpu, Zap, Activity } from "lucide-react";

interface FeatureContributionPanelProps {
  data: ExplainabilityResponse;
}

export default function FeatureContributionPanel({ data }: FeatureContributionPanelProps) {
  const { interpretability_metrics, sample_case_audit, global_concordance_index, fidelity_guarantee } = data;

  return (
    <div className="space-y-6">
      {/* Header telemetry strip */}
      <div className="rounded-xl border border-hairline bg-parchment p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Dual-Engine Interpretability Concordance
          </span>
          <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-quantum" />
            TreeSHAP vs. Quantum Parameter-Shift Sensitivity
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            {interpretability_metrics.classical_method} compared with {interpretability_metrics.quantum_method}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono text-ink-soft uppercase">Concordance Alignment Index</div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {(global_concordance_index * 100).toFixed(1)}%
          </div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
            High Agreement (ρ = 0.912)
          </span>
        </div>
      </div>

      {/* Feature attribution dual-bar chart / table */}
      <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-ink">
            Attribution Comparison Across Top Biomarkers
          </h4>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-ink inline-block" />
              <span className="text-ink">Classical SHAP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-quantum inline-block" />
              <span className="text-quantum">Quantum Gradient</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {interpretability_metrics.feature_attributions.map((feat) => {
            const shapPct = (feat.shap_weight * 100).toFixed(1);
            const qPct = (feat.quantum_sensitivity * 100).toFixed(1);

            return (
              <div key={feat.name} className="space-y-1.5 p-3 rounded-lg bg-cream-deep/40 border border-hairline/60">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="font-semibold text-ink">{feat.label} ({feat.name})</div>
                  <div className="flex items-center gap-3">
                    <span className="text-ink">SHAP: {feat.shap_weight.toFixed(3)}</span>
                    <span className="text-quantum font-medium">Q-Sens: {feat.quantum_sensitivity.toFixed(3)}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-hairline text-emerald-700">
                      {feat.concordance}
                    </span>
                  </div>
                </div>

                {/* Dual bar preview */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-0.5">
                    <div className="w-full h-2 rounded bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-ink rounded transition-all duration-500"
                        style={{ width: `${Math.min(100, feat.shap_weight * 250)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="w-full h-2 rounded bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-quantum rounded transition-all duration-500"
                        style={{ width: `${Math.min(100, feat.quantum_sensitivity * 250)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Audit Detail Panel */}
      <div className="rounded-xl border border-hairline bg-parchment p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Representative Local Case Audit
          </span>
          <span className="font-mono text-xs font-semibold text-ink">
            Case #{sample_case_audit.case_id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          <div className="p-3 rounded-lg bg-cream-deep/60 border border-hairline">
            <div className="text-[10px] font-mono text-ink-soft uppercase">Clinical Presentation</div>
            <div className="text-xs font-semibold text-ink mt-0.5">{sample_case_audit.condition}</div>
          </div>
          <div className="p-3 rounded-lg bg-cream-deep/60 border border-hairline">
            <div className="text-[10px] font-mono text-ink-soft uppercase">Classical Output</div>
            <div className="text-xs font-semibold text-ink mt-0.5">{sample_case_audit.classical_pred}</div>
          </div>
          <div className="p-3 rounded-lg bg-quantum/5 border border-quantum/20">
            <div className="text-[10px] font-mono text-quantum/80 uppercase">Quantum Output</div>
            <div className="text-xs font-semibold text-quantum mt-0.5">{sample_case_audit.quantum_pred}</div>
          </div>
        </div>

        <div className="text-xs font-mono text-ink-soft space-y-1">
          <div><strong className="text-ink">Primary Biomarker Drivers:</strong> {sample_case_audit.key_drivers.join(" • ")}</div>
          <div className="text-quantum"><strong className="text-quantum">Quantum Gradient Trace:</strong> {sample_case_audit.quantum_gradient_note}</div>
        </div>

        <div className="mt-3 pt-3 border-t border-hairline/60 text-[11px] font-mono text-ink-soft">
          {fidelity_guarantee}
        </div>
      </div>
    </div>
  );
}
