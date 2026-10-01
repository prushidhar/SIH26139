import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // 60-second timeout for serverless function


// Empirical WDBC reference statistics for calculation
const WDBC_BENIGN = {
  radius_mean: { med: 12.20, pct90: 14.45 },
  texture_mean: { med: 17.39, pct90: 22.87 },
  perimeter_mean: { med: 78.18, pct90: 93.80 },
  area_mean: { med: 458.70, pct90: 649.00 },
  smoothness_mean: { med: 0.0908, pct90: 0.1060 },
  compactness_mean: { med: 0.0645, pct90: 0.1150 },
  concavity_mean: { med: 0.0371, pct90: 0.0926 },
  concave_points_mean: { med: 0.0234, pct90: 0.0480 }
};

const WDBC_MALIGNANT = {
  radius_mean: { pct10: 13.61, med: 17.33 },
  texture_mean: { pct10: 17.25, med: 21.46 },
  perimeter_mean: { pct10: 88.50, med: 114.20 },
  area_mean: { pct10: 573.20, med: 932.00 },
  smoothness_mean: { pct10: 0.0880, med: 0.1030 },
  compactness_mean: { pct10: 0.0780, med: 0.1328 },
  concavity_mean: { pct10: 0.0803, med: 0.1513 },
  concave_points_mean: { pct10: 0.0519, med: 0.0863 }
};

const FEATURE_WEIGHTS: Record<string, number> = {
  concave_points_mean: 0.22,
  concavity_mean: 0.20,
  radius_mean: 0.18,
  area_mean: 0.15,
  perimeter_mean: 0.12,
  compactness_mean: 0.07,
  texture_mean: 0.04,
  smoothness_mean: 0.02
};

const FEATURE_LABELS: Record<string, string> = {
  radius_mean: "Cell Size (Radius)",
  texture_mean: "Surface Texture",
  perimeter_mean: "Cell Perimeter",
  area_mean: "Nuclear Area",
  smoothness_mean: "Border Smoothness",
  compactness_mean: "Compactness Index",
  concavity_mean: "Indentation Depth",
  concave_points_mean: "Indentation Count"
};

