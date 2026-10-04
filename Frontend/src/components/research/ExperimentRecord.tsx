"use client";

import React, { useState } from "react";
import { VaultExperiment } from "@/services/research.service";
import { Archive, Lock, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from "lucide-react";

interface ExperimentRecordProps {
  experiment: VaultExperiment;
}

export default function ExperimentRecord({ experiment }: ExperimentRecordProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 transition-all hover:border-[#006766]/30 shadow-2xs font-sans">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F2F7F6] border border-[#DFEBE8] text-[#082827]">
              {experiment.id}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#006766] bg-[#E6F7F4] px-2.5 py-0.5 rounded-full border border-[#00B489]/30">
              <Lock className="w-3 h-3 text-[#00B489]" />
              {experiment.status}
            </span>
            <span className="text-xs font-mono text-[#5A7470]">{experiment.date}</span>
          </div>

          <h4 className="text-base font-bold text-[#082827] pt-1">
            {experiment.title}
          </h4>
          <div className="text-xs text-[#5A7470]">
            Biomedical Cohort: <strong className="text-[#082827]">{experiment.dataset}</strong>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#082827] bg-[#F8FBFA] hover:bg-[#E6F7F4] border border-[#DFEBE8] transition-colors self-start shrink-0 cursor-pointer shadow-2xs"
        >
          <span>{expanded ? "Collapse Audit" : "Expand Audit"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[#006766]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#006766]" />}
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5 p-3.5 rounded-xl bg-[#FAFDFD] border border-[#DFEBE8] text-xs font-mono shadow-2xs">
        <div>
          <span className="text-[#5A7470]">Classical Baseline:</span>
          <div className="font-bold text-[#082827] mt-0.5">{experiment.classical_baseline}</div>
        </div>
        <div>
          <span className="text-[#006766] font-semibold">Quantum Result:</span>
          <div className="font-bold text-[#006766] mt-0.5">{experiment.quantum_result}</div>
        </div>
        <div>
          <span className="text-[#00B489] font-semibold">Advantage Delta:</span>
          <div className="font-bold text-[#00B489] mt-0.5">{experiment.advantage_delta}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#DFEBE8] space-y-3 text-xs font-sans">
          <div className="p-4 rounded-xl bg-[#F8FBFA] border border-[#DFEBE8] space-y-1 shadow-2xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#5A7470]">
              Tested Hypothesis
            </span>
            <p className="text-[#082827] leading-relaxed">{experiment.hypothesis}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#E6F7F4]/40 border border-[#00B489]/30 space-y-1 shadow-2xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#006766]">
              Experimental Conclusion &amp; Verification
            </span>
            <p className="text-[#082827] font-medium leading-relaxed">{experiment.conclusion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
