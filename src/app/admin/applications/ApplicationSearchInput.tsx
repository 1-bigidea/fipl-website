'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface Props {
  defaultValue: string
  status: string
}

export default function ApplicationSearchInput({ defaultValue, status }: Props) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearTimeout(timerRef.current)
    const q = e.target.value
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      router.push(`/admin/applications${params.size ? `?${params}` : ''}`)
    }, 350)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input
        key={`${defaultValue}-${status}`}
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Search applicants or roles…"
        className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#DB1B0C] focus:ring-2 focus:ring-[#DB1B0C]/10 w-56"
      />
    </div>
  )
}
