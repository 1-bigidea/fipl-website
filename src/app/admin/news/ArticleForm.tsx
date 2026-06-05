'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, RotateCcw } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { NewsArticleRow } from '@/lib/database.types'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-64 bg-gray-50 dark:bg-gray-800/40 animate-pulse" />
  ),
})

const CATEGORIES = ['Operations', 'Community', 'Corporate', 'Partnerships', 'Updates'] as const

interface Props {
  article?: NewsArticleRow
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function formatDisplayDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function estimateReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

function wordCount(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

export default function ArticleForm({ article }: Props) {
  const router = useRouter()
  const isEdit = !!article

  const [form, setForm] = useState({
    slug: article?.slug ?? '',
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    date: article?.date ?? '',
    date_iso: article?.date_iso ?? '',
    category: article?.category ?? 'Operations',
    read_time: article?.read_time ?? '',
    image_url: article?.image_url ?? '',
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(article?.image_url ?? '')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'title' && !slugManuallyEdited) {
        next.slug = slugify(value)
      }
      if (name === 'date_iso' && value) {
        next.date = formatDisplayDate(value)
      }
      return next
    })
  }

  function handleContentChange(html: string) {
    setForm((prev) => ({
      ...prev,
      content: html,
      read_time: estimateReadTime(html),
    }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: e.target.value }))
  }

  function resetSlug() {
    setSlugManuallyEdited(false)
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
  }

  function processImageFile(file: File) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setForm((prev) => ({ ...prev, image_url: '' }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) processImageFile(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview('')
    setForm((prev) => ({ ...prev, image_url: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let image_url = form.image_url

    if (imageFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', imageFile)
      fd.append('bucket', 'news-images')
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      setUploading(false)
      if (!uploadRes.ok) {
        setError('Image upload failed')
        setSaving(false)
        return
      }
      const { url } = await uploadRes.json()
      image_url = url
    }

    const payload = { ...form, image_url }
    const url = isEdit ? `/api/admin/news/${article!.id}` : '/api/admin/news'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/news')
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

  const words = wordCount(form.content)

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <label className={labelCls}>Title</label>
            <p className={hintCls + ' mb-1.5'}>The main headline shown at the top of the article</p>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. FIPL Achieves Record Generation Output in Q1 2024"
              className={`${inputCls} text-base font-medium`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>Slug</label>
              {slugManuallyEdited && (
                <button
                  type="button"
                  onClick={resetSlug}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#DB1B0C] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Auto-generate
                </button>
              )}
            </div>
            <p className={hintCls + ' mb-1.5'}>The URL-friendly version of the title — auto-generated, edit only if needed</p>
            <input
              name="slug"
              value={form.slug}
              onChange={handleSlugChange}
              required
              className={`${inputCls} font-mono text-xs`}
            />
            {form.slug && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                fipl.ng/news/<span className="text-gray-600 dark:text-gray-400">{form.slug}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>Content</label>
              {words > 0 && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  {words.toLocaleString()} words · {estimateReadTime(form.content)}
                </span>
              )}
            </div>
            <p className={hintCls + ' mb-2'}>
              Write the full article here. Use the toolbar to add headings, bold text, bullet points, and more.
            </p>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>

          <div>
            <label className={labelCls}>Excerpt</label>
            <p className={hintCls + ' mb-1.5'}>
              A short summary (2–3 sentences) shown on the news listing page and in search results
            </p>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
              required
              placeholder="e.g. FIPL has announced a landmark achievement in power generation, recording its highest quarterly output to date across all three plants."
              className={`${inputCls} resize-none`}
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
              {uploading
                ? 'Uploading…'
                : saving
                  ? 'Saving…'
                  : isEdit
                    ? 'Save Changes'
                    : 'Publish Article'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/news')}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Details
            </p>

            <div>
              <label className={labelCls}>Category</label>
              <p className={hintCls + ' mb-1.5'}>The section this article belongs to</p>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Publish Date</label>
              <p className={hintCls + ' mb-1.5'}>The date shown on the article</p>
              <input
                name="date_iso"
                type="date"
                value={form.date_iso}
                onChange={handleChange}
                required
                className={inputCls}
              />
              {form.date && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{form.date}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>Read Time</label>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">auto</span>
              </div>
              <p className={hintCls + ' mb-1.5'}>Calculated from word count — edit to override</p>
              <input
                name="read_time"
                value={form.read_time}
                onChange={handleChange}
                placeholder="5 min read"
                className={inputCls}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Cover Image
            </p>
            <p className={hintCls}>The main image shown at the top of the article and in listings</p>

            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="" className="w-full h-36 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-900/60 hover:bg-gray-900/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-[#DB1B0C] bg-[#DB1B0C]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Drop image or click to upload
                </span>
              </label>
            )}

            {!imageFile && (
              <div>
                <label className={labelCls}>Or paste URL</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
