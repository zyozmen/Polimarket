import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Venta {
  id: number;
  numeroVenta: string;
  fecha: string;
  vendedorId: number;
  vendedor: string;
  clienteNombre: string;
  clienteDocumento: string;
  items: ItemVenta[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
}

export interface ItemVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface VentaFilter {
  fechaInicio?: string;
  fechaFin?: string;
  vendedorId?: number;
  estado?: string;
  page?: number;
  pageSize?: number;
}

export interface ReporteVentas {
  totalVentas: number;
  montoTotal: number;
  ventasPorVendedor: { vendedor: string; cantidad: number; monto: number }[];
  ventasPorMetodoPago: { metodoPago: string; cantidad: number; monto: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly API_URL = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  getVentas(filter?: VentaFilter): Observable<{ data: Venta[]; total: number }> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.fechaInicio) params = params.set('fechaInicio', filter.fechaInicio);
      if (filter.fechaFin) params = params.set('fechaFin', filter.fechaFin);
      if (filter.vendedorId) params = params.set('vendedorId', filter.vendedorId.toString());
      if (filter.estado) params = params.set('estado', filter.estado);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<{ data: Venta[]; total: number }>(this.API_URL, { params });
  }

  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.API_URL}/${id}`);
  }

  createVenta(venta: Partial<Venta>): Observable<Venta> {
    return this.http.post<Venta>(this.API_URL, venta);
  }

  cancelarVenta(id: number, motivo: string): Observable<Venta> {
    return this.http.patch<Venta>(`${this.API_URL}/${id}/cancelar`, { motivo });
  }

  getReporte(fechaInicio: string, fechaFin: string): Observable<ReporteVentas> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    return this.http.get<ReporteVentas>(`${this.API_URL}/reporte`, { params });
  }
}
