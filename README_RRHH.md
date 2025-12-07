# 🚀 Integración Backend RRHH - Inicio Rápido

## ⚡ Instalación Rápida

```powershell
# Opción 1: Script automatizado
.\install-rrhh-integration.ps1

# Opción 2: Manual
npm install crypto-js
npm install --save-dev @types/crypto-js
```

## 📋 Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `models/auth.model.ts` | Interfaces de autenticación |
| `services/encryption.service.ts` | Cifrado AES-256 |
| `services/auth.service.ts` | Servicio de autenticación |
| `guards/auth.guard.ts` | Protección de rutas |
| `interceptors/auth.interceptor.ts` | Interceptor JWT |
| `components/login/login.component.ts` | Componente login |

## ⚙️ Configuración Mínima

### 1. Configurar `app.module.ts`

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### 2. Configurar Rutas Protegidas

```typescript
import { AuthGuard } from './guards/auth.guard';
import { Role } from './models/auth.model';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'ventas', 
    component: VentasComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  }
];
```

## 🔐 Uso Básico

### Login
```typescript
constructor(private authService: AuthService) {}

login() {
  this.authService.login('usuario', 'password').subscribe({
    next: (response) => console.log('Login exitoso', response),
    error: (err) => console.error('Error', err)
  });
}
```

### Verificar Autenticación
```typescript
if (this.authService.isAuthenticated) {
  console.log('Usuario autenticado');
}
```

### Verificar Roles
```typescript
import { Role } from './models/auth.model';

if (this.authService.hasRole(Role.ADMIN)) {
  console.log('Es administrador');
}
```

### Logout
```typescript
this.authService.logout().subscribe({
  next: () => console.log('Sesión cerrada')
});
```

## 🌐 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Autenticar empleado |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/validate` | Validar token |

**Base URL:** `http://localhost:8081`

## ✅ Verificación

1. ✓ Backend corriendo en puerto 8081
2. ✓ Dependencias instaladas
3. ✓ AuthInterceptor configurado
4. ✓ Rutas protegidas con AuthGuard
5. ✓ Clave secreta AES configurada

## 📚 Documentación Completa

- `INTEGRACION_RRHH.md` - Guía completa
- `CHECKLIST_CONFIGURACION.md` - Checklist detallado
- `EJEMPLOS_USO.ts` - Ejemplos prácticos
- `app.module.example.ts` - Configuración de módulo
- `app-routing.module.example.ts` - Configuración de rutas

## 🔑 Roles Disponibles

- `Role.ADMIN` - Administrador
- `Role.RRHH` - Recursos Humanos
- `Role.VENDEDOR` - Vendedor
- `Role.BODEGUERO` - Bodeguero
- `Role.PROVEEDOR` - Proveedor
- `Role.ENTREGADOR` - Entregador

## ⚠️ Importante

1. **Clave secreta:** Debe coincidir con el backend
2. **CORS:** Configurar en el backend o usar proxy
3. **HTTPS:** Usar en producción
4. **Variables de entorno:** Para claves en producción

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Error 404 | Verificar que backend esté corriendo |
| Error 401 | Verificar credenciales y estado del usuario |
| Error CORS | Configurar proxy o headers CORS en backend |
| Token no se agrega | Verificar AuthInterceptor en app.module.ts |

## 🎯 Próximos Pasos

1. Ejecutar: `.\install-rrhh-integration.ps1`
2. Configurar `AuthInterceptor` en `app.module.ts`
3. Actualizar `app-routing.module.ts` con rutas protegidas
4. Iniciar backend: `http://localhost:8081`
5. Ejecutar: `npm start`
6. Probar login en el navegador

---

**¿Necesitas ayuda?** Consulta `INTEGRACION_RRHH.md` para documentación detallada.
