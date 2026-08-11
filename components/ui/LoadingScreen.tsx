interface Props {
  mensaje?: string
}

export default function LoadingScreen({ mensaje = 'Cargando...' }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-slate-500">{mensaje}</p>
    </div>
  )
}
