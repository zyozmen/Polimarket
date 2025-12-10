import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { 
  LoginRequest, 
  LoginResponse, 
  PerfilEmpleado, 
  Role,
  EstadoEmpleado,
  AuthErrorResponse 
} from '../models/auth.model';
import { Sistema } from '../models/vendedor.model';
import { EncryptionService } from './encryption.service';
import { PasswordEncryptionService } from './password-encryption.service';

/**
 * Servicio de autenticación con integración al backend de Recursos Humanos
 * Base URL: http://localhost:8081/api/auth
 * 
 * Funcionalidades:
 * - Login con cifrado AES de contraseñas
 * - Logout con revocación de tokens
 * - Validación de tokens JWT
 * - Gestión de sesión y permisos por roles
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de la API de autenticación (conexión directa)
  private readonly API_URL = 'http://localhost:8081/api/auth';
  
  // Subject para observar cambios en el perfil del usuario
  private currentUserSubject: BehaviorSubject<PerfilEmpleado | null>;
  
  // Observable público del perfil del usuario
  public currentUser$: Observable<PerfilEmpleado | null>;

  // Subject para permisos de sistemas (compatibilidad con código existente)
  private permisosSubject: BehaviorSubject<Sistema[]>;
  public permisos$: Observable<Sistema[]>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private encryptionService: EncryptionService,
    private passwordEncryption: PasswordEncryptionService
  ) {
    // Recuperar perfil guardado en localStorage si existe
    const perfilGuardado = localStorage.getItem('perfil');
    let perfil: PerfilEmpleado | null = null;
    
    if (perfilGuardado && perfilGuardado !== 'undefined' && perfilGuardado !== 'null') {
      try {
        perfil = JSON.parse(perfilGuardado);
      } catch (e) {
        console.error('Error parsing perfil from localStorage:', e);
        localStorage.removeItem('perfil');
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<PerfilEmpleado | null>(perfil);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Inicializar permisos desde localStorage
    const permisosGuardados = localStorage.getItem('permisos');
    let permisos: Sistema[] = [];
    
    if (permisosGuardados && permisosGuardados !== 'undefined' && permisosGuardados !== 'null') {
      try {
        permisos = JSON.parse(permisosGuardados);
      } catch (e) {
        console.error('Error parsing permisos from localStorage:', e);
        localStorage.removeItem('permisos');
      }
    }
    
    this.permisosSubject = new BehaviorSubject<Sistema[]>(permisos);
    this.permisos$ = this.permisosSubject.asObservable();
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  get currentUserValue(): PerfilEmpleado | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   * Comprueba la existencia del token y su validez
   */
  get isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token ha expirado
    const expiracion = localStorage.getItem('expiracion');
    if (expiracion) {
      const fechaExpiracion = new Date(expiracion);
      if (fechaExpiracion <= new Date()) {
        // Token expirado, limpiar sesión
        this.clearSession();
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene el token JWT del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Autentica un empleado con sus credenciales
   * POST /auth/login
   * 
   * @param usuario - Nombre de usuario
   * @param password - Contraseña en texto plano (será cifrada automáticamente)
   * @returns Observable con la respuesta de login
   */
  login(usuario: string, password: string): Observable<LoginResponse> {
    // Cifrar la contraseña con el servicio compatible con Spring Boot
    const passwordCifrado = this.passwordEncryption.encrypt(password);
    
    // Log para debug (eliminar en producción)
    console.log('🔐 Login attempt:', { 
      usuario, 
      passwordOriginal: password, 
      passwordCifrado 
    });

    const request: LoginRequest = {
      usuario: usuario,
      password: passwordCifrado
    };

    const loginUrl = `${this.API_URL}/login`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return this.http.post<LoginResponse>(loginUrl, request, { headers })
      .pipe(
        tap(response => {
          // Guardar token, fecha de expiración y perfil en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('expiracion', response.expiracion);
          localStorage.setItem('perfil', JSON.stringify(response.empleado));
          
          // Mapear roles a sistemas/módulos
          const sistemas = this.mapearRolesASistemas(response.empleado.roles);
          localStorage.setItem('permisos', JSON.stringify(sistemas));
          
          // Notificar cambios
          this.currentUserSubject.next(response.empleado);
          this.permisosSubject.next(sistemas);
        }),
        catchError(this.handleAuthError)
      );
  }

  /**
   * Cierra sesión del usuario y revoca el token
   * POST /auth/logout
   * 
   * @returns Observable que se completa cuando el logout es exitoso
   */
  logout(): Observable<void> {
    const token = this.getToken();
    
    if (!token) {
      // Si no hay token, solo limpiar sesión local
      this.clearSession();
      return throwError(() => new Error('No hay sesión activa'));
    }

    // Headers con el token de autorización
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<void>(`${this.API_URL}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(error => {
          // Aunque falle el logout en el servidor, limpiar sesión local
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  /**
   * Valida si un token JWT es válido y está activo
   * GET /auth/validate
   * 
   * @returns Observable<boolean> - true si el token es válido, false si no
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<boolean>(`${this.API_URL}/validate`, { headers })
      .pipe(
        tap(isValid => {
          if (!isValid) {
            this.clearSession();
          }
        }),
        catchError(error => {
          this.clearSession();
          return new Observable<boolean>(observer => {
            observer.next(false);
            observer.complete();
          });
        })
      );
  }

  /**
   * Limpia la sesión local (localStorage y subject)
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiracion');
    localStorage.removeItem('perfil');
    localStorage.removeItem('permisos');
    this.currentUserSubject.next(null);
    this.permisosSubject.next([]);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role - Rol a verificar
   * @returns true si el usuario tiene el rol, false si no
   */
  hasRole(role: Role): boolean {
    const perfil = this.currentUserValue;
    if (!perfil || !perfil.roles) {
      return false;
    }
    return perfil.roles.includes(role);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si el usuario tiene al menos uno de los roles
   */
  hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si el usuario tiene todos los roles
   */
  hasAllRoles(roles: Role[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Verifica si el usuario está activo
   * @returns true si el estado del usuario es ACTIVO
   */
  isUserActive(): boolean {
    const perfil = this.currentUserValue;
    return perfil?.estado === EstadoEmpleado.ACTIVO;
  }

  /**
   * Obtiene el nombre completo del usuario
   * @returns Nombre completo (nombre + apellido)
   */
  getFullName(): string {
    const perfil = this.currentUserValue;
    if (!perfil) {
      return '';
    }
    return `${perfil.nombre} ${perfil.apellido}`;
  }

  /**
   * Obtiene los roles del usuario actual
   * @returns Array de roles o array vacío si no hay usuario
   */
  getUserRoles(): Role[] {
    const perfil = this.currentUserValue;
    return perfil?.roles || [];
  }

  /**
   * Mapea roles de RRHH a sistemas/módulos de la aplicación
   * @param roles - Roles del usuario del backend de RRHH
   * @returns Array de sistemas a los que tiene acceso
   */
  private mapearRolesASistemas(roles: Role[]): Sistema[] {
    const sistemas: Sistema[] = [];

    roles.forEach(role => {
      switch (role) {
        case Role.ADMIN:
          // Admin tiene acceso a todos los módulos
          sistemas.push(
            Sistema.BODEGA,
            Sistema.VENTAS,
            Sistema.RECURSOS_HUMANOS,
            Sistema.PROVEEDORES,
            Sistema.ENTREGAS
          );
          break;
        case Role.RRHH:
          // RRHH tiene acceso a recursos humanos y ventas
          sistemas.push(Sistema.RECURSOS_HUMANOS, Sistema.VENTAS);
          break;
        case Role.VENDEDOR:
          // Vendedor solo acceso a ventas
          sistemas.push(Sistema.VENTAS);
          break;
        case Role.BODEGUERO:
          // Bodeguero acceso a bodega y entregas
          sistemas.push(Sistema.BODEGA, Sistema.ENTREGAS);
          break;
        case Role.PROVEEDOR:
          // Proveedor acceso a módulo de proveedores
          sistemas.push(Sistema.PROVEEDORES);
          break;
        case Role.ENTREGADOR:
          // Entregador acceso a entregas
          sistemas.push(Sistema.ENTREGAS);
          break;
      }
    });

    // Eliminar duplicados usando Set
    return [...new Set(sistemas)];
  }

  /**
   * Obtiene los permisos de sistemas del usuario actual
   * @returns Array de sistemas a los que tiene acceso
   */
  getPermisosUsuario(): Sistema[] {
    return this.permisosSubject.value;
  }

  /**
   * Verifica si el usuario tiene acceso a un sistema específico
   * @param sistema - Sistema a verificar
   * @returns true si tiene acceso, false si no
   */
  tieneAcceso(sistema: Sistema): boolean {
    return this.permisosSubject.value.includes(sistema);
  }

  /**
   * Maneja errores de autenticación
   * @param error - Error HTTP recibido
   * @returns Observable con error formateado
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en la autenticación';
    let errorDetails = '';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de red: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object') {
      // Error del backend con estructura personalizada
      const backendError = error.error;
      
      // El backend devuelve: { codigo, mensaje, detalles, timestamp }
      if (backendError.mensaje) {
        errorMessage = backendError.mensaje;
      }
      
      if (backendError.detalles) {
        errorDetails = backendError.detalles;
        // Usar detalles como mensaje principal si es más descriptivo
        if (errorDetails && errorDetails.length > errorMessage.length) {
          errorMessage = errorDetails;
        }
      }
    } else {
      // Fallback a mensajes por código de estado
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos. Verifique usuario y contraseña.';
          break;
        case 401:
          errorMessage = 'Credenciales incorrectas o usuario inactivo.';
          break;
        case 404:
          errorMessage = 'Servicio de autenticación no disponible.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error código: ${error.status}`;
      }
    }
    
    const customError: AuthErrorResponse = {
      status: error.status,
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    };

    console.error('Auth error:', customError);
    return throwError(() => customError);
  }

  /**
   * Método legacy para compatibilidad con código existente
   * @deprecated Use login(usuario, password) instead
   */
  loginLegacy(credentials: { username: string; password: string }): Observable<any> {
    return this.login(credentials.username, credentials.password);
  }
}
