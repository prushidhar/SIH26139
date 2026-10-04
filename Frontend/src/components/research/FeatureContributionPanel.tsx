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
    <div className="space-y-6 font-sans">
      {/* Header telemetry strip */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Dual-Engine Interpretability Concordance
          </span>
          <h3 className="text-lg font-bold text-[#082827] flex items-center gap-2 mt-1">
            <Sparkles className="w-5 h-5 text-[#006766]" />
            TreeSHAP vs. Quantum Parameter-Shift Sensitivity
          </h3>
          <p className="text-xs text-[#5A7470] mt-1">
            {interpretability_metrics.classical_method} compared with {interpretability_metrics.quantum_method}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Concordance Alignment Index</div>
          <div className="text-2xl font-bold text-[#00B489]">
            {(global_concordance_index * 100).toFixed(1)}%
          </div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
            High Agreement (ρ = 0.912)
          </span>
        </div>
      </div>

      {/* Feature attribution dual-bar chart / table */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-[#082827]">
            Attribution Comparison Across Top Biomarkers
          </h4>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#5A7470] inline-block" />
              <span className="text-[#082827] font-semibold">Classical SHAP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#006766] inline-block" />
              <span className="text-[#006766] font-semibold">Quantum Gradient</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          {interpretability_metrics.feature_attributions.map((feat) => {
            return (
              <div key={feat.name} className="space-y-2 p-3.5 rounded-xl bg-[#FAFDFD] border border-[#DFEBE8] shadow-2xs">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="font-bold text-[#082827]">{feat.label} ({feat.name})</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#5A7470]">SHAP: {feat.shap_weight.toFixed(3)}</span>
                    <span className="text-[#006766] font-bold">Q-Sens: {feat.quantum_sensitivity.toFixed(3)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766]">
                      {feat.concordance}
                    </span>
                  </div>
                </div>

                {/* Dual bar preview */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-[#F2F7F6] overflow-hidden">
                      <div
                        className="h-full bg-[#5A7470] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, feat.shap_weight * 250)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-[#F2F7F6] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#006766] to-[#00B489] rounded-full transition-all duration-500"
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
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Representative Local Case Audit
          </span>
          <span className="font-mono text-xs font-bold text-[#006766] bg-[#E6F7F4] px-2.5 py-0.5 rounded-full border border-[#00B489]/25">
            Case #{sample_case_audit.case_id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          <div className="p-3.5 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8] shadow-2xs">
            <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Clinical Presentation</div>
            <div className="text-xs font-bold text-[#082827] mt-1">{sample_case_audit.condition}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8] shadow-2xs">
            <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Classical Output</div>
            <div className="text-xs font-bold text-[#082827] mt-1">{sample_case_audit.classical_pred}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#E6F7F4]/40 border border-[#00B489]/30 shadow-2xs">
            <div className="text-[10px] font-mono text-[#006766] uppercase font-bold tracking-wider">Quantum Output</div>
            <div className="text-xs font-bold text-[#006766] mt-1">{sample_case_audit.quantum_pred}</div>
          </div>
        </div>

        <div className="text-xs font-mono text-[#5A7470] space-y-1.5 pt-1">
          <div><strong className="text-[#082827]">Primary Biomarker Drivers:</strong> {sample_case_audit.key_drivers.join(" • ")}</div>
          <div className="text-[#006766]"><strong className="text-[#006766]">Quantum Gradient Trace:</strong> {sample_case_audit.quantum_gradient_note}</div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#DFEBE8] text-[11px] font-mono text-[#5A7470]">
          {fidelity_guarantee}
        </div>
      </div>
    </div>
  );
}
