"use client";

import React from "react";
import { QuantumFeasibilityResponse } from "@/services/research.service";
import { AlertCircle, ShieldAlert, Zap, TrendingDown } from "lucide-react";

interface NoiseImpactChartProps {
  noiseCurve: QuantumFeasibilityResponse["noise_impact"];
}

export default function NoiseImpactChart({ noiseCurve }: NoiseImpactChartProps) {
  return (
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            NISQ Noise Vulnerability
          </span>
          <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            Depolarizing Noise & Quantum Fidelity Degradation
          </h4>
        </div>
        <span className="text-xs font-mono text-[#5A7470]">Simulated Depolarizing Channel</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {noiseCurve.map((lvl) => {
          const isIdeal = lvl.depolarizing_p === 0.0;
          const isSevere = lvl.depolarizing_p >= 0.05;

          return (
            <div
              key={lvl.noise_level}
              className={`p-4 rounded-xl border transition-all ${
                isIdeal
                  ? "bg-[#E6F7F4]/40 border-[#00B489]/30 shadow-2xs"
                  : isSevere
                  ? "bg-amber-50/50 border-amber-200/80 shadow-2xs"
                  : "bg-[#FAFDFD] border-[#DFEBE8] shadow-2xs"
              }`}
            >
              <div className="text-xs font-mono font-bold text-[#5A7470]">
                p = {lvl.depolarizing_p}
              </div>
              <h5 className="text-xs font-bold text-[#082827] mt-0.5 mb-2 line-clamp-1">
                {lvl.noise_level}
              </h5>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A7470]">VQC Acc:</span>
                  <span className="font-bold text-[#082827]">{lvl.vqc_accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A7470]">AUROC:</span>
                  <span className="font-bold text-[#082827]">{lvl.auroc.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A7470]">Fidelity:</span>
                  <span className="font-bold text-[#006766]">
                    {(lvl.state_fidelity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar of fidelity */}
              <div className="w-full h-1.5 bg-[#F2F7F6] rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isIdeal ? "bg-[#00B489]" : isSevere ? "bg-amber-500" : "bg-[#006766]"
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
