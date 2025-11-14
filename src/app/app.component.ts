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

  logout(): void {
    this.rrhhService.logout();
    this.router.navigate(['/login']);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
