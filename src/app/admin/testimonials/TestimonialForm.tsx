'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TestimonialRow } from '@/lib/database.types'
import { useToast } from '@/components/AdminToast'

interface Props {
  testimonial?: TestimonialRow
}

export default function TestimonialForm({ testimonial }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = !!testimonial

  const [form, setForm] = useState({
    quote: testimonial?.quote ?? '',
    name: testimonial?.name ?? '',
    role: testimonial?.role ?? '',
    is_active: testimonial?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = isEdit ? `/api/admin/testimonials/${testimonial!.id}` : '/api/admin/testimonials'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast(isEdit ? 'Testimonial updated' : 'Testimonial added')
      router.push('/admin/testimonials')
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Failed to save')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'
  const hintCls = 'text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Quote</label>
        <p className={hintCls}>The testimonial text, in the stakeholder&apos;s own words</p>
        <textarea
          value={form.quote}
          onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
          required
          rows={4}
          placeholder="e.g. FIPL's commitment to reliable power generation has been transformational…"
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name</label>
          <p className={hintCls}>Who gave this testimonial</p>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            placeholder="e.g. Chukwudi O."
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Role / Organisation</label>
          <p className={hintCls}>Their title or company</p>
          <input
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            required
            placeholder="e.g. Director, Lagos Industries Ltd"
            className={inputCls}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {form.is_active ? 'Active' : 'Hidden'}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {form.is_active ? 'Shown on the About page' : 'Hidden from the About page'}
            </p>
          </div>
          <div className="relative ml-3 shrink-0">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-green-500 rounded-full transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
        </label>
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Testimonial'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/testimonials')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
