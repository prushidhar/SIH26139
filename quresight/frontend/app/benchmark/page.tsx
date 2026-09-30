'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { getResults } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import MetricCard from '@/components/MetricCard'

export default function BenchmarkPage() {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    getResults().then(data => {
      const bMarks = data.filter((r: any) => r.type === 'benchmark')
      if (bMarks.length > 0) {
        setResults(bMarks[0].data.models || [])
      }
    }).catch(console.error)
  }, [])

  if (results.length === 0) {
    return (
      <div className="p-8">
        <PageHeader title="Benchmark Results" />
        <div className="flex items-center justify-center h-64 bg-[#111827] rounded-lg border border-[#1f2937]">
          <p className="text-[#9ca3af]">Run a benchmark in Model Lab to see results here.</p>
        </div>
      </div>
    )
  }

  const chartData = results.map(r => ({
    name: r.model,
    auc: r.metrics.auc,
    family: r.family
  }))

  const bestModel = results.reduce((best, curr) => curr.metrics.auc > best.metrics.auc ? curr : best, results[0])

  return (
    <div className="p-8">
      <PageHeader title="Benchmark Results" subtitle="Comparative analysis of classical vs quantum models" />

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">AUC Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" />
                <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff'}} />
                <Bar dataKey="auc" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.family === 'quantum' ? '#8b5cf6' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg flex flex-col">
          <h3 className="text-lg font-medium mb-4">Model Selection</h3>
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-[#1f2937] rounded-lg border border-gray-700">
              <div className="text-xs text-[#9ca3af] mb-1">Selected Model</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                {bestModel.model}
                {bestModel.family === 'quantum' && (
                  <span className="text-xs px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full">quantum_benefit</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#9ca3af] mb-1">Reason</div>
              <p className="text-sm text-white">Highest Area Under Curve (AUC) across all evaluated models.</p>
            </div>
            <MetricCard label="Best AUC" value={(bestModel.metrics.auc || 0).toFixed(4)} variant={bestModel.family === 'quantum' ? 'violet' : 'cyan'} />
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#1f2937]">
          <h3 className="font-medium text-lg">Detailed Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#9ca3af] uppercase bg-[#1f2937]">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Family</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall</th>
                <th className="px-4 py-3">F1</th>
                <th className="px-4 py-3">AUC</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-[#1f2937] hover:bg-[#1f2937]/50">
                  <td className="px-4 py-3 font-medium text-white">{r.model}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${r.family === 'quantum' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-[#06b6d4]/20 text-[#06b6d4]'}`}>
                      {r.family}
                    </span>
                  </td>
                  <td className="px-4 py-3">{(r.metrics.accuracy || 0).toFixed(4)}</td>
                  <td className="px-4 py-3">{(r.metrics.precision || 0).toFixed(4)}</td>
                  <td className="px-4 py-3">{(r.metrics.recall || 0).toFixed(4)}</td>
                  <td className="px-4 py-3">{(r.metrics.f1 || 0).toFixed(4)}</td>
                  <td className="px-4 py-3 font-bold">{(r.metrics.auc || 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
