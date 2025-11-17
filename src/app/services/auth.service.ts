import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    username: string;
    nombre: string;
    rol: string;
  };
  permisos: string[];
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser$: Observable<Usuario | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(
      usuarioGuardado ? JSON.parse(usuarioGuardado) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token y datos del usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          localStorage.setItem('permisos', JSON.stringify(response.permisos));
          this.currentUserSubject.next(response.usuario);
        })
      );
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasPermission(permiso: string): boolean {
    const permisos = localStorage.getItem('permisos');
    if (!permisos) return false;
    
    const permisosArray: string[] = JSON.parse(permisos);
    return permisosArray.includes(permiso);
  }

  hasAnyPermission(permisos: string[]): boolean {
    return permisos.some(permiso => this.hasPermission(permiso));
  }

  hasAllPermissions(permisos: string[]): boolean {
    return permisos.every(permiso => this.hasPermission(permiso));
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/refresh-token`, {})
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }
}
