'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { JobRow } from '@/lib/database.types'

const RichTextEditor = dynamic(() => import('../RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-48 bg-gray-50 dark:bg-gray-800/40 animate-pulse" />
  ),
})

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'] as const

interface Props {
  job?: JobRow
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

export default function JobForm({ job }: Props) {
  const router = useRouter()
  const isEdit = !!job

  const [form, setForm] = useState({
    title: job?.title ?? '',
    department: job?.department ?? '',
    location: job?.location ?? 'Port Harcourt, Rivers State',
    type: job?.type ?? 'Full Time',
    description: job?.description ?? '',
    requirements: job?.requirements ?? '',
    posted_date: job?.posted_date ?? new Date().toISOString().split('T')[0],
    is_active: job?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = isEdit ? `/api/admin/jobs/${job!.id}` : '/api/admin/jobs'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/admin/jobs')
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error || 'Failed to save')
    }
    setSaving(false)
  }

  const inputCls =
    'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'
  const hintCls = 'text-[11px] text-gray-400 dark:text-gray-500 mt-1'

  const descWords = wordCount(form.description)
  const reqWords = wordCount(form.requirements)

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <label className={labelCls}>Job Title</label>
            <p className={`${hintCls} mb-1.5`}>The position name shown on the careers page</p>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Senior Electrical Engineer"
              className={`${inputCls} text-base font-medium`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>Job Description</label>
              {descWords > 0 && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  {descWords.toLocaleString()} words
                </span>
              )}
            </div>
            <p className={`${hintCls} mb-2`}>
              Describe the role, key responsibilities, and what a typical day looks like. Use
              headings and bullet points to keep it easy to read.
            </p>
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
              placeholder="Describe the role and what the person will be doing day-to-day…"
              minHeight={240}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>Requirements</label>
              {reqWords > 0 && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  {reqWords.toLocaleString()} words
                </span>
              )}
            </div>
            <p className={`${hintCls} mb-2`}>
              List the qualifications, experience, and skills needed. A bullet list works best here
              — one requirement per line.
            </p>
            <RichTextEditor
              value={form.requirements}
              onChange={(html) => setForm((prev) => ({ ...prev, requirements: html }))}
              placeholder="• Bachelor's degree in Electrical Engineering or related field&#10;• Minimum 5 years experience in power generation…"
              minHeight={200}
            />
          </div>
        </div>

        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3">
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#DB1B0C] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#b81508] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Details
            </p>

            <div>
              <label className={labelCls}>Department</label>
              <p className={`${hintCls} mb-1.5`}>The team or division this role belongs to</p>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="e.g. Engineering, Finance, Operations"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Location</label>
              <p className={`${hintCls} mb-1.5`}>Where the role is based</p>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Port Harcourt, Rivers State"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Employment Type</label>
              <p className={`${hintCls} mb-1.5`}>The nature of the engagement</p>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                {JOB_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Posted Date</label>
              <p className={`${hintCls} mb-1.5`}>The date this role was opened</p>
              <input
                name="posted_date"
                type="date"
                value={form.posted_date}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Visibility
            </p>
            <label className="flex items-center justify-between cursor-pointer select-none">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {form.is_active ? 'Active' : 'Closed'}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {form.is_active ? 'Visible on careers page' : 'Hidden from careers page'}
                </p>
              </div>
              <div className="relative ml-3 shrink-0">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-green-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
