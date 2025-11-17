import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  pais: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface ProveedorFilter {
  nombre?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private readonly API_URL = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getProveedores(filter?: ProveedorFilter): Observable<{ data: Proveedor[]; total: number }> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.nombre) params = params.set('nombre', filter.nombre);
      if (filter.activo !== undefined) params = params.set('activo', filter.activo.toString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<{ data: Proveedor[]; total: number }>(this.API_URL, { params });
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.API_URL}/${id}`);
  }

  createProveedor(proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.API_URL, proveedor);
  }

  updateProveedor(id: number, proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.API_URL}/${id}`, proveedor);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activarProveedor(id: number): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.API_URL}/${id}/activar`, {});
  }

  desactivarProveedor(id: number): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.API_URL}/${id}/desactivar`, {});
  }
}
