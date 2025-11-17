import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated) {
      // Verificar permisos si están definidos en la ruta
      const requiredPermissions = route.data['permissions'] as string[];
      
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = this.authService.hasAnyPermission(requiredPermissions);
        
        if (!hasPermission) {
          console.warn('Acceso denegado: permisos insuficientes');
          this.router.navigate(['/']);
          return false;
        }
      }
      
      return true;
    }

    // No autenticado, redirigir al login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
