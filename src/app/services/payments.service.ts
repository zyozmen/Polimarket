import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CheckoutSessionResponse,
  PaymentRequest,
  PaymentStatusResponse,
  PayuBackendContract,
  TransactionType,
  TransactionTypeOption
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly API_URL = `${environment.apiUrl}${environment.payu.backendPath}`;

  constructor(private http: HttpClient) {}

  createCheckoutSession(payload: PaymentRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(`${this.API_URL}/checkout`, payload).pipe(
      catchError((error) => {
        const message = error?.message || 'No fue posible crear la sesion de pago';
        return throwError(() => new Error(message));
      })
    );
  }

  getPaymentStatus(reference: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.API_URL}/status/${reference}`).pipe(
      catchError((error) => {
        const message = error?.message || 'No fue posible consultar el estado del pago';
        return throwError(() => new Error(message));
      })
    );
  }

  buildReference(prefix: string = 'PMK'): string {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${stamp}-${random}`;
  }

  getTransactionTypeOptions(): TransactionTypeOption[] {
    return [
      {
        value: TransactionType.AUTHORIZATION_AND_CAPTURE,
        label: 'Autorizacion y captura',
        description: 'Cobro inmediato al cliente.'
      },
      {
        value: TransactionType.AUTHORIZATION,
        label: 'Solo autorizacion',
        description: 'Reserva fondos sin capturar de inmediato.'
      },
      {
        value: TransactionType.CAPTURE,
        label: 'Captura',
        description: 'Captura una autorizacion existente.'
      },
      {
        value: TransactionType.REFUND,
        label: 'Reembolso',
        description: 'Devuelve total o parcialmente una transaccion.'
      }
    ];
  }

  getBackendContract(): PayuBackendContract {
    return {
      checkoutEndpoint: `${this.API_URL}/checkout`,
      statusEndpoint: `${this.API_URL}/status/{reference}`,
      payloadExample: {
        reference: 'PMK-20260416-1001',
        description: 'Pago pedido #1001',
        amount: 150000,
        currency: 'COP',
        transactionType: TransactionType.AUTHORIZATION_AND_CAPTURE,
        payer: {
          fullName: 'Cliente Demo',
          email: 'cliente@demo.com',
          document: '1234567890',
          phone: '3000000000'
        },
        returnUrl: 'https://tu-frontend/pagos/resultado',
        confirmationUrl: 'https://tu-backend/webhooks/payu/confirmacion'
      },
      responseExample: {
        success: true,
        reference: 'PMK-20260416-1001',
        status: 'CREATED',
        redirectUrl: 'https://checkout.payulatam.com/....',
        message: 'Sesion de pago creada'
      }
    };
  }
}
