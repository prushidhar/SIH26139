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
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 space-y-3 shadow-2xs font-sans">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 font-bold">
          <Info className="w-3.5 h-3.5 text-[#006766]" />
          {badge}
        </span>
        {significance && (
          <span className="text-xs font-mono text-[#00B489] font-bold">
            {significance}
          </span>
        )}
      </div>

      <h4 className="text-base font-bold text-[#082827] leading-snug">
        {title}
      </h4>

      <p className="text-xs md:text-sm text-[#5A7470] leading-relaxed">
        {finding}
      </p>

      {sourceNote && (
        <div className="pt-3 border-t border-[#DFEBE8] text-[11px] font-mono text-[#5A7470]">
          Provenance: {sourceNote}
        </div>
      )}
    </div>
  );
}