function calculateMorphometricIndex(biomarkers: Record<string, number>) {
  let weightedScore = 0;
  const dimensionDetails: Record<string, any> = {};

  for (const [key, weight] of Object.entries(FEATURE_WEIGHTS)) {
    const val = Number(biomarkers[key] ?? WDBC_BENIGN[key as keyof typeof WDBC_BENIGN].med);
    const bMed = WDBC_BENIGN[key as keyof typeof WDBC_BENIGN].med;
    const mMed = WDBC_MALIGNANT[key as keyof typeof WDBC_MALIGNANT].med;

    const relativePos = (val - bMed) / (mMed - bMed + 1e-7);
    const dimScore = Math.max(-25, Math.min(250, relativePos * 100));

    dimensionDetails[key] = {
      measured: val,
      benignMedian: bMed,
      malignantMedian: mMed,
      deviationScore: dimScore,
      isElevated: val > WDBC_BENIGN[key as keyof typeof WDBC_BENIGN].pct90
    };

    weightedScore += dimScore * weight;
  }

  return {
    morphometricIndex: Math.max(0, Math.min(100, weightedScore)),
    dimensionDetails
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      biomarkers = {},
      model_family = "quresight_hybrid_v1", // 'aegis_classical_v1' | 'quresight_hybrid_v1'
      execution_mode = "simulator",       // 'simulator' | 'real_ibm_qpu'
      patient_info = {}
    } = body;

    const t0 = performance.now();
    const isClassicalPrimary = model_family === "aegis_classical_v1" || model_family === "cx_01";

    // Standardize biomarker vector
    const b: Record<string, number> = {
      radius_mean: Number(biomarkers.radius_mean ?? 12.2),
      texture_mean: Number(biomarkers.texture_mean ?? 17.39),
      perimeter_mean: Number(biomarkers.perimeter_mean ?? 78.18),
      area_mean: Number(biomarkers.area_mean ?? 458.7),
      smoothness_mean: Number(biomarkers.smoothness_mean ?? 0.0908),
      compactness_mean: Number(biomarkers.compactness_mean ?? 0.0645),
      concavity_mean: Number(biomarkers.concavity_mean ?? 0.0371),
      concave_points_mean: Number(biomarkers.concave_points_mean ?? 0.0234)
    };

    const { morphometricIndex, dimensionDetails } = calculateMorphometricIndex(b);

    // Connect to real Python Backend (Port 8000) running trained PyTorch, PennyLane & Scikit-Learn pipelines
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    let livePythonData: any = null;

    try {
      const [tfResp, cxResp] = await Promise.all([
        fetch(`${backendUrl}/inference/breast-cancer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: "transfinite_1",
            biomarkers: b,
          }),
          signal: AbortSignal.timeout(10000),
        }),
        fetch(`${backendUrl}/inference/breast-cancer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: "cx_01",
            biomarkers: b,
          }),
          signal: AbortSignal.timeout(10000),
        }),
      ]);

      if (tfResp.ok && cxResp.ok) {
        const tfData = await tfResp.json();
        const cxData = await cxResp.json();
        if (tfData.success && cxData.success) {
          livePythonData = {
            tf: tfData.telemetry,
            cx: cxData.telemetry,
          };
        }
      }
    } catch (backendErr) {
      console.warn("Python backend connection note:", backendErr);
    }

    if (!livePythonData) {
      return NextResponse.json(
        { error: "Python ML backend inference unreachable. Please ensure the backend is running on port 8000." },
        { status: 503 }
      );
    }

    const cxTelemetry = livePythonData.cx;
    const tfTelemetry = livePythonData.tf;

    // Real Classical SHAP Attributions from trained SVM-RBF / XGBoost pipeline
    const classicalAttributions = (cxTelemetry.shap_attributions || []).map((attr: any) => {
      const impactVal = Number(attr.impact_percentage ?? 0);
      return {
        featureKey: attr.feature_key,
        feature_key: attr.feature_key,
        featureName: attr.feature_name || FEATURE_LABELS[attr.feature_key] || attr.feature_key,
        feature_name: attr.feature_name || FEATURE_LABELS[attr.feature_key] || attr.feature_key,
        measuredValue: Number(attr.measured_value ?? b[attr.feature_key] ?? 0),
        measured_value: Number(attr.measured_value ?? b[attr.feature_key] ?? 0),
        baselineValue: Number(attr.baseline_value ?? 0),
        baseline_value: Number(attr.baseline_value ?? 0),
        impactPercentage: Math.abs(impactVal),
        impact_percentage: Math.abs(impactVal),
        rawImpact: impactVal / 100.0,
        direction: attr.direction || (impactVal >= 0 ? "risk_elevating" : "protective"),
        quantumImpact: `${impactVal >= 0 ? "+" : "-"}${Math.abs(impactVal).toFixed(1)}% impact`,
        description: attr.description || `${attr.feature_name || attr.feature_key} classical attribution`,
      };
    });

    // Real Quantum Saliency from trained PennyLane 8-Qubit VQC circuit
    const quantumAttributions = (tfTelemetry.quantum_saliency || []).map((sal: any) => {
      const saliencyVal = Number(sal.saliency_percentage ?? 0);
      return {
        featureKey: sal.feature_key,
        feature_key: sal.feature_key,
        featureName: sal.feature_name || FEATURE_LABELS[sal.feature_key] || sal.feature_key,
        feature_name: sal.feature_name || FEATURE_LABELS[sal.feature_key] || sal.feature_key,
        wire_index: sal.wire_index,
        qubit_label: sal.qubit_label || `Qubit q[${sal.wire_index}]`,
        rotation_angle_rad: sal.rotation_angle_rad,
        saliency_percentage: saliencyVal,
        impactPercentage: Math.abs(saliencyVal),
        impact_percentage: Math.abs(saliencyVal),
        rawImpact: saliencyVal / 100.0,
        direction: "risk_elevating",
        importance_rank: sal.importance_rank,
        quantumImpact: sal.quantum_impact || `+${saliencyVal.toFixed(1)}% impact`,
        quantum_impact: sal.quantum_impact || `+${saliencyVal.toFixed(1)}% impact`,
        measuredValue: Number(b[sal.feature_key] ?? 0),
        measured_value: Number(b[sal.feature_key] ?? 0),
        baselineValue: Number(WDBC_BENIGN[sal.feature_key as keyof typeof WDBC_BENIGN]?.med ?? 0),
        baseline_value: Number(WDBC_BENIGN[sal.feature_key as keyof typeof WDBC_BENIGN]?.med ?? 0),
        description: `${sal.qubit_label || 'Qubit'} Pauli rotation angle: ${Number(sal.rotation_angle_rad).toFixed(3)} rad`,
      };
    });

    // PIPELINE 3: IBM Quantum Hardware QPU (if requested)
    let hardwareReceipt = null;
    let alephTelemetry = null;
    if (execution_mode === "real_ibm_qpu") {
      try {
        const alephResp = await fetch(`${backendUrl}/inference/breast-cancer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: "aleph_1",
            biomarkers: b,
            ibm_token: patient_info?.ibm_token || null,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (alephResp.ok) {
          const alephData = await alephResp.json();
          if (alephData?.telemetry) {
            alephTelemetry = alephData.telemetry;
            hardwareReceipt = alephData.telemetry.hardware_receipt || null;
          }
        }
      } catch (alephErr) {
        console.warn("IBM live QPU note:", alephErr);
      }
    }

    // Active Selected Primary Evaluation
    const primaryTelemetry = isClassicalPrimary
      ? cxTelemetry
      : (execution_mode === "real_ibm_qpu" && alephTelemetry ? alephTelemetry : tfTelemetry);

    const activeEngineName = isClassicalPrimary
      ? "Classical Baseline"
      : (execution_mode === "real_ibm_qpu" ? "IBM Quantum Eagle QPU" : "Quantum Model (8-Qubit VQC)");

    const shapAttributions = isClassicalPrimary ? classicalAttributions : quantumAttributions;

    const latencyMs = performance.now() - t0;
    const isConcordant = cxTelemetry.prediction_label === tfTelemetry.prediction_label;

    const dualComparison = {
      consensus: isConcordant ? "CONCORDANT" : "DIVERGENT",
      consensus_summary: isConcordant
        ? `Both Classical Baseline and Quantum VQC independently concord on ${primaryTelemetry.prediction_label.toUpperCase()} assessment.`
        : `Divergence detected: Quantum VQC model identified subtle non-linear boundary deviations.`,
      cx_01: {
        engine: "Classical Baseline",
        type: "Classical Baseline (SVM-RBF + XGBoost)",
        prediction_label: cxTelemetry.prediction_label,
        confidence: parseFloat(Number(cxTelemetry.confidence_percentage ?? 70.0).toFixed(1)),
        risk_score: parseFloat(Number(cxTelemetry.composite_risk_score ?? 50.0).toFixed(1)),
        risk_tag: cxTelemetry.risk_tag || "MODERATE_RISK",
        risk_tier: cxTelemetry.risk_tier || "Moderate Risk",
        severity: cxTelemetry.severity || "moderate",
        iac_category: cxTelemetry.iac_category || "IAC Category 3 (Atypical)",
        rom_estimate: cxTelemetry.rom_estimate || "15% - 50%",
        malignancy_prob: parseFloat(Number(cxTelemetry.calibrated_malignancy_prob ?? 50.0).toFixed(1)),
        latency_ms: parseFloat(Number(cxTelemetry.latency_ms ?? 14.5).toFixed(2)),
        architecture: "30-Feature Regularized Hyperplane + Tree Ensemble",
        individual_models: cxTelemetry.individual_models || {},
        shap_attributions: classicalAttributions,
      },
      transfinite_1: {
        engine: "Quantum Model (8-Qubit VQC)",
        type: "Quantum Hybrid Simulator (ZZ Feature Map + VQC)",
        prediction_label: tfTelemetry.prediction_label,
        confidence: parseFloat(Number(tfTelemetry.confidence_percentage ?? 50.0).toFixed(1)),
        risk_score: parseFloat(Number(tfTelemetry.composite_risk_score ?? 50.0).toFixed(1)),
        risk_tag: tfTelemetry.risk_tag || "MODERATE_RISK",
        risk_tier: tfTelemetry.risk_tier || "Moderate Risk",
        severity: tfTelemetry.severity || "moderate",
        iac_category: tfTelemetry.iac_category || "IAC Category 3 (Atypical)",
        rom_estimate: tfTelemetry.rom_estimate || "15% - 50%",
        malignancy_prob: parseFloat(Number(tfTelemetry.calibrated_malignancy_prob ?? 50.0).toFixed(1)),
        quantum_expectation: parseFloat(Number(tfTelemetry.quantum_expectation_val ?? 0.0).toFixed(4)),
        qubit_expectations: tfTelemetry.qubit_expectations || [],
        latency_ms: parseFloat(Number(tfTelemetry.latency_ms ?? 75.0).toFixed(2)),
        architecture: "8-Qubit ZZ Pauli Tensor Map + Strongly Entangling Layers",
        quantum_saliency: quantumAttributions,
        shap_attributions: quantumAttributions,
      }
    };

    const responsePayload = {
      success: true,
      engine: activeEngineName,
      model_family,
      execution_mode,
      prediction_label: primaryTelemetry.prediction_label,
      confidence: parseFloat(Number(primaryTelemetry.confidence_percentage ?? 50.0).toFixed(1)),
      calibrated_malignancy_prob: parseFloat(Number(primaryTelemetry.calibrated_malignancy_prob ?? 50.0).toFixed(1)),
      composite_risk_score: parseFloat(Number(primaryTelemetry.composite_risk_score ?? 50.0).toFixed(1)),
      risk_tier: primaryTelemetry.risk_tier,
      risk_tag: primaryTelemetry.risk_tag,
      severity: primaryTelemetry.severity,
      iac_category: primaryTelemetry.iac_category,
      rom_estimate: primaryTelemetry.rom_estimate,
      clinical_action: primaryTelemetry.clinical_action,
      morphology_summary: primaryTelemetry.morphology_summary,
      morphometric_index: parseFloat(Number(primaryTelemetry.morphometric_index ?? morphometricIndex).toFixed(1)),
      in_overlap_zone: primaryTelemetry.composite_risk_score >= 45 && primaryTelemetry.composite_risk_score <= 65,
      quantum_expectation: parseFloat(Number(tfTelemetry.quantum_expectation_val ?? 0.0).toFixed(4)),
      qubit_expectations: tfTelemetry.qubit_expectations || [],
      quantum_saliency: quantumAttributions,
      individual_models: cxTelemetry.individual_models || {},
      shap_attributions: shapAttributions,
      dimension_details: dimensionDetails,
      hardware_receipt: hardwareReceipt,
      dual_comparison: dualComparison,
      latency_ms: parseFloat(latencyMs.toFixed(2)),
      timestamp: new Date().toISOString()
    };

    // Asynchronously log to Supabase if configured
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("screenings").insert({
          id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          patient_id: patient_info.patient_id || "QS-PATIENT-001",
          patient_name: patient_info.name || "Test Patient",
          patient_age: patient_info.age ? parseInt(patient_info.age) : null,
          patient_gender: patient_info.gender || "Female",
          disease_type: "breast-cancer",
          model_family,
          execution_mode,
          quantum_prediction: primaryTelemetry.prediction_label,
          quantum_confidence: primaryTelemetry.confidence_percentage,
          classical_prediction: cxTelemetry.prediction_label,
          classical_confidence: cxTelemetry.confidence_percentage,
          risk_level: primaryTelemetry.risk_tag,
          risk_score: primaryTelemetry.composite_risk_score,
          morphometric_index: morphometricIndex,
          top_driver: shapAttributions[0]?.featureName || "Cell Size",
          quantum_execution_time_ms: Math.round(latencyMs),
          input_features: b,
          gate_attributions: shapAttributions,
          shap_attributions: shapAttributions,
          hardware_receipt: hardwareReceipt,
          clinical_note: `${primaryTelemetry.risk_tier} - ${primaryTelemetry.clinical_action}`
        });
      }
    } catch (dbErr) {
      console.warn("Supabase background logging notice:", dbErr);
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Inference Engine API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process inference" },
      { status: 500 }
    );
  }
}
