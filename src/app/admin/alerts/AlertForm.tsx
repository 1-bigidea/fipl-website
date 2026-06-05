'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/AdminToast'

type AlertType = 'info' | 'warning' | 'critical'

export default function AlertForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as AlertType })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast('Alert published')
      router.push('/admin/alerts')
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Failed to publish alert')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'
  const hintCls = 'text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title</label>
          <p className={hintCls}>Short headline shown in bold on the banner</p>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            placeholder="e.g. Scheduled Maintenance"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <p className={hintCls}>Sets the banner colour and icon</p>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AlertType }))}
            className={inputCls}
          >
            <option value="info">Info (blue)</option>
            <option value="warning">Warning (orange)</option>
            <option value="critical">Critical (red)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Message</label>
        <p className={hintCls}>The detail shown next to the title</p>
        <textarea
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          required
          rows={3}
          placeholder="e.g. Afam plant will undergo routine maintenance on 15 June from 08:00–14:00."
          className={inputCls}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#DB1B0C] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#b81508] transition-colors disabled:opacity-60"
        >
          {saving ? 'Publishing…' : 'Publish Alert'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/alerts')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
