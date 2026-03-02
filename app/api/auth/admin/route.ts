import { NextRequest, NextResponse } from 'next/server'
import { signAdminJWT, ADMIN_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { password?: string }

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const token = await signAdminJWT()

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  })

  return response
}
