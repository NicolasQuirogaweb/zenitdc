'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  titulo: string
  subtitulo?: string
  abiertoInicial?: boolean
  headerRight?: React.ReactNode
  children: React.ReactNode
}

export default function CollapsibleCard({
  titulo,
  subtitulo,
  abiertoInicial = false,
  headerRight,
  children,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoInicial)

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          className="flex flex-1 items-center justify-between text-left"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
            {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
          </div>
          <ChevronDown
            className={`ml-3 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
              abierto ? 'rotate-180' : ''
            }`}
          />
        </button>
        {headerRight}
      </div>

      {abierto && <div className="mt-4">{children}</div>}
    </div>
  )
}
