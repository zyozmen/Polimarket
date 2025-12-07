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
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para agregar token JWT y manejar errores de autenticación
 * 
 * Funcionalidades:
 * - Agrega automáticamente el token JWT a todas las peticiones HTTP
 * - Maneja errores HTTP con mensajes personalizados
 * - Redirige al login cuando el token es inválido (401)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // NO modificar peticiones de login
    if (request.url.includes('/auth/login')) {
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      );
    }

    // Obtener token del servicio de autenticación
    const token = this.authService.getToken();

    // Clonar la petición y agregar headers necesarios
    let modifiedRequest = request.clone();

    // Agregar token JWT si existe
    if (token) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Manejar la respuesta y errores
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  /**
   * Maneja errores HTTP con mensajes personalizados
   * @param error - Error HTTP recibido
   * @returns Observable con error formateado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, etc.)
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else if (error.status === 0) {
      // Error de CORS o red
      errorMessage = 'No se puede conectar con el servidor. Verifique CORS o que el backend esté corriendo.';
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          // Bad Request - Datos inválidos
          errorMessage = (error.error && error.error.message) ? error.error.message : 'Datos inválidos en la petición.';
          if (error.error && error.error.details && Array.isArray(error.error.details)) {
            errorMessage += ' ' + error.error.details.join(', ');
          }
          break;

        case 401:
          // Unauthorized - Token inválido o expirado
          errorMessage = 'Sesión expirada o no autorizada.';
          
          // Limpiar sesión y redirigir al login
          this.authService.logout().subscribe();
          break;

        case 403:
          // Forbidden - Sin permisos
          errorMessage = 'No tiene permisos para realizar esta acción.';
          break;

        case 404:
          // Not Found
          errorMessage = (error.error && error.error.message) ? error.error.message : 'Recurso no encontrado (404).';
          break;

        case 422:
          // Unprocessable Entity - Error de validación
          errorMessage = (error.error && error.error.errors)
            ? Object.values(error.error.errors).flat().join(', ')
            : 'Error de validación en los datos enviados.';
          break;

        case 500:
          // Internal Server Error
          errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
          break;

        case 503:
          // Service Unavailable
          errorMessage = 'Servicio temporalmente no disponible.';
          break;

        default:
          errorMessage = (error.error && error.error.message) ? error.error.message : `Error código: ${error.status}`;
      }
    }
    
    // Crear un error personalizado con información completa
    const customError: any = new Error(errorMessage);
    customError.status = error.status;
    customError.statusText = error.statusText;
    customError.error = error.error;
    customError.url = error.url;
    
    return throwError(() => customError);
  }
}

/**
 * Interceptor legacy para compatibilidad con código existente
 * @deprecated Use AuthInterceptor instead
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Delegar al AuthInterceptor
    const authInterceptor = new AuthInterceptor(this.router, this.authService);
    return authInterceptor.intercept(request, next);
  }
}
