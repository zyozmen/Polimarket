/**
 * Ejemplo de Configuración de app.module.ts
 * 
 * Este archivo muestra cómo configurar correctamente los interceptors
 * y providers necesarios para la integración con el backend de RRHH
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Servicios
import { AuthService } from './services/auth.service';
import { EncryptionService } from './services/encryption.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { BodegaComponent } from './components/bodega/bodega.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { EntregasComponent } from './components/entregas/entregas.component';
import { VendedorListComponent } from './components/vendedor-list/vendedor-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VentasComponent,
    BodegaComponent,
    ProveedoresComponent,
    EntregasComponent,
    VendedorListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    // Servicios
    AuthService,
    EncryptionService,
    
    // Guards
    AuthGuard,
    
    // Interceptor HTTP para agregar JWT automáticamente
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
