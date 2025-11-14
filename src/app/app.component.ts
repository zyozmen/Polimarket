import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecursosHumanosService } from './services/recursos-humanos.service';
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
    public rrhhService: RecursosHumanosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en los permisos
    this.rrhhService.permisos$.subscribe(permisos => {
      this.permisos = permisos;
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
    this.rrhhService.logout();
    this.router.navigate(['/login']);
    this.cerrarMenu();
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
