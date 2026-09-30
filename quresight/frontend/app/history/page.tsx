'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { getResults, getPredictions, generateReport } from '@/lib/api'

export default function HistoryPage() {
  const [results, setResults] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getResults().then(setResults).catch(console.error)
    getPredictions().then(setPredictions).catch(console.error)
  }, [])

  const handleDownload = async () => {
    setLoading(true)
    try {
      const report = await generateReport()
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quresight_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="History & Reports" 
        subtitle="Review past experiments and predictions" 
        action={
          <button onClick={handleDownload} disabled={loading} className="px-4 py-2 bg-[#1f2937] text-white rounded hover:bg-[#374151]">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        }
      />

      <div className="space-y-8">
        <div className="bg-[#111827] border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#1f2937]">
            <h3 className="font-medium">Recent Experiments</h3>
          </div>
          {results.length === 0 ? (
            <div className="p-6 text-center text-[#9ca3af] text-sm">No experiments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#9ca3af] uppercase bg-[#1f2937]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-[#1f2937]">
                      <td className="px-4 py-3 text-[#9ca3af]">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3"><span className="text-[#10b981]">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#1f2937]">
            <h3 className="font-medium">Prediction Logs</h3>
          </div>
          {predictions.length === 0 ? (
            <div className="p-6 text-center text-[#9ca3af] text-sm">No predictions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#9ca3af] uppercase bg-[#1f2937]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={i} className="border-b border-[#1f2937]">
                      <td className="px-4 py-3 text-[#9ca3af]">{new Date(p.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">{p.model}</td>
                      <td className="px-4 py-3">{(p.probability * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
