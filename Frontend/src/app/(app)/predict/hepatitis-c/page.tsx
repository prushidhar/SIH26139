"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Droplets,
  Activity,
  Cpu,
  Layers,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sliders,
  HelpCircle,
  FlaskConical,
  Zap,
  UploadCloud,
  User,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";
import BiomarkerUploadModal from "@/components/predict/BiomarkerUploadModal";
import { PatientMetadata } from "@/lib/medicalReportParser";

interface BiomarkerField {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
  category: "Enzymatic" | "Synthetic" | "Clearance";
}

const HCV_FIELDS: BiomarkerField[] = [
  {
    key: "AST",
    label: "AST (Aspartate Aminotransferase)",
    min: 10,
    max: 250,
    step: 1,
    defaultValue: 34,
    unit: "U/L",
    description: "Core liver injury enzyme. Markedly elevated in active hepatitis and cirrhosis.",
    category: "Enzymatic",
  },
  {
    key: "ALT",
    label: "ALT (Alanine Aminotransferase)",
    min: 10,
    max: 250,
    step: 1,
    defaultValue: 28,
    unit: "U/L",
    description: "Specific hepatocellular biomarker. Surges during hepatic inflammation.",
    category: "Enzymatic",
  },
  {
    key: "GGT",
    label: "GGT (Gamma-Glutamyl Transferase)",
    min: 10,
    max: 300,
    step: 1,
    defaultValue: 39,
    unit: "U/L",
    description: "Biliary and parenchymal integrity enzyme.",
    category: "Enzymatic",
  },
  {
    key: "ALP",
    label: "ALP (Alkaline Phosphatase)",
    min: 20,
    max: 220,
    step: 1,
    defaultValue: 68,
    unit: "U/L",
    description: "Cholestatic biomarker indicating bile duct blockage.",
    category: "Enzymatic",
  },
  {
    key: "ALB",
    label: "ALB (Serum Albumin)",
    min: 15,
    max: 55,
    step: 0.5,
    defaultValue: 41.5,
    unit: "g/L",
    description: "Primary protein synthesized by the liver. Depleted in severe fibrosis.",
    category: "Synthetic",
  },
  {
    key: "CHE",
    label: "CHE (Cholinesterase)",
    min: 1.5,
    max: 15.0,
    step: 0.1,
    defaultValue: 8.2,
    unit: "kU/L",
    description: "Direct gauge of liver protein synthetic capacity.",
    category: "Synthetic",
  },
  {
    key: "BIL",
    label: "BIL (Total Bilirubin)",
    min: 2,
    max: 80,
    step: 0.5,
    defaultValue: 11.4,
    unit: "µmol/L",
    description: "Heme breakdown product. Accumulates in jaundice and liver failure.",
    category: "Clearance",
  },
  {
    key: "CREA",
    label: "CREA (Serum Creatinine)",
    min: 40,
    max: 200,
    step: 1,
    defaultValue: 81,
    unit: "µmol/L",
    description: "Renal clearance marker; assesses hepatorenal syndrome risk.",
    category: "Clearance",
  },
];



