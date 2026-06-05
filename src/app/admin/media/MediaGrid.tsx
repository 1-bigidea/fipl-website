'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FileText } from 'lucide-react'
import type { MediaKitRow } from '@/lib/database.types'
import { useToast } from '@/components/AdminToast'

const CATEGORY_COLOR: Record<string, string> = {
  'Our Plants': 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  People: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  Events: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  'FIPL Foundation': 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
}

function MediaCard({ item }: { item: MediaKitRow }) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isImageFile = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.file_url)
  const isPdf = /\.pdf$/i.test(item.file_url)
  const preview = item.thumbnail_url || (isImageFile ? item.file_url : null)

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDeleteError(json.error || `Failed (${res.status})`)
        setDeleting(false)
        return
      }
      toast('Media deleted')
      setConfirming(false)
      router.refresh()
    } catch {
      setDeleteError('Network error')
    }
    setDeleting(false)
  }

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all">
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
        {preview ? (
          <img src={preview} alt={item.title} className="w-full h-full object-cover" />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">PDF</span>
          </div>
        ) : (
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            File
          </div>
        )}
        <a
          href={item.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/20 transition-colors"
          title="Open file"
        />
      </div>

      <div className="p-3">
        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mb-1">
          {item.title}
        </div>
        <span
          className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            CATEGORY_COLOR[item.category] ??
            'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {item.category}
        </span>

        <div className="mt-2.5">
          {deleteError ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-red-500 dark:text-red-400 truncate">{deleteError}</span>
              <button onClick={() => { setDeleteError(''); setConfirming(false) }} className="text-[11px] text-gray-400 hover:text-gray-600 shrink-0 transition-colors">✕</button>
            </div>
          ) : confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
              >
                {deleting ? '…' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MediaGrid({ items }: { items: MediaKitRow[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
        No media uploaded yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
