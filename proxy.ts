import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { verifyClientPortalJWT, PORTAL_COOKIE_PREFIX } from '@/lib/auth'

// ── Admin auth ────────────────────────────────────────────────
const ADMIN_COOKIE = 'admin_token'
const getSecret = () =>
  new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-production'
  )

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Proteger /dashboard (admin) ───────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      await jwtVerify(token, getSecret())
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Proteger /client-portal/[clientSlug]/home ─────────────
  const portalHomeMatch = pathname.match(/^\/client-portal\/([^/]+)\/home/)
  if (portalHomeMatch) {
    const clientSlug = portalHomeMatch[1]
    const cookieName = `${PORTAL_COOKIE_PREFIX}${clientSlug}`
    const token = request.cookies.get(cookieName)?.value

    if (!token) {
      return NextResponse.redirect(
        new URL(`/client-portal/${clientSlug}`, request.url)
      )
    }

    const clientId = await verifyClientPortalJWT(token, clientSlug)
    if (!clientId) {
      const response = NextResponse.redirect(
        new URL(`/client-portal/${clientSlug}`, request.url)
      )
      response.cookies.delete(cookieName)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client-portal/:clientSlug/home/:path*'],
}
