'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { generateReport, listReports, getReportHtmlUrl } from '@/lib/api'
import { FileText, Download, ExternalLink, RefreshCw, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchReportsList = async () => {
    setLoading(true)
    try {
      const data = await listReports()
      if (Array.isArray(data)) {
        setReports(data)
        if (data.length > 0 && !selectedReport) {
          try {
            const parsed = typeof data[0].content === 'string' ? JSON.parse(data[0].content) : data[0].content
            setSelectedReport(parsed)
          } catch {
            setSelectedReport(data[0])
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsList()
  }, [])

  const handleGenerateReport = async () => {
    setGenerating(true)
    setError('')
    setSuccess('')
    try {
      const newReport = await generateReport()
      setSelectedReport(newReport)
      setSuccess('Comprehensive report generated successfully.')
      await fetchReportsList()
    } catch (err: any) {
      setError(err.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadJSON = (report: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `QureSight_Report_${report.id || 'export'}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Audit & Clinical Reports" 
        subtitle="Exportable diagnostic evaluations, evidence routing audits, and quantum feasibility reports" 
      />

      {error && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111827] border border-[#1f2937] p-6 rounded-xl">
        <div>
          <h2 className="text-lg font-semibold text-white">Generate Diagnostic & Benchmark Audit</h2>
          <p className="text-sm text-[#9ca3af]">
            Compiles live empirical benchmark metrics, model routing justification, and explainability audits into publication-ready HTML/JSON.
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#06b6d4] text-black font-semibold rounded-lg hover:bg-[#06b6d4]/90 disabled:opacity-50 transition-colors shadow-lg shadow-[#06b6d4]/10 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Compiling Report...' : 'Generate New Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports Archive List */}
        <div className="lg:col-span-1 bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8b5cf6]" />
              Archived Reports ({reports.length})
            </h3>
            <button 
              onClick={fetchReportsList} 
              disabled={loading}
              className="text-xs text-[#9ca3af] hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <p className="text-xs text-[#9ca3af] py-6 text-center">No reports generated yet. Click above to create one.</p>
            ) : (
              reports.map((r) => {
                let parsed: any = null
                try {
                  parsed = typeof r.content === 'string' ? JSON.parse(r.content) : r.content
                } catch {
                  parsed = r
                }
                const isSelected = selectedReport?.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(parsed)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]'
                        : 'bg-[#1f2937]/50 border-[#1f2937] hover:border-[#374151]'
                    }`}
                  >
                    <div className="font-medium text-sm text-white truncate">{r.title || 'Diagnostic Report'}</div>
                    <div className="text-xs text-[#9ca3af] mt-1 font-mono">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1f2937]">
                      <a
                        href={getReportHtmlUrl(r.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#06b6d4] hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" /> HTML View
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Selected Report Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedReport.title || 'QureSight Audit Report'}</h3>
                  <div className="text-xs text-[#9ca3af] mt-1 font-mono">
                    ID: {selectedReport.id} | Generated: {selectedReport.generated_at}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={getReportHtmlUrl(selectedReport.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] text-white hover:bg-[#374151] rounded text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#06b6d4]" /> Open Standalone HTML
                  </a>
                  <button
                    onClick={() => handleDownloadJSON(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] text-white hover:bg-[#374151] rounded text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8b5cf6]" /> Export JSON
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-sm font-semibold text-[#06b6d4] uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-sm text-[#d1d5db] bg-[#1f2937]/40 p-4 rounded-lg border border-[#1f2937]">
                  {selectedReport.executive_summary || 'Empirical comparison completed with evidence-based model routing.'}
                </p>
              </div>

              {/* Selection Rule & Platform Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1f2937]/30 border border-[#1f2937] p-4 rounded-lg">
                  <div className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wider mb-1">
                    Evidence-Based Selection Rule
                  </div>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    {selectedReport.evidence_based_selection_rule || 'Deterministic multi-metric routing favoring AUC, sensitivity, and calibration.'}
                  </p>
                </div>
                <div className="bg-[#1f2937]/30 border border-[#1f2937] p-4 rounded-lg">
                  <div className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wider mb-1">
                    Simulation & Hardware Architecture
                  </div>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Simulator: {selectedReport.platform?.quantum_simulator || 'PennyLane default.qubit (Statevector)'}
                    <br />
                    Hardware Export: OpenQASM 2.0 / IBM Quantum Adapter ready
                  </p>
                </div>
              </div>

              {/* Benchmark Summary Table */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Recorded Benchmark Highlight Runs</h4>
                <div className="overflow-x-auto border border-[#1f2937] rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1f2937] text-[#9ca3af]">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Runtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2937]">
                      {(selectedReport.benchmark_runs || []).slice(0, 5).map((b: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#1f2937]/40">
                          <td className="p-3 font-mono text-white">{b.experiment_type || b.type || 'benchmark'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-[#10b981]/20 text-[#10b981]">
                              {b.status || 'completed'}
                            </span>
                          </td>
                          <td className="p-3 text-[#9ca3af] font-mono">{b.created_at ? new Date(b.created_at).toLocaleTimeString() : 'N/A'}</td>
                          <td className="p-3 text-[#9ca3af] font-mono">{b.duration_seconds ? `${b.duration_seconds.toFixed(2)}s` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statutory Disclaimer */}
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4 flex items-start gap-3 text-xs text-[#fca5a5]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#ef4444]" />
                <div>
                  <span className="font-semibold text-white">Statutory Research & Medical Disclaimer:</span>{' '}
                  {selectedReport.disclaimer || 'This system is a research decision-support prototype and must not replace professional clinical evaluation or pathology workup.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-12 text-center text-[#9ca3af]">
              Select a report from the archive or click &quot;Generate New Report&quot; to review audits.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
