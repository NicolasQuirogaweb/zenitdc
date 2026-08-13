'use client'

import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function isoADisplay(iso: string) {
  const [anio, mes, dia] = iso.split('-')
  if (!anio || !mes || !dia) return ''
  return `${dia}/${mes}/${anio}`
}

function parseIso(iso: string): { anio: number; mes: number; dia: number } | null {
  const [anio, mes, dia] = iso.split('-').map(Number)
  if (!anio || !mes || !dia) return null
  return { anio, mes, dia }
}

export default function FechaInput({ id, value, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)
  const seleccionado = parseIso(value)
  const hoy = new Date()
  const [mesVisible, setMesVisible] = useState(() =>
    seleccionado
      ? new Date(seleccionado.anio, seleccionado.mes - 1, 1)
      : new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const handleClick = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [abierto])

  const abrir = () => {
    if (seleccionado) {
      setMesVisible(new Date(seleccionado.anio, seleccionado.mes - 1, 1))
    }
    setAbierto((v) => !v)
  }

  const elegirDia = (dia: number) => {
    onChange(`${mesVisible.getFullYear()}-${pad(mesVisible.getMonth() + 1)}-${pad(dia)}`)
    setAbierto(false)
  }

  const cambiarMes = (delta: number) => {
    setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  const anio = mesVisible.getFullYear()
  const mes = mesVisible.getMonth()
  const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]

  const esSeleccionado = (dia: number) =>
    !!seleccionado && seleccionado.anio === anio && seleccionado.mes === mes + 1 && seleccionado.dia === dia

  const esHoy = (dia: number) =>
    hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === dia

  return (
    <div ref={contenedorRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={abrir}
        className="input-field flex items-center justify-between gap-2 text-left"
      >
        <span className={value ? '' : 'text-[color:var(--color-text-muted)]'}>
          {value ? isoADisplay(value) : 'dd/mm/aaaa'}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-[color:var(--color-text-muted)]" />
      </button>

      {abierto && (
        <div className="absolute z-20 mt-1 w-64 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              className="rounded p-1 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
              {MESES[mes]} {anio}
            </p>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              className="rounded p-1 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-[color:var(--color-text-muted)]">
            {DIAS_SEMANA.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {celdas.map((dia, i) =>
              dia === null ? (
                <span key={`vacio-${i}`} />
              ) : (
                <button
                  key={dia}
                  type="button"
                  onClick={() => elegirDia(dia)}
                  className={`rounded-md py-1 text-sm transition ${
                    esSeleccionado(dia)
                      ? 'bg-blue-accent text-white'
                      : esHoy(dia)
                        ? 'border border-blue-accent text-[color:var(--color-text-primary)]'
                        : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]'
                  }`}
                >
                  {dia}
                </button>
              )
            )}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setAbierto(false)
              }}
              className="mt-2 w-full rounded-md border border-[color:var(--color-border)] py-1 text-xs text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]"
            >
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
