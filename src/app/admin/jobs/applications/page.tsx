import { createServerClient } from '@/lib/supabase-server'
import type { JobApplicationRow } from '@/lib/database.types'
import Link from 'next/link'
import { Suspense } from 'react'
import AdminPagination from '@/components/AdminPagination'
import ApplicationRow from './ApplicationRow'
import ApplicationSearchInput from './ApplicationSearchInput'
import JobsTabNav from '../JobsTabNav'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Rejected', value: 'rejected' },
] as const

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; q?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const statusFilter = searchParams.status ?? ''
  const q = searchParams.q ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServerClient()
  let query = supabase.from('job_applications').select('*', { count: 'exact' })
  if (statusFilter) query = query.eq('status', statusFilter)
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,job_title.ilike.%${q}%`)
  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

  const applications = (data ?? []) as JobApplicationRow[]
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const [pendingRes, reviewedRes, shortlistedRes, rejectedRes] = await Promise.all([
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'reviewed'),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])
  const statusCounts = {
    '': (pendingRes.count ?? 0) + (reviewedRes.count ?? 0) + (shortlistedRes.count ?? 0) + (rejectedRes.count ?? 0),
    pending: pendingRes.count ?? 0,
    reviewed: reviewedRes.count ?? 0,
    shortlisted: shortlistedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  }

  const filterParams = new URLSearchParams()
  if (statusFilter) filterParams.set('status', statusFilter)
  if (q) filterParams.set('q', q)
  const paginationBase = `/admin/jobs/applications${filterParams.size ? `?${filterParams}` : ''}`

  return (
    <div className="space-y-5">
      <JobsTabNav />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {totalCount} application{totalCount !== 1 ? 's' : ''}
            {statusFilter ? ` · ${statusFilter}` : ''}
            {q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Suspense fallback={null}>
          <ApplicationSearchInput defaultValue={q} status={statusFilter} />
        </Suspense>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {STATUS_FILTERS.map(({ label, value }) => {
          const href = (() => {
            const p = new URLSearchParams()
            if (value) p.set('status', value)
            if (q) p.set('q', q)
            return `/admin/jobs/applications${p.size ? `?${p}` : ''}`
          })()
          const active = statusFilter === value
          const cnt = statusCounts[value as keyof typeof statusCounts] ?? 0
          return (
            <Link
              key={value}
              href={href}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label}
              <span
                className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold px-1 ${
                  active
                    ? 'bg-white/20 dark:bg-gray-900/20 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {cnt}
              </span>
            </Link>
          )
        })}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
          {q || statusFilter ? 'No applications match your filters.' : 'No applications yet.'}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Applicant
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Position
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            basePath={paginationBase}
          />
        </>
      )}
    </div>
  )
}
