'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JobActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function toggleStatus() {
    setToggling(true)
    await fetch(`/api/admin/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    router.refresh()
    setToggling(false)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })
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

  if (deleteError) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-red-500 dark:text-red-400">{deleteError}</span>
        <button
          onClick={() => { setDeleteError(''); setConfirming(false) }}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={toggleStatus}
        disabled={toggling}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {toggling ? '…' : isActive ? 'Close' : 'Reopen'}
      </button>
      <Link
        href={`/admin/jobs/${id}/edit`}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Delete
      </button>
    </div>
  )
}
