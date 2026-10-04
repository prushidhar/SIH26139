"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Activity,
  Layers,
  Cpu,
  Zap,
  Sliders,
  CheckCircle2,
  Check,
  RotateCcw,
  FlaskConical,
  HelpCircle,
  Loader2,
  Lock,
  ArrowRight,
  AlertTriangle,
  X,
  ShieldCheck,
  UploadCloud,
  Info,
  Calculator,
  Link2,
  Unlink2,
  User,
  Calendar,
  Hash,
  RefreshCw,
  Phone,
  FileCheck2,
  ChevronRight,
  Eye,
  Microscope,
  ExternalLink,
  ArrowLeft,
  Play,
  CheckSquare,
  FileText,
  Languages,
  Globe,
  Users,
} from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";
import BiomarkerUploadModal from "@/components/predict/BiomarkerUploadModal";
import BatchUploadPanel from "@/components/predict/BatchUploadPanel";
import BatchResultsTable from "@/components/predict/BatchResultsTable";
import { PatientMetadata } from "@/lib/medicalReportParser";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";
import { executeBatch, type BatchSession, type BatchRecord } from "@/services/batch.service";
import { type BatchParseResult } from "@/lib/batchFileProcessor";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" },
];

interface FieldConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
  simpleExplanation: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "radius_mean",
    label: "Cell Size (Radius)",
    min: 6.0,
    max: 30.0,
    step: 0.1,
    defaultValue: 12.2,
    unit: "μm",
    description: "Mean distance from center to points on perimeter of cell nucleus.",
    simpleExplanation: "Average radius of the cell nucleus under microscope.",
  },
  {
    key: "texture_mean",
    label: "Surface Texture",
    min: 9.0,
    max: 40.0,
    step: 0.1,
    defaultValue: 17.4,
    unit: "std",
    description: "Standard deviation of gray-scale values in the cell nucleus image.",
    simpleExplanation: "Variation in gray-scale texture across the cell.",
  },
  {
    key: "perimeter_mean",
    label: "Cell Perimeter",
    min: 40.0,
    max: 200.0,
    step: 0.5,
    defaultValue: 78.2,
    unit: "μm",
    description: "Total boundary length of the cell nucleus.",
    simpleExplanation: "Distance around the outside edge of the cell.",
  },
  {
    key: "area_mean",
    label: "Nuclear Area",
    min: 140.0,
    max: 2500.0,
    step: 1.0,
    defaultValue: 458.7,
    unit: "μm²",
    description: "Total surface area of the cell nucleus.",
    simpleExplanation: "Two-dimensional size of the nucleus footprint.",
  },
  {
    key: "smoothness_mean",
    label: "Border Smoothness",
    min: 0.05,
    max: 0.20,
    step: 0.001,
    defaultValue: 0.091,
    unit: "idx",
    description: "Local variation in radius lengths.",
    simpleExplanation: "How even or jagged the cell boundary appears.",
  },
  {
    key: "compactness_mean",
    label: "Compactness",
    min: 0.01,
    max: 0.35,
    step: 0.001,
    defaultValue: 0.065,
    unit: "idx",
    description: "Calculated as (perimeter² / area - 1.0).",
    simpleExplanation: "Density and circular packing efficiency of cell structure.",
  },
  {
    key: "concavity_mean",
    label: "Indentation Depth",
    min: 0.0,
    max: 0.45,
    step: 0.001,
    defaultValue: 0.037,
    unit: "idx",
    description: "Severity of concave portions of the nuclear contour.",
    simpleExplanation: "Depth of inward curves/notches on cell surface.",
  },
  {
    key: "concave_points_mean",
    label: "Indentation Count",
    min: 0.0,
    max: 0.25,
    step: 0.001,
    defaultValue: 0.023,
    unit: "cnt",
    description: "Number of concave portions along the nuclear boundary.",
    simpleExplanation: "Count of sharp inward notches on cell margin.",
  },
];

