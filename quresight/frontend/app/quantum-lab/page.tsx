'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { runQuantumExperiments } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import MetricCard from '@/components/MetricCard'

export default function QuantumLabPage() {
  const [activeTab, setActiveTab] = useState('scaling')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleRun = async (type: string) => {
    setLoading(true)
    try {
      const config = type === 'scaling' 
        ? { type: 'scaling', method: 'vqc', qubits_list: [2, 4, 6], depth: 2 }
        : type === 'depth'
        ? { type: 'depth', method: 'vqc', qubits: 4, depth_list: [2, 4, 6] }
        : { type: 'full', method: 'vqc' }
        
      const res = await runQuantumExperiments(config)
      setResults({ type, data: res.results || res })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Quantum Lab" subtitle="Systematic quantum scaling experiments" />

      <div className="bg-blue-900/20 border border-blue-800/30 text-blue-200 p-4 rounded-lg mb-8 flex items-center gap-3">
        <span className="text-xl">ℹ️</span>
        <p className="text-sm">All experiments run on PennyLane <strong>default.qubit</strong> (Statevector Simulator). No physical quantum hardware.</p>
      </div>

      <div className="flex border-b border-[#1f2937] mb-6">
        <button onClick={() => setActiveTab('scaling')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'scaling' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-[#9ca3af] hover:text-white'}`}>Qubit Scaling</button>
        <button onClick={() => setActiveTab('depth')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'depth' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-[#9ca3af] hover:text-white'}`}>Circuit Depth</button>
        <button onClick={() => setActiveTab('full')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'full' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-[#9ca3af] hover:text-white'}`}>Full Experiment</button>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg mb-8">
        <button 
          onClick={() => handleRun(activeTab)} disabled={loading}
          className="px-6 py-2 bg-[#8b5cf6] text-white font-semibold rounded hover:bg-[#8b5cf6]/90 disabled:opacity-50 mb-6"
        >
          {loading ? 'Running Experiment...' : `Run ${activeTab === 'scaling' ? 'Qubit Scaling' : activeTab === 'depth' ? 'Depth Experiment' : 'Full Experiment'}`}
        </button>

        {results && results.type === activeTab && (
          <div className="space-y-8">
            <h3 className="font-medium text-lg">Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#9ca3af] uppercase bg-[#1f2937]">
                  <tr>
                    <th className="px-4 py-2">Qubits</th>
                    <th className="px-4 py-2">Depth</th>
                    <th className="px-4 py-2">Accuracy</th>
                    <th className="px-4 py-2">AUC</th>
                    <th className="px-4 py-2">Runtime (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((r: any, i: number) => (
                    <tr key={i} className="border-b border-[#1f2937]">
                      <td className="px-4 py-2">{r.qubits}</td>
                      <td className="px-4 py-2">{r.depth}</td>
                      <td className="px-4 py-2">{(r.metrics?.accuracy || 0).toFixed(4)}</td>
                      <td className="px-4 py-2">{(r.metrics?.auc || 0).toFixed(4)}</td>
                      <td className="px-4 py-2">{(r.runtime || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.data.map((r:any) => ({ x: activeTab === 'scaling' ? r.qubits : r.depth, auc: r.metrics?.auc }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="x" stroke="#9ca3af" label={{ value: activeTab === 'scaling' ? 'Qubits' : 'Depth', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151'}} />
                  <Line type="monotone" dataKey="auc" stroke="#8b5cf6" strokeWidth={3} dot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
