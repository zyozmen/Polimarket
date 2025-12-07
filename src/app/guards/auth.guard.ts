import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

/**
 * Guard de autenticación y autorización
 * 
 * Funcionalidades:
 * - Valida que el usuario esté autenticado antes de acceder a rutas protegidas
 * - Valida el token JWT con el backend (GET /auth/validate)
 * - Verifica roles requeridos para acceder a rutas específicas
 * - Redirige al login si no está autenticado o el token es inválido
 * - Redirige a página de acceso denegado si no tiene los roles necesarios
 * 
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [AuthGuard],
 *   data: { 
 *     roles: [Role.ADMIN, Role.RRHH],  // Opcional: roles requeridos
 *     requireAllRoles: false            // true = todos los roles, false = al menos uno
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Determina si una ruta puede ser activada
   * @param route - Snapshot de la ruta a activar
   * @param state - Estado del router
   * @returns Observable<boolean> o boolean indicando si se permite el acceso
   */
  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    
    // Verificar si hay token en localStorage
    if (!this.authService.isAuthenticated) {
      console.warn('No hay sesión activa, redirigiendo al login');
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Validar el token con el backend
    return this.authService.validateToken().pipe(
      map(isValid => {
        if (!isValid) {
          // Token inválido, redirigir al login
          console.warn('Token inválido, redirigiendo al login');
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          });
        }

        // Verificar si el usuario está activo
        if (!this.authService.isUserActive()) {
          console.warn('Usuario inactivo, acceso denegado');
          alert('Su cuenta está inactiva. Contacte al administrador.');
          this.authService.logout().subscribe();
          return this.router.createUrlTree(['/login']);
        }

        // Verificar roles requeridos si están definidos en la ruta
        const requiredRoles = route.data['roles'] as Role[];
        const requireAllRoles = route.data['requireAllRoles'] as boolean;

        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRoles = requireAllRoles
            ? this.authService.hasAllRoles(requiredRoles)
            : this.authService.hasAnyRole(requiredRoles);

          if (!hasRequiredRoles) {
            console.warn('Acceso denegado: roles insuficientes', {
              required: requiredRoles,
              user: this.authService.getUserRoles()
            });
            
            alert('No tiene permisos para acceder a esta sección.');
            return this.router.createUrlTree(['/']);
          }
        }

        // Token válido y permisos correctos
        return true;
      })
    );
  }

  /**
   * Método auxiliar para verificar roles sin validar token
   * Útil para verificaciones rápidas en componentes
   * @param requiredRoles - Roles requeridos
   * @param requireAll - Si se requieren todos los roles o al menos uno
   */
  checkRoles(requiredRoles: Role[], requireAll: boolean = false): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requireAll
      ? this.authService.hasAllRoles(requiredRoles)
      : this.authService.hasAnyRole(requiredRoles);
  }
}
