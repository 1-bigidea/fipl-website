import { NextRequest, NextResponse } from 'next/server'
import { roleForPassword, tokenForRole } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const role = password ? roleForPassword(password) : null
  const token = role ? tokenForRole(role) : undefined

  if (!role || !token) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true, role })
  const baseCookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
  response.cookies.set('admin_token', token, { ...baseCookieOptions, httpOnly: true })
  response.cookies.set('admin_role', role, { ...baseCookieOptions, httpOnly: false })
  return response
}
