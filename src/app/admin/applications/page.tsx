import { createServerClient } from '@/lib/supabase-server'
import type { JobApplicationRow } from '@/lib/database.types'
import AdminPagination from '@/components/AdminPagination'
import ApplicationStatusSelect from './ApplicationStatusSelect'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  reviewed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shortlisted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const statusFilter = searchParams.status || ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServerClient()
  let query = supabase
    .from('job_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, count } = await query
  const applications = (data ?? []) as JobApplicationRow[]
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const statusCounts = await (async () => {
    const supabase2 = createServerClient()
    const [pending, reviewed, shortlisted, rejected] = await Promise.all([
      supabase2.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase2.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'reviewed'),
      supabase2.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
      supabase2.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    ])
    return {
      pending: pending.count ?? 0,
      reviewed: reviewed.count ?? 0,
      shortlisted: shortlisted.count ?? 0,
      rejected: rejected.count ?? 0,
    }
  })()

  const filters = [
    { label: 'All', value: '', count: Object.values(statusCounts).reduce((a, b) => a + b, 0) },
    { label: 'Pending', value: 'pending', count: statusCounts.pending },
    { label: 'Reviewed', value: 'reviewed', count: statusCounts.reviewed },
    { label: 'Shortlisted', value: 'shortlisted', count: statusCounts.shortlisted },
    { label: 'Rejected', value: 'rejected', count: statusCounts.rejected },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Applications</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => {
          const active = statusFilter === f.value
          return (
            <a
              key={f.value}
              href={f.value ? `/admin/applications?status=${f.value}` : '/admin/applications'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#DB1B0C] text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {f.label}
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {f.count}
              </span>
            </a>
          )
        })}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
          No applications found.
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide text-right">
                    CV
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {app.first_name} {app.last_name}
                      </div>
                      <a
                        href={`mailto:${app.email}`}
                        className="text-xs text-[#DB1B0C] hover:underline"
                      >
                        {app.email}
                      </a>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {app.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                        {app.job_title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusSelect id={app.id} initialStatus={app.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={app.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#DB1B0C] hover:underline"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        CV
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.some((a) => a.cover_letter) && (
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Cover Letters
              </h2>
              {applications
                .filter((a) => a.cover_letter)
                .map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {app.first_name} {app.last_name}
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">·</span>
                      <span className="text-xs text-[#DB1B0C]">{app.job_title}</span>
                      <span
                        className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded ${STATUS_BADGE[app.status] ?? STATUS_BADGE.pending}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {app.cover_letter}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            basePath={statusFilter ? `/admin/applications?status=${statusFilter}` : '/admin/applications'}
          />
        </>
      )}
    </div>
  )
}
