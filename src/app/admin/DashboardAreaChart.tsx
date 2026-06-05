'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  data: { month: string; articles: number }[]
}

export default function DashboardAreaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DB1B0C" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#DB1B0C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#1f2937',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            color: '#f9fafb',
          }}
          cursor={{ stroke: 'rgba(156,163,175,0.2)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="articles"
          name="Articles"
          stroke="#DB1B0C"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ r: 3, fill: '#DB1B0C', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#DB1B0C', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
