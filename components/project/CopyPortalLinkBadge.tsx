'use client'

import { useState } from 'react'

interface Props {
  clientSlug: string
}

export default function CopyPortalLinkBadge({ clientSlug }: Props) {
  const [copied, setCopied] = useState(false)

  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/client-portal/${clientSlug}`

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title={url}
      className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
      style={{
        background: 'rgba(123,110,246,0.1)',
        borderColor: 'rgba(123,110,246,0.3)',
        color: 'var(--accent2)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: 'var(--accent2)' }}
        aria-hidden
      />
      {copied ? 'Link copiado!' : 'Portal ativo · Copiar link'}
    </button>
  )
}
