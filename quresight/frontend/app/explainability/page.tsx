'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { explain } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import MetricCard from '@/components/MetricCard'

export default function ExplainabilityPage() {
  const [model, setModel] = useState('random_forest')
  const [sampleIdx, setSampleIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<any>(null)

  const handleExplain = async () => {
    setLoading(true)
    try {
      const res = await explain({ model_name: model, sample_index: sampleIdx })
      setExplanation(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getShapData = () => {
    if (!explanation?.local?.shap_values) return []
    const sv = explanation.local.shap_values
    const fn = explanation.local.feature_names
    return sv.map((val: number, i: number) => ({
      name: fn[i],
      value: val,
      color: val > 0 ? '#ef4444' : '#06b6d4'
    })).sort((a: any, b: any) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10)
  }

  const isQuantum = model.includes('quantum') || model.includes('vqc')

  return (
    <div className="p-8">
      <PageHeader title="Explainability" subtitle="Understand model decisions globally and locally" />

      <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1 text-[#9ca3af]">Select Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#06b6d4]">
            <option value="logistic_regression">Logistic Regression</option>
            <option value="random_forest">Random Forest</option>
            <option value="xgboost">XGBoost</option>
            <option value="vqc">Quantum VQC</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1 text-[#9ca3af]">Sample Index (0-N)</label>
          <input type="number" value={sampleIdx} onChange={e => setSampleIdx(Number(e.target.value))} className="w-full bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#06b6d4]" />
        </div>
        <button onClick={handleExplain} disabled={loading} className="px-6 py-2 bg-[#06b6d4] text-black font-semibold rounded hover:bg-[#06b6d4]/90 disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Explain This Sample'}
        </button>
      </div>

      {explanation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Local Explanation (SHAP)</h3>
            <p className="text-sm text-[#9ca3af] mb-4">Top 10 features contributing to this specific prediction.</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getShapData()} layout="vertical" margin={{left: 80, right: 20}}>
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} />
                  <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff'}} />
                  <ReferenceLine x={0} stroke="#4b5563" />
                  <Bar dataKey="value" barSize={20}>
                    {getShapData().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs mt-4">
              <span className="text-[#06b6d4]">← Protective (Lower Risk)</span>
              <span className="text-[#ef4444]">Risk Elevating (Higher Risk) →</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Prediction Context</h3>
              <MetricCard 
                label="Risk Probability" 
                value={`${(explanation.local.probability * 100).toFixed(1)}%`} 
                variant={explanation.local.probability > 0.5 ? 'red' : 'green'} 
              />
              <div className="mt-4 p-4 bg-[#1f2937] rounded border border-gray-700">
                <p className="text-sm text-[#f9fafb]">Base Value (Expected): {explanation.local.base_value?.toFixed(3)}</p>
                <p className="text-sm text-[#f9fafb]">Model Output: {explanation.local.model_output?.toFixed(3)}</p>
              </div>
            </div>

            {isQuantum && (
              <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg border-l-4 border-l-[#8b5cf6]">
                <h3 className="text-lg font-medium mb-2 text-[#8b5cf6]">Quantum Feature Sensitivity (Perturbation-Based)</h3>
                <p className="text-sm text-[#9ca3af]">Quantum models evaluate feature importance via gradient sensitivity in the quantum circuit.</p>
                <div className="mt-4 text-center p-4 bg-[#1f2937] rounded">
                  <span className="text-xs text-white">Sensitivity metrics available in full report.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
