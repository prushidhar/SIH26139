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
    <div className="space-y-6 font-sans">
      {/* Header Operational Status */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
            Automated Model Arbitration Engine
          </span>
          <h3 className="text-lg font-bold text-[#082827] flex items-center gap-2 mt-1">
            <Cpu className="w-5 h-5 text-[#006766]" />
            {arbitration_protocol}
          </h3>
          <p className="text-xs text-[#5A7470] mt-1">
            Adaptive predictive confidence routing threshold set at η = {entropy_threshold_bits}.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Router Execution State</div>
          <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
            {router_status}
          </span>
        </div>
      </div>

      {/* Live Routing Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#DFEBE8] bg-white shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Total Routed</div>
          <div className="text-2xl font-bold text-[#082827] mt-1">
            {live_telemetry_stats.total_screenings_routed.toLocaleString()}
          </div>
          <div className="text-xs text-[#5A7470] mt-1">Screening sessions</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFEBE8] bg-white shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Classical Fastpath</div>
          <div className="text-2xl font-bold text-[#082827] mt-1">
            {live_telemetry_stats.classical_only_resolved.toLocaleString()}
          </div>
          <div className="text-xs text-[#5A7470] mt-1">High confidence (&lt; 2.5 ms)</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFEBE8] bg-white shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Dual Consensus</div>
          <div className="text-2xl font-bold text-[#006766] mt-1">
            {live_telemetry_stats.dual_consensus_engaged.toLocaleString()}
          </div>
          <div className="text-xs text-[#5A7470] mt-1">Intermediate boundary</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFEBE8] bg-white shadow-2xs">
          <div className="text-[10px] font-mono text-[#5A7470] uppercase font-bold tracking-wider">Discordance Aversion</div>
          <div className="text-2xl font-bold text-[#00B489] mt-1">
            {live_telemetry_stats.discordance_aversion_rate}
          </div>
          <div className="text-xs text-[#5A7470] mt-1">Clinical safety capture</div>
        </div>
      </div>

      {/* Operational Tiers */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-[#082827]">
            Adaptive Routing Decision Tiers
          </h4>
          <span className="text-xs font-mono text-[#5A7470]">Deterministic Logic Rules</span>
        </div>

        <div className="space-y-3">
          {operational_tiers.map((tier) => (
            <div
              key={tier.tier}
              className="p-4 rounded-xl bg-[#FAFDFD] border border-[#DFEBE8] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#082827]">{tier.tier}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F7F4] border border-[#00B489]/25 text-[#006766]">
                    {tier.badge}
                  </span>
                </div>
                <div className="text-xs font-mono text-[#5A7470]">{tier.condition}</div>
                <div className="text-xs font-sans text-[#082827]">{tier.action}</div>
              </div>

              <div className="text-right shrink-0 font-mono text-xs space-y-0.5">
                <div className="text-[#082827] font-bold">Latency: {tier.latency_guarantee}</div>
                <div className="text-[#5A7470]">{tier.cohort_coverage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guardrails */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs">
        <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#00B489]" />
          Clinical Governance & Safety Guardrails
        </h4>

        <div className="space-y-2">
          {safety_guardrails.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#FAFDFD] border border-[#DFEBE8] flex items-start gap-3 text-xs text-[#082827]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00B489] shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
