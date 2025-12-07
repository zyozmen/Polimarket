import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Sistema } from './models/vendedor.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PoliMarket';
  permisos: Sistema[] = [];
  Sistema = Sistema; // Exponer enum al template
  menuAbierto = false; // Control del menú responsive

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en los permisos
    this.authService.permisos$.subscribe(permisos => {
      this.permisos = permisos;
      console.log('Permisos actualizados en AppComponent:', permisos);
    });
  }

  tieneAcceso(sistema: Sistema): boolean {
    return this.permisos.includes(sistema);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout exitoso');
        this.router.navigate(['/login']);
        this.cerrarMenu();
      },
      error: (err) => {
        console.error('Error en logout:', err);
        // Aunque falle, redirigir al login
        this.router.navigate(['/login']);
        this.cerrarMenu();
      }
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
