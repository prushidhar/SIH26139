"use client";

import React from "react";
import { Cpu, Zap, Award, Scale, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ChampionSpec {
  model: string;
  accuracy: string;
  auroc?: number;
  f1_score?: number;
  advantage_margin?: string;
  p_value?: string;
  condition: string;
  badge: string;
}

interface ResearchStatusProps {
  classical: ChampionSpec;
  quantum: ChampionSpec;
  evidenceSummary: string;
}

export default function ResearchStatus({ classical, quantum, evidenceSummary }: ResearchStatusProps) {
  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Classical Benchmark Champion Card */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#F2F7F6] text-[#082827] border border-[#DFEBE8]">
                <Cpu className="w-4 h-4 text-[#5A7470]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#5A7470]">
                  Classical Baseline Leader
                </span>
                <h4 className="text-base font-bold text-[#082827] leading-tight">{classical.model}</h4>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#F2F7F6] text-[#5A7470] border border-[#DFEBE8]">
              {classical.badge}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 p-3.5 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8]">
            <div>
              <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Accuracy</div>
              <div className="text-lg font-bold text-[#082827]">{classical.accuracy}</div>
            </div>
            {classical.auroc !== undefined && (
              <div>
                <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">AUROC</div>
                <div className="text-lg font-bold text-[#082827]">{classical.auroc.toFixed(4)}</div>
              </div>
            )}
            {classical.f1_score !== undefined && (
              <div>
                <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">F1-Score</div>
                <div className="text-lg font-bold text-[#082827]">{classical.f1_score.toFixed(4)}</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5A7470] mt-3 pt-3 border-t border-[#DFEBE8]">
            <span>Operational Regime:</span>
            <span className="font-mono text-[#082827] font-semibold">{classical.condition}</span>
          </div>
        </div>

        {/* Quantum Frontier Champion Card */}
        <div className="rounded-2xl border border-[#DFEBE8] bg-[#FAFDFD] p-6 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B489]/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 shadow-2xs">
                <Zap className="w-4 h-4 text-[#00B489]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#006766]">
                  Quantum Frontier Baseline
                </span>
                <h4 className="text-base font-bold text-[#082827] leading-tight">{quantum.model}</h4>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
              {quantum.badge}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 p-3.5 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8] relative z-10">
            <div>
              <div className="text-[9.5px] font-mono text-[#006766] uppercase font-bold tracking-wider">Accuracy</div>
              <div className="text-lg font-bold text-[#082827]">{quantum.accuracy}</div>
            </div>
            <div>
              <div className="text-[9.5px] font-mono text-[#006766] uppercase font-bold tracking-wider">Advantage</div>
              <div className="text-lg font-bold text-[#00B489]">{quantum.advantage_margin || "Evaluated"}</div>
            </div>
            <div>
              <div className="text-[9.5px] font-mono text-[#006766] uppercase font-bold tracking-wider">Significance</div>
              <div className="text-xs font-mono font-bold text-[#082827] mt-1">{quantum.p_value || "p < 0.05"}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5A7470] mt-3 pt-3 border-t border-[#DFEBE8] relative z-10">
            <span>Optimal Regime:</span>
            <span className="font-mono text-[#006766] font-bold">{quantum.condition}</span>
          </div>
        </div>
      </div>

      {/* Synthesis Callout */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-[#F8FBFA] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] border border-[#00B489]/25 text-[#00B489] shrink-0 mt-0.5 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#00B489]" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
              Synthesis Evidence
            </div>
            <p className="text-xs md:text-sm text-[#082827] leading-relaxed">
              {evidenceSummary}
            </p>
          </div>
        </div>

        <Link
          href="/evidence-matrix"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white text-xs font-semibold shrink-0 transition-all shadow-xs active:scale-98 self-start sm:self-center"
        >
          <span>Examine Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
