interface Props {
  estado: string
}

const CLASES: Record<string, string> = {
  terminada: 'bg-green-alert/15 text-green-alert',
  en_ejecucion: 'bg-blue-accent/15 text-blue-light',
}

const LABELS: Record<string, string> = {
  presupuestada: 'Presupuestada',
  en_ejecucion: 'En ejecución',
  terminada: 'Terminada',
}

export default function EstadoObraBadge({ estado }: Props) {
  return (
    <span
      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        CLASES[estado] ?? 'bg-yellow-500/15 text-yellow-400'
      }`}
    >
      {LABELS[estado] ?? 'Terminada'}
    </span>
  )
}
