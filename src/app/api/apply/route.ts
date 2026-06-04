import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sendApplicationNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const coverLetter = (formData.get('coverLetter') as string)?.trim() || null
  const jobId = (formData.get('jobId') as string)?.trim() || null
  const jobTitle = (formData.get('jobTitle') as string)?.trim()
  const cvFile = formData.get('cv') as File | null

  if (!firstName || !lastName || !email || !phone || !jobTitle || !cvFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (cvFile.type !== 'application/pdf') {
    return NextResponse.json({ error: 'CV must be a PDF file' }, { status: 400 })
  }

  if (cvFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'CV must be under 5MB' }, { status: 400 })
  }

  const supabase = createServerClient()

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
  const buffer = await cvFile.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('job-applications')
    .upload(filename, buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('job-applications').getPublicUrl(filename)
  const cvUrl = urlData.publicUrl

  const { error } = await supabase.from('job_applications').insert({
    job_id: jobId,
    job_title: jobTitle,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    cover_letter: coverLetter,
    cv_url: cvUrl,
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }

  sendApplicationNotification({ firstName, lastName, email, phone, jobTitle, cvUrl }).catch(
    () => {},
  )

  return NextResponse.json({ ok: true })
}
