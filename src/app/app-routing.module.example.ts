/**
 * Ejemplo de Configuración de app-routing.module.ts
 * 
 * Este archivo muestra cómo proteger rutas con AuthGuard
 * y configurar roles requeridos para cada ruta
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Modelos
import { Role } from './models/auth.model';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { BodegaComponent } from './components/bodega/bodega.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { EntregasComponent } from './components/entregas/entregas.component';
import { VendedorListComponent } from './components/vendedor-list/vendedor-list.component';

const routes: Routes = [
  // ============================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ============================================
  { 
    path: 'login', 
    component: LoginComponent 
  },

  // ============================================
  // RUTAS PROTEGIDAS (requieren autenticación)
  // ============================================
  
  // Ruta protegida básica - solo requiere estar autenticado
  { 
    path: 'ventas', 
    component: VentasComponent,
    canActivate: [AuthGuard]
  },

  // Ruta con rol específico requerido
  { 
    path: 'bodega', 
    component: BodegaComponent,
    canActivate: [AuthGuard],
    data: { 
      roles: [Role.BODEGUERO, Role.ADMIN],  // Usuario debe tener uno de estos roles
      requireAllRoles: false  // false = al menos uno de los roles
    }
  },

  // Ruta con múltiples roles (al menos uno)
  { 
    path: 'proveedores', 
    component: ProveedoresComponent,
    canActivate: [AuthGuard],
    data: { 
      roles: [Role.PROVEEDOR, Role.ADMIN],
      requireAllRoles: false
    }
  },

  // Ruta con múltiples roles (todos requeridos)
  { 
    path: 'recursos-humanos', 
    component: VendedorListComponent,
    canActivate: [AuthGuard],
    data: { 
      roles: [Role.ADMIN, Role.RRHH],
      requireAllRoles: true  // true = usuario debe tener TODOS los roles
    }
  },

  // Ruta solo para administradores
  { 
    path: 'admin', 
    component: VendedorListComponent,
    canActivate: [AuthGuard],
    data: { 
      roles: [Role.ADMIN],
      requireAllRoles: false
    }
  },

  // Ruta para entregas
  { 
    path: 'entregas', 
    component: EntregasComponent,
    canActivate: [AuthGuard],
    data: { 
      roles: [Role.ENTREGADOR, Role.ADMIN],
      requireAllRoles: false
    }
  },

  // ============================================
  // REDIRECCIONES
  // ============================================
  
  // Ruta raíz redirige a login
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },

  // Cualquier ruta no definida redirige a login
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


/*
 * EJEMPLOS DE USO DE ROLES:
 * 
 * 1. RUTA BÁSICA (solo autenticación):
 *    { path: 'ruta', component: Component, canActivate: [AuthGuard] }
 * 
 * 2. RUTA CON UN ROL:
 *    data: { roles: [Role.ADMIN] }
 * 
 * 3. RUTA CON VARIOS ROLES (al menos uno):
 *    data: { roles: [Role.ADMIN, Role.RRHH], requireAllRoles: false }
 * 
 * 4. RUTA CON VARIOS ROLES (todos):
 *    data: { roles: [Role.ADMIN, Role.RRHH], requireAllRoles: true }
 * 
 * ROLES DISPONIBLES:
 * - Role.ADMIN
 * - Role.RRHH
 * - Role.VENDEDOR
 * - Role.BODEGUERO
 * - Role.PROVEEDOR
 * - Role.ENTREGADOR
 */