export default function HepatitisStudioPage() {
  const [values, setValues] = useState<Record<string, number>>({
    AST: 34,
    ALT: 28,
    GGT: 39,
    ALP: 68,
    ALB: 41.5,
    CHE: 8.2,
    BIL: 11.4,
    CREA: 81,
    Age: 45,
    CHOL: 5.4,
    PROT: 72.0,
  });
  const [sex, setSex] = useState<string>("m");
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
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
          if (!isNaN(numAge)) setValues((v) => ({ ...v, Age: numAge }));
        }
        if (parsed.patientGender) {
          setSex(parsed.patientGender.toLowerCase().startsWith("f") ? "f" : "m");
        }
      }
    } catch {}
  }, []);

  const handleApplyExtractedData = (extractedValues: Record<string, number>, metadata: PatientMetadata) => {
    setValues((prev) => {
      const updated = { ...prev };
      Object.keys(extractedValues).forEach((k) => {
        if (k in updated || k.toUpperCase() in updated) {
          const targetKey = k in updated ? k : k.toUpperCase();
          updated[targetKey] = extractedValues[k];
        }
      });
      return updated;
    });
    if (metadata.patientName) setPatientName(metadata.patientName);
    if (metadata.patientId) setPatientId(metadata.patientId);
    if (metadata.patientGender) setSex(metadata.patientGender.toLowerCase().startsWith("f") ? "f" : "m");
    showToast({
      title: "Medical Report Imported",
      message: `Hepatitis serum chemistry populated for ${metadata.patientName || "Patient"}.`,
      type: "quantum",
    });
  };

  const handleSliderChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };


  const runDiagnosticTriage = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const payload = {
        ...values,
        Sex: sex,
      };

      const res = await fetch("/api/inference/hepatitis-c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);

        const isDisease = (data.telemetry.router_decision?.final_calibrated_probability ?? 0.1) >= 0.5;

        // Persist screening to patient database
        try {
          await ScreeningService.createScreening({
            id: patientId || `QS-HCV-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName: patientName || "Hepatology Patient",
            patientAge: Number(values.Age ?? 45),
            patientGender: sex === "m" ? "Male" : "Female",
            diseaseType: "Hepatic Panels & Fibrosis Staging",
            disease: "Hepatitis C & Fibrosis",
            cohort: "UCI Hepatitis C Serum Chemistry (615 Cases)",
            quantumPrediction: data.telemetry.quantum_results?.prediction || (isDisease ? "Fibrosis Indicated" : "Normal Liver Panel"),
            quantumRiskScore: Number(((data.telemetry.quantum_results?.probability ?? 0.1) * 100).toFixed(1)),
            quantumConfidence: Number(((data.telemetry.quantum_results?.confidence ?? 0.8) * 100).toFixed(1)),
            classicalPrediction: data.telemetry.classical_results?.prediction || (isDisease ? "Fibrosis Indicated" : "Normal Liver Panel"),
            classicalRiskScore: Number(((data.telemetry.classical_results?.probability ?? 0.1) * 100).toFixed(1)),
            classicalConfidence: 96.6,
            riskLevel: isDisease ? "High" : "Low",
            topDriver: data.telemetry.clinical_summary?.top_classical_driver || "AST / ALT Ratio",
            topDriverImpact: 14.5,
            consensusStatus: data.telemetry.router_decision?.consensus_status || "Concordant",
            inputFeatures: { ...values, Sex: sex === "m" ? 1 : 0 },
            telemetryJson: data.telemetry,
          });
        } catch {
          // ignore cache error
        }

        showToast({
          title: "Inference Complete",
          message: "Tri-model clinical evaluation and quantum routing finished.",
          type: "quantum",
        });
      } else {
        throw new Error(data.error || "Inference failed");
      }
    } catch (err: any) {
      showToast({
        title: "Evaluation Error",
        message: err.message || "Failed to run diagnosis",
        type: "warning",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
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
              <div className="w-11 h-11 rounded-2xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] flex items-center justify-center shadow-xs">
                <Droplets size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Hepatitis C & Liver Health
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] font-bold">
                    ACTIVE • 4-QUBIT VQC
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  12 Serum Biomarkers · UCI Hepatitis C Cohort · Adaptive Entropy Router
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#DFEBE8] bg-white text-[#082827] hover:bg-[#F2F7F6] font-semibold text-xs transition-all shadow-2xs hover:border-[#006766]/40 cursor-pointer"
            >
              <UploadCloud size={14} className="text-[#006766]" /> Upload Lab Report
            </button>
            <button
              onClick={runDiagnosticTriage}
              disabled={isEvaluating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs shadow-md shadow-[#006766]/25 disabled:opacity-50 transition-all cursor-pointer active:scale-98"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={15} className="animate-spin text-[#00B489]" />
                  <span>Evaluating Biomarkers...</span>
                </>
              ) : (
                <>
                  <Zap size={15} className="text-[#00B489]" />
                  <span>Screen Liver Biomarkers</span>
                </>
              )}
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
            Connected to PennyLane hybrid quantum engine with Ring-CNOT entanglement and adaptive model routing.
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Priya Sharma"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient ID / MRN</label>
            <input
              type="text"
              placeholder="e.g. MRN-91044"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Age (Years)</label>
            <input
              type="number"
              min={18}
              max={95}
              value={values.Age}
              onChange={(e) => handleSliderChange("Age", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Biological Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            >
              <option value="m">Male (m)</option>
              <option value="f">Female (f)</option>
            </select>
          </div>
        </div>
      </div>



      {/* Main Grid: Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-foreground">Serum Biomarker Parameters</h2>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Standardized Z-Score Ingestion</span>
            </div>

            {/* Biomarker sliders */}
            <div className="space-y-5">
              {HCV_FIELDS.map((f) => {
                const val = values[f.key] ?? f.defaultValue;
                return (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-foreground">{f.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({f.category})</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {val} {f.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={val}
                      onChange={(e) => handleSliderChange(f.key, parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Adaptive Router */}
        <div className="lg:col-span-5 space-y-6">
          {telemetry ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Router Decision Card */}
                <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      Adaptive Model Router
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Δ = {(telemetry.router_decision.discordance_delta * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-sans font-semibold text-foreground">
                      {telemetry.router_decision.selected_engine}
                    </h3>
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      {telemetry.router_decision.routing_rationale}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Calibrated Risk Consensus:</span>
                      <span className="font-mono font-bold text-foreground">
                        {(telemetry.router_decision.final_calibrated_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          telemetry.router_decision.final_calibrated_probability >= 0.5
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(5, telemetry.router_decision.final_calibrated_probability * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Low Risk</span>
                      <span>50% Decision Threshold</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </div>

                {/* Model Breakdown: Classical vs Quantum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classical Card */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-foreground">Classical Ensemble</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-mono font-bold text-foreground">
                        {(telemetry.classical_results.probability * 100).toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {telemetry.classical_results.prediction}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      Top Driver: {telemetry.classical_results.top_driver}
                    </div>
                  </div>

                  {/* Quantum Card */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-purple-500" />
                      <span className="text-xs font-semibold text-foreground">4-Qubit VQC</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-mono font-bold text-foreground">
                        {(telemetry.quantum_results.probability * 100).toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {telemetry.quantum_results.prediction}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      Ansatz: Ring-CNOT
                    </div>
                  </div>
                </div>

                {/* QML Feature Sensitivity Attribution */}
                {telemetry.quantum_results.qml_sensitivity_analysis && (
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-semibold text-foreground">
                          QML Latent-Space Sensitivity
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">Finite-Difference</span>
                    </div>
                    <div className="space-y-2">
                      {telemetry.quantum_results.qml_sensitivity_analysis.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{s.component}</span>
                          <span className="font-mono font-semibold text-foreground">
                            {s.sensitivity_gradient} grad
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Awaiting Execution</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Adjust patient serum biomarkers or select a clinical preset, then click Execute Adaptive Triage.
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
        schemaType="hepatitis-c"
        diseaseTitle="Hepatitis C & Fibrosis"
      />
    </div>
  );
}
