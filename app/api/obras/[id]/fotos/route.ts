import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { fotoSchema, TIPOS_PERMITIDOS, MAX_FOTO_BYTES, EXTENSIONES } from '@/lib/validations/fotos'

const BUCKET = 'fotos-obra'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    const supabase = await createClient()
    const { data: fotos, error } = await supabase
      .from('fotos_obra')
      .select('*')
      .eq('obra_id', id)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const fotosConUrl = await Promise.all(
      fotos.map(async (foto) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(foto.storage_path, 3600)
        return { ...foto, url: signed?.signedUrl ?? null }
      })
    )

    return NextResponse.json(fotosConUrl)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    const formData = await request.formData()
    const file = formData.get('file')
    const descripcion = formData.get('descripcion')
    const fecha = formData.get('fecha')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo de imagen' }, { status: 400 })
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido (usar JPG, PNG, WEBP o GIF)' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FOTO_BYTES) {
      return NextResponse.json({ error: 'La imagen supera los 5 MB' }, { status: 400 })
    }

    const parsed = fotoSchema.safeParse({
      descripcion: typeof descripcion === 'string' && descripcion ? descripcion : null,
      fecha: typeof fecha === 'string' ? fecha : new Date().toISOString().slice(0, 10),
    })

    if (!parsed.success) {
      const mensajes = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
      return NextResponse.json({ error: mensajes || 'Datos inválidos' }, { status: 400 })
    }

    const extension = EXTENSIONES[file.type]
    const storagePath = `obra/${id}/${crypto.randomUUID()}.${extension}`

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Error al subir imagen: ${uploadError.message}` }, { status: 500 })
    }

    const { data, error: insertError } = await supabase
      .from('fotos_obra')
      .insert({
        obra_id: id,
        storage_path: storagePath,
        descripcion: parsed.data.descripcion,
        fecha: parsed.data.fecha,
      })
      .select()
      .single()

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600)

    return NextResponse.json({ ...data, url: signed?.signedUrl ?? null }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}