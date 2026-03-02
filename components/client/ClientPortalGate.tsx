'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  clientSlug: string
  clientName: string
  company?: string
}

export default function ClientPortalGate({ clientSlug, clientName, company }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSlug, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Senha incorreta')
        setLoading(false)
      } else {
        router.push(`/client-portal/${clientSlug}/home`)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">

      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between">
        <span className="text-accent font-bold font-sans text-lg tracking-tight">F&amp;A</span>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(123,110,246,0.12)',
            color: 'var(--accent2)',
            border: '1px solid rgba(123,110,246,0.2)',
          }}
        >
          Portal do Cliente
        </span>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm flex flex-col gap-8">

          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            {/* Avatar / iniciais */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-sans mx-auto mb-1"
              style={{
                background: 'rgba(123,110,246,0.15)',
                color: 'var(--accent2)',
                border: '2px solid rgba(123,110,246,0.25)',
              }}
            >
              {clientName.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold font-sans text-text">
              {company ?? clientName}
            </h1>
            {company && (
              <p className="text-sm font-mono text-muted">{clientName}</p>
            )}
            <p
              className="text-xs font-mono mt-1"
              style={{ color: 'var(--accent2)' }}
            >
              Área exclusiva do cliente
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full min-h-[48px] px-4 py-3 rounded-lg text-text font-mono text-sm outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent2)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />

            {error && (
              <p className="text-xs font-mono" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 rounded-lg text-sm font-bold font-sans transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              style={{ background: 'var(--accent2)', color: '#fff' }}
            >
              {loading ? 'verificando…' : 'Acessar Portal'}
            </button>
          </form>

          {/* Nota de privacidade */}
          <p className="text-xs font-mono text-muted text-center leading-relaxed">
            Esta área é exclusiva para clientes da FSZA WORKS.
            <br />
            A senha do portal é diferente da senha de acesso ao cronograma.
          </p>

        </div>
      </div>

    </div>
  )
}
