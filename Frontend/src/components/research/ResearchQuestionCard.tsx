"use client";

import React from "react";
import { Sparkles, HelpCircle, ArrowUpRight, FlaskConical, CheckCircle2 } from "lucide-react";

interface ResearchQuestionCardProps {
  question: string;
  hypothesis: string;
  experimentName: string;
  experimentId: string;
  datasetName: string;
  status: string;
  updatedAt?: string;
}

export default function ResearchQuestionCard({
  question,
  hypothesis,
  experimentName,
  experimentId,
  datasetName,
  status,
  updatedAt,
}: ResearchQuestionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#DFEBE8] bg-white p-7 shadow-[0_4px_20px_-6px_rgba(0,103,102,0.08)] transition-all font-sans">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006766] via-[#00B489] to-[#74D0D2]" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
              <FlaskConical className="w-3.5 h-3.5 text-[#006766]" />
              ACTIVE INVESTIGATION
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00B489]" />
              {status}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#082827] tracking-tight pt-1">
            {question}
          </h2>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Experiment Code</div>
          <div className="font-mono text-sm font-bold text-[#082827]">{experimentId}</div>
          <div className="text-xs text-[#5A7470] mt-0.5">{datasetName}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#F8FBFA] border border-[#DFEBE8] p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] border border-[#00B489]/25 text-[#006766] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#006766]" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
              Core Working Hypothesis
            </div>
            <p className="text-sm text-[#082827] leading-relaxed">
              {hypothesis}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#DFEBE8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A7470]">
        <div className="flex items-center gap-2">
          <span>Protocol:</span>
          <span className="font-semibold text-[#082827]">{experimentName}</span>
        </div>
        {updatedAt && (
          <div className="font-mono text-xs text-[#5A7470]">
            Audit State: {new Date(updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
