'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

type Segment = { name: string; value: number; color: string }

type Props = {
  segments: Segment[]
  total: number
}

export default function DashboardDonutChart({ segments, total }: Props) {
  const hasData = segments.some((s) => s.value > 0)
  const display = hasData
    ? segments.filter((s) => s.value > 0)
    : [{ name: 'No applications', value: 1, color: '#e5e7eb' }]

  return (
    <div className="relative" style={{ height: 170 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={display}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={76}
            paddingAngle={hasData && display.length > 1 ? 2 : 0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            {display.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          {hasData && (
            <Tooltip
              contentStyle={{
                background: '#1f2937',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                color: '#f9fafb',
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {total}
          </div>
          <div className="text-[11px] text-gray-400">total</div>
        </div>
      </div>
    </div>
  )
}
