'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyClientPasswordAction } from '@/lib/actions'

interface Props {
  projectName: string
  slug: string
}

export default function PasswordGate({ projectName, slug }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await verifyClientPasswordAction(slug, password)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push(`/p/${slug}/view`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">

      {/* Logo */}
      <div className="px-6 py-5">
        <span className="text-accent font-bold font-sans text-lg tracking-tight">F&amp;A</span>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm flex flex-col gap-8">

          <div className="text-center flex flex-col gap-1">
            <h1 className="text-2xl font-bold font-sans text-text">{projectName}</h1>
            <p className="text-sm text-muted font-mono">acesso restrito</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-surface border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
            />

            {error && (
              <p className="text-xs text-warn font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'verificando…' : 'entrar'}
            </button>
          </form>

        </div>
      </div>

    </div>
  )
}
