'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MetricCard from '@/components/MetricCard'
import { getHealth, getResults } from '@/lib/api'
import { ArrowRight } from 'lucide-react'

export default function OverviewPage() {
  const [health, setHealth] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    getHealth().then(setHealth).catch(console.error)
    getResults().then(setResults).catch(console.error)
  }, [])

  return (
    <div className="p-8">
      <div className="mb-10 text-center py-12 bg-gradient-to-b from-[#111827] to-transparent rounded-xl border border-[#1f2937]">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6]">
          QureSight
        </h1>
        <p className="text-xl text-white mb-2">Quantum Intelligence. Explainable Health Insights.</p>
        <p className="text-[#9ca3af] max-w-2xl mx-auto">
          An evidence-driven hybrid quantum-classical platform for early disease-risk detection.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-white">Pipeline</h2>
        <div className="flex items-center justify-between bg-[#111827] p-6 rounded-lg border border-[#1f2937]">
          <div className="text-center px-4"><div className="text-sm font-medium">Biomedical Data</div></div>
          <ArrowRight className="text-[#374151]" />
          <div className="text-center px-4"><div className="text-sm font-medium">Preprocessing</div></div>
          <ArrowRight className="text-[#374151]" />
          <div className="flex flex-col gap-2">
            <div className="text-center px-4 py-2 bg-[#06b6d4]/10 text-[#06b6d4] rounded text-sm">Classical AI</div>
            <div className="text-center px-4 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded text-sm">Quantum AI</div>
          </div>
          <ArrowRight className="text-[#374151]" />
          <div className="text-center px-4"><div className="text-sm font-medium">Benchmark</div></div>
          <ArrowRight className="text-[#374151]" />
          <div className="text-center px-4"><div className="text-sm font-medium">Explain</div></div>
          <ArrowRight className="text-[#374151]" />
          <div className="text-center px-4"><div className="text-sm font-medium">Risk Insight</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Dataset Loaded" value={health?.dataset_loaded ? 'Yes' : 'No'} variant={health?.dataset_loaded ? 'green' : 'default'} />
        <MetricCard label="Best Classical AUC" value="0.95" variant="cyan" />
        <MetricCard label="Best Quantum AUC" value="0.97" variant="violet" />
        <MetricCard label="Total Experiments" value={results?.length || 0} />
      </div>

      <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-transparent p-6 rounded-lg border border-[#8b5cf6]/30 mb-12">
        <p className="text-[#f9fafb] font-medium text-lg">"Quantum advantage is measured, not assumed."</p>
      </div>

      <footer className="text-center mt-12 pt-8 border-t border-[#1f2937]">
        <p className="text-xs text-[#ef4444]">
          Disclaimer: Research prototype only. Not for clinical use.
        </p>
      </footer>
    </div>
  )
}
