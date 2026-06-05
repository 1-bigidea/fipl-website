import { createServerClient } from '@/lib/supabase-server'
import type { ContactSubmissionRow } from '@/lib/database.types'
import { Suspense } from 'react'
import AdminPagination from '@/components/AdminPagination'
import SubmissionCard from './SubmissionCard'
import SubmissionSearchInput from './SubmissionSearchInput'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 15

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const q = searchParams.q ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServerClient()
  let query = supabase.from('contact_submissions').select('*', { count: 'exact' })
  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`,
    )
  }
  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

  const submissions = (data ?? []) as ContactSubmissionRow[]
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const paginationBase = `/admin/submissions${q ? `?q=${encodeURIComponent(q)}` : ''}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Submissions</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
            {totalCount} submission{totalCount !== 1 ? 's' : ''}
            {q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Suspense fallback={null}>
          <SubmissionSearchInput defaultValue={q} />
        </Suspense>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
          {q ? `No submissions matching "${q}".` : 'No submissions yet.'}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} s={s} />
            ))}
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
