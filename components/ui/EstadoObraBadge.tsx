interface Props {
  estado: string
}

const CLASES: Record<string, string> = {
  pendiente: 'bg-yellow-500/15 text-yellow-400',
  cotizada: 'bg-blue-accent/15 text-blue-light',
  en_proceso: 'bg-blue-accent/15 text-blue-light',
  finalizada: 'bg-green-alert/15 text-green-alert',
}

const LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  cotizada: 'Cotizada',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
}

export default function EstadoObraBadge({ estado }: Props) {
  return (
    <span
      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        CLASES[estado] ?? 'bg-yellow-500/15 text-yellow-400'
      }`}
    >
      {LABELS[estado] ?? estado}
    </span>
  )
}
