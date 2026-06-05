'use client'

import { Mail, FileText } from 'lucide-react'

type FeedItem = {
  id: string
  type: 'submission' | 'application'
  name: string
  detail: string
  status?: string
  createdAt: string
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
  reviewed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  shortlisted: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
  rejected: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function DashboardActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No recent activity</div>
  }

  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
      {items.map((item) => {
        const Icon = item.type === 'submission' ? Mail : FileText
        return (
          <div key={item.id} className="flex items-center gap-3 py-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                item.type === 'submission'
                  ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-1.5">{item.detail}</span>
            </div>
            {item.status && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${
                  STATUS_STYLE[item.status] ?? ''
                }`}
              >
                {item.status}
              </span>
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-600 shrink-0 tabular-nums">
              {timeAgo(item.createdAt)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
