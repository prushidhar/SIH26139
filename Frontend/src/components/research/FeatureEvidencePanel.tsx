"use client";

import React from "react";
import { SignalTransformResult } from "@/services/research.service";
import { Sliders, Cpu, Award, Zap, Layers } from "lucide-react";

interface FeatureEvidencePanelProps {
  data: SignalTransformResult;
}

export default function FeatureEvidencePanel({ data }: FeatureEvidencePanelProps) {
  const { feature_rankings, pca_analysis, sample_quantum_state } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* Feature Ranking (Gini Impurity) */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
              Supervised Feature Importance
            </span>
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
              <Award className="w-4 h-4 text-[#006766]" />
              Random Forest Gini Impurity Ranking
            </h4>
          </div>
          <span className="text-xs font-mono text-[#5A7470]">
            Top {feature_rankings.length} Selected
          </span>
        </div>

        <div className="space-y-3">
          {feature_rankings.map((f) => {
            const pct = (f.importance * 100).toFixed(1);
            return (
              <div key={f.feature} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[#5A7470] text-right font-bold">#{f.rank}</span>
                    <span className="text-[#082827] font-semibold">{f.feature}</span>
                  </div>
                  <span className="text-[#5A7470]">{f.importance.toFixed(4)} ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F2F7F6] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#006766] to-[#00B489] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, f.importance * 300)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PCA Decomposition & Quantum Circuit Encoding Map */}
      <div className="space-y-5">
        {/* PCA Decomposition Card */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
                Spectral Decomposition
              </span>
              <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
                <Layers className="w-4 h-4 text-[#006766]" />
                Principal Component Variance Capture
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#006766] bg-[#E6F7F4] px-2.5 py-0.5 rounded-full border border-[#00B489]/30">
              {(pca_analysis.cumulative_variance * 100).toFixed(1)}% Captured
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 font-mono">
            {pca_analysis.explained_variance_ratio.map((v, i) => (
              <div key={i} className="p-3.5 bg-[#FAFDFD] rounded-xl border border-[#DFEBE8] shadow-2xs">
                <div className="text-[10px] font-bold text-[#5A7470]">PC{i + 1}</div>
                <div className="text-base font-bold text-[#082827] mt-0.5">
                  {(v * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-[#5A7470] mt-1">
                  Var: {v.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Qubit Wire Mapping Card */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#006766]">
                Quantum Hilbert Space Mapping
              </span>
              <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
                <Zap className="w-4 h-4 text-[#00B489]" />
                Qubit Angle Wire Allocations
              </h4>
            </div>
            <span className="text-xs font-mono font-bold bg-[#E6F7F4] text-[#006766] px-2.5 py-0.5 rounded-full border border-[#00B489]/30">
              {sample_quantum_state.qubit_wires.length} Qubits Active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFDFD] border border-[#DFEBE8] text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[#5A7470] border-b border-[#DFEBE8] pb-2">
              <span className="font-sans">Encoding Ansatz:</span>
              <span className="font-bold text-[#082827]">{sample_quantum_state.encoding_gate}</span>
            </div>
            <div className="flex items-center justify-between text-[#5A7470]">
              <span className="font-sans">Angle Normalization Domain:</span>
              <span className="text-[#006766] font-bold">[−π, +π] Radians</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
