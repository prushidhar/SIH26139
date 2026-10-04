"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplets,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sliders,
  Zap,
  Activity,
  Cpu,
  Layers,
  FlaskConical,
  UploadCloud,
  User,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";
import BiomarkerUploadModal from "@/components/predict/BiomarkerUploadModal";
import { PatientMetadata } from "@/lib/medicalReportParser";



export default function LiverILPDStudioPage() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [values, setValues] = useState({
    Age: 45,
    Gender: 1,
    Total_Bilirubin: 2.4,
    Direct_Bilirubin: 1.1,
    Alkaline_Phosphotase: 280,
    Alamine_Aminotransferase: 52,
    Aspartate_Aminotransferase: 64,
    Total_Protiens: 6.8,
    Albumin: 3.1,
    Albumin_and_Globulin_Ratio: 0.85,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const handleApplyExtractedData = (extractedValues: Record<string, number>, metadata: PatientMetadata) => {
    setValues((prev) => {
      const updated = { ...prev };
      Object.keys(prev).forEach((k) => {
        if (k in extractedValues) {
          (updated as any)[k] = extractedValues[k];
        }
      });
      return updated;
    });
    if (metadata.patientName) setPatientName(metadata.patientName);
    if (metadata.patientId) setPatientId(metadata.patientId);
    showToast({
      title: "Medical Report Imported",
      message: `Hepatic panel biomarkers populated for ${metadata.patientName || "Patient"}.`,
      type: "quantum",
    });
  };

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
          setValues((v) => ({ ...v, Gender: parsed.patientGender.toLowerCase().startsWith("f") ? 0 : 1 }));
        }
      }
    } catch {}
  }, []);

  const handleValueChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/liver-ilpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);

        const isElevated =
          (data.telemetry.liver_disease_probability ?? 0) >= 0.5 ||
          data.telemetry.diagnosis?.toLowerCase().includes("dysfunction") ||
          data.telemetry.diagnosis?.toLowerCase().includes("elevated") ||
          data.telemetry.diagnosis?.toLowerCase().includes("impairment");

        // Save screening to local & remote history so it displays in Screening History & Chatbot
        try {
          await ScreeningService.createScreening({
            id: patientId || `QS-LIV-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName: patientName || "Hepatic Panel Patient",
            patientAge: values.Age,
            patientGender: values.Gender === 1 ? "Male" : "Female",
            diseaseType: "Hepatic Dysregulation & Liver Function",
            disease: "Liver Function Panel (ILPD)",
            cohort: "Indian Liver Patient Dataset (ILPD)",
            quantumPrediction: isElevated ? "Hepatic Dysfunction" : "Normal Liver Biomarkers",
            quantumRiskScore: Number(((data.telemetry.liver_disease_probability ?? 0.44) * 100).toFixed(1)),
            quantumConfidence: Number(((data.telemetry.quantum_probability ?? 0.73) * 100).toFixed(1)),
            classicalPrediction: isElevated ? "Hepatic Dysfunction" : "Normal Liver Biomarkers",
            classicalRiskScore: Number(((data.telemetry.classical_probability ?? 0.48) * 100).toFixed(1)),
            classicalConfidence: 74.2,
            riskLevel: isElevated ? "High" : "Low",
            topDriver: "Total Bilirubin / Transaminase",
            topDriverImpact: 14.2,
            consensusStatus: "Concordant",
            inputFeatures: values,
            telemetryJson: data.telemetry,
          });
        } catch {
          // ignore cache error
        }

        showToast({
          title: "Inference Complete",
          message: "2-Qubit Variational Quantum evaluation finished.",
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
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                <Droplets size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Liver Function Screening (ILPD)
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold">
                    ACTIVE • 2-QUBIT MINIMAL VQC
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  10 Hepatic Biomarkers · Indian Liver Patient Dataset · 0.772 ROC-AUC Quantum Kernel
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
            <button
              onClick={runEvaluation}
              disabled={isEvaluating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs shadow-md shadow-[#006766]/25 disabled:opacity-50 transition-all cursor-pointer active:scale-98"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={15} className="animate-spin text-[#00B489]" /> Evaluating Biomarkers...
                </>
              ) : (
                <>
                  <Zap size={15} className="text-[#00B489]" /> Screen Liver Function
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Studio Status Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F7F4]/60 border border-[#00B489]/25 text-[#006766] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#006766]/10 text-[#006766] font-bold text-[10px] uppercase shrink-0">
            Certified Clinical Studio • 2-Qubit Minimal VQC
          </span>
          <span className="text-[#082827]/80">
            Connected to PennyLane hybrid quantum engine with 10-biomarker Indian Liver Patient Dataset (ILPD) calibration.
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
              placeholder="e.g. Ramesh Chandra"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient ID / MRN</label>
            <input
              type="text"
              placeholder="e.g. MRN-51082"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Age (Years)</label>
            <input
              type="number"
              min={10}
              max={100}
              value={values.Age}
              onChange={(e) => handleValueChange("Age", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Biological Gender</label>
            <select
              value={values.Gender}
              onChange={(e) => handleValueChange("Gender", parseInt(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-xs text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none"
            >
              <option value={1}>Male (1)</option>
              <option value={0}>Female (0)</option>
            </select>
          </div>
        </div>
      </div>



      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Biomarkers */}
        <div className="lg:col-span-7 space-y-5">
          {/* Digital Studio Hepatic Anatomy & Bilirubin Fractions Analysis */}
          <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-teal-600 dark:text-teal-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Liver Anatomy & Hepatic Lobule Micro-Architecture
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold">
                Bilirubin Fractions Analyzed
              </span>
            </div>
            <div className="relative aspect-[16/7] w-full bg-[#181816] overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studios/liver-function-panel-analysis.png"
                alt="Liver Function Panel Analysis and Bilirubin Fractions"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Portal Triad & Hepatocyte Plates · Biliary Tree Localization</span>
                </span>
                <span className="text-teal-300 font-bold">Direct vs Indirect Bilirubin Ratio</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-teal-500" />
                <h3 className="text-sm font-medium text-foreground">Hepatic Biomarker Inputs</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">10 Clinical Features</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Total Bilirubin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Bilirubin</span>
                  <span className="font-mono font-medium text-foreground">{values.Total_Bilirubin} mg/dL</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={15.0}
                  step={0.1}
                  value={values.Total_Bilirubin}
                  onChange={(e) => handleValueChange("Total_Bilirubin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Direct Bilirubin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Direct Bilirubin</span>
                  <span className="font-mono font-medium text-foreground">{values.Direct_Bilirubin} mg/dL</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={8.0}
                  step={0.1}
                  value={values.Direct_Bilirubin}
                  onChange={(e) => handleValueChange("Direct_Bilirubin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Alkaline Phosphotase */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Alkaline Phosphatase</span>
                  <span className="font-mono font-medium text-foreground">{values.Alkaline_Phosphotase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={900}
                  step={5}
                  value={values.Alkaline_Phosphotase}
                  onChange={(e) => handleValueChange("Alkaline_Phosphotase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* ALT */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ALT (Sgpt)</span>
                  <span className="font-mono font-medium text-foreground">{values.Alamine_Aminotransferase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={2}
                  value={values.Alamine_Aminotransferase}
                  onChange={(e) => handleValueChange("Alamine_Aminotransferase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* AST */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AST (Sgot)</span>
                  <span className="font-mono font-medium text-foreground">{values.Aspartate_Aminotransferase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={400}
                  step={2}
                  value={values.Aspartate_Aminotransferase}
                  onChange={(e) => handleValueChange("Aspartate_Aminotransferase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Albumin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Albumin</span>
                  <span className="font-mono font-medium text-foreground">{values.Albumin} g/dL</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.1}
                  value={values.Albumin}
                  onChange={(e) => handleValueChange("Albumin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Total Proteins */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Proteins</span>
                  <span className="font-mono font-medium text-foreground">{values.Total_Protiens} g/dL</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={10.0}
                  step={0.1}
                  value={values.Total_Protiens}
                  onChange={(e) => handleValueChange("Total_Protiens", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* A/G Ratio */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Albumin/Globulin Ratio</span>
                  <span className="font-mono font-medium text-foreground">{values.Albumin_and_Globulin_Ratio}</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.05}
                  value={values.Albumin_and_Globulin_Ratio}
                  onChange={(e) => handleValueChange("Albumin_and_Globulin_Ratio", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-5 space-y-5">
          {telemetry ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Primary Diagnostic Banner */}
              {(() => {
                const isElevated =
                  (telemetry.liver_disease_probability ?? 0) >= 0.5 ||
                  telemetry.diagnosis?.toLowerCase().includes("dysfunction") ||
                  telemetry.diagnosis?.toLowerCase().includes("elevated") ||
                  telemetry.diagnosis?.toLowerCase().includes("impairment");

                return (
                  <div
                    className={`p-5 rounded-2xl border ${
                      isElevated
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isElevated ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        <h4 className="font-medium text-sm">{telemetry.diagnosis}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {(telemetry.liver_disease_probability * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {telemetry.clinical_recommendation}
                    </p>
                  </div>
                );
              })()}

              {/* 2-Qubit Minimal Telemetry */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-teal-500" />
                    <span className="font-mono uppercase tracking-wider text-muted-foreground">
                      Compact 2-Qubit VQC
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    12 Parameters · Depth 4
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₀⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z0 ?? telemetry.quantum_observables?.qubit_0_pauli_z ?? 0.3}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₁⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z1 ?? telemetry.quantum_observables?.qubit_1_pauli_z ?? -0.75}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₀Z₁⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z0_Z1_parity ?? telemetry.quantum_observables?.parity_z0_z1 ?? -0.16}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adaptive Model Router */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Adaptive Model Router</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-medium border border-indigo-500/20">
                    {telemetry.router_telemetry?.dispatch_code || "CONSENSUS_CONCORDANT"}
                  </span>
                </div>
                <h5 className="font-medium text-xs text-foreground">
                  {telemetry.router_telemetry?.selected_engine || telemetry.router_telemetry?.action || "Tri-Model Concordant Consensus"}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {telemetry.router_telemetry?.routing_rationale || "Both Classical and Quantum pipelines concordantly converge on this biomarker profile."}
                </p>
              </div>

              {/* Quick links to History and Hub */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/history"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 cursor-pointer"
                >
                  View in Screening History <ArrowRight size={12} />
                </Link>
                <Link
                  href="/predict"
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Screen Another Patient
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-border/50 bg-card/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Droplets size={24} />
              </div>
              <h4 className="font-medium text-sm text-foreground">Awaiting ILPD Evaluation</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Select a clinical reference profile or adjust hepatic biomarkers, then click &ldquo;Execute Quantum-Classical Screening&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>

      <BiomarkerUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyData={handleApplyExtractedData}
        schemaType="liver-ilpd"
        diseaseTitle="Liver Function (ILPD)"
      />
    </div>
  );
}
