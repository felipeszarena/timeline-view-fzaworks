'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const MESSAGES: Record<string, string> = {
  created: 'Projeto criado com sucesso',
  updated: 'Projeto atualizado com sucesso',
  deleted: 'Projeto deletado',
}

interface ToastProps {
  message: string | undefined
}

export default function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(!!message)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      router.replace(pathname, { scroll: false })
    }, 3500)
    return () => clearTimeout(timer)
  }, [message, router, pathname])

  if (!visible || !message) return null

  const text = MESSAGES[message] ?? message

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl border border-border bg-surface font-mono text-sm text-text shadow-xl whitespace-nowrap">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0"
        style={{ backgroundColor: 'var(--success)', color: 'var(--bg)' }}
      >
        ✓
      </span>
      {text}
    </div>
  )
}
