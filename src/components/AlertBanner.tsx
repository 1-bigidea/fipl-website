'use client'

import { useEffect, useState } from 'react'

interface Alert {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'critical'
}

const TYPES = {
  info: {
    color: '#1a4e8a',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  warning: {
    color: '#D97300',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  critical: {
    color: '#DB1B0C',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
}

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('dismissed_alerts') ?? '[]')
      setDismissed(new Set(stored))
    } catch {}
    setReady(true)
  }, [])

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev).add(id)
      sessionStorage.setItem('dismissed_alerts', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const visible = alerts.filter((a) => !dismissed.has(a.id))
  if (!ready || visible.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 flex flex-col gap-2 pointer-events-none">
      {visible.map((alert) => {
        const t = TYPES[alert.type]
        return (
          <div
            key={alert.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[var(--fipl-bg)] border border-[var(--fipl-border)] shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-300"
            style={{ borderLeftWidth: '4px', borderLeftColor: t.color }}
          >
            <span className="shrink-0 mt-0.5" style={{ color: t.color }}>
              {t.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--fipl-heading)]">{alert.title}</p>
              <p className="text-xs text-[var(--fipl-body)] mt-0.5 leading-relaxed">
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              aria-label="Dismiss alert"
              className="shrink-0 -mr-1 -mt-1 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fipl-body)] hover:bg-[var(--fipl-surface)] hover:text-[var(--fipl-heading)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
