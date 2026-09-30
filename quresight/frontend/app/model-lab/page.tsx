'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { trainClassical, trainQuantum, benchmark } from '@/lib/api'
import MetricCard from '@/components/MetricCard'

export default function ModelLabPage() {
  const [loadingClassical, setLoadingClassical] = useState(false)
  const [loadingQuantum, setLoadingQuantum] = useState(false)
  const [loadingBenchmark, setLoadingBenchmark] = useState(false)
  const [classicalResults, setClassicalResults] = useState<any>(null)
  const [quantumResult, setQuantumResult] = useState<any>(null)

  // Quantum Config
  const [method, setMethod] = useState('vqc')
  const [qubits, setQubits] = useState(4)
  const [depth, setDepth] = useState(2)
  const [epochs, setEpochs] = useState(30)

  const handleRunClassical = async () => {
    setLoadingClassical(true)
    try {
      const res = await trainClassical(['logistic_regression', 'random_forest', 'xgboost'])
      setClassicalResults(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingClassical(false)
    }
  }

  const handleRunQuantum = async () => {
    setLoadingQuantum(true)
    try {
      const res = await trainQuantum({ method, qubits, depth, epochs })
      setQuantumResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingQuantum(false)
    }
  }

  const handleRunBenchmark = async () => {
    setLoadingBenchmark(true)
    try {
      await benchmark()
      window.location.href = '/benchmark'
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingBenchmark(false)
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Model Lab" subtitle="Train classical and quantum models" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Classical Panel */}
        <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-[#06b6d4]">Classical Models</h2>
          <div className="space-y-3 mb-6">
            {['Logistic Regression', 'Random Forest', 'XGBoost'].map(m => (
              <label key={m} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                <span className="text-sm">{m}</span>
              </label>
            ))}
          </div>
          <button 
            onClick={handleRunClassical} disabled={loadingClassical}
            className="w-full py-2 bg-[#06b6d4] text-black font-semibold rounded hover:bg-[#06b6d4]/90 disabled:opacity-50 mb-6"
          >
            {loadingClassical ? 'Training...' : 'Run Classical Models'}
          </button>

          {classicalResults && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-[#9ca3af]">Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#9ca3af] uppercase bg-[#1f2937]">
                    <tr>
                      <th className="px-4 py-2">Model</th>
                      <th className="px-4 py-2">Accuracy</th>
                      <th className="px-4 py-2">AUC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(classicalResults.results || {}).map(([name, metrics]: [string, any]) => (
                      <tr key={name} className="border-b border-[#1f2937]">
                        <td className="px-4 py-2">{name}</td>
                        <td className="px-4 py-2">{(metrics.accuracy || 0).toFixed(4)}</td>
                        <td className="px-4 py-2">{(metrics.auc || 0).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Quantum Panel */}
        <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-[#8b5cf6]">Quantum Models</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-1 text-[#9ca3af]">Method</label>
              <select 
                value={method} onChange={e => setMethod(e.target.value)}
                className="w-full bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="vqc">Variational Quantum Classifier (VQC)</option>
                <option value="qsvm">Quantum Kernel (QSVM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#9ca3af]">Qubits ({qubits})</label>
              <input type="range" min="2" max="8" step="2" value={qubits} onChange={e => setQubits(Number(e.target.value))} className="w-full accent-[#8b5cf6]" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#9ca3af]">Layers / Depth ({depth})</label>
              <input type="range" min="2" max="8" step="2" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full accent-[#8b5cf6]" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#9ca3af]">Epochs</label>
              <input type="number" value={epochs} onChange={e => setEpochs(Number(e.target.value))} className="w-full bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#8b5cf6]" />
            </div>
          </div>
          <button 
            onClick={handleRunQuantum} disabled={loadingQuantum}
            className="w-full py-2 bg-[#8b5cf6] text-white font-semibold rounded hover:bg-[#8b5cf6]/90 disabled:opacity-50 mb-6"
          >
            {loadingQuantum ? 'Training...' : 'Run Quantum Model'}
          </button>

          {quantumResult && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-[#9ca3af]">Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Accuracy" value={quantumResult.metrics?.accuracy?.toFixed(4) || 0} variant="violet" />
                <MetricCard label="AUC" value={quantumResult.metrics?.auc?.toFixed(4) || 0} variant="violet" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center border-t border-[#1f2937] pt-8">
        <button 
          onClick={handleRunBenchmark} disabled={loadingBenchmark}
          className="px-8 py-3 bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] text-white font-bold rounded hover:opacity-90 disabled:opacity-50"
        >
          {loadingBenchmark ? 'Benchmarking...' : 'Run Full Benchmark'}
        </button>
      </div>
    </div>
  )
}
