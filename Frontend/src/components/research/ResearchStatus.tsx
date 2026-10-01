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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Classical Benchmark Champion Card */}
        <div className="rounded-xl border border-hairline bg-parchment p-5 transition-all hover:border-ink/30 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-stone-100 text-ink border border-hairline">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
                  Classical Baseline Leader
                </span>
                <h4 className="text-base font-semibold text-ink leading-tight">{classical.model}</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-stone-100 text-ink border border-hairline font-medium">
              {classical.badge}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-lg bg-cream-deep/60 border border-hairline/60">
            <div>
              <div className="text-[10px] font-mono text-ink-soft uppercase">Accuracy</div>
              <div className="text-lg font-serif font-bold text-ink">{classical.accuracy}</div>
            </div>
            {classical.auroc !== undefined && (
              <div>
                <div className="text-[10px] font-mono text-ink-soft uppercase">AUROC</div>
                <div className="text-lg font-serif font-bold text-ink">{classical.auroc.toFixed(4)}</div>
              </div>
            )}
            {classical.f1_score !== undefined && (
              <div>
                <div className="text-[10px] font-mono text-ink-soft uppercase">F1-Score</div>
                <div className="text-lg font-serif font-bold text-ink">{classical.f1_score.toFixed(4)}</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft mt-3 pt-3 border-t border-hairline/60">
            <span>Operational Regime:</span>
            <span className="font-mono text-ink font-medium">{classical.condition}</span>
          </div>
        </div>

        {/* Quantum Frontier Champion Card */}
        <div className="rounded-xl border border-quantum/30 bg-parchment p-5 transition-all hover:border-quantum relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-quantum/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-quantum/10 text-quantum border border-quantum/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-quantum font-medium">
                  Quantum Frontier Baseline
                </span>
                <h4 className="text-base font-semibold text-ink leading-tight">{quantum.model}</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-quantum/10 text-quantum border border-quantum/20 font-medium">
              {quantum.badge}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-lg bg-quantum/5 border border-quantum/10">
            <div>
              <div className="text-[10px] font-mono text-quantum/80 uppercase">Accuracy</div>
              <div className="text-lg font-serif font-bold text-ink">{quantum.accuracy}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-quantum/80 uppercase">Advantage</div>
              <div className="text-base font-serif font-bold text-emerald-700">{quantum.advantage_margin || "Evaluated"}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-quantum/80 uppercase">Significance</div>
              <div className="text-xs font-mono font-semibold text-ink mt-1">{quantum.p_value || "p < 0.05"}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft mt-3 pt-3 border-t border-hairline/60">
            <span>Optimal Regime:</span>
            <span className="font-mono text-quantum font-medium">{quantum.condition}</span>
          </div>
        </div>
      </div>

      {/* Synthesis Callout */}
      <div className="rounded-xl border border-hairline bg-cream-deep/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-white border border-hairline text-emerald-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-ink-soft font-medium">
              Synthesis Evidence
            </div>
            <p className="text-xs md:text-sm text-ink leading-relaxed">
              {evidenceSummary}
            </p>
          </div>
        </div>

        <Link
          href="/evidence-matrix"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ink text-parchment hover:bg-ink/90 text-xs font-medium font-sans shrink-0 transition-colors self-start sm:self-center"
        >
          <span>Examine Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
