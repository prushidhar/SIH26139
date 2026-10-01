"use client";

import React from "react";
import { QuantumFeasibilityResponse } from "@/services/research.service";
import { Cpu, Layers, Activity, HardDrive, Clock, CheckCircle2 } from "lucide-react";

interface QuantumResourceProfileProps {
  feasibility: QuantumFeasibilityResponse;
}

export default function QuantumResourceProfile({ feasibility }: QuantumResourceProfileProps) {
  const { qubit_scaling, scarce_data_crossover, verdict, verdict_summary, hardware_recommendation } = feasibility;

  return (
    <div className="space-y-6">
      {/* Feasibility Analytical Verdict */}
      <div className="rounded-xl border border-quantum/30 bg-parchment p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-quantum/10 text-quantum border border-quantum/20">
              {verdict}
            </span>
            <span className="text-xs font-mono text-ink-soft">
              Analytical Feasibility Verdict
            </span>
          </div>
          <div className="text-xs font-mono text-ink-soft">
            Hardware Target: {hardware_recommendation.qpu_target}
          </div>
        </div>

        <p className="text-sm font-sans text-ink leading-relaxed">
          {verdict_summary}
        </p>

        <div className="mt-4 pt-3 border-t border-hairline/60 flex flex-wrap items-center gap-4 text-xs font-mono text-ink-soft">
          <div>Simulator: <span className="text-ink font-semibold">{hardware_recommendation.simulator}</span></div>
          <div>Mitigation: <span className="text-quantum font-semibold">{hardware_recommendation.mitigation_protocol}</span></div>
        </div>
      </div>

      {/* Qubit Scaling Table */}
      <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
              Resource Footprint & Depth Scaling
            </span>
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
              <Layers className="w-4 h-4 text-quantum" />
              Circuit Complexity Matrix (StronglyEntanglingLayers, 2 Layers)
            </h4>
          </div>
          <span className="text-xs font-mono text-ink-soft">Simulated on PennyLane Statevector</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream-deep/70 text-ink font-mono uppercase text-[10px] tracking-wider border-b border-hairline">
              <tr>
                <th className="py-2.5 px-3">Qubits (Features)</th>
                <th className="py-2.5 px-3">Circuit Depth</th>
                <th className="py-2.5 px-3">Total Gates</th>
                <th className="py-2.5 px-3">CNOT / 2Q Gates</th>
                <th className="py-2.5 px-3">Trainable Params</th>
                <th className="py-2.5 px-3">State Memory (MB)</th>
                <th className="py-2.5 px-3">Latency (Sim)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-mono text-ink">
              {qubit_scaling.map((q) => (
                <tr key={q.n_qubits} className="hover:bg-cream-deep/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-quantum">
                    {q.n_qubits} Qubits
                  </td>
                  <td className="py-2.5 px-3">{q.circuit_depth}</td>
                  <td className="py-2.5 px-3">{q.total_gates}</td>
                  <td className="py-2.5 px-3 text-ink-soft">{q.cnot_gates}</td>
                  <td className="py-2.5 px-3 font-medium text-ink">{q.trainable_parameters}</td>
                  <td className="py-2.5 px-3 text-ink-soft">{q.statevector_memory_mb} MB</td>
                  <td className="py-2.5 px-3 font-medium text-ink">{q.simulated_latency_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scarce Data Regime Crossover */}
      <div className="rounded-xl border border-hairline bg-parchment p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
              Scarce Data Generalization Frontier
            </span>
            <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mt-0.5">
              <Activity className="w-4 h-4 text-quantum" />
              Classical vs. Quantum Cross-Over Performance
            </h4>
          </div>
          <span className="text-xs font-mono text-ink-soft">Stratified Subsampling Protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream-deep/70 text-ink font-mono uppercase text-[10px] tracking-wider border-b border-hairline">
              <tr>
                <th className="py-2.5 px-3">Training Subsample</th>
                <th className="py-2.5 px-3">Cases (N)</th>
                <th className="py-2.5 px-3">Classical SVM Accuracy</th>
                <th className="py-2.5 px-3">Quantum VQC Accuracy</th>
                <th className="py-2.5 px-3">Advantage Delta</th>
                <th className="py-2.5 px-3">Regime Champion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-mono text-ink">
              {scarce_data_crossover.map((row) => {
                const isQuantumWin = row.winner.includes("Quantum");
                return (
                  <tr key={row.split_pct} className="hover:bg-cream-deep/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-ink">
                      {row.split_pct}% of Cohort
                    </td>
                    <td className="py-2.5 px-3 text-ink-soft">{row.samples} cases</td>
                    <td className="py-2.5 px-3">{row.classical_svm.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-semibold text-quantum">{row.quantum_vqc.toFixed(1)}%</td>
                    <td className={`py-2.5 px-3 font-bold ${isQuantumWin ? "text-emerald-700" : "text-stone-700"}`}>
                      {row.delta}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          isQuantumWin
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-ink border border-hairline"
                        }`}
                      >
                        {row.winner}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
