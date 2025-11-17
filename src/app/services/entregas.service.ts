import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Entrega {
  id: number;
  numeroEntrega: string;
  ventaId: number;
  numeroVenta: string;
  fecha: string;
  direccionEntrega: string;
  ciudad: string;
  clienteNombre: string;
  clienteTelefono: string;
  repartidorId: number;
  repartidor: string;
  estado: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADA' | 'CANCELADA';
  observaciones: string;
  fechaEntrega?: string;
  firmadoPor?: string;
}

export interface EntregaFilter {
  fechaInicio?: string;
  fechaFin?: string;
  repartidorId?: number;
  estado?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EntregasService {
  private readonly API_URL = `${environment.apiUrl}/entregas`;

  constructor(private http: HttpClient) {}

  getEntregas(filter?: EntregaFilter): Observable<{ data: Entrega[]; total: number }> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.fechaInicio) params = params.set('fechaInicio', filter.fechaInicio);
      if (filter.fechaFin) params = params.set('fechaFin', filter.fechaFin);
      if (filter.repartidorId) params = params.set('repartidorId', filter.repartidorId.toString());
      if (filter.estado) params = params.set('estado', filter.estado);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<{ data: Entrega[]; total: number }>(this.API_URL, { params });
  }

  getEntregaById(id: number): Observable<Entrega> {
    return this.http.get<Entrega>(`${this.API_URL}/${id}`);
  }

  createEntrega(entrega: Partial<Entrega>): Observable<Entrega> {
    return this.http.post<Entrega>(this.API_URL, entrega);
  }

  updateEntrega(id: number, entrega: Partial<Entrega>): Observable<Entrega> {
    return this.http.put<Entrega>(`${this.API_URL}/${id}`, entrega);
  }

  cambiarEstado(id: number, estado: string, observaciones?: string): Observable<Entrega> {
    return this.http.patch<Entrega>(`${this.API_URL}/${id}/estado`, { 
      estado, 
      observaciones 
    });
  }

  marcarEnRuta(id: number): Observable<Entrega> {
    return this.cambiarEstado(id, 'EN_RUTA');
  }

  marcarEntregada(id: number, firmadoPor: string, observaciones?: string): Observable<Entrega> {
    return this.http.patch<Entrega>(`${this.API_URL}/${id}/entregar`, {
      firmadoPor,
      observaciones,
      fechaEntrega: new Date().toISOString()
    });
  }

  cancelarEntrega(id: number, motivo: string): Observable<Entrega> {
    return this.http.patch<Entrega>(`${this.API_URL}/${id}/cancelar`, { motivo });
  }

  getRepartidores(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(`${this.API_URL}/repartidores`);
  }
}
