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
    <div className="rounded-xl border border-hairline bg-parchment p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Research Workflow Protocol
          </span>
          <h3 className="text-base font-serif font-bold text-ink">9-Stage Scientific Progression</h3>
        </div>
        <div className="text-xs font-mono text-ink-soft">
          Phase 9 of 9 Grounded & Operational
        </div>
      </div>

      {/* Progress pipeline pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {WORKFLOW_STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isActive = pathname === st.href || currentStageId === st.id;

          return (
            <Link
              key={st.id}
              href={st.href}
              className={`group flex flex-col justify-between p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-ink text-parchment border-ink shadow-sm"
                  : "bg-cream-deep/40 text-ink border-hairline/80 hover:border-ink/40 hover:bg-cream-deep"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={`text-[10px] font-mono ${
                    isActive ? "text-parchment/70" : "text-ink-soft"
                  }`}
                >
                  0{idx + 1}
                </span>
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-quantum-soft" : "bg-emerald-500"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-quantum-soft" : "text-quantum"
                    }`}
                  />
                  <div
                    className={`text-xs font-semibold truncate ${
                      isActive ? "text-parchment" : "text-ink"
                    }`}
                  >
                    {st.name}
                  </div>
                </div>
                <p
                  className={`text-[11px] leading-tight line-clamp-2 ${
                    isActive ? "text-parchment/80" : "text-ink-soft"
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
