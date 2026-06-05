'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText } from 'lucide-react'

const CATEGORIES = ['Our Plants', 'People', 'Events', 'FIPL Foundation'] as const

function isImage(file: File | null): boolean {
  return file !== null && file.type.startsWith('image/')
}

function isPdf(file: File | null): boolean {
  return file !== null && file.type === 'application/pdf'
}

export default function MediaUploader() {
  const router = useRouter()
  const [resetKey, setResetKey] = useState(0)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [fileDrag, setFileDrag] = useState(false)
  const [thumbDrag, setThumbDrag] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function setMainFile(f: File) {
    setFile(f)
    setFilePreview(isImage(f) ? URL.createObjectURL(f) : null)
  }

  function setThumbFile(f: File) {
    setThumbnail(f)
    setThumbPreview(URL.createObjectURL(f))
  }

  function clearMain() {
    setFile(null)
    setFilePreview(null)
  }

  function clearThumb() {
    setThumbnail(null)
    setThumbPreview(null)
  }

  async function uploadFile(f: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', f)
    fd.append('bucket', 'media-kit-assets')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)
    setError('')
    try {
      const [file_url, thumbnail_url] = await Promise.all([
        uploadFile(file),
        thumbnail ? uploadFile(thumbnail) : Promise.resolve(null),
      ])
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, file_url, thumbnail_url }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setTitle('')
      setCategory(CATEGORIES[0])
      setFile(null)
      setFilePreview(null)
      setThumbnail(null)
      setThumbPreview(null)
      setResetKey((k) => k + 1)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
    setUploading(false)
  }

  const inputCls =
    'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5'

  return (
    <form key={resetKey} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <label className={labelCls}>File (image or PDF)</label>
          {file ? (
            <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/60">
              {filePreview ? (
                <img src={filePreview} alt="" className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-2">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 max-w-[80%] truncate text-center">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={clearMain}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 hover:bg-gray-900/80 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              {filePreview && (
                <div className="absolute bottom-2 left-2 bg-gray-900/60 rounded-md px-2 py-0.5">
                  <span className="text-[11px] text-white truncate max-w-[200px] block">
                    {file.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center gap-2 h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                fileDrag
                  ? 'border-[#DB1B0C] bg-[#DB1B0C]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setFileDrag(true)
              }}
              onDragLeave={() => setFileDrag(false)}
              onDrop={(e) => {
                e.preventDefault()
                setFileDrag(false)
                const f = e.dataTransfer.files?.[0]
                if (f) setMainFile(f)
              }}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setMainFile(f)
                }}
              />
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Drop file or click to upload
              </span>
              <span className="text-xs text-gray-400">Images or PDF</span>
            </label>
          )}
        </div>

        <div className="w-full lg:w-64 shrink-0 space-y-3.5">
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Q1 2024 Press Kit"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Thumbnail (optional)</label>
            {thumbPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={thumbPreview} alt="" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={clearThumb}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gray-900/60 hover:bg-gray-900/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-1.5 h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  thumbDrag
                    ? 'border-[#DB1B0C] bg-[#DB1B0C]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setThumbDrag(true)
                }}
                onDragLeave={() => setThumbDrag(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setThumbDrag(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && f.type.startsWith('image/')) setThumbFile(f)
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setThumbFile(f)
                  }}
                />
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Drop image or click
                </span>
              </label>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-[#DB1B0C] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#b81508] transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </form>
  )
}
