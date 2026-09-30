'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { predict } from '@/lib/api'

export default function PredictionPage() {
  const [model, setModel] = useState('random_forest')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handlePredict = async () => {
    setLoading(true)
    try {
      // Mock features for now
      const features = {
        "mean radius": 17.99,
        "mean texture": 10.38,
        "mean perimeter": 122.8,
        "mean area": 1001.0,
        "mean smoothness": 0.1184
      }
      const res = await predict(features, model)
      setResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Clinical Prediction" subtitle="Single-sample analysis" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-lg">Input Features</h3>
            <button className="px-3 py-1 bg-[#1f2937] text-xs text-[#9ca3af] hover:text-white rounded">Use Example Sample</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {['mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness'].map(f => (
              <div key={f}>
                <label className="block text-xs mb-1 text-[#9ca3af] capitalize">{f}</label>
                <input type="number" defaultValue="0" className="w-full bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#06b6d4]" />
              </div>
            ))}
          </div>
          <div className="text-xs text-[#9ca3af] italic mb-6">* Showing subset of features for demonstration</div>

          <div className="flex gap-4 items-center border-t border-[#1f2937] pt-6">
            <select value={model} onChange={e => setModel(e.target.value)} className="bg-[#1f2937] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#06b6d4]">
              <option value="logistic_regression">Logistic Regression</option>
              <option value="random_forest">Random Forest</option>
              <option value="xgboost">XGBoost</option>
              <option value="vqc">Quantum VQC</option>
            </select>
            <button onClick={handlePredict} disabled={loading} className="px-6 py-2 bg-[#10b981] text-black font-semibold rounded hover:bg-[#10b981]/90 disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Analyze Sample'}
            </button>
          </div>
        </div>

        <div>
          {result ? (
            <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg flex flex-col items-center text-center">
              <h3 className="text-[#9ca3af] text-sm uppercase tracking-wider mb-2">Risk Assessment</h3>
              <div className={`text-5xl font-bold mb-2 ${result.probability > 0.5 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                {(result.probability * 100).toFixed(1)}%
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-6 ${result.probability > 0.5 ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
                {result.probability > 0.5 ? 'Elevated Risk' : 'Low Risk'}
              </div>
              
              <div className="w-full bg-[#1f2937] rounded p-4 mb-6">
                <div className="text-xs text-[#9ca3af] mb-1">Model Used</div>
                <div className="font-medium text-white">{result.model}</div>
              </div>

              <div className="w-full text-left bg-red-900/20 border border-red-800/30 p-4 rounded text-red-200 text-xs">
                <strong>⚠️ Research Prototype</strong>
                <p className="mt-1">This platform provides decision-support predictions only. It is NOT a substitute for professional medical diagnosis. Consult a qualified healthcare professional.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg h-full flex items-center justify-center text-center">
              <p className="text-[#9ca3af] text-sm">Enter patient features and click Analyze Sample to view risk assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
