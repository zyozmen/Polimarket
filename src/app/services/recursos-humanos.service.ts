import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Vendedor, 
  Permiso, 
  TipoPermiso, 
  Sistema, 
  AuditoriaAccesos,
  Credenciales,
  Token,
  JWTPayload
} from '../models/vendedor.model';

@Injectable({
  providedIn: 'root'
})
export class RecursosHumanosService {
  private apiUrl = 'http://localhost:8080/api/rrhh'; // URL base de tu API REST
  private currentTokenSubject: BehaviorSubject<string | null>;
  public currentToken: Observable<string | null>;
  private permisosSubject: BehaviorSubject<Sistema[]>;
  public permisos$: Observable<Sistema[]>;
  
  // Credenciales hardcodeadas para desarrollo sin backend
  private readonly ADMIN_USER = 'admin';
  private readonly ADMIN_PASSWORD = 'admin123';
  private readonly VENDEDOR_USER = 'vendedor1';
  private readonly VENDEDOR_PASSWORD = 'vendedor123';
  private readonly PERSONAL_USER = 'personal';
  private readonly PERSONAL_PASSWORD = 'personal123';

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('token')
    );
    this.currentToken = this.currentTokenSubject.asObservable();
    
    // Inicializar permisos desde localStorage
    const permisosGuardados = localStorage.getItem('permisos');
    this.permisosSubject = new BehaviorSubject<Sistema[]>(
      permisosGuardados ? JSON.parse(permisosGuardados) : []
    );
    this.permisos$ = this.permisosSubject.asObservable();
  }

  // Headers para las peticiones
  private getHeaders(): HttpHeaders {
    const token = this.currentTokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ==================== Autenticación ====================

  /**
   * Autentica un usuario y obtiene un token JWT
   * Versión sin backend - valida contra credenciales hardcodeadas y dinámicas
   */
  autenticar(credenciales: Credenciales): Observable<Token> {
    let permisos: Sistema[] = [];
    let isValid = false;

    // Primero verificar usuarios hardcodeados
    if (credenciales.usuario === this.ADMIN_USER && 
        credenciales.password === this.ADMIN_PASSWORD) {
      // Admin tiene acceso a todos los módulos
      isValid = true;
      permisos = [
        Sistema.BODEGA,
        Sistema.VENTAS,
        Sistema.RECURSOS_HUMANOS,
        Sistema.PROVEEDORES,
        Sistema.ENTREGAS
      ];
    } else if (credenciales.usuario === this.VENDEDOR_USER && 
               credenciales.password === this.VENDEDOR_PASSWORD) {
      // Vendedor solo tiene acceso a ventas
      isValid = true;
      permisos = [Sistema.VENTAS];
    } else if (credenciales.usuario === this.PERSONAL_USER && 
               credenciales.password === this.PERSONAL_PASSWORD) {
      // Personal tiene acceso a bodega y entregas
      isValid = true;
      permisos = [Sistema.BODEGA, Sistema.ENTREGAS];
    } else {
      // Verificar en credenciales dinámicas (usuarios creados desde el módulo)
      const credencialesDinamicas = JSON.parse(localStorage.getItem('credenciales') || '{}');
      if (credencialesDinamicas[credenciales.usuario] && 
          credencialesDinamicas[credenciales.usuario].password === credenciales.password) {
        isValid = true;
        permisos = credencialesDinamicas[credenciales.usuario].permisos || [];
      }
    }

    if (isValid) {
      // Generar un token simulado
      const mockToken: Token = {
        token: 'mock-jwt-token-' + Date.now(),
        expira: new Date(Date.now() + 3600000).toISOString(), // 1 hora
        permisos: permisos
      };
      
      // Guardar token y permisos en localStorage
      localStorage.setItem('token', mockToken.token);
      localStorage.setItem('permisos', JSON.stringify(permisos));
      this.currentTokenSubject.next(mockToken.token);
      this.permisosSubject.next(permisos);
      
      // Simular delay de red y retornar el token
      return of(mockToken).pipe(delay(300));
    } else {
      // Credenciales inválidas
      return throwError(() => new Error('Usuario o contraseña incorrectos'));
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('permisos');
    this.currentTokenSubject.next(null);
    this.permisosSubject.next([]);
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    return !!this.currentTokenSubject.value;
  }

  /**
   * Obtiene los permisos actuales del usuario
   */
  getPermisosUsuario(): Sistema[] {
    return this.permisosSubject.value;
  }

  /**
   * Verifica si el usuario tiene acceso a un sistema específico
   */
  tieneAcceso(sistema: Sistema): boolean {
    return this.permisosSubject.value.includes(sistema);
  }

  // ==================== Gestión de Vendedores ====================

  /**
   * Obtiene todos los vendedores
   */
  getVendedores(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(`${this.apiUrl}/vendedores`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un vendedor por ID
   */
  getVendedorById(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.apiUrl}/vendedores/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo vendedor
   */
  createVendedor(vendedor: Vendedor): Observable<Vendedor> {
    return this.http.post<Vendedor>(`${this.apiUrl}/vendedores`, vendedor, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un vendedor existente
   */
  updateVendedor(id: number, vendedor: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(`${this.apiUrl}/vendedores/${id}`, vendedor, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un vendedor
   */
  deleteVendedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vendedores/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Gestión de Permisos ====================

  /**
   * Obtiene los permisos de un vendedor
   */
  getPermisos(idVendedor: number): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/vendedores/${idVendedor}/permisos`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Autoriza a un vendedor para acceder a un sistema
   */
  autorizarVendedor(idVendedor: number, tipoPermiso: TipoPermiso): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.apiUrl}/vendedores/${idVendedor}/autorizar`, 
      { tipo: tipoPermiso },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Revoca un permiso de un vendedor
   */
  revocarPermiso(idVendedor: number, tipoPermiso: TipoPermiso): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vendedores/${idVendedor}/revocar/${tipoPermiso}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Valida si un vendedor tiene acceso a un sistema
   */
  validarAcceso(idVendedor: number, sistema: Sistema): Observable<{ autorizado: boolean, permisos: string[] }> {
    return this.http.get<{ autorizado: boolean, permisos: string[] }>(
      `${this.apiUrl}/autorizaciones?usuarioId=${idVendedor}&sistema=${sistema}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Auditoría ====================

  /**
   * Obtiene el historial de accesos de un vendedor
   */
  getAuditoriaAccesos(idVendedor?: number): Observable<AuditoriaAccesos[]> {
    const url = idVendedor 
      ? `${this.apiUrl}/auditoria?vendedorId=${idVendedor}`
      : `${this.apiUrl}/auditoria`;
    
    return this.http.get<AuditoriaAccesos[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Manejo de Errores ====================

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      
      if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
