import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  variant?: 'cyan' | 'violet' | 'green' | 'red' | 'default'
  trend?: string
  icon?: ReactNode
}

const variantColors = {
  cyan: 'text-[#06b6d4]',
  violet: 'text-[#8b5cf6]',
  green: 'text-[#10b981]',
  red: 'text-[#ef4444]',
  default: 'text-white'
}

export default function MetricCard({ label, value, unit, variant = 'default', trend, icon }: MetricCardProps) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-lg flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-[#9ca3af]">{label}</h3>
        {icon && <div className="text-[#9ca3af]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl font-bold ${variantColors[variant]}`}>{value}</span>
        {unit && <span className="text-sm text-[#9ca3af]">{unit}</span>}
      </div>
      {trend && (
        <p className="text-xs text-[#9ca3af] mt-1">{trend}</p>
      )}
    </div>
  )
}
