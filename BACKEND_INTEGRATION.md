// README: Guía de integración con Backend REST

## 📋 Configuración completada

Se ha configurado la aplicación para consumir servicios REST del backend con las siguientes mejoras:

### ✅ Archivos creados

1. **Configuración de entorno**
   - `src/environments/environment.ts` - Desarrollo
   - `src/environments/environment.prod.ts` - Producción

2. **Interceptor HTTP**
   - `src/app/interceptors/auth.interceptor.ts` - Maneja tokens automáticamente y errores HTTP

3. **Servicios REST**
   - `auth.service.ts` - Autenticación y autorización
   - `vendedor.service.ts` - CRUD de vendedores
   - `bodega.service.ts` - Gestión de inventario
   - `ventas.service.ts` - Gestión de ventas
   - `proveedores.service.ts` - Gestión de proveedores
   - `entregas.service.ts` - Gestión de entregas

4. **Guard de seguridad**
   - `src/app/guards/auth.guard.ts` - Protege rutas basado en autenticación y permisos

---

## 🚀 Cómo usar los servicios

### 1. Configurar la URL del backend

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://tu-backend:8080/api',  // ⬅️ Cambia esta URL
  apiTimeout: 30000,
  enableDebug: true
};
```

### 2. Ejemplo: Login

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export class LoginComponent {
  constructor(private authService: AuthService) {}

  login() {
    this.authService.login({
      username: 'admin',
      password: 'password123'
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login', error);
        alert(error.message);
      }
    });
  }
}
```

### 3. Ejemplo: Listar vendedores con filtros

```typescript
import { Component, OnInit } from '@angular/core';
import { VendedorService } from '../../services/vendedor.service';

export class VendedorListComponent implements OnInit {
  vendedores: any[] = [];
  
  constructor(private vendedorService: VendedorService) {}

  ngOnInit() {
    this.cargarVendedores();
  }

  cargarVendedores() {
    this.vendedorService.getVendedores({
      nombre: 'Juan',
      activo: true,
      page: 1,
      pageSize: 10
    }).subscribe({
      next: (response) => {
        this.vendedores = response.data;
        console.log(`Total: ${response.total}`);
      },
      error: (error) => {
        console.error('Error al cargar vendedores', error);
      }
    });
  }

  crear() {
    this.vendedorService.createVendedor({
      nombre: 'Juan Pérez',
      documento: '0123456789',
      email: 'juan@example.com'
    }).subscribe({
      next: (vendedor) => {
        console.log('Vendedor creado', vendedor);
        this.cargarVendedores();
      },
      error: (error) => alert(error.message)
    });
  }
}
```

### 4. Proteger rutas con el Guard

En `app-routing.module.ts`:

```typescript
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'vendedores',
    component: VendedorListComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['VENDEDORES_READ'] }  // Opcional
  },
  {
    path: 'bodega',
    component: BodegaComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['BODEGA_READ'] }
  }
];
```

---

## 🔧 Características implementadas

### Interceptor automático
- ✅ Añade el token JWT automáticamente a todas las peticiones
- ✅ Maneja errores HTTP (401, 403, 404, 500)
- ✅ Redirecciona al login si el token expira
- ✅ Mensajes de error descriptivos

### Servicio de autenticación
- ✅ Login y logout
- ✅ Verificación de permisos
- ✅ Refresh token
- ✅ Observable del usuario actual

### Servicios CRUD completos
- ✅ Paginación
- ✅ Filtros
- ✅ Búsqueda
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Acciones específicas (activar/desactivar, cambiar estado, etc.)

---

## 📝 Formato de respuesta esperado del backend

### Login
```json
POST /api/auth/login
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "ADMIN"
  },
  "permisos": ["VENDEDORES_READ", "BODEGA_WRITE"]
}
```

### Lista con paginación
```json
GET /api/vendedores?page=1&pageSize=10
{
  "data": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10
}
```

---

## 🎯 Próximos pasos

1. Instalar dependencias: `npm install`
2. Configurar URL del backend en `environment.ts`
3. Actualizar componentes para usar los servicios
4. Probar la conexión con el backend
5. Implementar manejo de errores en la UI (toasts, alertas)

---

## 💡 Buenas prácticas aplicadas

- ✅ Separación de responsabilidades
- ✅ Tipado fuerte con TypeScript
- ✅ Manejo centralizado de errores
- ✅ Interceptor para requests HTTP
- ✅ Guards para seguridad de rutas
- ✅ Servicios reutilizables
- ✅ Configuración por ambiente
- ✅ Observable patterns (RxJS)
