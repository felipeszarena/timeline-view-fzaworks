'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-8 py-10 rounded-2xl bg-surface border border-border">

        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-4xl font-bold text-accent font-sans tracking-tight">F&A</p>
          <p className="mt-1 text-xs text-muted font-mono">FSZA WORKS</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted font-mono">senha admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-warn font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold bg-accent text-bg font-sans transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'entrando...' : 'entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
