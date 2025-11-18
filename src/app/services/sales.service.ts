import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SaleItem {
  id?: number;
  product_id: number;
  quantity: number;
  comment?: string;
  price?: number;
  discount?: number;
  taxes_amount?: number;
  total_item?: number;
}

export interface Sale {
  id?: number;
  customer_id: number;
  seller_id: number;
  date: string;
  comments?: string;
  total?: number | string;  // Backend puede enviar string "5100.0" o number
  delivery_status?: string;  // Backend envía "PENDIENTE", "EN_PROGRESO", etc.
  created_at?: string;
  sale_items?: SaleItem[];
}

export interface CreateSaleRequest {
  sale: {
    customer_id: number;
    seller_id: number;
    date: string;
    comments?: string;
    sale_items_attributes: Array<{
      product_id: number;
      quantity: number;
      comment?: string;
      discount?: number;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly API_URL = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todas las ventas
   * GET /sales
   */
  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.API_URL);
  }

  /**
   * Obtiene una venta por ID
   * GET /sales/:id
   */
  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva venta
   * POST /sales
   * 
   * @example
   * createSale({
   *   sale: {
   *     customer_id: 1,
   *     seller_id: 1,
   *     date: "2025-11-14",
   *     comments: "Entrega urgente",
   *     sale_items_attributes: [
   *       { product_id: 1, quantity: 2, comment: "", discount: 0 }
   *     ]
   *   }
   * })
   */
  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.API_URL, request);
  }

  /**
   * Filtra ventas por fecha, cliente o vendedor
   * Nota: El filtrado se hace del lado del cliente
   */
  filterSales(
    sales: Sale[],
    filters: {
      dateFrom?: string;
      dateTo?: string;
      customerId?: number;
      sellerId?: number;
      deliveryStatus?: string;
    }
  ): Sale[] {
    return sales.filter(sale => {
      if (filters.dateFrom && sale.date < filters.dateFrom) return false;
      if (filters.dateTo && sale.date > filters.dateTo) return false;
      if (filters.customerId && sale.customer_id !== filters.customerId) return false;
      if (filters.sellerId && sale.seller_id !== filters.sellerId) return false;
      if (filters.deliveryStatus && sale.delivery_status !== filters.deliveryStatus) return false;
      return true;
    });
  }

  /**
   * Calcula el total de ventas
   */
  calculateTotal(sales: Sale[]): number {
    return sales.reduce((sum, sale) => {
      const total = typeof sale.total === 'string' ? parseFloat(sale.total) : (sale.total || 0);
      return sum + total;
    }, 0);
  }
}
