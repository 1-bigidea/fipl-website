'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const inputCls =
  'w-full border border-[var(--fipl-border)] rounded-lg px-4 py-3 text-sm bg-[var(--fipl-bg)] text-[var(--fipl-heading)] placeholder:text-[var(--fipl-body)] focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10'
const labelCls = 'block text-xs font-semibold text-[var(--fipl-heading)] mb-1.5'

export default function ApplicationForm({
  jobId,
  jobTitle,
}: {
  jobId: string
  jobTitle: string
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!cvFile) {
      setErrorMsg('Please attach your CV as a PDF file.')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    fd.set('jobId', jobId)
    fd.set('jobTitle', jobTitle)
    fd.set('cv', cvFile)

    const res = await fetch('/api/apply', { method: 'POST', body: fd })
    if (res.ok) {
      setStatus('done')
    } else {
      const json = await res.json().catch(() => ({}))
      setErrorMsg(json.error || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-green-600 dark:text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[var(--fipl-heading)] mb-2">Application Submitted</h2>
        <p className="text-sm text-[var(--fipl-body)] mb-6 max-w-sm mx-auto">
          Thank you for applying for <strong>{jobTitle}</strong>. We will review your application
          and get back to you if there is a match.
        </p>
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#DB1B0C] hover:underline"
        >
          ← Back to Careers
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls} htmlFor="firstName">
            First Name <span className="text-[#DB1B0C]">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="lastName">
            Last Name <span className="text-[#DB1B0C]">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls} htmlFor="email">
            Email Address <span className="text-[#DB1B0C]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">
            Phone Number <span className="text-[#DB1B0C]">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls} htmlFor="coverLetter">
          Cover Letter <span className="text-[var(--fipl-body)] font-normal">(optional)</span>
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={5}
          placeholder="Tell us why you're a great fit for this role…"
          className={`${inputCls} resize-vertical`}
        />
      </div>

      <div className="mb-6">
        <label className={labelCls} htmlFor="cv">
          CV / Resume <span className="text-[#DB1B0C]">*</span>
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors text-center ${
            cvFile
              ? 'border-[#DB1B0C]/40 bg-[#DB1B0C]/5'
              : 'border-[var(--fipl-border)] hover:border-[#DB1B0C]/50 bg-[var(--fipl-bg)]'
          }`}
        >
          <input
            ref={fileRef}
            id="cv"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setCvFile(file)
              setErrorMsg('')
            }}
          />
          {cvFile ? (
            <div className="flex items-center justify-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[#DB1B0C] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <span className="font-medium text-[var(--fipl-heading)] truncate max-w-[240px]">
                {cvFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCvFile(null)
                  if (fileRef.current) fileRef.current.value = ''
                }}
                className="text-[var(--fipl-body)] hover:text-red-500 transition-colors ml-1 shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div>
              <svg
                className="w-8 h-8 text-[var(--fipl-body)] mx-auto mb-2 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-sm text-[var(--fipl-body)]">
                <span className="font-semibold text-[#DB1B0C]">Click to upload</span> your CV
              </p>
              <p className="text-xs text-[var(--fipl-body)] mt-1 opacity-70">PDF only · max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {(status === 'error' || errorMsg) && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-60 hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #DB1B0C 0%, #D97300 100%)' }}
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Application ↗'}
      </button>
    </form>
  )
}
