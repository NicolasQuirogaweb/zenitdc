'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
const MARGEN = 8

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
  const [posicion, setPosicion] = useState<{ top: number; left: number } | null>(null)
  const seleccionado = parseIso(value)
  const hoy = new Date()
  const [mesVisible, setMesVisible] = useState(() =>
    seleccionado
      ? new Date(seleccionado.anio, seleccionado.mes - 1, 1)
      : new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )
  const botonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!abierto) return

    const reposicionar = () => {
      const boton = botonRef.current
      const panel = panelRef.current
      if (!boton) return
      const rectBoton = boton.getBoundingClientRect()
      const anchoPanel = panel?.offsetWidth ?? 260
      const altoPanel = panel?.offsetHeight ?? 320

      let left = rectBoton.left
      if (left + anchoPanel > window.innerWidth - MARGEN) {
        left = rectBoton.right - anchoPanel
      }
      left = Math.max(MARGEN, Math.min(left, window.innerWidth - anchoPanel - MARGEN))

      let top = rectBoton.bottom + 4
      if (top + altoPanel > window.innerHeight - MARGEN) {
        const arriba = rectBoton.top - 4 - altoPanel
        top = arriba >= MARGEN ? arriba : Math.max(MARGEN, window.innerHeight - altoPanel - MARGEN)
      }

      setPosicion({ top, left })
    }

    reposicionar()
    window.addEventListener('resize', reposicionar)
    window.addEventListener('scroll', reposicionar, true)
    return () => {
      window.removeEventListener('resize', reposicionar)
      window.removeEventListener('scroll', reposicionar, true)
    }
  }, [abierto, mesVisible])

  useLayoutEffect(() => {
    if (!abierto) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const dentroBoton = botonRef.current?.contains(target)
      const dentroPanel = panelRef.current?.contains(target)
      if (!dentroBoton && !dentroPanel) {
        setAbierto(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
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
    <>
      <button
        ref={botonRef}
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

      {abierto && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: posicion?.top ?? -9999,
            left: posicion?.left ?? -9999,
            visibility: posicion ? 'visible' : 'hidden',
          }}
          className="z-50 w-64 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] p-3 shadow-lg"
        >
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
        </div>,
        document.body
      )}
    </>
  )
}
