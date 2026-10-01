"use client";

import React from "react";
import { QuantumFeasibilityResponse } from "@/services/research.service";
import { AlertCircle, ShieldAlert, Zap, TrendingDown } from "lucide-react";

interface NoiseImpactChartProps {
  noiseCurve: QuantumFeasibilityResponse["noise_impact"];
}

export default function NoiseImpactChart({ noiseCurve }: NoiseImpactChartProps) {
  return (
    <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            NISQ Noise Vulnerability
          </span>
          <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            Depolarizing Noise & Quantum Fidelity Degradation
          </h4>
        </div>
        <span className="text-xs font-mono text-ink-soft">Simulated Depolarizing Channel</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {noiseCurve.map((lvl) => {
          const isIdeal = lvl.depolarizing_p === 0.0;
          const isSevere = lvl.depolarizing_p >= 0.05;

          return (
            <div
              key={lvl.noise_level}
              className={`p-4 rounded-lg border transition-all ${
                isIdeal
                  ? "bg-emerald-50/50 border-emerald-200"
                  : isSevere
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-cream-deep/50 border-hairline"
              }`}
            >
              <div className="text-xs font-mono font-medium text-ink-soft">
                p = {lvl.depolarizing_p}
              </div>
              <h5 className="text-xs font-semibold text-ink mt-0.5 mb-2 line-clamp-1">
                {lvl.noise_level}
              </h5>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-soft">VQC Acc:</span>
                  <span className="font-bold text-ink">{lvl.vqc_accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">AUROC:</span>
                  <span className="font-semibold text-ink">{lvl.auroc.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Fidelity:</span>
                  <span className="font-semibold text-quantum">
                    {(lvl.state_fidelity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar of fidelity */}
              <div className="w-full h-1.5 bg-stone-200 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isIdeal ? "bg-emerald-600" : isSevere ? "bg-amber-600" : "bg-quantum"
                  }`}
                  style={{ width: `${lvl.state_fidelity * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
