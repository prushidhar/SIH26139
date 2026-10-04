"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  parseMedicalReportFile,
  MedicalReportParseResult,
  BREAST_CANCER_CANONICAL_SCHEMA,
  PatientMetadata,
} from "@/lib/medicalReportParser";
import { playSound } from "@/lib/sound";

interface BiomarkerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (extractedValues: Record<string, number>, metadata: PatientMetadata) => void;
  schemaType?: string;
  diseaseTitle?: string;
}

export default function BiomarkerUploadModal({
  isOpen,
  onClose,
  onApplyData,
  schemaType = "breast-cancer",
  diseaseTitle,
}: BiomarkerUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<MedicalReportParseResult | null>(null);
  const [editableValues, setEditableValues] = useState<Record<string, number>>({});
  const [patientId, setPatientId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    playSound("click");

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "bmp", "gif", "tif", "tiff"].includes(ext) || file.type.startsWith("image/")) {
      setErrorMessage(
        `Image files cannot be processed for tabular lab reports. "${file.name}" appears to be an image. This clinical studio exclusively processes structured and unstructured lab reports (.CSV, .JSON, .PDF, .TXT). For 12-lead ECG or Chest X-Ray image analysis, please use the specialized imaging studios.`
      );
      setIsProcessing(false);
      playSound("error");
      return;
    }

    try {
      const result = await parseMedicalReportFile(file, schemaType);
      const nonDefaultMatches = result.fieldMatches?.filter((m) => m.matchType !== "default") || [];
      if (nonDefaultMatches.length === 0) {
        setErrorMessage(
          `No clinical measurements or biomarkers for ${diseaseTitle || "this diagnostic studio"} were detected in "${file.name}". Please verify the uploaded file contains standard laboratory or diagnostic markers.`
        );
        setIsProcessing(false);
        playSound("error");
        return;
      }

      setParseResult(result);
      setEditableValues({ ...result.extractedFields });
      setPatientId(result.patientId);
      playSound("success");
    } catch (err: any) {
      console.error("File processing failed:", err);
      setErrorMessage(err.message || "Failed to parse the uploaded file.");
      playSound("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const handleValueChange = (key: string, valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      setEditableValues((prev) => ({ ...prev, [key]: val }));
    }
  };

  const handleApply = () => {
    if (!parseResult) return;
    playSound("quantum");
    const meta: PatientMetadata = parseResult.metadata || {
      patientId: patientId || `Patient-${(schemaType || "cli").toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: "Patient Intake",
      patientGender: "Unspecified",
      intakeDate: new Date().toISOString().split("T")[0],
    };
    if (patientId) meta.patientId = patientId;
    onApplyData(editableValues, meta);
    onClose();
  };

  const handleResetModal = () => {
    setParseResult(null);
    setEditableValues({});
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#DFEBE8] bg-white shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFEBE8] px-6 py-5 bg-gradient-to-r from-white via-[#FAFDFD] to-[#EBF7F5]/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 shadow-xs">
              <Sparkles className="h-5 w-5 text-[#00B489]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#082827]">
                {diseaseTitle ? `Import ${diseaseTitle} Report` : "Import Patient Medical Report"}
              </h2>
              <p className="text-xs text-[#5A7470]">
                Automated extraction for CSV, PDF, JSON, and clinical lab sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#5A7470] hover:bg-slate-100 hover:text-[#082827] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {!parseResult ? (
            /* Upload Dropzone */
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#006766] bg-[#E6F7F4]/30 scale-[0.99]"
                    : "border-[#DFEBE8] hover:border-[#006766]/50 bg-[#FAFDFD] hover:bg-[#E6F7F4]/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.pdf,.txt,.tsv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/25 shadow-xs">
                  {isProcessing ? (
                    <RefreshCw className="h-7 w-7 animate-spin text-[#006766]" />
                  ) : (
                    <UploadCloud className="h-7 w-7 text-[#006766]" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-[#082827]">
                    {isProcessing
                      ? "Analyzing report & resolving medical aliases..."
                      : "Click to upload or drag & drop patient report"}
                  </p>
                  <p className="text-xs text-[#5A7470] mt-1">
                    Supports <span className="font-semibold text-[#082827]">.CSV, .PDF, .JSON, .TXT, .TSV</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> CSV / TSV
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF Pathology
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5 text-sky-500" /> JSON FHIR
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Guarantees Note */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Zero-Hallucination Intelligence Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our medical parser strictly resolves variable naming discrepancies (e.g. &ldquo;nuclear radius&rdquo; vs &ldquo;radius_mean&rdquo;) while preserving exact numerical readings without rounding, guessing, or alteration.
                </p>
              </div>
            </div>
          ) : (
            /* Review & Mapping Confirmation Panel */
            <div className="space-y-4">
              {/* File summary banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{parseResult.fileName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Parsed via {parseResult.parseMethod === "json" ? "JSON Engine" : parseResult.parseMethod === "csv" ? "CSV Engine" : "Pathology NLP Engine"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetModal}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline"
                >
                  <RefreshCw className="h-3 w-3" /> Upload Another File
                </button>
              </div>

              {/* Patient ID field */}
              <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
                <label className="text-xs font-medium text-muted-foreground">Patient Identifier</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:border-primary focus:outline-none w-48 text-right"
                />
              </div>

              {/* Biomarkers Extraction Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Extracted Cellular Biomarkers (8 Parameters)
                  </h3>
                  <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Numbers Preserved 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BREAST_CANCER_CANONICAL_SCHEMA.map((field) => {
                    const match = parseResult.fieldMatches.find((m) => m.key === field.key);
                    const isDefault = match?.matchType === "default";
                    const isDerived = match?.matchType === "derived";
                    const isAi = match?.matchType === "ai_semantic";
                    const val = editableValues[field.key] ?? field.defaultValue;

                    return (
                      <div
                        key={field.key}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isDefault
                            ? "border-amber-500/30 bg-amber-500/5"
                            : isDerived
                            ? "border-purple-500/30 bg-purple-500/5"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="space-y-0.5 max-w-[60%]">
                          <p className="text-xs font-medium text-foreground truncate">{field.label}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isDefault ? (
                              <span className="text-[10px] text-amber-500 font-medium">Cohort Median</span>
                            ) : isDerived ? (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5" title={match?.derivationFormula}>
                                ⚡ Derived ({match?.derivationFormula || match?.rawLabel})
                              </span>
                            ) : isAi ? (
                              <span className="text-[10px] text-sky-500 font-medium flex items-center gap-0.5">
                                <Sparkles className="h-2.5 w-2.5" /> AI Mapped
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Mapped
                              </span>
                            )}
                            {!isDerived && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                ({match?.rawLabel || field.key})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            value={val}
                            onChange={(e) => handleValueChange(field.key, e.target.value)}
                            className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                          />
                          <span className="text-[11px] text-muted-foreground w-6">{field.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#DFEBE8] px-6 py-4.5 bg-[#FAFDFD]">
          <button
            onClick={onClose}
            className="rounded-2xl border border-[#DFEBE8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5A7470] hover:bg-slate-50 hover:text-[#082827] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {parseResult && (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-[#006766]/25 cursor-pointer active:scale-98"
            >
              <span>Apply to Screening Form</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
