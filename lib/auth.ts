import { SignJWT, jwtVerify } from 'jose'

export const ADMIN_COOKIE          = 'admin_token'
export const CLIENT_COOKIE_PREFIX  = 'client_'
export const PORTAL_COOKIE_PREFIX  = 'client_portal_'

const getSecret = () =>
  new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-production'
  )

export async function signAdminJWT(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyAdminJWT(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

// ── Client JWT ───────────────────────────────────────────────

export async function signClientJWT(slug: string): Promise<string> {
  return new SignJWT({ role: 'client', slug })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyClientJWT(token: string, slug: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.role === 'client' && payload.slug === slug
  } catch {
    return false
  }
}

// ── Client Portal JWT ─────────────────────────────────────────

export async function signClientPortalJWT(
  clientId: string,
  clientSlug: string
): Promise<string> {
  return new SignJWT({ role: 'client-portal', clientId, clientSlug })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

/**
 * Verifies the portal JWT for a given clientSlug.
 * Returns the clientId if valid, or null if the token is missing/invalid.
 * Reads the cookie internally via next/headers — use only in Server Components.
 */
export async function verifyClientPortalToken(clientSlug: string): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get(`${PORTAL_COOKIE_PREFIX}${clientSlug}`)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role === 'client-portal' && payload.clientSlug === clientSlug) {
      return payload.clientId as string
    }
    return null
  } catch {
    return null
  }
}

/**
 * Low-level portal JWT verifier — accepts the token string directly.
 * Use in middleware (no next/headers available) or when token is already extracted.
 * Returns clientId if valid, or null.
 */
export async function verifyClientPortalJWT(
  token: string,
  clientSlug: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role === 'client-portal' && payload.clientSlug === clientSlug) {
      return payload.clientId as string
    }
    return null
  } catch {
    return null
  }
}
