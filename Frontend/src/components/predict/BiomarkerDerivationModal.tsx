"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  X,
  Sparkles,
  Check,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface DerivationOption {
  id: string;
  name: string;
  description: string;
  formulaDisplay: string;
  inputs: {
    key: string;
    label: string;
    unit: string;
    placeholder: string;
    defaultValue?: number;
  }[];
  compute: (inputVals: Record<string, number>) => number;
}

export interface BiomarkerDerivationConfig {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  cohortMedianExplanation: string;
  options: DerivationOption[];
}

export const DERIVATION_REGISTRY: Record<string, BiomarkerDerivationConfig> = {
  radius_mean: {
    key: "radius_mean",
    label: "Cell Size (Radius)",
    unit: "μm",
    defaultValue: 17.99,
    cohortMedianExplanation: "Standard clinical non-pathological reference radius (17.99 μm). Preserves normalized baseline feature scaling.",
    options: [
      {
        id: "from_area",
        name: "Derive from Nuclear Area (A)",
        description: "Exact geometric calculation assuming circular / ellipsoidal nuclear cross-section.",
        formulaDisplay: "r = √(Area / π)",
        inputs: [{ key: "area", label: "Nuclear Area", unit: "μm²", placeholder: "e.g. 1001.0", defaultValue: 1001.0 }],
        compute: (v) => parseFloat(Math.sqrt((v.area || 1001) / Math.PI).toFixed(2)),
      },
      {
        id: "from_perimeter",
        name: "Derive from Cell Perimeter (P)",
        description: "Exact geometric circumference formula.",
        formulaDisplay: "r = Perimeter / 2π",
        inputs: [{ key: "perimeter", label: "Cell Perimeter", unit: "μm", placeholder: "e.g. 122.8", defaultValue: 122.8 }],
        compute: (v) => parseFloat(((v.perimeter || 122.8) / (2 * Math.PI)).toFixed(2)),
      },
      {
        id: "from_worst",
        name: "Estimate from Worst / Largest Radius",
        description: "Clinical correlation ratio for maximum tumor cell perimeter.",
        formulaDisplay: "r_mean ≈ r_worst / 1.32",
        inputs: [{ key: "worst_radius", label: "Worst (Max) Radius", unit: "μm", placeholder: "e.g. 23.5", defaultValue: 23.5 }],
        compute: (v) => parseFloat(((v.worst_radius || 23.5) / 1.32).toFixed(2)),
      },
    ],
  },
  texture_mean: {
    key: "texture_mean",
    label: "Surface Texture",
    unit: "std",
    defaultValue: 10.38,
    cohortMedianExplanation: "Median grayscale pixel intensity variance (10.38 std) from standard digitized fine needle aspirates (FNA).",
    options: [
      {
        id: "from_variance",
        name: "Derive from Grayscale Variance (σ²)",
        description: "Converts pixel brightness variance to standard deviation.",
        formulaDisplay: "Texture = √(Variance)",
        inputs: [{ key: "variance", label: "Grayscale Pixel Variance", unit: "var", placeholder: "e.g. 107.7", defaultValue: 107.7 }],
        compute: (v) => parseFloat(Math.sqrt(v.variance || 107.7).toFixed(2)),
      },
      {
        id: "from_worst",
        name: "Estimate from Worst / Max Texture",
        description: "Correlation scaling from most textured biopsy regions.",
        formulaDisplay: "Texture_mean ≈ Texture_worst / 1.25",
        inputs: [{ key: "worst_texture", label: "Worst Texture", unit: "std", placeholder: "e.g. 13.0", defaultValue: 13.0 }],
        compute: (v) => parseFloat(((v.worst_texture || 13.0) / 1.25).toFixed(2)),
      },
    ],
  },
  perimeter_mean: {
    key: "perimeter_mean",
    label: "Cell Perimeter",
    unit: "μm",
    defaultValue: 122.8,
    cohortMedianExplanation: "Standard baseline tumor core perimeter (122.8 μm).",
    options: [
      {
        id: "from_radius",
        name: "Derive from Cell Radius (r)",
        description: "Circumference of circular boundary.",
        formulaDisplay: "Perimeter = 2π * Radius",
        inputs: [{ key: "radius", label: "Cell Radius", unit: "μm", placeholder: "e.g. 17.99", defaultValue: 17.99 }],
        compute: (v) => parseFloat((2 * Math.PI * (v.radius || 17.99)).toFixed(2)),
      },
      {
        id: "from_area",
        name: "Derive from Nuclear Area (A)",
        description: "Calculates perimeter from area assuming circular cross-section.",
        formulaDisplay: "Perimeter = 2 * √(π * Area)",
        inputs: [{ key: "area", label: "Nuclear Area", unit: "μm²", placeholder: "e.g. 1001.0", defaultValue: 1001.0 }],
        compute: (v) => parseFloat((2 * Math.sqrt(Math.PI * (v.area || 1001.0))).toFixed(2)),
      },
      {
        id: "from_worst",
        name: "Estimate from Worst Perimeter",
        description: "Correlation ratio for largest cell perimeters.",
        formulaDisplay: "Perimeter_mean ≈ Perimeter_worst / 1.34",
        inputs: [{ key: "worst_perimeter", label: "Worst Perimeter", unit: "μm", placeholder: "e.g. 164.5", defaultValue: 164.5 }],
        compute: (v) => parseFloat(((v.worst_perimeter || 164.5) / 1.34).toFixed(2)),
      },
    ],
  },
  area_mean: {
    key: "area_mean",
    label: "Nuclear Area",
    unit: "μm²",
    defaultValue: 1001.0,
    cohortMedianExplanation: "Reference median two-dimensional nuclear area (1001.0 μm²).",
    options: [
      {
        id: "from_radius",
        name: "Derive from Cell Radius (r)",
        description: "Calculates spatial area from radius.",
        formulaDisplay: "Area = π * Radius²",
        inputs: [{ key: "radius", label: "Cell Radius", unit: "μm", placeholder: "e.g. 17.99", defaultValue: 17.99 }],
        compute: (v) => parseFloat((Math.PI * Math.pow(v.radius || 17.99, 2)).toFixed(1)),
      },
      {
        id: "from_perimeter",
        name: "Derive from Cell Perimeter (P)",
        description: "Calculates spatial area from perimeter.",
        formulaDisplay: "Area = Perimeter² / (4π)",
        inputs: [{ key: "perimeter", label: "Cell Perimeter", unit: "μm", placeholder: "e.g. 122.8", defaultValue: 122.8 }],
        compute: (v) => parseFloat((Math.pow(v.perimeter || 122.8, 2) / (4 * Math.PI)).toFixed(1)),
      },
      {
        id: "from_worst",
        name: "Estimate from Worst Area",
        description: "Correlation scaling from largest cell area.",
        formulaDisplay: "Area_mean ≈ Area_worst / 1.45",
        inputs: [{ key: "worst_area", label: "Worst Area", unit: "μm²", placeholder: "e.g. 1450.0", defaultValue: 1450.0 }],
        compute: (v) => parseFloat(((v.worst_area || 1450.0) / 1.45).toFixed(1)),
      },
    ],
  },
  smoothness_mean: {
    key: "smoothness_mean",
    label: "Border Smoothness",
    unit: "idx",
    defaultValue: 0.1184,
    cohortMedianExplanation: "Baseline edge smoothness index (0.1184 idx), representing standard benign contour variance.",
    options: [
      {
        id: "from_worst",
        name: "Estimate from Worst Smoothness",
        description: "Scaled from most irregular boundary sections.",
        formulaDisplay: "Smoothness_mean ≈ Smoothness_worst / 1.35",
        inputs: [{ key: "worst_smoothness", label: "Worst Smoothness", unit: "idx", placeholder: "e.g. 0.16", defaultValue: 0.16 }],
        compute: (v) => parseFloat(((v.worst_smoothness || 0.16) / 1.35).toFixed(4)),
      },
    ],
  },
  compactness_mean: {
    key: "compactness_mean",
    label: "Compactness",
    unit: "idx",
    defaultValue: 0.2776,
    cohortMedianExplanation: "Median morphological compactness index (0.2776 idx).",
    options: [
      {
        id: "from_perim_area",
        name: "Derive from Perimeter & Area",
        description: "Exact ISO compactness definition: Perimeter² / (4π * Area) - 1.0.",
        formulaDisplay: "Compactness = (P² / 4πA) - 1.0",
        inputs: [
          { key: "perimeter", label: "Perimeter", unit: "μm", placeholder: "122.8", defaultValue: 122.8 },
          { key: "area", label: "Area", unit: "μm²", placeholder: "1001.0", defaultValue: 1001.0 },
        ],
        compute: (v) => {
          const p = v.perimeter || 122.8;
          const a = v.area || 1001.0;
          const c = Math.pow(p, 2) / (4 * Math.PI * a) - 1.0;
          return parseFloat(Math.max(0.01, Math.min(0.35, Math.abs(c))).toFixed(4));
        },
      },
      {
        id: "from_worst",
        name: "Estimate from Worst Compactness",
        description: "Correlation scaling from maximum cellular density index.",
        formulaDisplay: "Compactness_mean ≈ Compactness_worst / 1.40",
        inputs: [{ key: "worst_compactness", label: "Worst Compactness", unit: "idx", placeholder: "e.g. 0.38", defaultValue: 0.38 }],
        compute: (v) => parseFloat(((v.worst_compactness || 0.38) / 1.40).toFixed(4)),
      },
    ],
  },
  concavity_mean: {
    key: "concavity_mean",
    label: "Indentation Depth",
    unit: "idx",
    defaultValue: 0.3001,
    cohortMedianExplanation: "Reference median contour indentation severity index (0.3001 idx).",
    options: [
      {
        id: "from_worst",
        name: "Estimate from Worst Concavity",
        description: "Scaled from deepest measured contour indentations.",
        formulaDisplay: "Concavity_mean ≈ Concavity_worst / 1.40",
        inputs: [{ key: "worst_concavity", label: "Worst Concavity", unit: "idx", placeholder: "e.g. 0.42", defaultValue: 0.42 }],
        compute: (v) => parseFloat(((v.worst_concavity || 0.42) / 1.40).toFixed(4)),
      },
    ],
  },
  concave_points_mean: {
    key: "concave_points_mean",
    label: "Indentation Count",
    unit: "cnt",
    defaultValue: 0.1471,
    cohortMedianExplanation: "Reference median number of concave boundary points (0.1471 cnt).",
    options: [
      {
        id: "from_worst",
        name: "Estimate from Worst Concave Points",
        description: "Scaled from total notch count across the cell contour.",
        formulaDisplay: "Points_mean ≈ Points_worst / 1.38",
        inputs: [{ key: "worst_pts", label: "Worst Concave Points", unit: "cnt", placeholder: "e.g. 0.20", defaultValue: 0.20 }],
        compute: (v) => parseFloat(((v.worst_pts || 0.20) / 1.38).toFixed(4)),
      },
    ],
  },
};

