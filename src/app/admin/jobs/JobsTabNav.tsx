'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function JobsTabNav() {
  const pathname = usePathname()
  const isApps = pathname.startsWith('/admin/jobs/applications')

  const tabCls = (active: boolean) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
      active
        ? 'border-[#DB1B0C] text-[#DB1B0C]'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
    }`

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 mb-5">
      <Link href="/admin/jobs" className={tabCls(!isApps)}>
        Job Listings
      </Link>
      <Link href="/admin/jobs/applications" className={tabCls(isApps)}>
        Applications
      </Link>
    </div>
  )
}
