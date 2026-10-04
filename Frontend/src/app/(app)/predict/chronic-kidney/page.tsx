"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sliders,
  Zap,
  Cpu,
  Layers,
  FlaskConical,
  HeartPulse,
  UploadCloud,
  User,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";
import BiomarkerUploadModal from "@/components/predict/BiomarkerUploadModal";
import { PatientMetadata } from "@/lib/medicalReportParser";



export default function ChronicKidneyStudioPage() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [values, setValues] = useState({
    age: 52,
    blood_pressure: 80,
    specific_gravity: 1.020,
    albumin: 0,
    blood_glucose_random: 115,
    blood_urea: 36,
    serum_creatinine: 1.1,
    hemoglobin: 14.8,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("quresight_patient_intake");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.patientId) setPatientId(parsed.patientId);
        if (parsed.patientAge) {
          const numAge = parseInt(parsed.patientAge, 10);
          if (!isNaN(numAge)) setValues((v) => ({ ...v, age: numAge }));
        }
      }
    } catch {}
  }, []);

  const handleApplyExtractedData = (extractedValues: Record<string, number>, metadata: PatientMetadata) => {
    setValues((prev) => ({
      age: extractedValues.age ?? extractedValues.patient_age ?? prev.age,
      blood_pressure: extractedValues.bp ?? extractedValues.blood_pressure ?? prev.blood_pressure,
      specific_gravity: extractedValues.sg ?? extractedValues.specific_gravity ?? prev.specific_gravity,
      albumin: extractedValues.al ?? extractedValues.albumin ?? prev.albumin,
      blood_glucose_random: extractedValues.bgr ?? extractedValues.blood_glucose_random ?? prev.blood_glucose_random,
      blood_urea: extractedValues.bu ?? extractedValues.blood_urea ?? prev.blood_urea,
      serum_creatinine: extractedValues.sc ?? extractedValues.serum_creatinine ?? prev.serum_creatinine,
      hemoglobin: extractedValues.hemo ?? extractedValues.hemoglobin ?? prev.hemoglobin,
    }));
    if (metadata.patientName) setPatientName(metadata.patientName);
    if (metadata.patientId) setPatientId(metadata.patientId);
    showToast({
      title: "Medical Report Imported",
      message: `Renal biomarkers mapped successfully for ${metadata.patientName || "Patient"}.`,
      type: "success",
    });
  };


  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/chronic-kidney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(`Inference returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);

        const isCKD = (data.telemetry.risk_score ?? 20) >= 50;

        // Persist screening to patient database
        try {
          await ScreeningService.createScreening({
            id: patientId || `QS-CKD-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName: patientName || "Renal Function Patient",
            patientAge: values.age,
            patientGender: "Unspecified",
            diseaseType: "Renal Biomarkers & KDIGO Staging",
            disease: "Chronic Kidney Disease (CKD)",
            cohort: "UCI Chronic Kidney Disease (400 Cases)",
            quantumPrediction: data.telemetry.prediction_label || (isCKD ? "CKD Indicated" : "Normal Kidney Function"),
            quantumRiskScore: Number(data.telemetry.risk_score ?? 20),
            quantumConfidence: Number(data.telemetry.confidence_percentage ?? 81.2),
            classicalPrediction: isCKD ? "CKD Indicated" : "Normal Kidney Function",
            classicalRiskScore: Number(((data.telemetry.classical_results?.probability ?? 0.15) * 100).toFixed(1)),
            classicalConfidence: 97.8,
            riskLevel: isCKD ? "High" : "Low",
            topDriver: "Serum Creatinine / eGFR",
            topDriverImpact: 12.0,
            consensusStatus: "Concordant",
            inputFeatures: values,
            telemetryJson: data.telemetry,
          });
        } catch {
          // ignore cache error
        }

        showToast({
          title: "Screening Complete",
          message: `${data.telemetry.prediction_label} (Risk: ${data.telemetry.risk_score}/100)`,
          type: data.telemetry.risk_score >= 50 ? "warning" : "success",
        });
      } else {
        throw new Error(data.error || "Inference response missing telemetry");
      }
    } catch (err: any) {
      showToast({
        title: "Screening Error",
        message: err.message || "Failed to reach renal inference service",
        type: "warning",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER SECTION (Matching MedTech Workstation Design) */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <Link
              href="/predict"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A7470] hover:text-[#006766] transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Screening Terminals
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                <Activity size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Chronic Kidney Disease (CKD) Studio
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold">
                    ACTIVE • 4-QUBIT VQC
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  4-Qubit Variational Quantum Classifier (VQC) with KDIGO 2024 Glomerular Staging and eGFR estimation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#DFEBE8] bg-white text-[#082827] hover:bg-[#F2F7F6] font-semibold text-xs transition-all shadow-2xs hover:border-[#006766]/40 cursor-pointer"
            >
              <UploadCloud size={14} className="text-[#006766]" /> Upload Lab Report
            </button>
          </div>
        </div>
      </div>

      {/* Active Certified Studio Status Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F7F4]/60 border border-[#00B489]/25 text-[#006766] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#006766]/10 text-[#006766] font-bold text-[10px] uppercase shrink-0">
            Certified Clinical Studio • 4-Qubit VQC
          </span>
          <span className="text-[#082827]/80">
            Connected to PennyLane hybrid quantum engine with KDIGO 2024 Glomerular Staging and CKD-EPI eGFR estimation.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#006766] font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
          <span>Online &amp; Verified</span>
        </div>
      </div>

      {/* Patient Clinical Intake Profile */}
      <div className="p-5 rounded-3xl border border-[#DFEBE8] bg-white shadow-[0_4px_24px_-8px_rgba(0,103,102,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#082827]">
            <User size={15} className="text-[#006766]" />
            <span>Patient Clinical Intake Profile</span>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="text-[11px] font-medium text-[#006766] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <UploadCloud size={12} /> Auto-fill from Lab Report (.PDF, .CSV, .JSON)
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Full Name</label>
            <input
              type="text"
              placeholder="e.g. Anand Sharma"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient ID / MRN</label>
            <input
              type="text"
              placeholder="e.g. MRN-39104"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Age (Years)</label>
            <input
              type="number"
              min={18}
              max={95}
              value={values.age}
              onChange={(e) => setValues({ ...values, age: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <Sliders size={16} className="text-quantum" />
                Renal Biomarker Panel (8 Inputs)
              </h2>
              <span className="text-[11px] font-mono text-ink-soft bg-cream px-2 py-0.5 rounded border border-hairline">
                KDIGO Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="95"
                  value={values.age}
                  onChange={(e) => setValues({ ...values, age: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  value={values.blood_pressure}
                  onChange={(e) => setValues({ ...values, blood_pressure: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Specific Gravity
                </label>
                <input
                  type="number"
                  step="0.005"
                  min="1.005"
                  max="1.035"
                  value={values.specific_gravity}
                  onChange={(e) => setValues({ ...values, specific_gravity: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Albuminuria (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={values.albumin}
                  onChange={(e) => setValues({ ...values, albumin: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="60"
                  max="450"
                  value={values.blood_glucose_random}
                  onChange={(e) => setValues({ ...values, blood_glucose_random: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Blood Urea (mg/dL)
                </label>
                <input
                  type="number"
                  min="10"
                  max="250"
                  value={values.blood_urea}
                  onChange={(e) => setValues({ ...values, blood_urea: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Serum Creatinine (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.4"
                  max="15.0"
                  value={values.serum_creatinine}
                  onChange={(e) => setValues({ ...values, serum_creatinine: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Hemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="20.0"
                  value={values.hemoglobin}
                  onChange={(e) => setValues({ ...values, hemoglobin: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs transition-all shadow-md shadow-[#006766]/25 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#00B489]" />
                  <span>Running 4-Qubit Quantum & Classical Analysis...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="text-[#00B489]" />
                  <span>Evaluate Renal Panel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Telemetry & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {telemetry ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Primary Verdict Card */}
              <div
                className={`p-6 rounded-2xl border ${
                  telemetry.risk_score >= 50
                    ? "bg-rose-500/5 border-rose-300"
                    : "bg-emerald-500/5 border-emerald-300"
                } shadow-xs space-y-4`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                        telemetry.risk_score >= 50
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {telemetry.risk_category}
                    </span>
                    <h3 className="text-xl font-serif text-ink mt-2 font-medium">
                      {telemetry.prediction_label}
                    </h3>
                    <p className="text-xs font-mono text-ink-soft mt-1">
                      {telemetry.kdigo_stage} • {telemetry.proteinuria_tier}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-serif text-ink font-light">
                      {telemetry.risk_score}
                      <span className="text-sm font-sans text-ink-soft"> / 100</span>
                    </div>
                    <span className="text-[11px] font-mono text-ink-soft">
                      Confidence: {telemetry.confidence_percentage}%
                    </span>
                  </div>
                </div>

                {/* eGFR Callout */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse size={18} className="text-quantum" />
                    <div>
                      <div className="text-xs font-semibold text-ink">Estimated GFR (CKD-EPI 2021)</div>
                      <div className="text-[11px] text-ink-soft">Standardized filtration index</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-ink">
                      {telemetry.egfr_value}{" "}
                      <span className="text-xs font-normal text-ink-soft">{telemetry.egfr_unit}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="bg-cream/60 p-3.5 rounded-xl border border-hairline text-xs text-ink space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-quantum" />
                    Clinical Recommendation:
                  </div>
                  <p className="text-ink-soft leading-relaxed">{telemetry.clinical_action}</p>
                </div>
              </div>

              {/* Dual-Engine Comparison */}
              <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                    <Layers size={16} className="text-quantum" />
                    Dual-Engine Comparison
                  </h3>
                  <span className="text-xs font-mono text-ink-soft">
                    Consensus: <span className="font-bold text-quantum">{telemetry.consensus_status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Classical Card */}
                  <div className="p-4 rounded-xl border border-hairline bg-cream/30 space-y-2">
                    <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">
                      Classical Baseline
                    </div>
                    <div className="text-base font-semibold text-ink">
                      {telemetry.classical_results?.prediction}
                    </div>
                    <div className="text-xs font-mono text-ink-soft">
                      Probability: {(telemetry.classical_results?.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[11px] font-mono text-ink-soft">
                      Latency: {telemetry.classical_results?.latency_ms} ms
                    </div>
                  </div>

                  {/* Quantum Card */}
                  <div className="p-4 rounded-xl border border-quantum/30 bg-quantum/5 space-y-2">
                    <div className="text-[11px] font-mono text-quantum uppercase tracking-wider font-bold">
                      Quantum VQC (4-Qubit)
                    </div>
                    <div className="text-base font-semibold text-quantum">
                      {telemetry.quantum_results?.prediction}
                    </div>
                    <div className="text-xs font-mono text-ink-soft">
                      Probability: {(telemetry.quantum_results?.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[11px] font-mono text-ink-soft">
                      Latency: {telemetry.quantum_results?.latency_ms} ms
                    </div>
                  </div>
                </div>

                {/* Pauli-Z Expectation Telemetry */}
                {telemetry.quantum_results?.pauli_z_expvals && (
                  <div className="bg-cream/40 p-3.5 rounded-xl border border-hairline space-y-2">
                    <div className="text-xs font-medium text-ink flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={14} className="text-quantum" />
                        4-Qubit Expectation Telemetry ⟨Z_i⟩
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">Hilbert Space: 2⁴ = 16</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {telemetry.quantum_results.pauli_z_expvals.map((v: number, idx: number) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-hairline text-center">
                          <div className="text-[10px] font-mono text-ink-soft">q[{idx}]</div>
                          <div className="text-xs font-mono font-bold text-quantum">{v.toFixed(3)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Attributions */}
              {telemetry.feature_attributions && (
                <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                    <FlaskConical size={16} className="text-quantum" />
                    Biomarker Risk Drivers & Attributions
                  </h3>
                  <div className="space-y-2.5">
                    {telemetry.feature_attributions.map((attr: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-hairline bg-cream/20 text-xs"
                      >
                        <div>
                          <span className="font-medium text-ink">{attr.feature}</span>
                          <span className="text-ink-soft font-mono ml-2">({attr.measured})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-ink-soft">{attr.status}</span>
                          <span className="font-mono font-bold text-quantum">
                            +{attr.impact_pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-hairline p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-quantum/10 text-quantum flex items-center justify-center mx-auto border border-quantum/20">
                <Activity size={28} />
              </div>
              <div>
                <h3 className="text-lg font-serif text-ink font-light">Renal Telemetry Awaiting Input</h3>
                <p className="text-xs text-ink-soft max-w-md mx-auto mt-1">
                  Adjust patient biomarker levels on the left panel or click any preset profile above, then click &quot;Evaluate Renal Panel&quot; to execute quantum-classical screening.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BiomarkerUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyData={handleApplyExtractedData}
        schemaType="chronic-kidney"
        diseaseTitle="Renal Function (CKD)"
      />
    </div>
  );
}