export default function BreastCancerDetailPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [derivedNotes, setDerivedNotes] = useState<Record<string, string>>({});

  // ── Batch Mode State ──────────────────────────────────────────────────
  const [screeningMode, setScreeningMode] = useState<"single" | "batch">("single");
  const [batchParseResult, setBatchParseResult] = useState<BatchParseResult | null>(null);
  const [batchSession, setBatchSession] = useState<BatchSession | null>(null);
  const [isBatchExecuting, setIsBatchExecuting] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Architecture & Engine Selection
  const [selectedModelFamily, setSelectedModelFamily] = useState<"quresight_hybrid_v1" | "aegis_classical_v1">("quresight_hybrid_v1");
  const [executionMode, setExecutionMode] = useState<"simulator" | "real_ibm_qpu">("simulator");
  const [isIbmModalOpen, setIsIbmModalOpen] = useState(false);

  // Patient Demographics State (Starts Empty & Inputable)
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">("")
  const [patientGender, setPatientGender] = useState("Female");
  const [intakeDate, setIntakeDate] = useState("");
  const [accessionNumber, setAccessionNumber] = useState("");
  const [isPatientIntakeOpen, setIsPatientIntakeOpen] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [linkGeometry, setLinkGeometry] = useState(false);

  // Execution & Progress State
  const [isInferring, setIsInferring] = useState(false);
  const [hasInferred, setHasInferred] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any>(null);
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [typedSummaryText, setTypedSummaryText] = useState("");
  const [isTypingSummary, setIsTypingSummary] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [baseEnglishSummary, setBaseEnglishSummary] = useState("");

  // ── Batch Handlers ──────────────────────────────────────────────────────
  const handleBatchExecute = async (parseResult: BatchParseResult) => {
    setIsBatchExecuting(true);
    try {
      const batchTitle =
        parseResult.fileInventory && parseResult.fileInventory.length > 1
          ? `${parseResult.fileInventory.length} Patient Files (${parseResult.totalRecords} records)`
          : parseResult.fileInventory?.[0]?.name || "batch_upload.csv";
      const session = await executeBatch(
        parseResult.chunks,
        "breast_cancer",
        batchTitle,
        (s) => {
          setBatchSession({ ...s });
          setBatchProgress(s.totalRecords > 0 ? (s.processedCount / s.totalRecords) * 100 : 0);
        },
      );
      setBatchSession(session);
      showToast({ title: "Batch Complete", message: `${session.successCount} of ${session.totalRecords} records processed successfully.`, type: "quantum" });
    } catch (err: any) {
      showToast({ title: "Batch Error", message: err.message, type: "warning" });
    } finally {
      setIsBatchExecuting(false);
    }
  };

  const handleBatchViewDetails = (record: BatchRecord) => {
    try {
      const payload = {
        patientInfo: { name: record.patientName, patient_id: record.patientId, age: 50, gender: "Female" },
        biomarkers: record.inputData,
        screeningResult: record.fullResult || {},
        aiSynthesis: null,
      };
      sessionStorage.setItem("quresight_active_analysis", JSON.stringify(payload));
    } catch (e) { console.warn(e); }
    router.push("/predict/breast-cancer/analysis");
  };

  const generateNewPatientIdentity = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPatientId(`QS-BC-${randomSuffix}`);
    setAccessionNumber(`ACC-2026-08${Math.floor(10 + Math.random() * 90)}`);
    setIntakeDate(new Date().toISOString().split("T")[0]);
  };

  useEffect(() => {
    const initial: Record<string, number> = {};
    FIELDS.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    setFormValues(initial);
    generateNewPatientIdentity();
    try {
      const stored = sessionStorage.getItem("quresight_patient_intake");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.patientId) setPatientId(parsed.patientId);
        if (parsed.patientAge) {
          const numAge = parseInt(parsed.patientAge, 10);
          if (!isNaN(numAge)) setPatientAge(numAge);
        }
        if (parsed.patientGender) setPatientGender(parsed.patientGender);
      }
    } catch {}
  }, []);

  const triggerTypewriter = (text: string) => {
    setIsTypingSummary(true);
    setTypedSummaryText("");

    let currentIdx = 0;
    const speed = 10;
    const chunkSize = 2;

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= text.length) {
        setTypedSummaryText(text);
        setIsTypingSummary(false);
        clearInterval(interval);
      } else {
        setTypedSummaryText(text.slice(0, currentIdx));
      }
    }, speed);
  };

  // Real-time typewriter effect for clinical diagnostic summary
  useEffect(() => {
    if (!screeningResult) {
      setTypedSummaryText("");
      setIsTypingSummary(false);
      setBaseEnglishSummary("");
      return;
    }

    let fullText = "";
    if (aiSynthesis) {
      if (typeof aiSynthesis === "string") {
        fullText = aiSynthesis;
      } else if (aiSynthesis.summary_paragraph) {
        fullText = aiSynthesis.summary_paragraph;
      } else {
        const parts = [
          aiSynthesis.executive_summary,
          aiSynthesis.morphological_breakdown,
          aiSynthesis.actionable_recommendations ? `Recommended Action: ${aiSynthesis.actionable_recommendations}` : ""
        ].filter(Boolean);
        fullText = parts.join("\n\n");
      }
    } else if (!isLoadingAi) {
      fullText = `The biopsy test for ${patientName || "Patient"} was evaluated with ${screeningResult.confidence?.toFixed(1)}% certainty, yielding a continuous Risk Score of ${screeningResult.composite_risk_score?.toFixed(1)} / 100 (${getEssentialRiskLabel(screeningResult)}).\n\nCell measurements show average cell size of ${formValues.radius_mean || 12.2} micrometers and smoothness of ${formValues.smoothness_mean || 0.1}. ${screeningResult.clinical_action || "Routine checkup and clinical follow-up is advised."}`;
    }

    if (!fullText) return;

    setBaseEnglishSummary(fullText);
    setSelectedLanguage("en");
    triggerTypewriter(fullText);
  }, [aiSynthesis, isLoadingAi, screeningResult, patientName, formValues]);

  const handleTranslateSummary = async (langCode: string) => {
    setSelectedLanguage(langCode);
    if (!baseEnglishSummary) return;

    if (langCode === "en") {
      triggerTypewriter(baseEnglishSummary);
      return;
    }

    setIsTranslating(true);
    try {
      const selectedLangObj = LANGUAGES.find((l) => l.code === langCode);
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: baseEnglishSummary,
          targetLanguage: langCode,
          languageName: selectedLangObj?.name || langCode,
        }),
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        triggerTypewriter(data.translatedText);
      } else {
        triggerTypewriter(baseEnglishSummary);
      }
    } catch (err) {
      console.warn("Translation failed, keeping original:", err);
      triggerTypewriter(baseEnglishSummary);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleNavigateToAnalysis = () => {
    try {
      const payload = {
        patientInfo: {
          name: patientName.trim() || "Patient",
          patient_id: patientId,
          age: patientAge || 45,
          gender: patientGender,
        },
        biomarkers: formValues,
        screeningResult: screeningResult || {},
        aiSynthesis: aiSynthesis,
      };
      sessionStorage.setItem("quresight_active_analysis", JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not save analysis payload to sessionStorage:", e);
    }
    router.push("/predict/breast-cancer/analysis");
  };

  const handleStartNewScreening = () => {
    const initial: Record<string, number> = {};
    FIELDS.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    setFormValues(initial);
    setDerivedNotes({});
    setPatientName("");
    setPatientAge("");
    generateNewPatientIdentity();
    setHasInferred(false);
    setScreeningResult(null);
    setAiSynthesis(null);
    setTypedSummaryText("");
    setIsTypingSummary(false);
    setIsPatientIntakeOpen(true);
    showToast({
      title: "New Patient Intake Initialized",
      message: "Parameters and demographics unlocked for new patient screening.",
      type: "quantum",
    });
  };

  const executeInferenceEngine = async (
    vals: Record<string, number>,
    pName: string,
    pId: string,
    pAge: number,
    pGender: string,
    pDate: string,
    pAccession: string
  ) => {
    setIsInferring(true);
    setHasInferred(false);
    setIsLoadingAi(true);

    try {
      // 1. Call the Dedicated Inference Engine API
      const response = await fetch("/api/inference/breast-cancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biomarkers: vals,
          model_family: selectedModelFamily,
          execution_mode: executionMode,
          patient_info: {
            name: pName,
            patient_id: pId,
            age: pAge,
            gender: pGender,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScreeningResult(data);
        setHasInferred(true);
        setIsInferring(false);

        showToast({
          title: "Screening Computation Complete",
          message: `${pName} · ${data.prediction_label} (${data.composite_risk_score}/100 Risk Index)`,
          type: "quantum",
        });

        // 2. Permanently Save to Clinical Screening History (Non-Deletable Audit Record)
        const dc = data.dual_comparison;
        const tfData = dc?.transfinite_1;
        const cxData = dc?.cx_01;
        const topAttr = data.shap_attributions?.[0];
        const topDriverName = topAttr?.feature_name || topAttr?.featureName || "Cell Size (Radius)";
        const topDriverImpactVal = Math.abs(topAttr?.impact_percentage ?? topAttr?.impactPercentage ?? 6.6);

        ScreeningService.createScreening({
          id: pId,
          patientId: pId,
          patientName: pName || "Patient Record",
          patientAge: typeof pAge === "number" ? pAge : 55,
          patientGender: pGender || "Female",
          diseaseType: "Breast Cytology (Fine Needle Aspirate)",
          disease: "Breast Cancer Screening",
          cohort: "Fine Needle Aspirate (WDBC)",
          quantumPrediction: tfData?.prediction_label || data.prediction_label || "Benign",
          quantumRiskScore: Number((tfData?.risk_score ?? data.composite_risk_score ?? 42.4).toFixed(1)),
          quantumConfidence: Number((tfData?.confidence ?? data.confidence ?? 50.6).toFixed(1)),
          classicalPrediction: cxData?.prediction_label || "Benign",
          classicalRiskScore: Number((cxData?.risk_score ?? 44.1).toFixed(1)),
          classicalConfidence: Number((cxData?.confidence ?? 70.5).toFixed(1)),
          riskLevel: data.prediction_label === "Malignant" ? "High" : "Low",
          topDriver: topDriverName,
          topDriverImpact: topDriverImpactVal,
          consensusStatus:
            (tfData?.prediction_label || data.prediction_label) === (cxData?.prediction_label || "Benign")
              ? "Concordant"
              : "Discordant",
          quantumExecutionTimeMs: tfData?.latency_ms ?? 700.4,
          classicalExecutionTimeMs: cxData?.latency_ms ?? 104.4,
          inputFeatures: vals,
        }).catch((err) => console.warn("Failed to persist screening record:", err));

        // 3. Trigger Gemini AI Multimodal Cytopathology Synthesis
        fetch("/api/ai/synthesize-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            biomarkers: vals,
            prediction: data.prediction_label,
            confidence: data.confidence,
            risk_score: data.composite_risk_score,
            risk_tag: data.risk_tag,
            risk_tier: data.risk_tier,
            model_engine: data.engine,
            execution_mode: executionMode,
            shap_attributions: data.shap_attributions,
            patient_info: {
              name: pName,
              patient_id: pId,
              age: pAge,
              gender: pGender,
            },
          }),
        })
          .then((res) => res.json())
          .then((aiData) => {
            if (aiData.success) {
              setAiSynthesis(aiData.summary || aiData.synthesis);
            }
            setIsLoadingAi(false);
          })
          .catch((err) => {
            console.warn("AI synthesis fallback used:", err);
            setIsLoadingAi(false);
          });
      } else {
        throw new Error(data.error || "Inference failed");
      }
    } catch (err: any) {
      console.error("Inference execution error:", err);
      showToast({
        title: "Inference Error",
        message: err.message || "Failed to execute screening model.",
        type: "warning",
      });
      setIsInferring(false);
      setIsLoadingAi(false);
    }
  };

  const handleApplyExtractedData = (extractedValues: Record<string, number>, metadata: PatientMetadata) => {
    setFormValues(extractedValues);
    setDerivedNotes({});

    const name = metadata.patientName || patientName || "Imported Patient";
    const id = metadata.patientId || patientId;
    const age = metadata.patientAge || (patientAge ? Number(patientAge) : 48);
    const gender = "Female";
    const date = metadata.intakeDate || intakeDate;
    const acc = metadata.accessionNumber || accessionNumber;

    if (metadata.patientId) setPatientId(metadata.patientId);
    if (metadata.patientName) setPatientName(metadata.patientName);
    if (metadata.patientAge) setPatientAge(metadata.patientAge);
    if (metadata.intakeDate) setIntakeDate(metadata.intakeDate);
    if (metadata.accessionNumber) setAccessionNumber(metadata.accessionNumber);

    showToast({
      title: "Report Imported & Parsed",
      message: `Extracted 8 biomarkers for ${name}. Running dual-engine screening...`,
      type: "quantum",
    });

    executeInferenceEngine(extractedValues, name, id, age, gender, date, acc);
  };

  const handleRunInference = () => {
    if (hasInferred) {
      handleStartNewScreening();
      return;
    }

    if (!patientName.trim()) {
      showToast({
        title: "Patient Name Required",
        message: "Please enter the patient's full name in the Patient Intake section.",
        type: "warning",
      });
      setIsPatientIntakeOpen(true);
      return;
    }

    const numAge = Number(patientAge);
    if (!patientAge || isNaN(numAge) || numAge <= 0 || numAge > 120) {
      showToast({
        title: "Valid Age Required",
        message: "Please specify a valid patient age (e.g. 45) before running inference.",
        type: "warning",
      });
      setIsPatientIntakeOpen(true);
      return;
    }

    executeInferenceEngine(
      formValues,
      patientName.trim(),
      patientId,
      numAge,
      "Female",
      intakeDate,
      accessionNumber
    );
  };

  const handleValueChange = (key: string, numVal: number, fromDerivation?: string) => {
    if (hasInferred) return; // Prevent changing values after inference
    setFormValues((prev) => {
      const updated = { ...prev, [key]: numVal };

      if (linkGeometry && !fromDerivation) {
        if (key === "radius_mean") {
          updated.perimeter_mean = parseFloat((2 * Math.PI * numVal).toFixed(1));
          updated.area_mean = parseFloat((Math.PI * numVal * numVal).toFixed(1));
        } else if (key === "area_mean" && numVal > 0) {
          const derivedRadius = Math.sqrt(numVal / Math.PI);
          updated.radius_mean = parseFloat(derivedRadius.toFixed(2));
          updated.perimeter_mean = parseFloat((2 * Math.PI * derivedRadius).toFixed(1));
        }
      }
      return updated;
    });

    if (fromDerivation) {
      setDerivedNotes((prev) => ({ ...prev, [key]: fromDerivation }));
    } else {
      setDerivedNotes((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleReset = () => {
    if (hasInferred) return;
    const initial: Record<string, number> = {};
    FIELDS.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    setFormValues(initial);
    setDerivedNotes({});
  };

  const getEssentialRiskInfo = (data: any) => {
    let tier = "";
    let tag = "";
    let score: number | null = null;
    let prediction = "";

    if (typeof data === "string") {
      tier = data.toUpperCase();
    } else if (data && typeof data === "object") {
      tier = String(data.risk_tier || data.riskTier || data.dual_comparison?.transfinite_1?.risk_tier || "").toUpperCase();
      tag = String(data.risk_tag || data.riskTag || data.dual_comparison?.transfinite_1?.risk_tag || "").toUpperCase();
      const rawScore = data.composite_risk_score ?? data.risk_score ?? data.dual_comparison?.transfinite_1?.risk_score;
      if (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) {
        score = Number(rawScore);
      }
      prediction = String(data.prediction_label || data.quantum_prediction || data.dual_comparison?.transfinite_1?.prediction_label || "").toUpperCase();
    }

    // Critical Risk (Score >= 85, or CRITICAL in tag/tier)
    const isCritical =
      (score !== null && score >= 85) ||
      tag === "CRITICAL_RISK" ||
      tag.includes("CRITICAL") ||
      tier.includes("CRITICAL") ||
      tier.includes("DIAGNOSTIC OF MALIGNANCY");

    if (isCritical) {
      return {
        label: "Critical Risk (Malignant)",
        color: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/50",
      };
    }

    // High Risk (Score >= 65, or HIGH / MALIGNAN in tag/tier/prediction)
    const isHigh =
      (score !== null && score >= 65) ||
      tag === "HIGH_RISK" ||
      tag.includes("HIGH") ||
      tier.includes("HIGH") ||
      tier.includes("MALIGNAN") || // Covers MALIGNANT and MALIGNANCY
      prediction === "MALIGNANT";

    if (isHigh) {
      return {
        label: "High Risk (Malignant)",
        color: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900/50",
      };
    }

    // Borderline Risk (Score >= 45, or BORDERLINE / INDETERMINATE / ATYPICAL)
    const isBorderline =
      (score !== null && score >= 45) ||
      tag === "BORDERLINE" ||
      tag.includes("BORDERLINE") ||
      tier.includes("BORDERLINE") ||
      tier.includes("INDETERMINATE") ||
      tier.includes("ATYPICAL") ||
      tier.includes("DYSPLASIA");

    if (isBorderline) {
      return {
        label: "Borderline Risk (Atypical)",
        color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900/50",
      };
    }

    // Mild Suspicion (Score >= 25, or MILD in tag/tier)
    const isMild =
      (score !== null && score >= 25) ||
      tag === "MILD_SUSPICION" ||
      tag.includes("MILD") ||
      tier.includes("MILD");

    if (isMild) {
      return {
        label: "Mild Suspicion (Probably Benign)",
        color: "text-amber-600 bg-amber-50/70 border-amber-200/80 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-800/40",
      };
    }

    // Default: Low Risk (Benign)
    return {
      label: "Low Risk (Benign)",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/50",
    };
  };

  const getRiskColor = (data: any) => getEssentialRiskInfo(data).color;
  const getEssentialRiskLabel = (data: any) => getEssentialRiskInfo(data).label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-12 w-full"
    >
      {/* HEADER SECTION */}
      {/* HEADER SECTION */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00B489]/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

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
                <Microscope size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Breast Cytopathology Biopsy Studio
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] font-bold">
                    ACTIVE • VQC
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  Fine-Needle Biopsy Screening • Cellular Nuclear Size, Shape &amp; Structure Analysis
                </p>
              </div>
            </div>
          </div>

          {/* Action Controls & Hardware Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Compact Hardware Selector */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-[#DFEBE8] shadow-2xs">
              <button
                disabled={hasInferred}
                onClick={() => setExecutionMode("simulator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  executionMode === "simulator"
                    ? "bg-[#006766] text-white shadow-xs font-bold"
                    : "text-[#5A7470] hover:text-[#082827]"
                } ${hasInferred ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <Sparkles size={13} className="text-[#00B489]" />
                <span>Quantum Simulator</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast({
                    title: "Hardware QPU Access Locked",
                    message: "IBM Quantum QPU hardware execution is locked. Live QPU runtime requires authenticated IBM Quantum API credentials in Settings. Defaulting to Quantum Simulator.",
                    type: "warning",
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-[#5A7470] hover:text-[#082827] opacity-80 hover:opacity-100 cursor-pointer"
                title="IBM Quantum Eagle QPU — Hardware Locked (Requires Cloud API Token)"
              >
                <Cpu size={13} className="text-amber-500" />
                <span>IBM Quantum (QPU)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-300 font-semibold flex items-center gap-0.5">
                  <Lock size={8} />
                  Locked
                </span>
              </button>
            </div>

            {hasInferred && (
              <button
                onClick={handleStartNewScreening}
                className="px-4 py-2 rounded-xl bg-[#006766] hover:bg-[#084E4D] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#006766]/20 cursor-pointer"
              >
                <RotateCcw size={13} className="text-[#00B489]" />
                <span>Start New Patient</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SCREENING MODE TOGGLE ── */}
      <div className="flex items-center gap-2">
        <div className="inline-flex p-1 rounded-xl bg-white border border-[#DFEBE8] shadow-2xs">
          <button
            onClick={() => { setScreeningMode("single"); setBatchSession(null); setBatchParseResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              screeningMode === "single" ? "bg-[#082827] text-white shadow-xs" : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            <User size={14} />
            Single Patient
          </button>
          <button
            onClick={() => setScreeningMode("batch")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              screeningMode === "batch" ? "bg-[#082827] text-white shadow-xs" : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            <Users size={14} />
            Batch Screening
          </button>
        </div>
        {screeningMode === "batch" && batchSession && batchSession.isComplete && (
          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            ✓ {batchSession.successCount} Records Complete
          </span>
        )}
      </div>

      {/* ── BATCH MODE CONTENT ── */}
      {screeningMode === "batch" && (
        <div className="space-y-6">
          {/* Batch Upload Panel */}
          {!batchSession?.isComplete && (
            <BatchUploadPanel
              diseaseTarget="breast_cancer"
              onParseComplete={(result) => setBatchParseResult(result)}
              onExecute={handleBatchExecute}
              isExecuting={isBatchExecuting}
            />
          )}

          {/* Batch Progress Bar */}
          {isBatchExecuting && batchSession && (
            <div className="rounded-2xl bg-white border border-[#DFEBE8] shadow-xs p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#082827]">Processing Batch...</span>
                <span className="text-xs font-mono text-[#5A7470]">
                  {batchSession.processedCount} / {batchSession.totalRecords}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F7FAF9] overflow-hidden">
                <motion.div
                  className="h-full bg-quantum rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${batchProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Batch Results Table */}
          {batchSession?.isComplete && (
            <BatchResultsTable
              session={batchSession}
              onViewDetails={handleBatchViewDetails}
            />
          )}
        </div>
      )}

      {/* ── SINGLE MODE CONTENT ── */}
      {screeningMode === "single" && (
      <>
      {/* PATIENT INTAKE ACCORDION (INPUTABLE, NOT PRE-FILLED, CLEAN WHITE CARD) */}
      <div className="bg-white rounded-2xl border border-[#DFEBE8] shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPatientIntakeOpen(!isPatientIntakeOpen)}
          className="w-full px-5 py-3.5 bg-white hover:bg-[#F7FAF9]/40 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-[#DFEBE8]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-quantum/10 border border-quantum/20 flex items-center justify-center text-quantum">
              <User size={15} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm font-medium text-[#082827]">
                Patient Information &amp; Intake Details
              </h3>
              <p className="text-[11px] font-mono text-[#5A7470]">
                {patientName ? `${patientName} (${patientId})` : "Not Specified"} • {patientAge ? `Age: ${patientAge}` : "Age: Not Specified"} • Gender: Female
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-quantum font-semibold">
            {isPatientIntakeOpen ? "Collapse −" : "Expand +"}
          </span>
        </button>

        {isPatientIntakeOpen && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white">
            {/* 1. Patient Name (Inputable) */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#5A7470] font-medium block">
                Patient Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                disabled={hasInferred}
                placeholder="e.g. Elena Vance"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FAF9]/20 hover:bg-[#F7FAF9]/30 text-[#082827] text-xs font-medium focus:bg-white focus:outline-none focus:border-quantum ${
                  hasInferred ? "opacity-75 cursor-not-allowed bg-[#F7FAF9]/30" : ""
                }`}
              />
            </div>

            {/* 2. Patient ID (Auto-Generated, Read-Only) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono text-[#5A7470] font-medium">Patient ID</label>
                <span className="text-[9px] font-mono text-[#5A7470] bg-[#F7FAF9] px-1.5 py-0.5 rounded border border-[#DFEBE8]">Auto-Assigned</span>
              </div>
              <input
                type="text"
                value={patientId}
                readOnly
                className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FAF9]/40 text-[#082827] text-xs font-mono font-bold cursor-not-allowed select-all"
              />
            </div>

            {/* 3. Age (Inputable) */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#5A7470] font-medium block">
                Age (Years) <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                disabled={hasInferred}
                placeholder="e.g. 54"
                min="18"
                max="110"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : "")}
                className={`w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FAF9]/20 hover:bg-[#F7FAF9]/30 text-[#082827] text-xs font-mono focus:bg-white focus:outline-none focus:border-quantum ${
                  hasInferred ? "opacity-75 cursor-not-allowed bg-[#F7FAF9]/30" : ""
                }`}
              />
            </div>

            {/* 4. Gender */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#5A7470] font-medium">Gender</label>
              <div className="w-full px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FAF9]/20 text-[#082827] text-xs font-medium flex items-center justify-between">
                <span>Female</span>
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Female</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN SCREENING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Parameter Sliders */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DFEBE8] p-5 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFEBE8] pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-sans font-bold text-lg font-medium text-[#082827]">Cell Measurements</h2>
                <HelpTooltip
                  title="Cell Measurements"
                  text="These 8 microscopic metrics evaluate cell shape, size, border smoothness, and surface texture under the microscope."
                />
              </div>
              <p className="text-xs text-[#5A7470]">Adjust measured values or upload lab report</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                disabled={hasInferred}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F7FAF9] border border-[#DFEBE8] text-[#082827] text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <UploadCloud size={13} className="text-quantum" />
                <span>Upload Report</span>
              </button>

              {!hasInferred && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-[#F7FAF9] text-xs font-mono text-[#5A7470] hover:text-[#082827] flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-[#DFEBE8]"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Locked Notice Banner if Inferred */}
          {hasInferred && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-amber-600 shrink-0" />
                <span className="font-semibold">Parameters locked to current diagnostic result.</span>
              </div>
              <button
                onClick={handleStartNewScreening}
                className="px-2.5 py-1 rounded-lg bg-[#082827] text-white text-[11px] font-semibold hover:bg-[#082827]/90 transition-all cursor-pointer"
              >
                Start New
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((field) => {
              const val = formValues[field.key] ?? field.defaultValue;

              return (
                <div
                  key={field.key}
                  className={`p-3 rounded-xl border border-[#DFEBE8] space-y-2 transition-all ${
                    hasInferred ? "bg-[#F7FAF9]/20 opacity-70" : "bg-[#F7FAF9]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-[#082827]">{field.label}</span>
                      <HelpTooltip title={field.label} text={field.simpleExplanation} />
                    </div>
                    <span className="text-xs font-mono font-bold text-quantum">
                      {val} <span className="text-[10px] text-[#5A7470]">{field.unit}</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    disabled={hasInferred}
                    value={val}
                    onChange={(e) => handleValueChange(field.key, parseFloat(e.target.value))}
                    className={`w-full accent-quantum ${hasInferred ? "cursor-not-allowed" : "cursor-pointer"}`}
                  />
                  <p className="text-[10px] text-[#5A7470] leading-tight">{field.simpleExplanation}</p>
                </div>
              );
            })}
          </div>

          {/* Primary Action Button */}
          {hasInferred ? (
            <button
              onClick={handleStartNewScreening}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#006766]/20 cursor-pointer active:scale-98"
            >
              <RotateCcw size={14} className="text-[#00B489]" />
              <span>Start New Patient Screening (Reset Parameters)</span>
            </button>
          ) : (
            <button
              onClick={handleRunInference}
              disabled={isInferring}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#006766]/25 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isInferring ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Executing Simultaneous Dual-Engine Pipeline...</span>
                </>
              ) : (
                <>
                  <Play size={14} className="text-[#00B489] fill-[#00B489]" />
                  <span>Run Dual-Engine Screening (Quantum &amp; Classical)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* RIGHT: Results Panel with Clean High-Contrast Styling */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#DFEBE8] p-6 space-y-5 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] min-h-[520px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#00B489]/5 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
          <AnimatePresence mode="wait">
            {/* 1. CLEAN SIMPLE LOADING STATE */}
            {isInferring ? (
              <motion.div
                key="computing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="my-auto text-center space-y-6 py-20 px-4"
              >
                {/* Elegant Smooth Spinner */}
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-quantum/20 border-t-quantum animate-spin" />
                  <div className="w-10 h-10 rounded-full bg-quantum/10 flex items-center justify-center text-quantum shadow-2xs">
                    <Microscope size={20} />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-sans font-bold text-xl text-[#082827] font-semibold">
                    Analyzing Biopsy Sample...
                  </h3>
                  <p className="text-xs text-[#5A7470] leading-relaxed">
                    Evaluating cell measurements across classical and quantum models for{" "}
                    <strong className="text-[#082827]">{patientName || "Patient"}</strong>
                  </p>
                </div>

                {/* Subtle pulsing progress indicator */}
                <div className="w-44 mx-auto bg-[#F7FAF9] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-quantum rounded-full animate-pulse w-full" />
                </div>
              </motion.div>
            ) : hasInferred && screeningResult ? (
              /* 2. RESULTS SCORECARD */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Header - Clean & Essential */}
                <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-quantum font-bold">
                      Screening Assessment
                    </span>
                    <h3 className="font-sans font-bold text-xl font-medium text-[#082827]">
                      {patientName || "Patient"} <span className="text-xs font-mono text-[#5A7470]">({patientId})</span>
                    </h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border shadow-2xs ${getRiskColor(screeningResult)}`}>
                    {getEssentialRiskLabel(screeningResult)}
                  </span>
                </div>

                {/* SIDE-BY-SIDE DUAL-ENGINE LIVE COMPARISON CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Quantum Hybrid VQC Card */}
                  <div className="p-4.5 rounded-2xl bg-white border border-quantum/30 shadow-xs space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-2.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-quantum/10 text-quantum border border-quantum/20 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Quantum Model (8-Qubit VQC)</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#5A7470] font-semibold">
                          {screeningResult.dual_comparison?.transfinite_1?.latency_ms || "14.2"} ms
                        </span>
                      </div>

                      {/* Main Circular Gauge & Prediction */}
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        {/* Circular Score Gauge */}
                        {(() => {
                          const score = Number(screeningResult.dual_comparison?.transfinite_1?.risk_score ?? screeningResult.composite_risk_score ?? 0);
                          const strokeColor = score >= 85 ? "#dc2626" : score >= 65 ? "#ef4444" : score >= 45 ? "#f59e0b" : "#10b981";
                          const radius = 26;
                          const circumference = 2 * Math.PI * radius;
                          const dashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

                          return (
                            <div className="flex flex-col items-center">
                              <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r={radius}
                                    stroke="#f1ede6"
                                    strokeWidth="4.5"
                                    fill="transparent"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r={radius}
                                    stroke={strokeColor}
                                    strokeWidth="4.5"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-700"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                  <span className="text-base font-black font-mono text-[#082827] leading-none">
                                    {score.toFixed(1)}
                                  </span>
                                  <span className="text-[8px] font-mono text-[#5A7470] mt-0.5">/ 100</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-[#5A7470] font-semibold mt-1">Risk Score</span>
                            </div>
                          );
                        })()}

                        {/* Status, Risk Tag & Confidence Breakdown */}
                        {(() => {
                          const tf = screeningResult.dual_comparison?.transfinite_1;
                          const score = Number(tf?.risk_score ?? screeningResult.composite_risk_score ?? 0);
                          const rawTag = tf?.risk_tag || screeningResult.risk_tag || (score >= 85 ? "CRITICAL_RISK" : score >= 65 ? "HIGH_RISK" : score >= 45 ? "BORDERLINE" : score >= 25 ? "MILD_SUSPICION" : "LOW_RISK");

                          const isCritical = rawTag === "CRITICAL_RISK" || score >= 85;
                          const isHigh = rawTag === "HIGH_RISK" || (score >= 65 && score < 85);
                          const isBorderline = rawTag === "BORDERLINE" || (score >= 45 && score < 65);
                          const isMild = rawTag === "MILD_SUSPICION" || (score >= 25 && score < 45);

                          const tagLabel = isCritical ? "CRITICAL RISK" : isHigh ? "HIGH RISK" : isBorderline ? "BORDERLINE" : isMild ? "MILD SUSPICION" : "LOW RISK";
                          const tagBadgeStyle = isCritical
                            ? "bg-red-100 text-red-800 border-red-300"
                            : isHigh
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isBorderline
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : isMild
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200";

                          const dotColor = isCritical ? "bg-red-600" : isHigh ? "bg-red-500" : isBorderline ? "bg-amber-500" : "bg-emerald-500";
                          const pred = tf?.prediction_label || screeningResult.prediction_label;

                          return (
                            <div className="space-y-1 text-right flex flex-col items-end">
                              {/* Prominent Standardized Risk Tag */}
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-2xs ${tagBadgeStyle}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                {tagLabel}
                              </span>

                              {/* Assessment Label */}
                              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                                <span className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                  pred === "Malignant"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {pred}
                                </span>
                              </div>

                              <div className="text-[11px] font-mono text-[#5A7470]">
                                Confidence: <strong className="text-[#082827]">{tf?.confidence || screeningResult.confidence}%</strong>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Model-Specific Key Factors (Quantum SHAP) */}
                      <div className="pt-2.5 border-t border-[#DFEBE8] space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A7470] block">
                          Quantum Key Factors (Top 3)
                        </span>
                        <div className="space-y-1">
                          {((screeningResult.dual_comparison?.transfinite_1?.shap_attributions) || screeningResult.shap_attributions || []).slice(0, 3).map((attr: any, idx: number) => {
                            const isRisk = attr.direction === "risk_elevating";
                            return (
                              <div key={idx} className="p-1.5 px-2 rounded-lg bg-[#F7FAF9]/40 border border-[#DFEBE8]/60 text-[11px] flex items-center justify-between">
                                <span className="text-[#082827] font-medium truncate max-w-[140px]">{attr.featureName}</span>
                                <span className={`font-mono font-bold text-[10px] ${isRisk ? "text-red-600" : "text-emerald-700"}`}>
                                  {isRisk ? "+" : "-"}{attr.impactPercentage?.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFEBE8] flex justify-between items-center text-[10px] font-mono text-[#5A7470]">
                      <span>Engine: 8-Qubit ZZ VQC</span>
                      <span className="text-emerald-700 font-bold">Simulator Active</span>
                    </div>
                  </div>

                  {/* 2. Classical Baseline Card */}
                  <div className="p-4.5 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-2.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                          <Activity size={12} />
                          <span>Classical Baseline Ensemble</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#5A7470] font-semibold">
                          {screeningResult.dual_comparison?.cx_01?.latency_ms || "2.4"} ms
                        </span>
                      </div>

                      {/* Main Circular Gauge & Prediction */}
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        {/* Circular Score Gauge */}
                        {(() => {
                          const score = Number(screeningResult.dual_comparison?.cx_01?.risk_score ?? screeningResult.composite_risk_score ?? 0);
                          const strokeColor = score >= 85 ? "#dc2626" : score >= 65 ? "#ef4444" : score >= 45 ? "#f59e0b" : "#10b981";
                          const radius = 26;
                          const circumference = 2 * Math.PI * radius;
                          const dashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

                          return (
                            <div className="flex flex-col items-center">
                              <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r={radius}
                                    stroke="#f1ede6"
                                    strokeWidth="4.5"
                                    fill="transparent"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r={radius}
                                    stroke={strokeColor}
                                    strokeWidth="4.5"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-700"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                  <span className="text-base font-black font-mono text-[#082827] leading-none">
                                    {score.toFixed(1)}
                                  </span>
                                  <span className="text-[8px] font-mono text-[#5A7470] mt-0.5">/ 100</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-[#5A7470] font-semibold mt-1">Risk Score</span>
                            </div>
                          );
                        })()}

                        {/* Status, Risk Tag & Confidence Breakdown */}
                        {(() => {
                          const cx = screeningResult.dual_comparison?.cx_01;
                          const score = Number(cx?.risk_score ?? screeningResult.composite_risk_score ?? 0);
                          const rawTag = cx?.risk_tag || (score >= 85 ? "CRITICAL_RISK" : score >= 65 ? "HIGH_RISK" : score >= 45 ? "BORDERLINE" : score >= 25 ? "MILD_SUSPICION" : "LOW_RISK");

                          const isCritical = rawTag === "CRITICAL_RISK" || score >= 85;
                          const isHigh = rawTag === "HIGH_RISK" || (score >= 65 && score < 85);
                          const isBorderline = rawTag === "BORDERLINE" || (score >= 45 && score < 65);
                          const isMild = rawTag === "MILD_SUSPICION" || (score >= 25 && score < 45);

                          const tagLabel = isCritical ? "CRITICAL RISK" : isHigh ? "HIGH RISK" : isBorderline ? "BORDERLINE" : isMild ? "MILD SUSPICION" : "LOW RISK";
                          const tagBadgeStyle = isCritical
                            ? "bg-red-100 text-red-800 border-red-300"
                            : isHigh
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isBorderline
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : isMild
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200";

                          const dotColor = isCritical ? "bg-red-600" : isHigh ? "bg-red-500" : isBorderline ? "bg-amber-500" : "bg-emerald-500";
                          const pred = cx?.prediction_label || screeningResult.prediction_label;

                          return (
                            <div className="space-y-1 text-right flex flex-col items-end">
                              {/* Prominent Standardized Risk Tag */}
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-2xs ${tagBadgeStyle}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                {tagLabel}
                              </span>

                              {/* Assessment Label */}
                              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                                <span className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                  pred === "Malignant"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {pred}
                                </span>
                              </div>

                              <div className="text-[11px] font-mono text-[#5A7470]">
                                Confidence: <strong className="text-[#082827]">{cx?.confidence || screeningResult.confidence}%</strong>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Model-Specific Key Factors (Classical SHAP) */}
                      <div className="pt-2.5 border-t border-[#DFEBE8] space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A7470] block">
                          Classical Key Factors (Top 3)
                        </span>
                        <div className="space-y-1">
                          {((screeningResult.dual_comparison?.cx_01?.shap_attributions) || screeningResult.shap_attributions || []).slice(0, 3).map((attr: any, idx: number) => {
                            const isRisk = attr.direction === "risk_elevating";
                            return (
                              <div key={idx} className="p-1.5 px-2 rounded-lg bg-[#F7FAF9]/40 border border-[#DFEBE8]/60 text-[11px] flex items-center justify-between">
                                <span className="text-[#082827] font-medium truncate max-w-[140px]">{attr.featureName}</span>
                                <span className={`font-mono font-bold text-[10px] ${isRisk ? "text-red-600" : "text-emerald-700"}`}>
                                  {isRisk ? "+" : "-"}{attr.impactPercentage?.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFEBE8] flex justify-between items-center text-[10px] font-mono text-[#5A7470]">
                      <span>Engine: SVM-RBF + XGBoost</span>
                      <span className="text-blue-700 font-bold">Classical Baseline</span>
                    </div>
                  </div>
                </div>

                {/* QURESIGHT AI SUMMARY (PARAGRAPH FORMAT WITH TYPEWRITER ANIMATION & AI TRANSLATION) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFEBE8] shadow-xs space-y-3.5 relative overflow-hidden">
                  {/* Header Row - Clean & Medical */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DFEBE8] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-quantum/10 border border-quantum/20 flex items-center justify-center text-quantum shadow-2xs">
                        <FileText size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#082827] uppercase tracking-wider">
                          QureSight AI Summary
                        </h4>
                        <p className="text-[11px] text-[#5A7470]">
                          Evaluation for {patientName || "Patient"} ({patientId})
                        </p>
                      </div>
                    </div>

                    {/* Translation Controls & Status */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {(isLoadingAi || isTypingSummary || isTranslating) && (
                        <span className="text-[10px] font-mono text-quantum flex items-center gap-1 font-semibold mr-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-ping" />
                          {isLoadingAi ? "Thinking..." : isTranslating ? "Translating..." : "Writing..."}
                        </span>
                      )}

                      {/* Language Dropdown */}
                      <select
                        value={selectedLanguage}
                        onChange={(e) => {
                          const lang = e.target.value;
                          setSelectedLanguage(lang);
                          handleTranslateSummary(lang);
                        }}
                        disabled={isLoadingAi || isTranslating}
                        className="px-2.5 py-1 rounded-lg border border-[#DFEBE8] bg-[#F7FAF9]/30 hover:bg-[#F7FAF9]/60 text-[#082827] text-xs font-medium focus:outline-none focus:border-quantum cursor-pointer"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>

                      {/* Translate Button */}
                      <button
                        type="button"
                        onClick={() => handleTranslateSummary(selectedLanguage)}
                        disabled={isLoadingAi || isTranslating}
                        className="px-2.5 py-1 rounded-lg bg-[#082827] hover:bg-[#082827]/90 text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="AI rewrite and translate summary"
                      >
                        <Languages size={12} className="text-quantum" />
                        <span>Translate</span>
                      </button>
                    </div>
                  </div>

                  {/* Body: Thinking State or Typed Paragraph */}
                  {isLoadingAi && !typedSummaryText ? (
                    <div className="py-3 px-3.5 rounded-xl bg-white/40 border border-[#DFEBE8] flex items-center gap-2.5 text-xs text-[#5A7470] font-mono">
                      <div className="flex items-center gap-1 text-quantum shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-bounce" />
                      </div>
                      <span className="italic">Thinking... evaluating cell measurements and compiling clear summary</span>
                    </div>
                  ) : isTranslating ? (
                    <div className="py-3 px-3.5 rounded-xl bg-white/40 border border-[#DFEBE8] flex items-center gap-2.5 text-xs text-[#5A7470] font-mono">
                      <Loader2 size={13} className="animate-spin text-quantum shrink-0" />
                      <span>Rewriting summary in {LANGUAGES.find(l => l.code === selectedLanguage)?.name}...</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white/50 border border-[#DFEBE8]">
                      <p className="text-xs sm:text-[13px] text-[#082827] leading-relaxed whitespace-pre-line font-normal">
                        {typedSummaryText}
                        {isTypingSummary && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-quantum animate-pulse align-middle" />
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation and Action Buttons */}
                <div className="pt-3 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleNavigateToAnalysis}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center justify-between transition-all shadow-md shadow-[#006766]/20 cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <Microscope size={16} className="text-[#00B489]" />
                      <span>View Comprehensive Diagnostic Dossier &amp; Explainability</span>
                    </div>
                    <ChevronRight size={15} className="text-white/80" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewScreening}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F2F7F6] border border-[#DFEBE8] text-[#082827] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-[#006766]/30"
                  >
                    <RotateCcw size={13} className="text-[#006766]" />
                    <span>Start New Patient Screening</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* 3. INITIAL EMPTY / READY STATE */
              <div className="my-auto text-center space-y-4 py-20 px-4">
                <div className="w-16 h-16 rounded-3xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] mx-auto flex items-center justify-center shadow-xs">
                  <Microscope size={28} className="text-[#006766]" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-sans text-lg text-[#082827] font-bold">Ready for Biopsy Screening</h3>
                  <p className="text-xs text-[#5A7470] leading-relaxed">
                    Enter patient intake details above, adjust cell measurements or upload an FNA lab report, and launch simultaneous dual-engine algorithmic inference.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* REAL IBM QUANTUM HARDWARE MODAL (ADMIN ACCESS NOTICE) */}
      <AnimatePresence>
        {isIbmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082827]/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white border border-[#DFEBE8] rounded-2xl p-6 max-w-lg w-full text-[#082827] space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-amber-600">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg font-medium text-[#082827]">Real IBM Quantum QPU Engine</h3>
                    <p className="text-xs text-[#5A7470]">127-Qubit Superconducting Transmon Gateway</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIbmModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-[#F7FAF9] hover:bg-[#F2F7F6] border border-[#DFEBE8] flex items-center justify-center text-[#5A7470] hover:text-[#082827] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Hardware KPI Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#F7FAF9]/60 border border-[#DFEBE8] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#5A7470] block font-bold">Target</span>
                  <span className="font-sans font-bold text-sm font-light text-[#082827]">ibm_brisbane</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7FAF9]/60 border border-[#DFEBE8] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#5A7470] block font-bold">Qubits</span>
                  <span className="font-sans font-bold text-sm font-light text-[#082827]">127 Physical</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7FAF9]/60 border border-[#DFEBE8] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#5A7470] block font-bold">Coupling</span>
                  <span className="font-sans font-bold text-sm font-light text-emerald-600">Heavy-Hex</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#5A7470] leading-relaxed">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-200 text-[#082827] flex items-start gap-2.5">
                  <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-semibold text-amber-900">Enterprise / Clinical Deployment Notice</strong>
                    <span className="text-[11px] text-[#5A7470] leading-relaxed block">
                      Live IBM Quantum Hardware execution routes circuits to 127-qubit superconducting processors. Due to physical cryogenic queue times (1-8 mins), live hardware runs require authenticated clinical partner credentials.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7FAF9]/40 border border-[#DFEBE8] space-y-1.5">
                  <h4 className="font-bold text-[#082827] uppercase tracking-wider text-[10px]">Active Transpilation Specs</h4>
                  <ul className="space-y-1 font-mono text-[11px] text-[#5A7470]">
                    <li>• Topology: 8 Physical Transmon Coupling</li>
                    <li>• Readout Error Mitigation: M3 (Matrix Inversion)</li>
                    <li>• Dynamical Decoupling: XY4 Microwave Pulses</li>
                    <li>• Total Shots per Pass: 1,024 Shots</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFEBE8]">
                <button
                  type="button"
                  onClick={() => setIsIbmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F7FAF9] hover:bg-[#F2F7F6] border border-[#DFEBE8] text-[#5A7470] hover:text-[#082827] text-xs font-medium cursor-pointer transition-colors"
                >
                  Use High-Speed Simulator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExecutionMode("real_ibm_qpu");
                    setIsIbmModalOpen(false);
                    showToast({
                      title: "IBM QPU Hardware Mode Enabled",
                      message: "Configured target: ibm_brisbane (127-Qubit Eagle).",
                      type: "quantum",
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#082827] hover:bg-[#082827]/90 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Enable QPU Verification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD MODAL */}
      <BiomarkerUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyData={handleApplyExtractedData}
      />
      </>
      )}
    </motion.div>
  );
}