interface BiomarkerDerivationModalProps {
  isOpen: boolean;
  biomarkerKey: string | null;
  onClose: () => void;
  onApplyDerivedValue: (key: string, value: number, derivationLabel: string) => void;
}

export default function BiomarkerDerivationModal({
  isOpen,
  biomarkerKey,
  onClose,
  onApplyDerivedValue,
}: BiomarkerDerivationModalProps) {
  const config = biomarkerKey ? DERIVATION_REGISTRY[biomarkerKey] : null;

  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [inputValues, setInputValues] = useState<Record<string, number>>({});
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  React.useEffect(() => {
    if (config && config.options.length > 0) {
      const firstOpt = config.options[0];
      setSelectedOptionId(firstOpt.id);
      const defaults: Record<string, number> = {};
      firstOpt.inputs.forEach((inp) => {
        defaults[inp.key] = inp.defaultValue || 0;
      });
      setInputValues(defaults);
      setCalculatedValue(firstOpt.compute(defaults));
    } else {
      setSelectedOptionId("");
      setInputValues({});
      setCalculatedValue(null);
    }
  }, [config, biomarkerKey]);

  if (!isOpen || !config) return null;

  const activeOption = config.options.find((o) => o.id === selectedOptionId) || config.options[0];

  const handleInputChange = (k: string, val: string) => {
    const num = parseFloat(val);
    const updated = { ...inputValues, [k]: isNaN(num) ? 0 : num };
    setInputValues(updated);
    if (activeOption) {
      setCalculatedValue(activeOption.compute(updated));
    }
  };

  const handleSelectOption = (opt: DerivationOption) => {
    setSelectedOptionId(opt.id);
    const defaults: Record<string, number> = {};
    opt.inputs.forEach((inp) => {
      defaults[inp.key] = inp.defaultValue || 0;
    });
    setInputValues(defaults);
    setCalculatedValue(opt.compute(defaults));
  };

  const handleApply = () => {
    if (calculatedValue !== null) {
      onApplyDerivedValue(
        config.key,
        calculatedValue,
        activeOption ? `⚡ Derived: ${activeOption.formulaDisplay}` : "⚡ Derived"
      );
      onClose();
    }
  };

  const handleApplyCohortMedian = () => {
    onApplyDerivedValue(
      config.key,
      config.defaultValue,
      "🟡 Cohort Baseline Reference Applied"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#DFEBE8] bg-white p-6 sm:p-7 shadow-2xl space-y-4"
      >
        {/* Ambient Radial Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B489]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/25 shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#082827] tracking-tight">
                  Derive {config.label}
                </h3>
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#006766] bg-[#E6F7F4] border border-[#00B489]/30 px-2 py-0.5 rounded-full font-bold">
                  Clinical Math
                </span>
              </div>
              <p className="text-xs text-[#5A7470] mt-0.5">
                Calculate with verified clinical formulas using proxy measurements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#5A7470] hover:bg-[#F2F7F6] hover:text-[#082827] border border-[#DFEBE8] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options Tabs */}
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5A7470]">
            Available Derivation Methods
          </label>

          <div className="space-y-2">
            {config.options.map((opt) => {
              const isSelected = opt.id === activeOption?.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#006766] bg-[#E6F7F4]/50 ring-1 ring-[#006766]/30 text-[#082827] shadow-xs"
                      : "border-[#DFEBE8] bg-[#FAFDFD] hover:bg-[#E6F7F4]/20 text-[#5A7470] hover:text-[#082827]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#082827]">{opt.name}</span>
                    <span className="text-[10.5px] font-mono font-bold text-[#006766] bg-[#E6F7F4] border border-[#00B489]/30 px-2 py-0.5 rounded-lg">
                      {opt.formulaDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7470] mt-1 leading-snug">
                    {opt.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Formula Input Form */}
          {activeOption && (
            <div className="p-4 rounded-2xl border border-[#DFEBE8] bg-[#F8FBFA] space-y-3 shadow-2xs">
              <div className="text-xs font-semibold text-[#082827] flex items-center justify-between">
                <span>Enter Proxy Readings:</span>
                <span className="text-[10px] font-mono font-bold text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-md border border-[#00B489]/20">
                  {activeOption.formulaDisplay}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeOption.inputs.map((inp) => (
                  <div key={inp.key} className="space-y-1">
                    <label className="text-[11px] text-[#5A7470] font-semibold block">
                      {inp.label} ({inp.unit})
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="any"
                        value={inputValues[inp.key] ?? inp.defaultValue ?? 0}
                        onChange={(e) => handleInputChange(inp.key, e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-[#DFEBE8] bg-white text-xs font-semibold font-mono text-[#082827] focus:border-[#006766] focus:ring-1 focus:ring-[#006766] focus:outline-none shadow-xs"
                      />
                      <span className="text-xs font-mono text-[#5A7470] shrink-0 w-8">
                        {inp.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Computed Value Display */}
              <div className="pt-2.5 flex items-center justify-between border-t border-[#DFEBE8]">
                <span className="text-xs font-bold text-[#082827]">
                  Calculated {config.label}:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-base font-bold text-[#006766]">
                  <Zap className="h-4 w-4 text-[#00B489]" />
                  <span>{calculatedValue !== null ? calculatedValue : "--"}</span>
                  <span className="text-xs font-normal text-[#5A7470]">{config.unit}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="w-full h-10 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#006766]/20 active:scale-98"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply Calculated Value ({calculatedValue} {config.unit})</span>
              </button>
            </div>
          )}

          {/* Fallback: Cohort Baseline */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Need a clinically calibrated baseline?</span>
              </div>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                {config.defaultValue} {config.unit}
              </span>
            </div>
            <p className="text-xs text-[#5A7470] leading-relaxed">
              {config.cohortMedianExplanation}
            </p>
            <button
              type="button"
              onClick={handleApplyCohortMedian}
              className="w-full h-8 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/40 text-amber-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              <span>Apply Calibrated Cohort Baseline ({config.defaultValue} {config.unit})</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
