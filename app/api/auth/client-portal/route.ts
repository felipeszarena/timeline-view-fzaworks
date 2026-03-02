import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getClientBySlug } from '@/lib/db'
import { signClientPortalJWT, PORTAL_COOKIE_PREFIX } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { clientSlug?: string; password?: string }
    const { clientSlug, password } = body

    if (!clientSlug || !password) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const client = await getClientBySlug(clientSlug)
    if (!client || !client.portal_password_hash) {
      // Retornar a mesma mensagem para não expor se o portal existe
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, client.portal_password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    const token = await signClientPortalJWT(client.id, clientSlug)

    const response = NextResponse.json({ success: true })
    response.cookies.set(`${PORTAL_COOKIE_PREFIX}${clientSlug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8h
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
