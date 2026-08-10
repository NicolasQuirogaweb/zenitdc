'use client'

import { useState } from 'react'
import { OPCION_OTRO } from '@/lib/constantes'

interface Props {
  label: string
  id: string
  opciones: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SelectConOpciones({ label, id, opciones, value, onChange, placeholder }: Props) {
  const [esOtro, setEsOtro] = useState(value !== '' && !opciones.includes(value))

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={esOtro ? OPCION_OTRO : value}
        onChange={(e) => {
          const elegido = e.target.value
          if (elegido === OPCION_OTRO) {
            setEsOtro(true)
            onChange(OPCION_OTRO)
          } else {
            setEsOtro(false)
            onChange(elegido)
          }
        }}
        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
      >
        <option value="">Seleccionar...</option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
        <option value={OPCION_OTRO}>{OPCION_OTRO}</option>
      </select>
      {esOtro && (
        <input
          id={`${id}-otro`}
          value={value === OPCION_OTRO ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Escribí otra opción'}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        />
      )}
    </div>
  )
}
