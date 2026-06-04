import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import type { JobRow } from '@/lib/database.types'
import ApplicationForm from './ApplicationForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { jobId: string }
}): Promise<Metadata> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('jobs')
    .select('title')
    .eq('id', params.jobId)
    .eq('is_active', true)
    .single()

  return { title: data ? `Apply — ${data.title}` : 'Apply' }
}

export default async function ApplyPage({ params }: { params: { jobId: string } }) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.jobId)
    .eq('is_active', true)
    .single()

  if (!data) notFound()

  const job = data as JobRow

  return (
    <div className="min-h-screen bg-[var(--fipl-bg)]">
      <div className="h-[72px]" aria-hidden="true" />

      <div className="bg-[var(--fipl-surface)] border-b border-[var(--fipl-border)]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--fipl-body)] hover:text-[#DB1B0C] transition-colors mb-6"
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
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Careers
          </Link>

          <span className="inline-flex items-center gap-1.5 text-sm text-[#DB1B0C] mb-3">
            Job Application{' '}
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7.5 0.5L1 7.5h5L4.5 12.5l7.5-8h-5z" />
            </svg>
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fipl-heading)] mb-2">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--fipl-body)]">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-[#DB1B0C]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
              {job.department}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--fipl-border)]" />
            <span>{job.location}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--fipl-border)]" />
            <span>{job.type}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-[var(--fipl-card)] border border-[var(--fipl-border)] rounded-2xl p-6 md:p-8">
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>

        <p className="text-xs text-[var(--fipl-body)] text-center mt-6">
          Your personal data will be processed in accordance with our privacy policy and used solely
          for recruitment purposes.
        </p>
      </div>
    </div>
  )
}
