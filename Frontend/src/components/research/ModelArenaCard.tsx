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
      className={`rounded-2xl border p-5 cursor-pointer transition-all relative overflow-hidden font-sans ${
        isSelected
          ? isQuantum
            ? "border-[#006766] ring-2 ring-[#006766]/25 bg-white shadow-lg"
            : "border-[#082827] ring-2 ring-[#082827]/15 bg-white shadow-lg"
          : "border-[#DFEBE8] bg-[#FAFDFD] hover:bg-white hover:border-[#006766]/30 shadow-xs"
      }`}
    >
      {/* Top accent badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isQuantum
                ? "bg-[#E6F7F4] text-[#006766] border-[#00B489]/30 shadow-2xs"
                : "bg-[#F2F7F6] text-[#082827] border-[#DFEBE8]"
            }`}
          >
            {isQuantum ? <Zap className="w-4 h-4 text-[#00B489]" /> : <Cpu className="w-4 h-4" />}
          </div>
          <div>
            <span
              className={`text-[9.5px] font-mono uppercase tracking-wider font-bold ${
                isQuantum ? "text-[#006766]" : "text-[#5A7470]"
              }`}
            >
              {isQuantum ? "Quantum Candidate" : "Classical Benchmark"}
            </span>
            <h4 className="text-base font-bold text-[#082827] leading-tight">
              {candidate.name}
            </h4>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold border ${
            isQuantum
              ? "bg-[#E6F7F4] text-[#006766] border-[#00B489]/30"
              : "bg-[#F2F7F6] text-[#5A7470] border-[#DFEBE8]"
          }`}
        >
          {candidate.badge}
        </span>
      </div>

      <div className="text-xs text-[#5A7470] mb-3 font-mono line-clamp-1">
        {candidate.architecture}
      </div>

      {/* Primary Performance Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8] mb-3">
        <div>
          <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Accuracy</div>
          <div className="text-base font-sans font-bold text-[#082827] mt-0.5">
            {candidate.accuracy}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">AUROC</div>
          <div className="text-base font-sans font-bold text-[#082827] mt-0.5">
            {candidate.auroc.toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">F1-Score</div>
          <div className="text-base font-sans font-bold text-[#082827] mt-0.5">
            {candidate.f1_score.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Clinical Diagnostic Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
        <div className="p-2 rounded-lg bg-white border border-[#DFEBE8] flex justify-between shadow-2xs">
          <span className="text-[#5A7470]">Sensitivity:</span>
          <span className="font-bold text-[#082827]">{candidate.sensitivity}</span>
        </div>
        <div className="p-2 rounded-lg bg-white border border-[#DFEBE8] flex justify-between shadow-2xs">
          <span className="text-[#5A7470]">Specificity:</span>
          <span className="font-bold text-[#082827]">{candidate.specificity}</span>
        </div>
      </div>

      {/* Operational Latency & Footprint */}
      <div className="pt-3 border-t border-[#DFEBE8] flex items-center justify-between text-xs text-[#5A7470] font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#006766]" />
          <span>{candidate.runtime_ms} ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-[#006766]" />
          <span>{candidate.resource_cost}</span>
        </div>
      </div>
    </div>
  );
}
