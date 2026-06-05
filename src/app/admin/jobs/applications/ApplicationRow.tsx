'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, ChevronDown, ChevronUp, FileText, X } from 'lucide-react'
import type { JobApplicationRow } from '@/lib/database.types'
import ApplicationStatusSelect from './ApplicationStatusSelect'
import { useToast } from '@/components/AdminToast'

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
  reviewed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  shortlisted: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  rejected: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export default function ApplicationRow({ app }: { app: JobApplicationRow }) {
  const router = useRouter()
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [cvOpen, setCvOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!cvOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCvOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [cvOpen])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDeleteError(json.error || `Failed (${res.status})`)
        setDeleting(false)
        return
      }
      toast('Application deleted')
      window.location.href = '/admin/jobs/applications'
    } catch {
      setDeleteError('Network error')
    }
    setDeleting(false)
  }

  return (
    <>
      <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors last:border-0">
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {app.first_name} {app.last_name}
          </div>
          <a href={`mailto:${app.email}`} className="text-xs text-[#DB1B0C] hover:underline">
            {app.email}
          </a>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{app.phone}</div>
        </td>

        <td className="px-4 py-3">
          <div className="font-medium text-gray-700 dark:text-gray-200 text-sm">
            {app.job_title}
          </div>
        </td>

        <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap hidden md:table-cell">
          {new Date(app.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </td>

        <td className="px-4 py-3">
          <ApplicationStatusSelect id={app.id} initialStatus={app.status} />
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setCvOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#DB1B0C] hover:underline whitespace-nowrap"
            >
              <FileText className="w-3 h-3" />
              CV
            </button>

            {app.cover_letter && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                Letter
              </button>
            )}

            {deleteError ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-500 dark:text-red-400">{deleteError}</span>
                <button onClick={() => { setDeleteError(''); setConfirming(false) }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>
            ) : confirming ? (
              <div className="flex items-center gap-1">
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
                className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {cvOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-8"
              onClick={() => setCvOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={`CV — ${app.first_name} ${app.last_name}`}
            >
              <div
                className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {app.first_name} {app.last_name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {app.job_title} · CV
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={app.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#DB1B0C] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in new tab
                    </a>
                    <button
                      type="button"
                      onClick={() => setCvOpen(false)}
                      aria-label="Close"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <iframe
                  src={app.cv_url}
                  title={`CV — ${app.first_name} ${app.last_name}`}
                  className="w-full flex-1 bg-gray-100 dark:bg-gray-800"
                />
              </div>
            </div>
          )}
        </td>
      </tr>

      {expanded && app.cover_letter && (
        <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <td colSpan={5} className="px-4 pb-4 pt-2">
            <div className="flex items-start gap-2 mb-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                  STATUS_BADGE[app.status] ?? STATUS_BADGE.pending
                }`}
              >
                {app.status}
              </span>
              <span className="text-xs text-gray-400">
                Cover letter — {app.first_name} {app.last_name}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {app.cover_letter}
            </p>
          </td>
        </tr>
      )}
    </>
  )
}
