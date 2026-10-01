"use client";

import React from "react";
import { ModelCandidate } from "@/services/research.service";
import { Cpu, Zap, Activity, Clock, Server, CheckCircle2 } from "lucide-react";

interface ModelArenaCardProps {
  candidate: ModelCandidate;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ModelArenaCard({
  candidate,
  isSelected,
  onSelect,
}: ModelArenaCardProps) {
  const isQuantum = candidate.family === "quantum";

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-5 cursor-pointer transition-all relative overflow-hidden ${
        isSelected
          ? isQuantum
            ? "border-quantum ring-2 ring-quantum/30 bg-parchment shadow-md"
            : "border-ink ring-2 ring-ink/20 bg-parchment shadow-md"
          : "border-hairline bg-parchment hover:border-ink/40 shadow-xs"
      }`}
    >
      {/* Top accent badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md border ${
              isQuantum
                ? "bg-quantum/10 text-quantum border-quantum/20"
                : "bg-stone-100 text-ink border-hairline"
            }`}
          >
            {isQuantum ? <Zap className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          </div>
          <div>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${
                isQuantum ? "text-quantum font-medium" : "text-ink-soft"
              }`}
            >
              {isQuantum ? "Quantum Candidate" : "Classical Benchmark"}
            </span>
            <h4 className="text-base font-semibold text-ink leading-tight">
              {candidate.name}
            </h4>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
            isQuantum
              ? "bg-quantum/10 text-quantum border-quantum/20"
              : "bg-stone-100 text-ink border-hairline"
          }`}
        >
          {candidate.badge}
        </span>
      </div>

      <div className="text-xs text-ink-soft mb-3 font-mono line-clamp-1">
        {candidate.architecture}
      </div>

      {/* Primary Performance Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-cream-deep/60 border border-hairline/70 mb-3">
        <div>
          <div className="text-[10px] font-mono text-ink-soft uppercase">Accuracy</div>
          <div className="text-base font-serif font-bold text-ink mt-0.5">
            {candidate.accuracy}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-ink-soft uppercase">AUROC</div>
          <div className="text-base font-serif font-bold text-ink mt-0.5">
            {candidate.auroc.toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-ink-soft uppercase">F1-Score</div>
          <div className="text-base font-serif font-bold text-ink mt-0.5">
            {candidate.f1_score.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Clinical Diagnostic Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
        <div className="p-2 rounded bg-white/70 border border-hairline flex justify-between">
          <span className="text-ink-soft">Sensitivity:</span>
          <span className="font-semibold text-ink">{candidate.sensitivity}</span>
        </div>
        <div className="p-2 rounded bg-white/70 border border-hairline flex justify-between">
          <span className="text-ink-soft">Specificity:</span>
          <span className="font-semibold text-ink">{candidate.specificity}</span>
        </div>
      </div>

      {/* Operational Latency & Footprint */}
      <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-xs text-ink-soft font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{candidate.runtime_ms} ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          <span>{candidate.resource_cost}</span>
        </div>
      </div>
    </div>
  );
}
