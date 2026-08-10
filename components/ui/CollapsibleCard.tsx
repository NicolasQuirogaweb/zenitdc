'use client'

import { useState } from 'react'

interface Props {
  titulo: string
  subtitulo?: string
  abiertoInicial?: boolean
  children: React.ReactNode
}

export default function CollapsibleCard({
  titulo,
  subtitulo,
  abiertoInicial = false,
  children,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoInicial)

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
        </div>
        <span className="ml-3 text-sm text-slate-400">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && <div className="mt-4">{children}</div>}
    </div>
  )
}
