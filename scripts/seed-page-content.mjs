import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const pages = [
  {
    page: 'home',
    content: {
      hero: {
        slides: [
          {
            type: 'image',
            src: '/images/hero/FIPL6318.jpg',
            poster: '',
            line1: 'Our People',
            line2: 'Power the Nation',
          },
          {
            type: 'image',
            src: '/images/hero/FIPL6305.jpg',
            poster: '',
            line1: 'Engineering',
            line2: "Nigeria's Energy Future",
          },
          {
            type: 'video',
            src: '/videos/hero.mp4',
            poster: '/images/home/backgroundimage.png',
            line1: 'Committed to',
            line2: 'Efficient and Sustainable Power Generation',
          },
        ],
        overlay: {
          title: 'Our Power Plants,\nOur Impact',
          body: "FIPL operates four world-class thermal power plants – Omoku, Afam, Trans-Amadi, and Eleme – generating electricity that supports Nigeria's industrial and economic growth.",
          imageLeft: '/images/home/leftheroimage.png',
          imageRight: '/images/home/rightsideimage.png',
        },
      },
    },
  },
]

console.log(`Upserting ${pages.length} page content row(s)…`)

const { data, error } = await supabase
  .from('page_content')
  .upsert(pages, { onConflict: 'page' })
  .select('page')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${data.length} row(s) upserted:\n`)
data.forEach((p) => console.log(`  ✓ ${p.page}`))
