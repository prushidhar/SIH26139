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
    <div className="space-y-6 font-sans">
      {/* Feasibility Analytical Verdict */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-[#FAFDFD] p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30">
              {verdict}
            </span>
            <span className="text-xs font-mono text-[#5A7470]">
              Analytical Feasibility Verdict
            </span>
          </div>
          <div className="text-xs font-mono text-[#5A7470]">
            Hardware Target: <span className="text-[#082827] font-bold">{hardware_recommendation.qpu_target}</span>
          </div>
        </div>

        <p className="text-sm text-[#082827] leading-relaxed">
          {verdict_summary}
        </p>

        <div className="mt-4 pt-3 border-t border-[#DFEBE8] flex flex-wrap items-center gap-4 text-xs font-mono text-[#5A7470]">
          <div>Simulator: <span className="text-[#082827] font-bold">{hardware_recommendation.simulator}</span></div>
          <div>Mitigation: <span className="text-[#006766] font-bold">{hardware_recommendation.mitigation_protocol}</span></div>
        </div>
      </div>

      {/* Qubit Scaling Table */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
              Resource Footprint & Depth Scaling
            </span>
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
              <Layers className="w-4 h-4 text-[#006766]" />
              Circuit Complexity Matrix (StronglyEntanglingLayers, 2 Layers)
            </h4>
          </div>
          <span className="text-xs font-mono text-[#5A7470]">Simulated on PennyLane Statevector</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FBFA] text-[#082827] font-mono uppercase text-[10px] font-bold tracking-wider border-b border-[#DFEBE8]">
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
            <tbody className="divide-y divide-[#DFEBE8] font-mono text-[#082827]">
              {qubit_scaling.map((q) => (
                <tr key={q.n_qubits} className="hover:bg-[#E6F7F4]/20 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#006766]">
                    {q.n_qubits} Qubits
                  </td>
                  <td className="py-2.5 px-3">{q.circuit_depth}</td>
                  <td className="py-2.5 px-3">{q.total_gates}</td>
                  <td className="py-2.5 px-3 text-[#5A7470]">{q.cnot_gates}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#082827]">{q.trainable_parameters}</td>
                  <td className="py-2.5 px-3 text-[#5A7470]">{q.statevector_memory_mb} MB</td>
                  <td className="py-2.5 px-3 font-semibold text-[#082827]">{q.simulated_latency_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scarce Data Regime Crossover */}
      <div className="rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5A7470]">
              Scarce Data Generalization Frontier
            </span>
            <h4 className="text-sm font-bold text-[#082827] flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-[#006766]" />
              Classical vs. Quantum Cross-Over Performance
            </h4>
          </div>
          <span className="text-xs font-mono text-[#5A7470]">Stratified Subsampling Protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FBFA] text-[#082827] font-mono uppercase text-[10px] font-bold tracking-wider border-b border-[#DFEBE8]">
              <tr>
                <th className="py-2.5 px-3">Training Subsample</th>
                <th className="py-2.5 px-3">Cases (N)</th>
                <th className="py-2.5 px-3">Classical SVM Accuracy</th>
                <th className="py-2.5 px-3">Quantum VQC Accuracy</th>
                <th className="py-2.5 px-3">Advantage Delta</th>
                <th className="py-2.5 px-3">Regime Champion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFEBE8] font-mono text-[#082827]">
              {scarce_data_crossover.map((row) => {
                const isQuantumWin = row.winner.includes("Quantum");
                return (
                  <tr key={row.split_pct} className="hover:bg-[#E6F7F4]/20 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#082827]">
                      {row.split_pct}% of Cohort
                    </td>
                    <td className="py-2.5 px-3 text-[#5A7470]">{row.samples} cases</td>
                    <td className="py-2.5 px-3">{row.classical_svm.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold text-[#006766]">{row.quantum_vqc.toFixed(1)}%</td>
                    <td className={`py-2.5 px-3 font-bold ${isQuantumWin ? "text-[#00B489]" : "text-[#5A7470]"}`}>
                      {row.delta}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                          isQuantumWin
                            ? "bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30"
                            : "bg-[#F2F7F6] text-[#082827] border border-[#DFEBE8]"
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
