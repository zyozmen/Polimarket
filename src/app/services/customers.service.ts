import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Customer {
  id?: number;
  identification: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private readonly API_URL = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos los clientes
   * GET /customers
   */
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API_URL);
  }

  /**
   * Obtiene un cliente por ID
   * GET /customers/:id
   */
  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo cliente
   * POST /customers
   */
  createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Observable<Customer> {
    return this.http.post<Customer>(this.API_URL, { customer });
  }

  /**
   * Actualiza un cliente existente
   * PATCH/PUT /customers/:id
   */
  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}`, { customer });
  }

  /**
   * Elimina un cliente
   * DELETE /customers/:id
   */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Busca clientes por nombre o identificación
   * Filtrado del lado del cliente
   */
  searchCustomers(searchTerm: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API_URL);
    // Nota: El filtrado se puede hacer en el componente con:
    // customers.filter(c => c.name.includes(searchTerm) || c.identification.includes(searchTerm))
  }
}
