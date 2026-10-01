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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Feature Ranking (Gini Impurity) */}
      <div className="rounded-xl border border-hairline bg-parchment p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
              Supervised Feature Importance
            </span>
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
              <Award className="w-4 h-4 text-quantum" />
              Random Forest Gini Impurity Ranking
            </h4>
          </div>
          <span className="text-xs font-mono text-ink-soft">
            Top {feature_rankings.length} Selected
          </span>
        </div>

        <div className="space-y-2.5">
          {feature_rankings.map((f) => {
            const pct = (f.importance * 100).toFixed(1);
            return (
              <div key={f.feature} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-ink-soft text-right">#{f.rank}</span>
                    <span className="text-ink font-medium">{f.feature}</span>
                  </div>
                  <span className="text-ink-soft">{f.importance.toFixed(4)} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-cream-deep overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
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
        <div className="rounded-xl border border-hairline bg-parchment p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
                Spectral Decomposition
              </span>
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
                <Layers className="w-4 h-4 text-quantum" />
                Principal Component Variance Capture
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {(pca_analysis.cumulative_variance * 100).toFixed(1)}% Captured
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono">
            {pca_analysis.explained_variance_ratio.map((v, i) => (
              <div key={i} className="p-3 bg-cream-deep/60 rounded-lg border border-hairline/80">
                <div className="text-[10px] text-ink-soft">PC{i + 1}</div>
                <div className="text-base font-bold text-ink mt-0.5">
                  {(v * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-ink-soft mt-1">
                  Var: {v.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Qubit Wire Mapping Card */}
        <div className="rounded-xl border border-quantum/30 bg-parchment p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-quantum font-medium">
                Quantum Hilbert Space Mapping
              </span>
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
                <Zap className="w-4 h-4 text-quantum" />
                Qubit Angle Wire Allocations
              </h4>
            </div>
            <span className="text-xs font-mono bg-quantum/10 text-quantum px-2 py-0.5 rounded border border-quantum/20">
              {sample_quantum_state.qubit_wires.length} Qubits Active
            </span>
          </div>

          <div className="p-3 rounded-lg bg-cream-deep/50 border border-hairline text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-ink-soft border-b border-hairline/60 pb-1.5">
              <span>Encoding Ansatz:</span>
              <span className="font-semibold text-ink">{sample_quantum_state.encoding_gate}</span>
            </div>
            <div className="flex items-center justify-between text-ink-soft">
              <span>Angle Normalization Domain:</span>
              <span className="text-ink font-semibold">[−π, +π] Radians</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
