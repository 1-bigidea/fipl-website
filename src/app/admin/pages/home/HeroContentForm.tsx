'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import type { HomeHeroContent, HeroSlideContent } from '@/lib/database.types'
import { useToast } from '@/components/AdminToast'

interface Props {
  hero: HomeHeroContent
}

const inputCls =
  'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'
const hintCls = 'text-[11px] text-gray-400 dark:text-gray-500 mt-1'
const cardCls =
  'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4'

function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'page-content')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    setUploading(false)
    if (!res.ok) {
      setError('Upload failed')
      return
    }
    const { url } = await res.json()
    onChange(url)
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <p className={hintCls + ' mb-1.5'}>{hint}</p>
      {value ? (
        <div className="relative mb-2">
          <img src={value} alt="" className="w-full h-32 object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-900/60 hover:bg-gray-900/80 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 mb-2 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {uploading ? 'Uploading…' : 'Click to upload'}
          </span>
        </label>
      )}
      {error && <p className="text-[11px] text-red-500 mb-1.5">{error}</p>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL"
        className={`${inputCls} text-xs`}
      />
    </div>
  )
}

export default function HeroContentForm({ hero }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<HomeHeroContent>(hero)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateSlide(index: number, patch: Partial<HeroSlideContent>) {
    setForm((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  function updateOverlay(patch: Partial<HomeHeroContent['overlay']>) {
    setForm((prev) => ({ ...prev, overlay: { ...prev.overlay, ...patch } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/pages/home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { hero: form } }),
    })

    setSaving(false)
    if (res.ok) {
      toast('Home page hero updated')
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Slideshow
        </p>
        {form.slides.map((slide, i) => (
          <div key={i} className={cardCls}>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Slide {i + 1}</p>

            <div>
              <label className={labelCls}>Media Type</label>
              <select
                value={slide.type}
                onChange={(e) =>
                  updateSlide(i, { type: e.target.value as HeroSlideContent['type'] })
                }
                className={inputCls}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            {slide.type === 'image' ? (
              <ImageField
                label="Slide Image"
                hint="Full-bleed background image for this slide"
                value={slide.src}
                onChange={(url) => updateSlide(i, { src: url })}
              />
            ) : (
              <>
                <div>
                  <label className={labelCls}>Video URL</label>
                  <p className={hintCls + ' mb-1.5'}>
                    Path or URL to an .mp4 file — videos are pasted by URL, not uploaded here
                  </p>
                  <input
                    value={slide.src}
                    onChange={(e) => updateSlide(i, { src: e.target.value })}
                    placeholder="/videos/hero.mp4"
                    className={inputCls}
                  />
                </div>
                <ImageField
                  label="Poster Image"
                  hint="Shown while the video loads"
                  value={slide.poster}
                  onChange={(url) => updateSlide(i, { poster: url })}
                />
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Headline — Line 1</label>
                <input
                  value={slide.line1}
                  onChange={(e) => updateSlide(i, { line1: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Headline — Line 2</label>
                <input
                  value={slide.line2}
                  onChange={(e) => updateSlide(i, { line2: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Impact Card
        </p>
        <div className={cardCls}>
          <div>
            <label className={labelCls}>Title</label>
            <p className={hintCls + ' mb-1.5'}>
              Use a new line to control where the title wraps to a second line
            </p>
            <textarea
              value={form.overlay.title}
              onChange={(e) => updateOverlay({ title: e.target.value })}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Body</label>
            <textarea
              value={form.overlay.body}
              onChange={(e) => updateOverlay({ body: e.target.value })}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageField
              label="Left Background Image"
              hint="Shown on large screens, left of the impact card"
              value={form.overlay.imageLeft}
              onChange={(url) => updateOverlay({ imageLeft: url })}
            />
            <ImageField
              label="Right Background Image"
              hint="Shown on large screens, right of the impact card"
              value={form.overlay.imageRight}
              onChange={(url) => updateOverlay({ imageRight: url })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-[#DB1B0C] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#b81508] transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
