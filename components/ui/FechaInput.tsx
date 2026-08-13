'use client'

import { useState } from 'react'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
  className?: string
  required?: boolean
}

function isoADisplay(iso: string) {
  const [anio, mes, dia] = iso.split('-')
  if (!anio || !mes || !dia) return ''
  return `${dia}/${mes}/${anio}`
}

function displayAIso(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, dia, mes, anio] = match
  const mesNum = Number(mes)
  const diaNum = Number(dia)
  if (mesNum < 1 || mesNum > 12) return null
  const diasEnMes = new Date(Number(anio), mesNum, 0).getDate()
  if (diaNum < 1 || diaNum > diasEnMes) return null
  return `${anio}-${mes}-${dia}`
}

export default function FechaInput({ id, value, onChange, className = 'input-field', required }: Props) {
  const [texto, setTexto] = useState(() => isoADisplay(value))
  const [valorPrevio, setValorPrevio] = useState(value)

  if (value !== valorPrevio) {
    setValorPrevio(value)
    setTexto(isoADisplay(value))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formateado = soloNumeros
    if (soloNumeros.length > 4) {
      formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}/${soloNumeros.slice(4)}`
    } else if (soloNumeros.length > 2) {
      formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`
    }
    setTexto(formateado)

    if (formateado === '') {
      onChange('')
      return
    }
    const iso = displayAIso(formateado)
    if (iso) onChange(iso)
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={texto}
      onChange={handleChange}
      className={className}
      required={required}
    />
  )
}
