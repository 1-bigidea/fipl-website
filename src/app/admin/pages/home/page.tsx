import { createServerClient } from '@/lib/supabase-server'
import { defaultHomeHero } from '@/lib/page-content-defaults'
import type { HomeHeroContent, PageContentRow } from '@/lib/database.types'
import HeroContentForm from './HeroContentForm'

export const dynamic = 'force-dynamic'

export default async function AdminHomePagePage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('page_content')
    .select('*')
    .eq('page', 'home')
    .maybeSingle()

  const row = data as PageContentRow | null
  const hero: HomeHeroContent = row?.content?.hero ?? defaultHomeHero

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home Page — Hero</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Edit the hero slideshow and the impact card shown at the top of the home page
        </p>
      </div>
      <HeroContentForm hero={hero} />
    </div>
  )
}
