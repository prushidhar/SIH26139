"use client";

import React from "react";
import { DecisionConsoleResponse } from "@/services/research.service";
import { Cpu, ShieldCheck, Zap, AlertTriangle, Activity, CheckCircle2 } from "lucide-react";

interface DecisionConsolePanelProps {
  decision: DecisionConsoleResponse;
}

export default function DecisionConsolePanel({ decision }: DecisionConsolePanelProps) {
  const { router_status, arbitration_protocol, entropy_threshold_bits, operational_tiers, safety_guardrails, live_telemetry_stats } = decision;

  return (
    <div className="space-y-6">
      {/* Header Operational Status */}
      <div className="rounded-xl border border-hairline bg-parchment p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Automated Model Arbitration Engine
          </span>
          <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2 mt-0.5">
            <Cpu className="w-5 h-5 text-quantum" />
            {arbitration_protocol}
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Adaptive predictive confidence routing threshold set at η = {entropy_threshold_bits}.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono text-ink-soft uppercase">Router Execution State</div>
          <span className="inline-block mt-1 px-3 py-1 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {router_status}
          </span>
        </div>
      </div>

      {/* Live Routing Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-hairline bg-parchment">
          <div className="text-[11px] font-mono text-ink-soft uppercase">Total Routed</div>
          <div className="text-2xl font-serif font-bold text-ink mt-1">
            {live_telemetry_stats.total_screenings_routed.toLocaleString()}
          </div>
          <div className="text-xs text-ink-soft mt-1">Screening sessions</div>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-parchment">
          <div className="text-[11px] font-mono text-ink-soft uppercase">Classical Fastpath</div>
          <div className="text-2xl font-serif font-bold text-ink mt-1">
            {live_telemetry_stats.classical_only_resolved.toLocaleString()}
          </div>
          <div className="text-xs text-ink-soft mt-1">High confidence (&lt; 2.5 ms)</div>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-parchment">
          <div className="text-[11px] font-mono text-ink-soft uppercase">Dual Consensus</div>
          <div className="text-2xl font-serif font-bold text-quantum mt-1">
            {live_telemetry_stats.dual_consensus_engaged.toLocaleString()}
          </div>
          <div className="text-xs text-ink-soft mt-1">Intermediate boundary</div>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-parchment">
          <div className="text-[11px] font-mono text-ink-soft uppercase">Discordance Aversion</div>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
            {live_telemetry_stats.discordance_aversion_rate}
          </div>
          <div className="text-xs text-ink-soft mt-1">Clinical safety capture</div>
        </div>
      </div>

      {/* Operational Tiers */}
      <div className="rounded-xl border border-hairline bg-parchment p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-ink">
            Adaptive Routing Decision Tiers
          </h4>
          <span className="text-xs font-mono text-ink-soft">Deterministic Logic Rules</span>
        </div>

        <div className="space-y-3">
          {operational_tiers.map((tier) => (
            <div
              key={tier.tier}
              className="p-4 rounded-lg bg-cream-deep/50 border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink">{tier.tier}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-hairline text-ink-soft">
                    {tier.badge}
                  </span>
                </div>
                <div className="text-xs font-mono text-ink-soft">{tier.condition}</div>
                <div className="text-xs font-sans text-ink">{tier.action}</div>
              </div>

              <div className="text-right shrink-0 font-mono text-xs space-y-0.5">
                <div className="text-ink font-semibold">Latency: {tier.latency_guarantee}</div>
                <div className="text-ink-soft">{tier.cohort_coverage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guardrails */}
      <div className="rounded-xl border border-hairline bg-parchment p-5">
        <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Clinical Governance & Safety Guardrails
        </h4>

        <div className="space-y-2">
          {safety_guardrails.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-cream-deep/40 border border-hairline/70 flex items-start gap-2.5 text-xs text-ink"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
