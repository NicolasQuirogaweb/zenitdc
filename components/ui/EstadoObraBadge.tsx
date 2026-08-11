interface Props {
  estado: string
}

const CLASES: Record<string, string> = {
  terminada: 'bg-green-100 text-green-alert',
  en_ejecucion: 'bg-blue-100 text-blue-accent',
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
        CLASES[estado] ?? 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {LABELS[estado] ?? 'Terminada'}
    </span>
  )
}
