// Modelo para Vendedor
export interface Vendedor {
  idVendedor: number;
  nombre: string;
  documento: string;
  estado: EstadoVendedor;
  permisos: Permiso[];
}

// Modelo para Permiso
export interface Permiso {
  idPermiso: number;
  tipo: TipoPermiso;
  fechaAsignacion: Date;
  activo: boolean;
}

// Enumeraciones
export enum EstadoVendedor {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO'
}

export enum TipoPermiso {
  BODEGA = 'BODEGA',
  VENTAS = 'VENTAS',
  RECURSOS_HUMANOS = 'RECURSOS_HUMANOS',
  PROVEEDORES = 'PROVEEDORES',
  ENTREGAS = 'ENTREGAS'
}

export enum Sistema {
  BODEGA = 'BODEGA',
  VENTAS = 'VENTAS',
  RECURSOS_HUMANOS = 'RECURSOS_HUMANOS',
  PROVEEDORES = 'PROVEEDORES',
  ENTREGAS = 'ENTREGAS'
}

export enum ResultadoAcceso {
  PERMITIDO = 'PERMITIDO',
  DENEGADO = 'DENEGADO'
}

// Modelo para Auditoría
export interface AuditoriaAccesos {
  idRegistro: number;
  vendedor: Vendedor;
  sistema: Sistema;
  fechaHora: Date;
  resultado: ResultadoAcceso;
}

// Modelo para Autenticación
export interface Credenciales {
  usuario: string;
  password: string;
}

export interface Token {
  token: string;
  expira: string;
  permisos?: Sistema[];
}

export interface JWTPayload {
  id: number;
  nombre: string;
  roles: string[];
  sistemasAutorizados: Sistema[];
  permisos: string[];
  exp: number;
}
