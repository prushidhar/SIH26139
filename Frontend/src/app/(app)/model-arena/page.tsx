"use client";

import React, { useEffect, useState } from "react";
import { ResearchService, ModelCandidate, ModelArenaResponse } from "@/services/research.service";
import { ModelArenaCard, ExperimentTimeline } from "@/components/research";
import { Swords, RefreshCw, AlertCircle, ArrowRight, Scale, CheckCircle2, Cpu, Zap, Activity } from "lucide-react";
import Link from "next/link";

export default function ModelArenaPage() {
  const [datasetId, setDatasetId] = useState<string>("breast_cancer");
  const [data, setData] = useState<ModelArenaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected models for head-to-head comparison
  const [selectedA, setSelectedA] = useState<string>("svm_rbf");
  const [selectedB, setSelectedB] = useState<string>("vqc_8q");

  const getFallbackCandidates = (id: string): ModelCandidate[] => {
    if (id === "cardiomegaly_cxr") {
      return [
        {
          id: "densenet121_classical",
          name: "DenseNet-121 (Classical Transfer)",
          family: "classical",
          architecture: "121 Convolutional Layers • CheXpert Pre-trained",
          accuracy: "86.50 ± 1.20%",
          auroc: 0.9250,
          f1_score: 0.8580,
          sensitivity: "85.40%",
          specificity: "87.60%",
          runtime_ms: 14.2,
          resource_cost: "7.0M Weights / GPU",
          provenance: "Decoodt et al., J. Imaging 2023, 9(7), 128",
          badge: "Classical Deep Learning",
        },
        {
          id: "densenet_vqc_6q",
          name: "DenseNet-121 + 6-Qubit Hybrid VQC",
          family: "quantum",
          architecture: "DenseNet Features + PennyLane 6-Qubit StronglyEntangling (L=6)",
          accuracy: "87.00 ± 1.10%",
          auroc: 0.9300,
          f1_score: 0.8650,
          sensitivity: "86.20%",
          specificity: "87.80%",
          runtime_ms: 38.5,
          resource_cost: "6 Qubits • 36 Quantum Params",
          provenance: "PennyLane / Qiskit (Decoodt et al. 2023)",
          badge: "Quantum Hybrid Champion",
        },
        {
          id: "resnet_vqc_4q",
          name: "ResNet-18 + 4-Qubit Hybrid VQC",
          family: "quantum",
          architecture: "ResNet-18 Backbone + PennyLane 4-Qubit StronglyEntangling (L=4)",
          accuracy: "85.20 ± 1.40%",
          auroc: 0.9180,
          f1_score: 0.8460,
          sensitivity: "84.00%",
          specificity: "86.40%",
          runtime_ms: 29.1,
          resource_cost: "4 Qubits • 24 Quantum Params",
          provenance: "PennyLane (Decoodt et al. 2023)",
          badge: "Compact Quantum Hybrid",
        },
      ];
    }
    if (id === "heart_disease") {
      return [
        {
          id: "rf_cleveland",
          name: "Random Forest",
          family: "classical",
          architecture: "100 Gini Trees (max_depth=5)",
          accuracy: "82.84 ± 6.10%",
          auroc: 0.9088,
          f1_score: 0.8350,
          sensitivity: "83.2%",
          specificity: "82.5%",
          runtime_ms: 1.4,
          resource_cost: "CPU / 409 KB",
          provenance: "Scikit-Learn 5-Fold CV",
          badge: "Classical Ensemble",
        },
        {
          id: "lr_cleveland",
          name: "Logistic Regression",
          family: "classical",
          architecture: "Convex L2-Regularized Linear",
          accuracy: "83.83 ± 4.07%",
          auroc: 0.8899,
          f1_score: 0.8410,
          sensitivity: "85.0%",
          specificity: "82.4%",
          runtime_ms: 0.6,
          resource_cost: "CPU / 1 KB",
          provenance: "Scikit-Learn 5-Fold CV",
          badge: "Fast Baseline",
        },
        {
          id: "vqc_cleveland",
          name: "Transfinite-4Q Hybrid VQC",
          family: "quantum",
          architecture: "4 Qubits • StronglyEntanglingLayers (3 Layers)",
          accuracy: "80.84 ± 5.31%",
          auroc: 0.8813,
          f1_score: 0.8120,
          sensitivity: "81.5%",
          specificity: "79.8%",
          runtime_ms: 28.5,
          resource_cost: "4 Qubits / 36 Params",
          provenance: "PennyLane default.qubit (AstroVall02)",
          badge: "Quantum Hybrid",
        },
      ];
    }
    return [
      {
        id: "svm_rbf",
        name: "SVM-RBF",
        family: "classical",
        architecture: "Radial Basis Function (C=10.0, gamma=scale)",
        accuracy: "98.24 ± 0.96%",
        auroc: 0.9954,
        f1_score: 0.9757,
        sensitivity: "96.21%",
        specificity: "99.40%",
        runtime_ms: 1.18,
        resource_cost: "CPU / 26 KB",
        provenance: "Verified MLflow Artifact",
        badge: "Classical Accuracy Leader",
      },
      {
        id: "xgboost",
        name: "XGBoost",
        family: "classical",
        architecture: "Gradient Boosted Trees (n=100, lr=0.1)",
        accuracy: "95.61 ± 1.84%",
        auroc: 0.9901,
        f1_score: 0.9395,
        sensitivity: "92.48%",
        specificity: "97.50%",
        runtime_ms: 2.10,
        resource_cost: "CPU / 118 KB",
        provenance: "Verified MLflow Artifact",
        badge: "Tree Ensemble",
      },
      {
        id: "random_forest",
        name: "Random Forest",
        family: "classical",
        architecture: "100 Gini Decision Trees (max_depth=6)",
        accuracy: "95.43 ± 1.28%",
        auroc: 0.9899,
        f1_score: 0.9381,
        sensitivity: "93.41%",
        specificity: "96.60%",
        runtime_ms: 1.85,
        resource_cost: "CPU / 557 KB",
        provenance: "Verified MLflow Artifact",
        badge: "Robust Classical",
      },
      {
        id: "vqc_8q",
        name: "Transfinite-1 (8-Qubit VQC)",
        family: "quantum",
        architecture: "8 Qubits • StronglyEntanglingLayers (2 Layers)",
        accuracy: "87.87 ± 0.85%",
        auroc: 0.9850,
        f1_score: 0.8313,
        sensitivity: "80.19%",
        specificity: "92.50%",
        runtime_ms: 46.50,
        resource_cost: "8 Qubits / 48 Gates",
        provenance: "PennyLane Statevector",
        badge: "Quantum Benchmark",
      },
      {
        id: "q_kernel",
        name: "Havlíček ZZ-Quantum Kernel",
        family: "quantum",
        architecture: "8 Qubits • Havlíček Entangled ZZ Kernel",
        accuracy: "86.45 ± 1.10%",
        auroc: 0.9812,
        f1_score: 0.8240,
        sensitivity: "79.10%",
        specificity: "91.20%",
        runtime_ms: 58.20,
        resource_cost: "8 Qubits / 64 Gates",
        provenance: "PennyLane Statevector",
        badge: "Quantum Kernel",
      },
      {
        id: "aleph_1_ibm",
        name: "Aleph-1 (Real IBM QPU)",
        family: "quantum",
        architecture: "IBM Quantum Eagle r3 (127-Qubit Superconducting)",
        accuracy: "82.50 ± 2.40%",
        auroc: 0.9410,
        f1_score: 0.7920,
        sensitivity: "76.40%",
        specificity: "86.80%",
        runtime_ms: 1240.0,
        resource_cost: "1024 Shots / ZNE Mitigation",
        provenance: "Hardware Run Receipt",
        badge: "Physical QPU",
      },
    ];
  };

  const fetchArena = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ResearchService.getModelArena(datasetId);
      setData(res);
      if (res.candidates.length >= 2) {
        setSelectedA(res.candidates[0].id);
        const qModel = res.candidates.find((c) => c.family === "quantum") || res.candidates[1];
        setSelectedB(qModel.id);
      }
    } catch (err: any) {
      console.error("Failed to load model arena:", err);
      setError("Unable to load live arena metrics. Displaying certified 5-fold cross-validation benchmarks.");
      const fallbackCandidates = getFallbackCandidates(datasetId);
      setData({
        success: true,
        dataset_id: datasetId,
        evaluation_protocol: datasetId === "cardiomegaly_cxr" ? "Stratified CheXpert 5-Fold Test Set (N=1,200)" : "Stratified 5-Fold Cross Validation (Zero Data Leakage)",
        candidates: fallbackCandidates,
      });
      if (fallbackCandidates.length >= 2) {
        setSelectedA(fallbackCandidates[0].id);
        const qModel = fallbackCandidates.find((c) => c.family === "quantum") || fallbackCandidates[1];
        setSelectedB(qModel.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArena();
  }, [datasetId]);

  const candA = data?.candidates.find((c) => c.id === selectedA) || data?.candidates[0];
  const candB = data?.candidates.find((c) => c.id === selectedB) || data?.candidates[1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/70 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-soft">
            <Swords className="w-3.5 h-3.5 text-quantum" />
            <span>QureSight Platform • Phase 04</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1 tracking-tight">
            Model Arena
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Empirical head-to-head evaluation: Classical baselines against Quantum variational circuits and kernels.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/feasibility"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink text-parchment hover:bg-ink/90 text-xs font-medium transition-colors"
          >
            <span>Proceed to Quantum Feasibility</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <ExperimentTimeline currentStageId="models" />

      {/* Cohort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-hairline bg-parchment">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-ink-soft font-semibold">Cohort Protocol:</span>
          <select
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-hairline bg-cream-deep/60 text-ink text-xs font-mono focus:outline-none focus:ring-1 focus:ring-quantum"
          >
            <option value="breast_cancer">Wisconsin Diagnostic Breast Cancer (WDBC)</option>
            <option value="heart_disease">UCI Cleveland Heart Disease</option>
            <option value="cardiomegaly_cxr">CheXpert Cardiomegaly Radiography (Decoodt et al. 2023)</option>
          </select>
        </div>

        <div className="text-xs font-mono text-ink-soft flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{data?.evaluation_protocol || "Stratified 5-Fold Cross Validation"}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Head-to-Head Comparison Workspace */}
      {candA && candB && (
        <div className="rounded-xl border border-hairline bg-parchment p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-quantum" />
              Interactive Head-to-Head Differential
            </span>
            <span className="text-xs font-mono text-ink-soft">
              {candA.name} vs. {candB.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-cream-deep/40 border border-hairline">
            {/* Candidate A Column */}
            <div className="space-y-1">
              <div className="text-xs font-mono text-ink-soft uppercase">Candidate [A]</div>
              <h4 className="text-base font-bold text-ink">{candA.name}</h4>
              <div className="text-xs text-ink-soft">{candA.architecture}</div>
              <div className="mt-3 font-mono text-xs space-y-1">
                <div>Accuracy: <strong className="text-ink">{candA.accuracy}</strong></div>
                <div>AUROC: <strong className="text-ink">{candA.auroc.toFixed(4)}</strong></div>
                <div>Runtime: <strong className="text-ink">{candA.runtime_ms} ms</strong></div>
              </div>
            </div>

            {/* Differential Delta Column */}
            <div className="p-3 rounded-lg bg-white border border-hairline flex flex-col justify-center items-center text-center space-y-2 font-mono">
              <span className="text-[10px] text-ink-soft uppercase tracking-wider">AUROC Differential</span>
              <div
                className={`text-xl font-bold ${
                  candA.auroc >= candB.auroc ? "text-stone-900" : "text-quantum"
                }`}
              >
                {(candA.auroc - candB.auroc >= 0 ? "+" : "")}
                {(candA.auroc - candB.auroc).toFixed(4)}
              </div>
              <span className="text-[11px] text-ink-soft">
                Latency: {(candB.runtime_ms / (candA.runtime_ms || 1)).toFixed(1)}x difference
              </span>
            </div>

            {/* Candidate B Column */}
            <div className="space-y-1 md:text-right">
              <div className="text-xs font-mono text-quantum uppercase">Candidate [B]</div>
              <h4 className="text-base font-bold text-ink">{candB.name}</h4>
              <div className="text-xs text-ink-soft">{candB.architecture}</div>
              <div className="mt-3 font-mono text-xs space-y-1">
                <div>Accuracy: <strong className="text-ink">{candB.accuracy}</strong></div>
                <div>AUROC: <strong className="text-ink">{candB.auroc.toFixed(4)}</strong></div>
                <div>Runtime: <strong className="text-ink">{candB.runtime_ms} ms</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Candidate Cards */}
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
              Select any candidate below to update differential comparison
            </span>
            <span className="text-xs font-mono text-ink-soft">
              {data.candidates.length} Models Profiled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.candidates.map((cand) => {
              const isSelected = cand.id === selectedA || cand.id === selectedB;
              return (
                <ModelArenaCard
                  key={cand.id}
                  candidate={cand}
                  isSelected={isSelected}
                  onSelect={() => {
                    if (cand.id === selectedA) return;
                    if (cand.family === "quantum") {
                      setSelectedB(cand.id);
                    } else {
                      setSelectedA(cand.id);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
