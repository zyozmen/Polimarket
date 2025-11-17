import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  proveedor: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MovimientoInventario {
  id: number;
  productoId: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  usuario: string;
  fecha: string;
}

export interface ProductoFilter {
  nombre?: string;
  categoria?: string;
  stockBajo?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  private readonly API_URL = `${environment.apiUrl}/bodega`;

  constructor(private http: HttpClient) {}

  getProductos(filter?: ProductoFilter): Observable<{ data: Producto[]; total: number }> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.nombre) params = params.set('nombre', filter.nombre);
      if (filter.categoria) params = params.set('categoria', filter.categoria);
      if (filter.stockBajo) params = params.set('stockBajo', 'true');
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<{ data: Producto[]; total: number }>(`${this.API_URL}/productos`, { params });
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/productos/${id}`);
  }

  createProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.API_URL}/productos`, producto);
  }

  updateProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.API_URL}/productos/${id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/productos/${id}`);
  }

  registrarMovimiento(movimiento: Partial<MovimientoInventario>): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.API_URL}/movimientos`, movimiento);
  }

  getMovimientos(productoId?: number): Observable<MovimientoInventario[]> {
    let params = new HttpParams();
    if (productoId) {
      params = params.set('productoId', productoId.toString());
    }
    return this.http.get<MovimientoInventario[]>(`${this.API_URL}/movimientos`, { params });
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categorias`);
  }
}
