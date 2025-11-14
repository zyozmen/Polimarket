import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
import { RecursosHumanosService } from './services/recursos-humanos.service';

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
  providers: [RecursosHumanosService],
  bootstrap: [AppComponent]
})
export class AppModule { }
