import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function MetricCard({
  label,
  value,
  tone,
  icon,
  subtitle,
}: {
  label: string
  value: string
  tone: string
  icon: ReactNode
  subtitle?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`rounded-md p-3 ${tone}`}>{icon}</div>
      </div>
    </motion.div>
  )
}
