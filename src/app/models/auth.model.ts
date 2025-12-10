/**
 * Modelos de datos para la integración con el backend de Recursos Humanos
 * Base URL: http://localhost:8081/api/auth
 */

/**
 * Tipos de identificación permitidos
 */
export enum TipoIdentificacion {
  CC = 'CC',
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC'
}

/**
 * Estados de empleado
 */
export enum EstadoEmpleado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

/**
 * Roles disponibles en el sistema
 */
export enum Role {
  ADMIN = 'ADMIN',
  RRHH = 'RRHH',
  VENDEDOR = 'VENDEDOR',
  BODEGUERO = 'BODEGUERO',
  PROVEEDOR = 'PROVEEDOR',
  ENTREGADOR = 'ENTREGADOR'
}

/**
 * Request para login
 * POST /auth/login
 */
export interface LoginRequest {
  /** Usuario del empleado */
  usuario: string;
  /** Contraseña cifrada con AES-256 */
  password: string;
}

/**
 * Perfil completo del empleado autenticado
 */
export interface PerfilEmpleado {
  /** Número de identificación del empleado */
  identificacion: number;
  /** Tipo de identificación (CEDULA, PASAPORTE, RUC) */
  tipoIdentificacion: TipoIdentificacion;
  /** Nombre del empleado */
  nombre: string;
  /** Apellido del empleado */
  apellido: string;
  /** Usuario del empleado */
  usuario: string;
  /** Estado del empleado (ACTIVO, INACTIVO) */
  estado: EstadoEmpleado;
  /** Roles asignados al empleado */
  roles: Role[];
  /** Fecha de creación del registro */
  fechaCreacion: string;
  /** Fecha de última actualización */
  fechaActualizacion: string;
}

/**
 * Response del login exitoso
 * POST /auth/login - 200 OK
 */
export interface LoginResponse {
  /** Token JWT para autenticación */
  token: string;
  /** Fecha de expiración del token en formato ISO 8601 */
  expiracion: string;
  /** Perfil completo del empleado autenticado */
  empleado: PerfilEmpleado;
}

/**
 * Response de error de autenticación del backend
 */
export interface BackendErrorResponse {
  /** Código de estado HTTP */
  codigo: number;
  /** Mensaje de error principal */
  mensaje: string;
  /** Detalles adicionales del error */
  detalles: string;
  /** Timestamp del error */
  timestamp: number;
}

/**
 * Response de error de autenticación (normalizado para el frontend)
 */
export interface AuthErrorResponse {
  /** Código de estado HTTP */
  status: number;
  /** Mensaje de error */
  message: string;
  /** Timestamp del error */
  timestamp?: string;
  /** Detalles adicionales del error */
  details?: string;
}

/**
 * Información del token decodificado
 */
export interface TokenPayload {
  /** ID del empleado */
  empleadoId: number;
  /** Roles del empleado */
  roles: Role[];
  /** Subject (usuario) */
  sub: string;
  /** Issued at (timestamp) */
  iat: number;
  /** Expiration (timestamp) */
  exp: number;
}
