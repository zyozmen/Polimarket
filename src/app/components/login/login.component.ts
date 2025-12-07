import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role, AuthErrorResponse } from '../../models/auth.model';

/**
 * Componente de Login
 * 
 * Funcionalidades:
 * - Formulario de autenticación con validaciones
 * - Cifrado automático de contraseñas con AES-256
 * - Integración con backend de Recursos Humanos (POST /auth/login)
 * - Redirección inteligente según roles del usuario
 * - Manejo robusto de errores (400, 401, 404, 500)
 * - Soporte para returnUrl (redirigir a URL original después del login)
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Formulario reactivo de login
  loginForm!: FormGroup;
  
  // Estado del componente
  loading: boolean = false;
  error: string = '';
  mensajeExito: string = '';
  showPassword: boolean = false;
  
  // URL de retorno después del login exitoso
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.getDefaultRoute()]);
      return;
    }

    // Obtener URL de retorno de los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Inicializar formulario con validaciones
    this.loginForm = this.formBuilder.group({
      usuario: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(4),
        Validators.maxLength(100)
      ]]
    });
  }

  /**
   * Maneja el envío del formulario de login
   * Cifra la contraseña automáticamente antes de enviarla al backend
   */
  onSubmit() {
    // Marcar todos los campos como touched para mostrar errores
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.error = 'Por favor complete todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.mensajeExito = '';

    const { usuario, password } = this.loginForm.value;

    this.authService.login(usuario, password).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Mostrar mensaje de éxito temporal
        this.mensajeExito = `¡Bienvenido ${response.perfil.nombre} ${response.perfil.apellido}!`;
        
        // Redirigir después de 500ms
        setTimeout(() => {
          this.redirectAfterLogin(response.perfil.roles);
        }, 500);
      },
      error: (err: AuthErrorResponse) => {
        this.loading = false;
        this.error = this.getErrorMessage(err);
      }
    });
  }

  /**
   * Redirige al usuario después de un login exitoso
   * La lógica de redirección prioriza:
   * 1. returnUrl (si existe)
   * 2. Ruta según el primer rol del usuario
   * 3. Ruta por defecto (/ventas)
   * 
   * @param roles - Roles del usuario autenticado
   */
  private redirectAfterLogin(roles: Role[]): void {
    // Si hay returnUrl, usarla
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Mapear roles a rutas
    const rutaPorRol: { [key in Role]?: string } = {
      [Role.ADMIN]: '/admin',
      [Role.RRHH]: '/recursos-humanos',
      [Role.VENDEDOR]: '/ventas',
      [Role.BODEGUERO]: '/bodega',
      [Role.PROVEEDOR]: '/proveedores',
      [Role.ENTREGADOR]: '/entregas'
    };

    // Buscar la primera ruta válida según roles
    for (const rol of roles) {
      const ruta = rutaPorRol[rol];
      if (ruta) {
        this.router.navigate([ruta]);
        return;
      }
    }

    // Ruta por defecto si no hay coincidencias
    this.router.navigate([this.getDefaultRoute()]);
  }

  /**
   * Obtiene la ruta por defecto según los roles del usuario actual
   * @returns Ruta por defecto
   */
  private getDefaultRoute(): string {
    const roles = this.authService.getUserRoles();
    
    if (roles.includes(Role.ADMIN)) return '/admin';
    if (roles.includes(Role.VENDEDOR)) return '/ventas';
    if (roles.includes(Role.BODEGUERO)) return '/bodega';
    if (roles.includes(Role.RRHH)) return '/recursos-humanos';
    
    return '/ventas'; // Fallback
  }

  /**
   * Formatea mensajes de error según el tipo de error recibido
   * @param err - Error recibido del backend
   * @returns Mensaje de error formateado para el usuario
   */
  private getErrorMessage(err: any): string {
    if (err.status === 400) {
      return 'Usuario o contraseña inválidos. Verifique los datos ingresados.';
    } else if (err.status === 401) {
      return 'Credenciales incorrectas o usuario inactivo. Contacte al administrador.';
    } else if (err.status === 404) {
      return 'Servicio de autenticación no disponible. Intente más tarde.';
    } else if (err.status === 500) {
      return 'Error del servidor. Por favor, intente nuevamente más tarde.';
    } else if (err.message) {
      return err.message;
    }
    
    return 'Error al iniciar sesión. Verifique su conexión e intente nuevamente.';
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.error = '';
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Verifica si un campo tiene error y ha sido tocado
   * @param fieldName - Nombre del campo a verificar
   * @returns true si el campo es inválido y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error o cadena vacía
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `El campo ${fieldName} es requerido.`;
    }
    
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres.`;
    }
    
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `No puede exceder ${maxLength} caracteres.`;
    }

    return 'Campo inválido.';
  }
}
