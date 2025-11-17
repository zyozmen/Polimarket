import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { VendedorListComponent } from './components/vendedor-list/vendedor-list.component';
import { BodegaComponent } from './components/bodega/bodega.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { EntregasComponent } from './components/entregas/entregas.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'bodega', component: BodegaComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'recursos-humanos', component: VendedorListComponent },
  { path: 'vendedores', redirectTo: '/recursos-humanos', pathMatch: 'full' },
  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'entregas', component: EntregasComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
