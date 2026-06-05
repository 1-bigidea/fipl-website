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

const testimonials = [
  {
    quote:
      "FIPL's commitment to reliable power generation has been transformational. Their professionalism and expertise ensure seamless project execution every time.",
    name: 'Sarah L.',
    role: 'Operations Lead, Partner Firm',
    is_active: true,
  },
  {
    quote:
      'Working with FIPL over the years has shown us what true dedication to power reliability looks like. They have consistently exceeded expectations on every project.',
    name: 'James T.',
    role: 'Chief Executive, Red Button',
    is_active: true,
  },
  {
    quote:
      'The level of technical expertise and customer focus that FIPL brings to the table is unmatched in the Nigerian power sector. A truly world-class organisation.',
    name: 'Chukwudi O.',
    role: 'Director, Lagos Industries Ltd',
    is_active: true,
  },
]

const { data: existing, error: readError } = await supabase.from('testimonials').select('name')
if (readError) {
  console.error('Error reading existing testimonials:', readError.message)
  process.exit(1)
}

const existingNames = new Set((existing ?? []).map((r) => r.name))
const toInsert = testimonials.filter((t) => !existingNames.has(t.name))

if (toInsert.length === 0) {
  console.log('All testimonials already exist — nothing to insert.')
  process.exit(0)
}

console.log(`Inserting ${toInsert.length} testimonial(s)…`)

const { data, error } = await supabase.from('testimonials').insert(toInsert).select('name, role')
if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${data.length} testimonial(s) inserted:\n`)
data.forEach((t) => console.log(`  ✓ ${t.name} — ${t.role}`))
