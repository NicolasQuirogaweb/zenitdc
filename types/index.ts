export interface Proveedor {
  id: string
  nombre: string
  telefono: string | null
  contacto: string | null
  created_at: string
}

export interface EmpleadoTercerizado {
  id: string
  proveedor_id: string
  nombre: string
  oficio: string | null
  dni: string | null
  telefono: string | null
  created_at: string
}

export interface PresupuestoManoObra {
  id: string
  obra_id: string
  proveedor_id: string
  monto: number
  created_at: string
}

export interface PagoManoObra {
  id: string
  obra_id: string
  proveedor_id: string
  monto: number
  fecha: string
  observaciones: string | null
  created_at: string
}

export interface CuentaCorrienteProveedor {
  proveedor_id: string
  proveedor_nombre: string
  presupuestado: number
  pagado: number
  saldo: number
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

export interface BalanceObra {
  obra_id: string
  total_presupuestado: number
  total_ingresos: number
  total_egresos: number
  total_gastos_generales: number
  resultado: number
  diferencia_vs_presupuesto: number
}

export interface BalancePorObra {
  obra_id: string
  obra_nombre: string
  cliente_nombre: string
  total_ingresos: number
  total_egresos: number
  total_gastos_generales: number
  resultado: number
}

export interface BalanceGeneral {
  total_ingresos: number
  total_egresos: number
  total_gastos_generales: number
  resultado: number
  por_obra: BalancePorObra[]
}