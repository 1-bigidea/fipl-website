import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ArticleForm from '../ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          News Articles
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Article</h1>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <ArticleForm />
      </div>
    </div>
  )
}
