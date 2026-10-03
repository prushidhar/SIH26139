"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Play,
  Stethoscope,
  FileCheck2,
  LogOut,
  RotateCcw,
  Wind,
  Activity,
  MicOff,
  Mic,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  Menu,
  Cpu,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import BrandLogo from "@/components/common/BrandLogo";

type StepType = "patient" | "demo" | "screening" | "visualizer" | "results";

interface SymptomState {
  cough: "no" | "yes" | "unknown";
  coughWeeks: number;
  fever: "no" | "yes" | "unknown";
  feverWeeks: number;
  nightSweats: "no" | "yes" | "unknown";
  nightSweatsWeeks: number;
  weightLoss: "no" | "yes" | "unknown";
  chestPain: "no" | "yes" | "unknown";
  patientId: string;
  patientAge: string;
  patientGender: string;
}

interface PositionRecording {
  id: number;
  label: string;
  location: string;
  lobe: string;
  recorded: boolean;
  audioSample: string;
  status: "normal" | "crackles" | "wheezing" | "clear";
}

const INITIAL_POSITIONS: PositionRecording[] = [
  { id: 1, label: "Position 1", location: "Right Upper Anterior", lobe: "R. Upper Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
  { id: 2, label: "Position 2", location: "Left Upper Anterior", lobe: "L. Upper Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
  { id: 3, label: "Position 3", location: "Right Mid Anterior", lobe: "R. Middle Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
  { id: 4, label: "Position 4", location: "Left Lower Anterior", lobe: "L. Lower Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
  { id: 5, label: "Position 5", location: "Right Base Lateral", lobe: "R. Lower Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
  { id: 6, label: "Position 6", location: "Left Base Lateral", lobe: "L. Lower Lobe", recorded: false, audioSample: "Normal Vesicular", status: "normal" },
];

export default function AiDiagnosticsApp({
  initialStep = "patient",
}: {
  initialStep?: StepType;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step") as StepType;
      if (
        stepParam &&
        ["patient", "demo", "screening", "visualizer", "results"].includes(stepParam)
      ) {
        return stepParam;
      }
    }
    return initialStep;
  });
  const [activePosition, setActivePosition] = useState<number>(1);
  const [viewOrientation, setViewOrientation] = useState<"front" | "back">("front");
  const [breathCount, setBreathCount] = useState<number>(1);
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("out");
  const [demoActive, setDemoActive] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step") as StepType;
      if (
        stepParam &&
        ["patient", "demo", "screening", "visualizer", "results"].includes(stepParam)
      ) {
        setCurrentStep(stepParam);
      }
    }
  }, []);

  // Symptoms state
  const [symptoms, setSymptoms] = useState<SymptomState>({
    cough: "yes",
    coughWeeks: 0,
    fever: "no",
    feverWeeks: 0,
    nightSweats: "no",
    nightSweatsWeeks: 0,
    weightLoss: "no",
    chestPain: "no",
    patientId: "PT-2026-984",
    patientAge: "42",
    patientGender: "Female",
  });

  // Recorded positions
  const [positions, setPositions] = useState<PositionRecording[]>(INITIAL_POSITIONS);

  // Breathing Visualizer interval
  useEffect(() => {
    let interval: any = null;
    if (currentStep === "visualizer" || demoActive) {
      interval = setInterval(() => {
        setBreathPhase((prev) => (prev === "out" ? "in" : "out"));
        setBreathCount((prev) => {
          if (prev >= 5) {
            if (currentStep === "visualizer") {
              setPositions((curr) =>
                curr.map((p) => (p.id === activePosition ? { ...p, recorded: true } : p))
              );
              showToast({
                title: "Stethoscope Capture",
                message: `Position ${activePosition} auscultation recorded successfully`,
                type: "success",
              });
              setTimeout(() => {
                if (activePosition < 6) {
                  setActivePosition((pos) => pos + 1);
                }
                setCurrentStep("screening");
              }, 1200);
            }
            return 1;
          }
          return prev + 1;
        });
      }, 3000);
    } else {
      setBreathCount(1);
      setBreathPhase("out");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, demoActive, activePosition]);

  const handleNextStep = () => {
    if (currentStep === "patient") setCurrentStep("demo");
    else if (currentStep === "demo") setCurrentStep("screening");
    else if (currentStep === "screening") setCurrentStep("results");
  };

  const handlePrevStep = () => {
    if (currentStep === "demo") setCurrentStep("patient");
    else if (currentStep === "screening") setCurrentStep("demo");
    else if (currentStep === "visualizer") setCurrentStep("screening");
    else if (currentStep === "results") setCurrentStep("screening");
  };

  const startAuscultationForPosition = (posId: number) => {
    setActivePosition(posId);
    setCurrentStep("visualizer");
    setBreathCount(1);
    setBreathPhase("in");
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-4 transition-all">
      {/* OUTER SHOT FRAME CONTAINER */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline/80 bg-parchment shadow-xl transition-all">
        {/* ========================================================================= */}
        {/* HEADER BAR: Brand Logo, Stepper & Exit */}
        {/* ========================================================================= */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-hairline/60 bg-parchment/90 backdrop-blur-md">
          {/* Brand Logo with QureSight official emblem */}
          <div className="flex items-center gap-3">
            <BrandLogo href={false} size="sm" showSubtitle={true} />
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Diagnostic Progress" className="flex items-center gap-1 sm:gap-4">
            {/* Step 1: Patient */}
            <button
              type="button"
              onClick={() => setCurrentStep("patient")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep === "patient"
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Patient</span>
            </button>

            <span className="text-hairline text-xs font-semibold">›</span>

            {/* Step 2: Demo */}
            <button
              type="button"
              onClick={() => setCurrentStep("demo")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep === "demo"
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Demo</span>
            </button>

            <span className="text-hairline text-xs font-semibold">›</span>

            {/* Step 3: Screening */}
            <button
              type="button"
              onClick={() => setCurrentStep("screening")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep === "screening" || currentStep === "visualizer"
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Screening</span>
            </button>

            <span className="text-hairline text-xs font-semibold">›</span>

            {/* Step 4: Results */}
            <button
              type="button"
              onClick={() => setCurrentStep("results")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep === "results"
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Results</span>
            </button>
          </nav>

          {/* Exit Action */}
          <Link
            href="/home"
            className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <span>Exit</span>
            <LogOut className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </header>

        {/* ========================================================================= */}
        {/* MAIN BODY: Screen 1 to 5 */}
        {/* ========================================================================= */}
        <main className="p-6 sm:p-12 min-h-[520px] flex flex-col justify-between bg-cream/40">
          <div className="w-full">
            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 1: Patient Symptoms */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === "patient" && (
              <motion.div
                key="step-patient"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 max-w-3xl mx-auto w-full"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Patient symptoms
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-soft mt-1">
                    Record clinical presentation and symptom chronicity prior to auscultation.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Question 1: Cough */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-ink block">Cough</label>
                    <div className="inline-flex rounded-xl border border-hairline bg-parchment p-1 shadow-xs">
                      {(["no", "yes", "unknown"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSymptoms({ ...symptoms, cough: opt })}
                          className={`px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            symptoms.cough === opt
                              ? "bg-quantum text-white shadow-xs"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {symptoms.cough === "yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2 pl-1 space-y-2"
                      >
                        <span className="text-xs text-ink-soft font-medium block">
                          Select the duration in weeks
                        </span>
                        <div className="inline-flex gap-2">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSymptoms({ ...symptoms, coughWeeks: num })}
                              className={`h-9 w-12 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                symptoms.coughWeeks === num
                                  ? "bg-accent border-quantum text-primary font-bold shadow-xs"
                                  : "border-hairline bg-parchment text-ink hover:border-quantum/50"
                              }`}
                            >
                              {num === 3 ? "3+" : num}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Question 2: Fever */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-ink block">Fever</label>
                    <div className="inline-flex rounded-xl border border-hairline bg-parchment p-1 shadow-xs">
                      {(["no", "yes", "unknown"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSymptoms({ ...symptoms, fever: opt })}
                          className={`px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            symptoms.fever === opt
                              ? "bg-quantum text-white shadow-xs"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {symptoms.fever === "yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2 pl-1 space-y-2"
                      >
                        <span className="text-xs text-ink-soft font-medium block">
                          Select the duration in weeks
                        </span>
                        <div className="inline-flex gap-2">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSymptoms({ ...symptoms, feverWeeks: num })}
                              className={`h-9 w-12 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                symptoms.feverWeeks === num
                                  ? "bg-accent border-quantum text-primary font-bold shadow-xs"
                                  : "border-hairline bg-parchment text-ink hover:border-quantum/50"
                              }`}
                            >
                              {num === 3 ? "3+" : num}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Question 3: Night Sweats */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-ink block">Night sweats</label>
                    <div className="inline-flex rounded-xl border border-hairline bg-parchment p-1 shadow-xs">
                      {(["no", "yes", "unknown"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSymptoms({ ...symptoms, nightSweats: opt })}
                          className={`px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            symptoms.nightSweats === opt
                              ? "bg-quantum text-white shadow-xs"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 4: Unexplained Weight Loss */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-ink block">
                      Unexplained weight loss
                    </label>
                    <div className="inline-flex rounded-xl border border-hairline bg-parchment p-1 shadow-xs">
                      {(["no", "yes", "unknown"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSymptoms({ ...symptoms, weightLoss: opt })}
                          className={`px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            symptoms.weightLoss === opt
                              ? "bg-quantum text-white shadow-xs"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 2: Breathing Demo */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === "demo" && (
              <motion.div
                key="step-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 max-w-3xl mx-auto w-full"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Breathing demo
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-soft mt-1">
                    Please explain these simple instructions to your patient:
                  </p>
                </div>

                {/* 2x2 Grid of Instructions matching Dribbble shot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: 5x breaths per position */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-hairline bg-parchment shadow-xs hover:border-quantum/40 transition-all">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">5x breaths per position</h4>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Patient must complete five steady breaths at each chest node.
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Inhale first */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-hairline bg-parchment shadow-xs hover:border-quantum/40 transition-all">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <Wind className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Inhale first</h4>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Begin recording as the patient takes their initial breath inward.
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Breathe deeply */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-hairline bg-parchment shadow-xs hover:border-quantum/40 transition-all">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Breathe deeply</h4>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Full tidal volume breaths through the open mouth for acoustic clarity.
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Don't speak */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-hairline bg-parchment shadow-xs hover:border-quantum/40 transition-all">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <MicOff className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Don't speak</h4>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Maintain absolute silence to avoid speech vocal resonance artifacts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Guidance Demo Preview */}
                <div className="p-4 rounded-2xl border border-hairline bg-cream/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-quantum animate-pulse" />
                    <span className="text-xs font-semibold text-ink">
                      Audio Cadence Metronome Ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDemoActive(!demoActive)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{demoActive ? "Stop Preview" : "Test Timing Preview"}</span>
                    <Play className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 3: Anatomical Auscultation Guide */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === "screening" && (
              <motion.div
                key="step-screening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 max-w-4xl mx-auto w-full"
              >
                {/* Header info bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                      Position {activePosition} <span className="text-ink-soft font-normal">of 6</span>
                    </h1>
                    <p className="text-xs text-ink-soft">
                      {positions[activePosition - 1]?.location} ({positions[activePosition - 1]?.lobe})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPositions((curr) =>
                          curr.map((p) => (p.id === activePosition ? { ...p, recorded: false } : p))
                        );
                        showToast({
                          title: "Position Reset",
                          message: `Position ${activePosition} reset`,
                          type: "info",
                        });
                      }}
                      className="text-xs font-medium text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg border border-hairline bg-parchment cursor-pointer"
                    >
                      Redo position {activePosition}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep("results")}
                      className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
                    >
                      Submit recordings
                    </button>
                  </div>
                </div>

                {/* ANATOMICAL VISUALIZER CANVAS */}
                <div className="relative rounded-2xl border border-hairline bg-parchment p-6 flex flex-col items-center justify-center min-h-[360px] overflow-hidden shadow-xs">
                  {/* Orientation Switcher */}
                  <div className="absolute top-4 left-4 flex gap-1 bg-secondary p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setViewOrientation("front")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        viewOrientation === "front"
                          ? "bg-parchment text-ink shadow-xs"
                          : "text-ink-soft"
                      }`}
                    >
                      Anterior (Front)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewOrientation("back")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        viewOrientation === "back"
                          ? "bg-parchment text-ink shadow-xs"
                          : "text-ink-soft"
                      }`}
                    >
                      Posterior (Back)
                    </button>
                  </div>

                  {/* Anatomical Torso SVG Illustration with interactive positions */}
                  <div className="relative w-72 h-80 my-2">
                    <svg
                      viewBox="0 0 300 340"
                      className="w-full h-full text-slate-300 drop-shadow-xs"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {/* Head & Neck */}
                      <path
                        d="M 125 10 Q 150 0 175 10 Q 190 35 175 60 L 170 85 L 210 95 Q 260 115 270 190 L 260 330 L 40 330 L 30 190 Q 40 115 90 95 L 130 85 L 125 60 Q 110 35 125 10 Z"
                        fill="#F3F7F6"
                        stroke="#CADBD8"
                        strokeWidth="2.5"
                      />
                      {/* Trachea & Airway */}
                      <path
                        d="M 150 85 L 150 140 M 150 140 L 130 170 M 150 140 L 170 170"
                        stroke="#A7C7C2"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Lungs Contour (Right & Left) */}
                      <path
                        d="M 140 145 C 115 140 90 160 85 200 C 80 240 100 270 135 270 C 145 270 146 255 146 245 Z"
                        fill="#E1EFEB"
                        stroke="#B6D4CE"
                        strokeWidth="2"
                      />
                      <path
                        d="M 160 145 C 185 140 210 160 215 200 C 220 240 200 270 165 270 C 155 270 154 255 154 245 Z"
                        fill="#E1EFEB"
                        stroke="#B6D4CE"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Position Points Overlaid Anatomically */}
                    {/* Position 1: Right Upper */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(1)}
                      className="absolute top-[155px] left-[105px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 1
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[0].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[0].recorded ? <Check className="h-4 w-4" /> : "1"}
                      </div>
                    </button>

                    {/* Position 2: Left Upper */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(2)}
                      className="absolute top-[155px] left-[195px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 2
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[1].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[1].recorded ? <Check className="h-4 w-4" /> : "2"}
                      </div>
                    </button>

                    {/* Position 3: Right Mid */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(3)}
                      className="absolute top-[205px] left-[115px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 3
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[2].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[2].recorded ? <Check className="h-4 w-4" /> : "3"}
                      </div>
                    </button>

                    {/* Position 4: Left Lower */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(4)}
                      className="absolute top-[205px] left-[185px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 4
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[3].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[3].recorded ? <Check className="h-4 w-4" /> : "4"}
                      </div>
                    </button>

                    {/* Position 5: Right Base */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(5)}
                      className="absolute top-[250px] left-[125px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 5
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[4].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[4].recorded ? <Check className="h-4 w-4" /> : "5"}
                      </div>
                    </button>

                    {/* Position 6: Left Base */}
                    <button
                      type="button"
                      onClick={() => setActivePosition(6)}
                      className="absolute top-[250px] left-[175px] group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                          activePosition === 6
                            ? "bg-primary text-white scale-125 ring-4 ring-quantum/30"
                            : positions[5].recorded
                            ? "bg-quantum text-white"
                            : "bg-parchment text-ink border border-hairline hover:bg-accent"
                        }`}
                      >
                        {positions[5].recorded ? <Check className="h-4 w-4" /> : "6"}
                      </div>
                    </button>
                  </div>

                  {/* Anatomical Label matching Dribbble shot */}
                  <div className="flex items-center gap-12 font-mono text-[10px] tracking-widest text-ink-soft uppercase mt-2">
                    <span>R</span>
                    <span className="font-semibold text-ink">PATIENT'S FRONT</span>
                    <span>L</span>
                  </div>
                </div>

                {/* Bottom Trigger Action Banner matching Dribbble */}
                <div className="rounded-2xl border border-hairline bg-parchment p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-ink block">
                        Press stethoscope button to start position {activePosition}
                      </span>
                      <span className="text-[11px] text-ink-soft">
                        Digital auscultation sensor calibrated & ready.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startAuscultationForPosition(activePosition)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Start Position {activePosition} Recording</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 4: Concentric Breathing Visualizer */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === "visualizer" && (
              <motion.div
                key="step-visualizer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-2xl mx-auto w-full text-center flex flex-col items-center justify-center"
              >
                {/* Top Auscultation Position Banner */}
                <div className="flex items-center gap-2 bg-parchment px-4 py-1.5 rounded-full border border-hairline text-xs">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold text-ink">
                    Position {activePosition} Auscultation Active
                  </span>
                  <span className="text-ink-soft font-mono text-[11px]">
                    ({positions[activePosition - 1]?.location})
                  </span>
                </div>

                {/* THE CONCENTRIC BREATHING CIRCLES from Dribbble shot */}
                <div className="relative flex items-center justify-center w-72 h-72 sm:w-88 sm:h-88 my-6">
                  {/* Layer 1: Outer Ripple */}
                  <motion.div
                    animate={{
                      scale: breathPhase === "in" ? 1.25 : 0.85,
                      opacity: breathPhase === "in" ? 0.35 : 0.2,
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-sky-200/60 blur-xs"
                  />

                  {/* Layer 2: Middle Ripple */}
                  <motion.div
                    animate={{
                      scale: breathPhase === "in" ? 1.12 : 0.9,
                      opacity: breathPhase === "in" ? 0.5 : 0.3,
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-6 rounded-full bg-cyan-300/60 blur-xs"
                  />

                  {/* Layer 3: Inner Core */}
                  <motion.div
                    animate={{
                      scale: breathPhase === "in" ? 1.05 : 0.95,
                      opacity: breathPhase === "in" ? 0.75 : 0.5,
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-14 rounded-full bg-teal-400/50"
                  />

                  {/* Layer 4: Concentric Ring Offsets (matching Dribbble offset ripples) */}
                  <motion.div
                    animate={{
                      scale: breathPhase === "in" ? 1 : 0.85,
                      y: breathPhase === "in" ? -6 : 6,
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-20 rounded-full bg-sky-500/40"
                  />

                  <motion.div
                    animate={{
                      scale: breathPhase === "in" ? 0.95 : 0.8,
                      x: breathPhase === "in" ? 6 : -6,
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-24 rounded-full bg-cyan-600/40"
                  />

                  {/* Center Breathing Rhythm Indicator */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md capitalize">
                      Breathe {breathPhase}
                    </span>
                    <span className="text-xs text-white/90 font-medium tracking-wide mt-1 drop-shadow-xs">
                      Breath <span className="font-bold">{breathCount}</span> of 5
                    </span>
                  </div>
                </div>

                {/* Subtitle matching Dribbble */}
                <div>
                  <h3 className="text-xl font-bold text-ink capitalize">
                    Breathe {breathPhase}
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Breath <span className="font-semibold text-ink">{breathCount}</span> of 5
                  </p>
                </div>

                {/* Audio Waveform Simulator */}
                <div className="w-full max-w-md bg-parchment rounded-xl border border-hairline p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 h-6">
                    {[35, 60, 85, 45, 95, 70, 30, 90, 50, 65, 80, 40, 75, 55, 90].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.04 }}
                        className="w-1 bg-quantum rounded-full"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPositions((curr) =>
                        curr.map((p) => (p.id === activePosition ? { ...p, recorded: true } : p))
                      );
                      setCurrentStep("screening");
                    }}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Done & Return
                  </button>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 5: AI Diagnostic Consensus Results */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === "results" && (
              <motion.div
                key="step-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 max-w-4xl mx-auto w-full"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    AI Diagnostic Screening Report
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-soft mt-1">
                    Multi-modal consensus evaluation combining patient symptoms, 6-point auscultation acoustics, and 8-qubit quantum classifier.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Consensus Risk Score */}
                  <div className="p-5 rounded-2xl border border-hairline bg-parchment shadow-xs space-y-3">
                    <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                      Consensus Risk
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-primary">Low Risk</span>
                      <span className="text-xs font-bold text-quantum">96.4%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-quantum rounded-full w-[96.4%]" />
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      No acute adventitious sounds or classical symptoms indicating active pulmonary tuberculosis.
                    </p>
                  </div>

                  {/* Acoustic Auscultation Score */}
                  <div className="p-5 rounded-2xl border border-hairline bg-parchment shadow-xs space-y-3">
                    <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                      Auscultation Status
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-ink">Vesicular</span>
                      <span className="text-xs font-semibold text-ink-soft">6/6 clear</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-quantum font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Zero Crackles or Wheezes Detected</span>
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      Normal symmetric airflow across upper, middle, and basal lung lobes.
                    </p>
                  </div>

                  {/* Quantum Engine Attribution */}
                  <div className="p-5 rounded-2xl border border-hairline bg-parchment shadow-xs space-y-3">
                    <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                      Quantum Engine
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-ink">Transfinite-1</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                      <Cpu className="h-4 w-4" />
                      <span>8-Qubit Hilbert Space Entangled</span>
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      Cross-entropy kernel advantage: +4.2% separability over classical baseline SVM.
                    </p>
                  </div>
                </div>

                {/* 6 Positions Summary List */}
                <div className="rounded-2xl border border-hairline bg-parchment p-5 shadow-xs space-y-3">
                  <h3 className="text-sm font-semibold text-ink">
                    6-Node Auscultation Recording Audit
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {positions.map((pos) => (
                      <div
                        key={pos.id}
                        className="p-3 rounded-xl border border-hairline bg-cream/30 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-semibold text-ink block">{pos.label}</span>
                          <span className="text-[10px] text-ink-soft">{pos.lobe}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-quantum">
                          <Check className="h-3 w-3" /> Clear
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPositions(INITIAL_POSITIONS);
                      setCurrentStep("patient");
                      showToast({
                        title: "Screening Session",
                        message: "New screening session initiated",
                        type: "info",
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-hairline bg-parchment text-ink text-xs font-semibold hover:bg-secondary cursor-pointer"
                  >
                    Start New Screening
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        showToast({
                          title: "Report Export",
                          message: "PDF clinical diagnostic report exported",
                          type: "success",
                        })
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/95 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Clinical PDF</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION BAR: Menu, Status & Next/Back */}
        {/* ========================================================================= */}
        <footer className="flex items-center justify-between px-6 sm:px-10 py-4 border-t border-hairline/60 bg-parchment">
          {/* Bottom Left: Menu Button & Hardware Connectivity Badge */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-xl border border-hairline bg-parchment text-ink-soft hover:text-ink hover:bg-secondary transition-colors"
              aria-label="Toggle clinical drawer"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Hardware Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-quantum opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-quantum" />
              </span>
              <span className="text-xs font-semibold text-ink-soft tracking-wide">
                Connected
              </span>
            </div>
          </div>

          {/* Bottom Right: Back and Next buttons */}
          <div className="flex items-center gap-3">
            {currentStep !== "patient" && currentStep !== "visualizer" && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep === "demo" ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Start demo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : currentStep !== "visualizer" && currentStep !== "results" ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
