'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/AdminToast'

export default function TestimonialActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [toggling, setToggling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function toggleActive() {
    setToggling(true)
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    if (res.ok) {
      toast(isActive ? 'Testimonial hidden' : 'Testimonial shown')
      router.refresh()
    } else {
      toast('Failed to update', 'error')
    }
    setToggling(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast('Testimonial deleted')
      router.refresh()
    } else {
      toast('Failed to delete', 'error')
      setDeleting(false)
    }
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
          disabled={deleting}
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
        onClick={toggleActive}
        disabled={toggling}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {toggling ? '…' : isActive ? 'Hide' : 'Show'}
      </button>
      <Link
        href={`/admin/testimonials/${id}/edit`}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors"
      >
        Delete
      </button>
    </div>
  )
}
