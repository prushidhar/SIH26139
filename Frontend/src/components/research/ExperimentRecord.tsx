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
    <div className="rounded-xl border border-hairline bg-parchment p-5 transition-all hover:border-ink/30">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cream-deep border border-hairline text-ink">
              {experiment.id}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              {experiment.status}
            </span>
            <span className="text-xs font-mono text-ink-soft">{experiment.date}</span>
          </div>

          <h4 className="text-base font-serif font-bold text-ink pt-1">
            {experiment.title}
          </h4>
          <div className="text-xs text-ink-soft">
            Biomedical Cohort: <strong className="text-ink">{experiment.dataset}</strong>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium text-ink bg-cream-deep hover:bg-cream-deep/80 border border-hairline transition-colors self-start shrink-0"
        >
          <span>{expanded ? "Collapse Audit" : "Expand Audit"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3 p-3 rounded-lg bg-cream-deep/40 border border-hairline/60 text-xs font-mono">
        <div>
          <span className="text-ink-soft">Classical Baseline:</span>
          <div className="font-semibold text-ink mt-0.5">{experiment.classical_baseline}</div>
        </div>
        <div>
          <span className="text-quantum">Quantum Result:</span>
          <div className="font-semibold text-quantum mt-0.5">{experiment.quantum_result}</div>
        </div>
        <div>
          <span className="text-emerald-700">Advantage Delta:</span>
          <div className="font-bold text-emerald-700 mt-0.5">{experiment.advantage_delta}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-hairline/70 space-y-3 text-xs font-sans">
          <div className="p-3 rounded-lg bg-white/70 border border-hairline space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              Tested Hypothesis
            </span>
            <p className="text-ink leading-relaxed">{experiment.hypothesis}</p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
              Experimental Conclusion & Verification
            </span>
            <p className="text-ink font-medium leading-relaxed">{experiment.conclusion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
