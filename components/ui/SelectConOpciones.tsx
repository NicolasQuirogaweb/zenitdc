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
      <label htmlFor={id} className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
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
        className="input-field"
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
          className="input-field"
        />
      )}
    </div>
  )
}
