'use client'

import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  reviewed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shortlisted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export default function ApplicationStatusSelect({
  id,
  initialStatus,
}: {
  id: string
  initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setSaving(true)
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setStatus(next)
    setSaving(false)
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs font-semibold px-2.5 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DB1B0C]/20 disabled:opacity-60 ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
