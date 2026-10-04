"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Database,
  Sliders,
  Swords,
  Gauge,
  TableProperties,
  Sparkles,
  Cpu,
  Archive,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export interface StageInfo {
  id: string;
  name: string;
  href: string;
  icon: any;
  status: "COMPLETE" | "ACTIVE" | "VERIFIED" | "OPTIMIZED" | "EVALUATED" | "PROFILED" | "SYNTHESIZED";
  details: string;
}

export const WORKFLOW_STAGES: StageInfo[] = [
  {
    id: "workspace",
    name: "Research Workspace",
    href: "/workspace",
    icon: Compass,
    status: "ACTIVE",
    details: "Executive overview & hypotheses",
  },
  {
    id: "observatory",
    name: "Dataset Observatory",
    href: "/observatory",
    icon: Database,
    status: "VERIFIED",
    details: "Quality, missingness & correlations",
  },
  {
    id: "signal",
    name: "Signal Studio",
    href: "/signal-studio",
    icon: Sliders,
    status: "OPTIMIZED",
    details: "Gini ranking, PCA & angle encoding",
  },
  {
    id: "models",
    name: "Model Arena",
    href: "/model-arena",
    icon: Swords,
    status: "EVALUATED",
    details: "Classical vs quantum head-to-head",
  },
  {
    id: "feasibility",
    name: "Quantum Feasibility",
    href: "/feasibility",
    icon: Gauge,
    status: "PROFILED",
    details: "Qubits, depth, noise & crossover",
  },
  {
    id: "evidence",
    name: "Evidence Matrix",
    href: "/evidence-matrix",
    icon: TableProperties,
    status: "SYNTHESIZED",
    details: "9-axis multicriteria decision ledger",
  },
  {
    id: "explainability",
    name: "Explainability",
    href: "/explainability",
    icon: Sparkles,
    status: "COMPLETE",
    details: "SHAP & parameter shift gradients",
  },
  {
    id: "decision",
    name: "Decision Console",
    href: "/decision-console",
    icon: Cpu,
    status: "ACTIVE",
    details: "Adaptive confidence routing",
  },
  {
    id: "vault",
    name: "Experiment Vault",
    href: "/vault",
    icon: Archive,
    status: "COMPLETE",
    details: "Immutable experiment audit records",
  },
];

interface ExperimentTimelineProps {
  currentStageId?: string;
}

export default function ExperimentTimeline({ currentStageId }: ExperimentTimelineProps) {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Research Workflow Protocol
          </span>
          <h3 className="text-base font-bold text-[#082827]">9-Stage Scientific Progression</h3>
        </div>
        <div className="text-xs font-mono text-[#006766] font-bold bg-[#E6F7F4] px-2.5 py-0.5 rounded-full border border-[#00B489]/25">
          Phase 9 of 9 Grounded &amp; Operational
        </div>
      </div>

      {/* Progress pipeline pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {WORKFLOW_STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isActive = pathname === st.href || currentStageId === st.id;

          return (
            <Link
              key={st.id}
              href={st.href}
              className={`group flex flex-col justify-between p-3 rounded-xl border transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#006766] to-[#0A4F46] text-white border-[#006766] shadow-sm"
                  : "bg-[#FAFDFD] text-[#082827] border-[#DFEBE8] hover:border-[#006766]/30 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isActive ? "text-white/80" : "text-[#5A7470]"
                  }`}
                >
                  0{idx + 1}
                </span>
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-[#00B489]" : "bg-[#00B489]"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#00B489]" : "text-[#006766]"
                    }`}
                  />
                  <div
                    className={`text-xs font-bold truncate ${
                      isActive ? "text-white" : "text-[#082827]"
                    }`}
                  >
                    {st.name}
                  </div>
                </div>
                <p
                  className={`text-[11px] leading-tight line-clamp-2 ${
                    isActive ? "text-white/80" : "text-[#5A7470]"
                  }`}
                >
                  {st.details}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
