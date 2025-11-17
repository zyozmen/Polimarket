import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly API_URL = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos los productos
   * GET /products
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  /**
   * Obtiene un producto por ID
   * GET /products/:id
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  /**
   * Busca productos por nombre
   * Filtrado del lado del cliente
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
    // Filtrar en el componente: products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }
}
