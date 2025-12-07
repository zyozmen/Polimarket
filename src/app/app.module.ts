import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { VendedorListComponent } from './components/vendedor-list/vendedor-list.component';
import { BodegaComponent } from './components/bodega/bodega.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { EntregasComponent } from './components/entregas/entregas.component';

// Servicios de autenticación
import { AuthService } from './services/auth.service';
import { EncryptionService } from './services/encryption.service';
import { PasswordEncryptionService } from './services/password-encryption.service';
import { RecursosHumanosService } from './services/recursos-humanos.service';

// Servicios para la API de Rails (backend)
import { CustomersService } from './services/customers.service';
import { ProductsService } from './services/products.service';
import { SalesService } from './services/sales.service';
import { DeliveriesService } from './services/deliveries.service';

// Servicio para la API de RRHH (akira.sedbaq.com.co)
import { RrhhApiService } from './services/rrhh-api.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptor HTTP
import { AuthInterceptor, HttpErrorInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VendedorListComponent,
    BodegaComponent,
    VentasComponent,
    ProveedoresComponent,
    EntregasComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    // Servicios de autenticación
    AuthService,
    EncryptionService,
    PasswordEncryptionService,
    RecursosHumanosService,
    // Guards
    AuthGuard,
    // Servicios REST para backend Rails
    CustomersService,
    ProductsService,
    SalesService,
    DeliveriesService,
    // Servicio REST para API RRHH
    RrhhApiService,
    // Interceptor principal para JWT
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
