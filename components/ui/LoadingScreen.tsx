interface Props {
  mensaje?: string
}

export default function LoadingScreen({ mensaje = 'Cargando...' }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-bg-page)]">
      <p className="text-sm text-[color:var(--color-text-secondary)]">{mensaje}</p>
    </div>
  )
}
