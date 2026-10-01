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
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-parchment p-6 shadow-xs transition-all hover:shadow-sm">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ink via-quantum to-emerald-600" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide bg-cream-deep text-ink border border-hairline">
              <FlaskConical className="w-3 h-3 text-quantum" />
              ACTIVE INVESTIGATION
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {status}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif text-ink tracking-tight pt-1">
            {question}
          </h2>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono text-ink-soft uppercase tracking-wider">Experiment Code</div>
          <div className="font-mono text-sm font-semibold text-ink">{experimentId}</div>
          <div className="text-xs text-ink-soft mt-0.5">{datasetName}</div>
        </div>
      </div>

      <div className="rounded-lg bg-cream-deep/60 border border-hairline/70 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-white border border-hairline shadow-2xs mt-0.5">
            <Sparkles className="w-4 h-4 text-quantum" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-soft font-medium">
              Core Working Hypothesis
            </div>
            <p className="text-sm font-sans text-ink leading-relaxed">
              {hypothesis}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <div className="flex items-center gap-2">
          <span>Protocol:</span>
          <span className="font-medium text-ink">{experimentName}</span>
        </div>
        {updatedAt && (
          <div className="font-mono text-xs">
            Audit State: {new Date(updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
