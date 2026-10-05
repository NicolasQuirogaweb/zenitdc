export interface Proveedor {
  id: string
  nombre: string
  telefono: string | null
  contacto: string | null
  created_at: string
}

export interface PersonalEmpresa {
  id: string
  nombre: string
  rol: string | null
  telefono: string | null
  created_at: string
}

export interface PagoPersonal {
  id: string
  personal_id: string
  obra_id: string | null
  monto: number
  fecha: string
  motivo: string
  created_at: string
}

export interface PersonalTercerizado {
  id: string
  nombre: string
  oficio: string | null
  telefono: string | null
  created_at: string
}

export interface PagoPersonalTercerizado {
  id: string
  personal_tercerizado_id: string
  obra_id: string
  monto: number
  fecha: string
  motivo: string
  created_at: string
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  direccion: string | null
  cuit: string | null
  email: string | null
  estado: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}

export interface Obra {
  id: string
  cliente_id: string
  nombre: string
  descripcion: string | null
  direccion: string | null
  fecha_inicio: string | null
  fecha_estimada_fin: string | null
  estado: 'pendiente' | 'cotizada' | 'en_proceso' | 'finalizada'
  responsable: string | null
  created_at: string
  updated_at: string
}

export interface PresupuestoItem {
  id: string
  obra_id: string
  rubro: string
  monto: number
  created_at: string
}

export interface PagoCliente {
  id: string
  obra_id: string
  monto: number
  fecha: string
  numero_etapa: number | null
  metodo_pago: string | null
  observaciones: string | null
  created_at: string
}

export interface GastoMaterial {
  id: string
  obra_id: string
  material: string
  cantidad: string | null
  monto: number
  fecha: string
  proveedor_id: string | null
  observaciones: string | null
  created_at: string
}

export interface GastoGeneral {
  id: string
  obra_id: string
  concepto: string
  monto: number
  fecha: string
  proveedor_id: string | null
  observaciones: string | null
  created_at: string
}

export interface FotoObra {
  id: string
  obra_id: string
  storage_path: string
  descripcion: string | null
  fecha: string
  created_at: string
}

export interface GastoEmpresa {
  id: string
  concepto: string
  monto: number
  fecha: string
  observaciones: string | null
  created_at: string
}