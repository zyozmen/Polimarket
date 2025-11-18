import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sale } from './sales.service';

export interface Delivery extends Sale {
  // Las entregas son ventas con delivery_status
  // Estados posibles: 'pending', 'in_progress', 'confirmed', 'cancelled'
}

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {
  private readonly API_URL = `${environment.apiUrl}/deliveries`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todas las entregas
   * GET /deliveries
   */
  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(this.API_URL);
  }

  /**
   * Lista todas las entregas no confirmadas (pending, in_progress, cancelled)
   * GET /deliveries?status[]=pending&status[]=in_progress&status[]=cancelled
   */
  getUnconfirmedDeliveries(): Observable<Delivery[]> {
    const params = {
      'status[]': ['pending', 'in_progress', 'cancelled']
    };
    return this.http.get<Delivery[]>(this.API_URL, { params });
  }

  /**
   * Confirma una entrega
   * POST /deliveries/:id/confirm
   * 
   * Marca la entrega como confirmada (delivery_status = 'confirmed')
   */
  confirmDelivery(id: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.API_URL}/${id}/confirm`, {});
  }

  /**
   * Cancela una entrega
   * POST /deliveries/:id/cancel
   * 
   * Marca la entrega como cancelada (delivery_status = 'cancelled')
   */
  cancelDelivery(id: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.API_URL}/${id}/cancel`, {});
  }

  /**
   * Marca una entrega como en progreso
   * POST /deliveries/:id/in_progress
   * 
   * Marca la entrega como en progreso (delivery_status = 'in_progress')
   */
  markInProgress(id: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.API_URL}/${id}/in_progress`, {});
  }

  /**
   * Filtra entregas por estado
   */
  filterByStatus(deliveries: Delivery[], status: string): Delivery[] {
    return deliveries.filter(delivery => delivery.delivery_status === status);
  }

  /**
   * Obtiene entregas pendientes
   */
  getPendingDeliveries(deliveries: Delivery[]): Delivery[] {
    return this.filterByStatus(deliveries, 'pending');
  }

  /**
   * Obtiene entregas en progreso
   */
  getInProgressDeliveries(deliveries: Delivery[]): Delivery[] {
    return this.filterByStatus(deliveries, 'in_progress');
  }

  /**
   * Obtiene entregas confirmadas
   */
  getConfirmedDeliveries(deliveries: Delivery[]): Delivery[] {
    return this.filterByStatus(deliveries, 'confirmed');
  }
}
