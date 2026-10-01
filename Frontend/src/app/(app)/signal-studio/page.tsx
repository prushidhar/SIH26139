"use client";

import React, { useEffect, useState } from "react";
import { ResearchService, SignalTransformResult } from "@/services/research.service";
import { SignalMap, FeatureEvidencePanel, ExperimentTimeline } from "@/components/research";
import { Sliders, RefreshCw, AlertCircle, ArrowRight, Sparkles, Database } from "lucide-react";
import Link from "next/link";

export default function SignalStudioPage() {
  const [datasetId, setDatasetId] = useState<string>("breast_cancer");
  const [nComponents, setNComponents] = useState<number>(4);
  const [nTopFeatures, setNTopFeatures] = useState<number>(8);
  const [data, setData] = useState<SignalTransformResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runTransform = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ResearchService.transformSignal(datasetId, nComponents, nTopFeatures);
      setData(res);
    } catch (err: any) {
      console.error("Signal transform failed:", err);
      setError("Unable to run live signal decomposition. Displaying baseline 4-qubit embedding.");
      // Fallback data
      setData({
        success: true,
        dataset_id: datasetId,
        n_samples: 569,
        raw_feature_count: 30,
        selected_features: ["concave_points_mean", "radius_mean", "perimeter_mean", "area_mean", "concavity_mean", "compactness_mean", "texture_mean", "smoothness_mean"],
        feature_rankings: [
          { feature: "concave_points_mean", importance: 0.324, rank: 1 },
          { feature: "radius_mean", importance: 0.246, rank: 2 },
          { feature: "perimeter_mean", importance: 0.182, rank: 3 },
          { feature: "area_mean", importance: 0.125, rank: 4 },
          { feature: "concavity_mean", importance: 0.089, rank: 5 },
          { feature: "compactness_mean", importance: 0.052, rank: 6 },
          { feature: "texture_mean", importance: 0.041, rank: 7 },
          { feature: "smoothness_mean", importance: 0.038, rank: 8 },
        ],
        pca_analysis: {
          components: 4,
          explained_variance_ratio: [0.442, 0.191, 0.094, 0.057],
          cumulative_variance: 0.784,
          quantum_qubits_mapped: 4,
        },
        latent_space_points: [
          { id: 0, pc1: 9.193, pc2: 1.948, pc3: -1.123, label: 1, angles: [3.1416, 0.7854, -0.5236, 1.0472] },
          { id: 1, pc1: 2.388, pc2: -3.768, pc3: -0.529, label: 1, angles: [1.2566, -1.8849, -0.2618, 0.5236] },
          { id: 2, pc1: 5.734, pc2: -1.075, pc3: -0.552, label: 1, angles: [2.1991, -0.6283, -0.3142, -0.8377] },
          { id: 3, pc1: -3.123, pc2: 2.456, pc3: 0.812, label: 0, angles: [-1.4137, 1.2566, 0.4712, -0.3142] },
          { id: 4, pc1: -4.567, pc2: -1.234, pc3: 0.234, label: 0, angles: [-2.0944, -0.6283, 0.1571, 0.7854] },
          { id: 5, pc1: -2.891, pc2: -0.456, pc3: -0.123, label: 0, angles: [-1.309, -0.2094, -0.0524, -0.6283] },
        ],
        sample_quantum_state: {
          qubit_wires: ["q[0]", "q[1]", "q[2]", "q[3]"],
          sample_rotation_angles_rad: [3.1416, 0.7854, -0.5236, 1.0472],
          encoding_gate: "RX(theta) + StronglyEntanglingLayers",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTransform();
  }, [datasetId, nComponents, nTopFeatures]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/70 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-soft">
            <Sliders className="w-3.5 h-3.5 text-quantum" />
            <span>QureSight Platform • Phase 03</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1 tracking-tight">
            Signal Studio
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Supervised biomarker ranking, orthogonal PCA projection, and continuous rotation angle encoding for quantum Hilbert space circuits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/model-arena"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink text-parchment hover:bg-ink/90 text-xs font-medium transition-colors"
          >
            <span>Proceed to Model Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <ExperimentTimeline currentStageId="signal" />

      {/* Interactive Controls Strip */}
      <div className="rounded-xl border border-hairline bg-parchment p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Dataset Picker */}
            <div className="space-y-1">
              <label className="text-ink-soft uppercase text-[10px] tracking-wider font-semibold">
                Target Dataset
              </label>
              <select
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                className="block px-3 py-1.5 rounded-md border border-hairline bg-cream-deep/60 text-ink text-xs font-mono focus:outline-none focus:ring-1 focus:ring-quantum"
              >
                <option value="breast_cancer">Wisconsin Diagnostic Breast Cancer (WDBC)</option>
                <option value="heart_disease">UCI Cleveland Heart Disease</option>
              </select>
            </div>

            {/* Qubit / Component Count */}
            <div className="space-y-1">
              <label className="text-ink-soft uppercase text-[10px] tracking-wider font-semibold">
                PCA Components / Qubits ({nComponents})
              </label>
              <div className="flex items-center gap-2">
                {[2, 4, 6, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNComponents(n)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      nComponents === n
                        ? "bg-ink text-parchment"
                        : "bg-cream-deep text-ink border border-hairline hover:bg-cream-deep/80"
                    }`}
                  >
                    {n}Q
                  </button>
                ))}
              </div>
            </div>

            {/* Top Features Selected */}
            <div className="space-y-1">
              <label className="text-ink-soft uppercase text-[10px] tracking-wider font-semibold">
                Gini Rank Biomarkers ({nTopFeatures})
              </label>
              <div className="flex items-center gap-2">
                {[6, 8, 10, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNTopFeatures(n)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      nTopFeatures === n
                        ? "bg-ink text-parchment"
                        : "bg-cream-deep text-ink border border-hairline hover:bg-cream-deep/80"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={runTransform}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-cream-deep hover:bg-cream-deep/80 text-ink text-xs font-mono font-medium transition-colors self-start md:self-end"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-quantum" : "text-ink-soft"}`} />
            <span>Re-compute Angles</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="p-16 text-center text-xs font-mono text-ink-soft">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-quantum mb-2" />
          Computing Random Forest Gini impurity & PCA rotation angles...
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Latent Space Scatter Map */}
          <SignalMap data={data} />

          {/* Gini Feature Importance & Quantum Circuit Mapping */}
          <FeatureEvidencePanel data={data} />
        </div>
      ) : null}
    </div>
  );
}
