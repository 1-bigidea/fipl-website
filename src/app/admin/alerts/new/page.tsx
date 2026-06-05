import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AlertForm from '../AlertForm'

export default function NewAlertPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/alerts"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Site Alerts
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Publish New Alert</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Active alerts appear as a dismissible banner at the top of every public page.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <AlertForm />
      </div>
    </div>
  )
}
