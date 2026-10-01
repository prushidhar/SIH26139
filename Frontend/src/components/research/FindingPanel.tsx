"use client";

import React from "react";
import { Info, ExternalLink, ShieldCheck } from "lucide-react";

interface FindingPanelProps {
  title: string;
  finding: string;
  significance?: string;
  sourceNote?: string;
  badge?: string;
}

export default function FindingPanel({
  title,
  finding,
  significance,
  sourceNote,
  badge = "SCIENTIFIC EVIDENCE",
}: FindingPanelProps) {
  return (
    <div className="rounded-xl border border-hairline bg-parchment p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-cream-deep text-ink border border-hairline font-medium">
          <Info className="w-3 h-3 text-quantum" />
          {badge}
        </span>
        {significance && (
          <span className="text-xs font-mono text-emerald-700 font-semibold">
            {significance}
          </span>
        )}
      </div>

      <h4 className="text-base font-serif font-bold text-ink leading-snug">
        {title}
      </h4>

      <p className="text-xs md:text-sm text-ink-soft leading-relaxed font-sans">
        {finding}
      </p>

      {sourceNote && (
        <div className="pt-2 border-t border-hairline/60 text-[11px] font-mono text-ink-soft">
          Provenance: {sourceNote}
        </div>
      )}
    </div>
  );
}
