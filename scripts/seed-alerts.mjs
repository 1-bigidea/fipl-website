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

const alerts = [
  {
    title: 'Planned Website Maintenance',
    message:
      'Our portal may be briefly unavailable on Saturday 13 June, 22:00–23:00 WAT. Thank you for your patience.',
    type: 'info',
    is_active: true,
  },
  {
    title: 'Omoku Plant Routine Maintenance',
    message:
      'Unit 2 will undergo scheduled maintenance from 15–17 June. No supply impact is expected.',
    type: 'warning',
    is_active: false,
  },
  {
    title: 'Temporary Grid Constraint Notice',
    message:
      'Upstream grid constraints may cause brief load adjustments. Our team is actively managing the situation.',
    type: 'critical',
    is_active: false,
  },
  {
    title: 'New Career Opportunities',
    message:
      'Several engineering and operations roles are now open. Visit our Careers page to apply.',
    type: 'info',
    is_active: false,
  },
  {
    title: 'Public Holiday Office Hours',
    message: 'Our offices will be closed on the upcoming public holiday and reopen the next working day.',
    type: 'warning',
    is_active: false,
  },
]

const { data: existing, error: readError } = await supabase.from('alerts').select('title')
if (readError) {
  console.error('Error reading existing alerts:', readError.message)
  process.exit(1)
}

const existingTitles = new Set((existing ?? []).map((r) => r.title))
const toInsert = alerts.filter((a) => !existingTitles.has(a.title))

if (toInsert.length === 0) {
  console.log('All alerts already exist — nothing to insert.')
  process.exit(0)
}

console.log(`Inserting ${toInsert.length} alert(s)…`)

const { data, error } = await supabase.from('alerts').insert(toInsert).select('title, type, is_active')
if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${data.length} alert(s) inserted:\n`)
data.forEach((a) => console.log(`  ✓ [${a.type}${a.is_active ? ', live' : ', off'}] ${a.title}`))
