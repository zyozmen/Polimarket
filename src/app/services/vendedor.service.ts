import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vendedor } from '../models/vendedor.model';

export interface VendedorResponse {
  data: Vendedor[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VendedorFilter {
  nombre?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendedorService {
  private readonly API_URL = `${environment.apiUrl}/vendedores`;

  constructor(private http: HttpClient) {}

  getVendedores(filter?: VendedorFilter): Observable<VendedorResponse> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.nombre) params = params.set('nombre', filter.nombre);
      if (filter.activo !== undefined) params = params.set('activo', filter.activo.toString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<VendedorResponse>(this.API_URL, { params });
  }

  getVendedorById(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.API_URL}/${id}`);
  }

  createVendedor(vendedor: Partial<Vendedor>): Observable<Vendedor> {
    return this.http.post<Vendedor>(this.API_URL, vendedor);
  }

  updateVendedor(id: number, vendedor: Partial<Vendedor>): Observable<Vendedor> {
    return this.http.put<Vendedor>(`${this.API_URL}/${id}`, vendedor);
  }

  deleteVendedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activarVendedor(id: number): Observable<Vendedor> {
    return this.http.patch<Vendedor>(`${this.API_URL}/${id}/activar`, {});
  }

  desactivarVendedor(id: number): Observable<Vendedor> {
    return this.http.patch<Vendedor>(`${this.API_URL}/${id}/desactivar`, {});
  }
}
