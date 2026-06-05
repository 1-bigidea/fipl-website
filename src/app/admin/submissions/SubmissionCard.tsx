'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import type { ContactSubmissionRow } from '@/lib/database.types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SubmissionCard({ s }: { s: ContactSubmissionRow }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDeleteError(json.error || `Failed (${res.status})`)
        setDeleting(false)
        return
      }
      router.refresh()
      setDeleting(false)
      setConfirming(false)
    } catch {
      setDeleteError('Network error')
      setDeleting(false)
    }
  }

  const initials = `${s.first_name[0] ?? ''}${s.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#DB1B0C]/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-[#DB1B0C]">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {s.first_name} {s.last_name}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <a
                  href={`mailto:${s.email}`}
                  className="text-xs text-[#DB1B0C] hover:underline"
                >
                  {s.email}
                </a>
                {s.subject && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">·</span>
                    <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
                      {s.subject}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap hidden sm:block">
                {formatDate(s.created_at)}
              </span>
              {deleteError ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-500 dark:text-red-400">{deleteError}</span>
                  <button onClick={() => { setDeleteError(''); setConfirming(false) }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Dismiss</button>
                </div>
              ) : confirming ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                  >
                    {deleting ? '…' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="text-xs font-medium text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {s.message}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
            <a
              href={`mailto:${s.email}${s.subject ? `?subject=Re: ${encodeURIComponent(s.subject)}` : ''}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#DB1B0C] dark:hover:text-[#DB1B0C] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Reply
            </a>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums sm:hidden">
              {formatDate(s.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
