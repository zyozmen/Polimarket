import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo agregar Content-Type para POST, PUT, PATCH
    if (request.method !== 'GET' && request.method !== 'DELETE') {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Manejar la respuesta y errores
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 404:
              errorMessage = 'Recurso no encontrado.';
              break;
            case 422:
              errorMessage = error.error?.errors 
                ? Object.values(error.error.errors).flat().join(', ')
                : 'Error de validación.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor.';
              break;
            default:
              errorMessage = error.error?.message || `Error código: ${error.status}`;
          }
        }

        console.error('Error en la petición:', errorMessage, error);
        
        // Crear un error personalizado que incluya el status code
        const customError: any = new Error(errorMessage);
        customError.status = error.status;
        customError.statusText = error.statusText;
        customError.error = error.error;
        
        return throwError(() => customError);
      })
    );
  }
}
