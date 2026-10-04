"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Download,
  Eye,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  FileText,
  FileJson,
  Archive,
  Loader2,
  ArrowUp,
  Activity,
  Clock,
  BarChart3,
  XCircle,
} from "lucide-react";
import {
  type BatchSession,
  type BatchRecord,
  exportBatchAsCSV,
  exportBatchAsJSON,
  exportBatchAsPdfZip,
  BIOMARKER_LABELS,
} from "@/services/batch.service";
import { downloadCombinedReport, type ReportPayload, type BiomarkerEntry } from "@/lib/pdfReportGenerator";
import { showToast } from "@/components/common/ToastNotification";

interface BatchResultsTableProps {
  session: BatchSession;
  onViewDetails: (record: BatchRecord) => void;
}

type SortField = "rowIndex" | "riskScore" | "confidence" | "patientName" | "consensusStatus";
type SortDirection = "asc" | "desc";
type RiskFilter = "ALL" | "High" | "Low" | "Borderline";
type ConsensusFilter = "ALL" | "Concordant" | "Discordant";
type PageSize = 30 | 50 | 100 | 500 | "ALL";

export default function BatchResultsTable({
  session,
  onViewDetails,
}: BatchResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
  const [consensusFilter, setConsensusFilter] = useState<ConsensusFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("rowIndex");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [pageSize, setPageSize] = useState<PageSize>(30);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filter + Sort
  const filteredRecords = useMemo(() => {
    let records = session.records.filter((r) => r.status === "success" || r.status === "error");

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.patientId.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q) ||
          (r.quantumPrediction || "").toLowerCase().includes(q) ||
          (r.classicalPrediction || "").toLowerCase().includes(q),
      );
    }

    // Risk filter
    if (riskFilter !== "ALL") {
      records = records.filter((r) => r.riskLevel === riskFilter);
    }

    // Consensus filter
    if (consensusFilter !== "ALL") {
      records = records.filter((r) => r.consensusStatus === consensusFilter);
    }

    // Sort
    records.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "rowIndex":
          cmp = a.rowIndex - b.rowIndex;
          break;
        case "riskScore":
          cmp = (a.quantumRiskScore || 0) - (b.quantumRiskScore || 0);
          break;
        case "confidence":
          cmp = (a.quantumConfidence || 0) - (b.quantumConfidence || 0);
          break;
        case "patientName":
          cmp = a.patientName.localeCompare(b.patientName);
          break;
        case "consensusStatus":
          cmp = (a.consensusStatus || "").localeCompare(b.consensusStatus || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return records;
  }, [session.records, searchQuery, riskFilter, consensusFilter, sortField, sortDir]);

  const displayedRecords = useMemo(() => {
    if (pageSize === "ALL") return filteredRecords;
    return filteredRecords.slice(0, pageSize);
  }, [filteredRecords, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPdfProgress({ current: 0, total: session.successCount });
    showToast({
      title: "Exporting Batch ZIP",
      message: `Compiling PDF reports for ${session.successCount} patients...`,
      type: "quantum",
    });
    try {
      await exportBatchAsPdfZip(session, (current, total) => {
        setPdfProgress({ current, total });
      });
      showToast({
        title: "Batch ZIP Downloaded",
        message: `Downloaded QureSight_Batch_${session.batchId}_Reports.zip`,
        type: "quantum",
      });
    } catch (err: any) {
      console.error("PDF ZIP export failed:", err);
      showToast({
        title: "Batch Export Failed",
        message: err?.message || "Could not compile batch PDF ZIP archive.",
        type: "warning",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadSingleRecord = (record: BatchRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      showToast({
        title: "Generating Patient Report",
        message: `Assembling clinical report for ${record.patientName}...`,
        type: "quantum",
      });

      const biomarkers: BiomarkerEntry[] = Object.entries(record.inputData || {}).map(([key, val]) => {
        const meta = BIOMARKER_LABELS[key] || { label: key, unit: "", benignMed: 0, normalMax: 0 };
        return {
          key,
          label: meta.label,
          value: val as number,
          unit: meta.unit,
          benignMedian: meta.benignMed,
          normalMax: meta.normalMax,
        };
      });

      const mapAttrs = (arr: any[]) =>
        arr.map((a: any) => ({
          featureName: a.featureName || a.feature_name || "",
          measuredValue: a.measuredValue || a.measured_value || 0,
          baselineValue: a.baselineValue || a.baseline_value || 0,
          impactPercentage: a.impactPercentage || a.impact_percentage || 0,
          direction: (a.direction || "protective") as "risk_elevating" | "protective",
          quantumImpact: a.quantumImpact || a.quantum_impact || "",
        }));

      const payload: ReportPayload = {
        patient: {
          patientName: record.patientName,
          patientId: record.patientId,
          patientAge: "N/A",
          patientGender: "Not Specified",
          diseaseType: record.diseaseType.includes("Cardiac") ? "cardiac_ecg" : "breast_cancer",
        },
        biomarkers,
        transfinite1: {
          engineName: "Quantum VQC",
          engineDescription: "8-Qubit ZZ Variational Quantum Classifier (Simulator)",
          modelType: "hybrid",
          predictionLabel: record.quantumPrediction || "Unknown",
          confidence: record.quantumConfidence || 0,
          riskScore: record.quantumRiskScore || 0,
          riskTier: record.riskTier || "",
          riskTag: record.riskTag || "LOW_RISK",
          clinicalAction: "Refer to clinical provider for follow-up.",
          latencyMs: record.latencyMs || 15,
          architecture: "8-Qubit ZZ Pauli Tensor Map",
          attributions: mapAttrs(record.attributions || []),
          qubits: 8,
          ansatz: "StronglyEntanglingLayers",
          circuitDepth: 36,
          cnotCount: 16,
          variationalParams: 48,
        },
        cx01: {
          engineName: "Classical Baseline",
          engineDescription: "Classical SVM-RBF + XGBoost Ensemble",
          modelType: "classical",
          predictionLabel: record.classicalPrediction || "Unknown",
          confidence: record.classicalConfidence || 0,
          riskScore: record.classicalRiskScore || 0,
          riskTier: record.riskTier || "",
          riskTag: record.riskTag || "LOW_RISK",
          clinicalAction: "Refer to clinical provider for follow-up.",
          latencyMs: 2.5,
          architecture: "30-Feature Regularized Hyperplane",
          attributions: mapAttrs(record.attributions || []),
        },
        consensusStatus: (record.consensusStatus as "Concordant" | "Discordant") || "Concordant",
      };

      downloadCombinedReport(payload);
      showToast({
        title: "Report Downloaded",
        message: `Saved QureSight_Report_${payload.patient.patientId}_Combined.pdf`,
        type: "quantum",
      });
    } catch (err: any) {
      console.error("Batch single PDF generation failed:", err);
      showToast({
        title: "Download Failed",
        message: err?.message || "Could not generate PDF report.",
        type: "warning",
      });
    }
  };

  const getRiskBadge = (riskLevel?: string, riskScore?: number) => {
    const score = riskScore || 0;
    if (score >= 65 || riskLevel === "High") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold">
          ● HIGH {score.toFixed(1)}
        </span>
      );
    }
    if (score >= 45 || riskLevel === "Borderline") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold">
          ● BORDERLINE {score.toFixed(1)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
        ● LOW {score.toFixed(1)}
      </span>
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 400);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats Bar */}
      <div className="rounded-3xl bg-white border border-[#DFEBE8] shadow-[0_2px_12px_-4px_rgba(0,103,102,0.06)] p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#F8FBFA] rounded-2xl border border-[#DFEBE8]">
            <BarChart3 size={15} className="text-[#006766]" />
            <span className="text-[#5A7470]">Total:</span>
            <span className="font-bold text-[#082827]">{session.totalRecords.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="text-emerald-700 font-medium">Success:</span>
            <span className="font-bold text-emerald-800">{session.successCount}</span>
          </div>
          {session.errorCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 rounded-2xl border border-red-200">
              <XCircle size={15} className="text-red-500" />
              <span className="text-red-700 font-medium">Errors:</span>
              <span className="font-bold text-red-800">{session.errorCount}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 rounded-2xl border border-rose-200">
            <AlertTriangle size={15} className="text-rose-600" />
            <span className="text-rose-700 font-medium">High Risk:</span>
            <span className="font-bold text-rose-800">{session.highRiskCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#E6F7F4] rounded-2xl border border-[#00B489]/30">
            <Activity size={15} className="text-[#006766]" />
            <span className="text-[#006766] font-medium">Concordant:</span>
            <span className="font-bold text-[#006766]">
              {session.concordantCount} ({session.successCount > 0 ? ((session.concordantCount / session.successCount) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 rounded-2xl border border-purple-200">
            <Clock size={15} className="text-purple-600" />
            <span className="text-purple-700 font-medium">Time:</span>
            <span className="font-bold text-purple-800">
              {(session.executionTimeMs / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#F8FBFA] rounded-2xl border border-[#DFEBE8]">
            <span className="text-[#5A7470]">Avg Risk:</span>
            <span className="font-bold text-[#082827]">{session.averageRiskScore.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="rounded-2xl bg-white border border-[#DFEBE8] shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7470]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or prediction..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DFEBE8] bg-[#FAFDFD] text-[#082827] placeholder:text-[#5A7470]/60 focus:outline-none focus:ring-1 focus:ring-[#006766] focus:border-[#006766]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-[#5A7470]" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
              className="text-xs rounded-xl border border-[#DFEBE8] bg-[#FAFDFD] px-2.5 py-2 text-[#082827] font-medium cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Risk</option>
              <option value="High">High Risk</option>
              <option value="Borderline">Borderline</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <select
            value={consensusFilter}
            onChange={(e) => setConsensusFilter(e.target.value as ConsensusFilter)}
            className="text-xs rounded-xl border border-[#DFEBE8] bg-[#FAFDFD] px-2.5 py-2 text-[#082827] font-medium cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Consensus</option>
            <option value="Concordant">Concordant</option>
            <option value="Discordant">Discordant</option>
          </select>

          <select
            value={String(pageSize)}
            onChange={(e) => setPageSize(e.target.value === "ALL" ? "ALL" : (Number(e.target.value) as PageSize))}
            className="text-xs rounded-xl border border-[#DFEBE8] bg-[#FAFDFD] px-2.5 py-2 text-[#082827] font-medium cursor-pointer focus:outline-none"
          >
            <option value="30">Top 30</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
            <option value="500">Top 500</option>
            <option value="ALL">All</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportBatchAsCSV(session);
              showToast({
                title: "CSV Exported",
                message: `Exported QureSight_Batch_${session.batchId}.csv`,
                type: "quantum",
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DFEBE8] text-xs font-semibold text-[#082827] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FileText size={13} className="text-[#006766]" />
            CSV
          </button>
          <button
            onClick={() => {
              exportBatchAsJSON(session);
              showToast({
                title: "JSON Exported",
                message: `Exported QureSight_Batch_${session.batchId}.json`,
                type: "quantum",
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DFEBE8] text-xs font-semibold text-[#082827] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FileJson size={13} className="text-[#006766]" />
            JSON
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#006766]/20 disabled:opacity-50 active:scale-98"
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                {pdfProgress.current}/{pdfProgress.total}
              </>
            ) : (
              <>
                <Archive size={13} className="text-[#00B489]" />
                PDF ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-[11px] text-[#5A7470] px-1">
        Showing <span className="font-semibold text-[#082827]">{displayedRecords.length}</span> of{" "}
        <span className="font-semibold text-[#082827]">{filteredRecords.length}</span> records
        {filteredRecords.length !== session.records.length && (
          <span> (filtered from {session.records.length} total)</span>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl bg-white border border-[#DFEBE8] shadow-xs overflow-hidden"
        onScroll={handleScroll}
      >
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-[#F7FAF9] border-b border-[#DFEBE8]">
              <tr>
                <th
                  className="px-3 py-3 text-left font-semibold text-[#5A7470] cursor-pointer hover:text-[#082827] transition-colors"
                  onClick={() => toggleSort("rowIndex")}
                >
                  <div className="flex items-center gap-1">
                    # <ArrowUpDown size={10} className={sortField === "rowIndex" ? "text-quantum" : ""} />
                  </div>
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[#5A7470]">Patient ID</th>
                <th
                  className="px-3 py-3 text-left font-semibold text-[#5A7470] cursor-pointer hover:text-[#082827] transition-colors"
                  onClick={() => toggleSort("patientName")}
                >
                  <div className="flex items-center gap-1">
                    Name <ArrowUpDown size={10} className={sortField === "patientName" ? "text-quantum" : ""} />
                  </div>
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[#5A7470]">Quantum</th>
                <th className="px-3 py-3 text-left font-semibold text-[#5A7470]">Classical</th>
                <th
                  className="px-3 py-3 text-left font-semibold text-[#5A7470] cursor-pointer hover:text-[#082827] transition-colors"
                  onClick={() => toggleSort("riskScore")}
                >
                  <div className="flex items-center gap-1">
                    Risk <ArrowUpDown size={10} className={sortField === "riskScore" ? "text-quantum" : ""} />
                  </div>
                </th>
                <th
                  className="px-3 py-3 text-left font-semibold text-[#5A7470] cursor-pointer hover:text-[#082827] transition-colors"
                  onClick={() => toggleSort("consensusStatus")}
                >
                  <div className="flex items-center gap-1">
                    Consensus <ArrowUpDown size={10} className={sortField === "consensusStatus" ? "text-quantum" : ""} />
                  </div>
                </th>
                <th className="px-3 py-3 text-right font-semibold text-[#5A7470]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {displayedRecords.map((record, i) => (
                  <motion.tr
                    key={record.rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    className={`border-b border-[#DFEBE8]/50 hover:bg-[#F7FAF9]/50 transition-colors ${
                      record.status === "error" ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono text-[#5A7470]">
                      {record.rowIndex + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[10px] bg-[#F7FAF9] px-1.5 py-0.5 rounded border border-[#DFEBE8] text-[#5A7470]">
                        {record.patientId}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[#082827]">
                      {record.patientName}
                    </td>
                    <td className="px-3 py-2.5">
                      {record.status === "error" ? (
                        <span className="text-red-500 text-[10px]">Error</span>
                      ) : (
                        <span
                          className={
                            record.quantumPrediction === "Malignant" || record.quantumPrediction?.includes("Infarction")
                              ? "text-red-600 font-semibold"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          {record.quantumPrediction || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {record.status === "error" ? (
                        <span className="text-red-500 text-[10px]">—</span>
                      ) : (
                        <span
                          className={
                            record.classicalPrediction === "Malignant" || record.classicalPrediction?.includes("Infarction")
                              ? "text-red-600 font-semibold"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          {record.classicalPrediction || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {record.status === "success"
                        ? getRiskBadge(record.riskLevel, record.quantumRiskScore)
                        : <span className="text-red-500 text-[10px]">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {record.consensusStatus === "Concordant" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <CheckCircle2 size={12} /> Concordant
                        </span>
                      ) : record.consensusStatus === "Discordant" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                          <AlertTriangle size={12} /> Discordant
                        </span>
                      ) : (
                        <span className="text-[#5A7470] text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {record.status === "success" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleDownloadSingleRecord(record, e)}
                            title="Download Clinical PDF Report"
                            className="p-1 rounded-lg bg-[#F7FAF9] border border-[#DFEBE8] text-[#082827] hover:bg-quantum hover:text-black transition-all cursor-pointer"
                          >
                            <Download size={11} />
                          </button>
                          <button
                            onClick={() => onViewDetails(record)}
                            className="px-2.5 py-1 rounded-lg bg-[#F7FAF9] border border-[#DFEBE8] text-[10px] font-medium text-[#082827] hover:bg-[#082827] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Eye size={11} /> View
                          </button>
                        </div>
                      )}
                      {record.status === "error" && (
                        <span className="text-[10px] text-red-500 italic truncate max-w-[100px] block ml-auto" title={record.error}>
                          {record.error}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-[#082827] text-white shadow-lg flex items-center justify-center cursor-pointer z-50 hover:bg-[#082827]/90 transition-colors"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
