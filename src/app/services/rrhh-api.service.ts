import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearVendedorRequest {
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  codigo_vendedor: string;
}

export interface VendedorResponse {
  id: number;
  nombre: string;
  codigo_vendedor: string;
  estado_autorizacion: boolean;
}

export interface AutorizacionResponse {
  autorizado: boolean;
}

export interface CrearAdministradorRequest {
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  cargo: string;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RrhhApiService {
  private readonly API_URL = '/rrhh-api'; // Usar proxy para evitar CORS

  constructor(private http: HttpClient) {}

  /**
   * Crear un vendedor
   * POST /vendedor/crear
   */
  crearVendedor(vendedor: CrearVendedorRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/vendedor/crear`, vendedor);
  }

  /**
   * Autorizar un vendedor
   * POST /vendedor/autorizar/{id}
   */
  autorizarVendedor(id: number): Observable<AutorizacionResponse> {
    return this.http.post<AutorizacionResponse>(`${this.API_URL}/vendedor/autorizar/${id}`, {});
  }

  /**
   * Obtener información de un vendedor
   * GET /vendedor/{id}
   */
  obtenerVendedor(id: number): Observable<VendedorResponse> {
    return this.http.get<VendedorResponse>(`${this.API_URL}/vendedor/${id}`);
  }

  /**
   * Crear un administrador de RRHH
   * POST /administrador/crear
   */
  crearAdministrador(administrador: CrearAdministradorRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/administrador/crear`, administrador);
  }
}
