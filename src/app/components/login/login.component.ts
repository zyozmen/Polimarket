import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecursosHumanosService } from '../../services/recursos-humanos.service';
import { Credenciales } from '../../models/vendedor.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private rrhhService: RecursosHumanosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redireccionar si ya está autenticado
    if (this.rrhhService.isAuthenticated()) {
      this.router.navigate(['/ventas']);
    }

    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const credenciales: Credenciales = this.loginForm.value;

    this.rrhhService.autenticar(credenciales).subscribe({
      next: (token) => {
        this.loading = false;
        
        // Redirigir al primer módulo disponible según permisos
        const permisos = token.permisos || [];
        if (permisos.length > 0) {
          // Mapear Sistema a ruta
          const rutasPorSistema: { [key: string]: string } = {
            'VENTAS': '/ventas',
            'BODEGA': '/bodega',
            'RECURSOS_HUMANOS': '/recursos-humanos',
            'PROVEEDORES': '/proveedores',
            'ENTREGAS': '/entregas'
          };
          
          // Redirigir al primer módulo con permiso
          const primeraRuta = rutasPorSistema[permisos[0]];
          this.router.navigate([primeraRuta || '/ventas']);
        } else {
          this.router.navigate(['/ventas']);
        }
      },
      error: (err) => {
        this.error = err.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
