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

const submissions = [
  {
    first_name: 'Adaeze',
    last_name: 'Okonkwo',
    email: 'adaeze.okonkwo@example.com',
    subject: 'General Enquiry',
    message: 'Please could you share your latest sustainability report? I am preparing a study on power generation in the region.',
    created_at: '2026-06-03T09:15:00Z',
  },
  {
    first_name: 'Tunde',
    last_name: 'Bakare',
    email: 'tunde.bakare@contractco.ng',
    subject: 'Vendor Registration',
    message: 'We supply industrial spare parts and PPE, and would like to be considered for your approved vendor list. How do we proceed?',
    created_at: '2026-05-30T11:42:00Z',
  },
  {
    first_name: 'Grace',
    last_name: 'Eze',
    email: 'grace.eze@solartech.africa',
    subject: 'Partnership',
    message: 'Our firm specialises in solar-hybrid generation solutions. We would love to explore a partnership with FIPL on clean energy projects.',
    created_at: '2026-05-25T15:08:00Z',
  },
  {
    first_name: 'Ibrahim',
    last_name: 'Sani',
    email: 'i.sani@newsdaily.ng',
    subject: 'Media Enquiry',
    message: 'I am a journalist writing a feature on power generation in the Niger Delta and would appreciate a comment from your team.',
    created_at: '2026-05-20T08:30:00Z',
  },
  {
    first_name: 'Chioma',
    last_name: 'Nwankwo',
    email: 'chioma.nwankwo@gmail.com',
    subject: 'Careers',
    message: 'I submitted an application for the Control Room Operator role last week and wanted to confirm that it was received. Thank you.',
    created_at: '2026-05-15T13:20:00Z',
  },
  {
    first_name: 'Emeka',
    last_name: 'Obi',
    email: 'emeka.obi@manufacturing.ng',
    subject: 'Eligible Customer Enquiry',
    message: 'We operate a manufacturing plant in Port Harcourt and are interested in becoming an eligible customer. What are the requirements?',
    created_at: '2026-05-10T10:05:00Z',
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    subject: 'General Enquiry',
    message: 'What are your office opening hours, and is there a number I can call to speak with the customer service team?',
    created_at: '2026-05-05T16:47:00Z',
  },
]

const { data: existing, error: readError } = await supabase
  .from('contact_submissions')
  .select('message')

if (readError) {
  console.error('Error reading existing submissions:', readError.message)
  process.exit(1)
}

const existingMessages = new Set((existing ?? []).map((r) => r.message))
const toInsert = submissions.filter((s) => !existingMessages.has(s.message))

if (toInsert.length === 0) {
  console.log('All submissions already exist — nothing to insert.')
  process.exit(0)
}

console.log(`Inserting ${toInsert.length} submission(s)…`)

const { data, error } = await supabase
  .from('contact_submissions')
  .insert(toInsert)
  .select('first_name, last_name, subject')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${data.length} submission(s) inserted:\n`)
data.forEach((s) => console.log(`  ✓ [${s.subject}] ${s.first_name} ${s.last_name}`))
