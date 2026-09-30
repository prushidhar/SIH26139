'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { preprocess } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MetricCard from '@/components/MetricCard'

export default function PreprocessingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handlePreprocess = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await preprocess({
        imputation_method: 'mean',
        scaling_method: 'standard',
        feature_selection_k: 10,
        apply_pca: true,
        pca_components: 5
      })
      setResult(res)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const pcaData = result?.pca_variance_ratio?.map((v: number, i: number) => ({
    component: `PC${i + 1}`,
    variance: (v * 100).toFixed(2)
  })) || []

  return (
    <div className="p-8">
      <PageHeader 
        title="Preprocessing Pipeline" 
        subtitle="Clean, scale, and extract features"
        action={
          <button 
            onClick={handlePreprocess} 
            disabled={loading}
            className="px-4 py-2 bg-[#8b5cf6] text-white font-semibold rounded hover:bg-[#8b5cf6]/90 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Preprocessing'}
          </button>
        }
      />

      {error && <div className="bg-[#ef4444]/10 text-[#ef4444] p-4 rounded mb-6">{error}</div>}

      {result && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Original Features" value={result.original_features_count} />
            <MetricCard label="Selected Features" value={result.selected_features_count} variant="cyan" />
            <MetricCard label="Train Split Size" value={result.train_size} />
            <MetricCard label="Test Split Size" value={result.test_size} />
          </div>

          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Pipeline Steps Executed</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {['Imputation', 'Encoding', 'Scaling', 'Feature Selection', 'PCA'].map(step => (
                <div key={step} className="flex-shrink-0 px-4 py-2 bg-[#1f2937] rounded-md text-sm text-[#f9fafb]">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">PCA Variance Explained</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pcaData}>
                  <XAxis dataKey="component" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff'}} />
                  <Bar dataKey="variance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
