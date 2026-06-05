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

function img(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}.jpg`
}

function makeItem(title, category, seed) {
  return {
    title,
    category,
    file_url: img(seed, 1280, 960),
    thumbnail_url: img(seed, 600, 600),
  }
}

const items = [
  makeItem('Omoku Power Plant — Aerial View', 'Our Plants', 'fipl-omoku-aerial'),
  makeItem('Eleme Gas Turbine Hall', 'Our Plants', 'fipl-eleme-turbine'),
  makeItem('Trans-Amadi Control Room', 'Our Plants', 'fipl-transamadi-control'),
  makeItem('Switchyard at Dusk', 'Our Plants', 'fipl-switchyard-dusk'),

  makeItem('Engineering Team On Site', 'People', 'fipl-engineering-team'),
  makeItem('Operations Staff Portrait', 'People', 'fipl-operations-staff'),
  makeItem('Leadership at Annual Review', 'People', 'fipl-leadership-review'),

  makeItem('2025 Scholarship Award Ceremony', 'Events', 'fipl-scholarship-2025'),
  makeItem('Nigeria Energy Summit Booth', 'Events', 'fipl-energy-summit'),
  makeItem('Long Service Awards Night', 'Events', 'fipl-service-awards'),

  makeItem('Community Borehole Commissioning', 'FIPL Foundation', 'fipl-borehole'),
  makeItem('Primary Health Centre Handover', 'FIPL Foundation', 'fipl-health-centre'),
]

const { data: existing, error: readError } = await supabase
  .from('media_kits')
  .select('title')

if (readError) {
  console.error('Error reading existing media:', readError.message)
  process.exit(1)
}

const existingTitles = new Set((existing ?? []).map((r) => r.title))
const toInsert = items.filter((i) => !existingTitles.has(i.title))

if (toInsert.length === 0) {
  console.log('All media items already exist — nothing to insert.')
  process.exit(0)
}

console.log(`Inserting ${toInsert.length} media item(s)…`)

const { data, error } = await supabase.from('media_kits').insert(toInsert).select('title, category')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${data.length} media item(s) inserted:\n`)
data.forEach((m) => console.log(`  ✓ [${m.category}] ${m.title}`))
