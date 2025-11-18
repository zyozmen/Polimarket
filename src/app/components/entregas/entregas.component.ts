import { Component, OnInit } from '@angular/core';
import { DeliveriesService, Delivery } from '../../services/deliveries.service';
import { CustomersService, Customer } from '../../services/customers.service';

interface EntregaLocal {
  id: number;
  ventaId: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  direccion: string;
  items: number;
  total: number;
  estado: 'pending' | 'in_progress' | 'confirmed' | 'cancelled';
  comentarios?: string;
}

@Component({
  selector: 'app-entregas',
  templateUrl: './entregas.component.html',
  styleUrls: ['./entregas.component.css']
})
export class EntregasComponent implements OnInit {
  entregas: EntregaLocal[] = [];
  entregasFiltradas: EntregaLocal[] = [];
  clientes: Customer[] = [];
  
  // Filtros
  estadoFiltro: string = 'todos';
  busqueda: string = '';
  
  // UI
  cargando = false;
  procesando = false;
  mensaje = '';
  error = '';
  
  // Estadísticas
  get totalEntregas(): number {
    return this.entregas.length;
  }
  
  get entregasPendientes(): number {
    return this.entregas.filter(e => e.estado === 'pending').length;
  }
  
  get entregasEnProgreso(): number {
    return this.entregas.filter(e => e.estado === 'in_progress').length;
  }
  
  get entregasConfirmadas(): number {
    return this.entregas.filter(e => e.estado === 'confirmed').length;
  }
  
  get entregasCanceladas(): number {
    return this.entregas.filter(e => e.estado === 'cancelled').length;
  }

  constructor(
    private deliveriesService: DeliveriesService,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarEntregas();
  }

  /**
   * Cargar clientes desde el backend
   */
  cargarClientes(): void {
    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.clientes = customers;
        console.log('✅ Clientes cargados:', customers.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar clientes:', error);
      }
    });
  }

  /**
   * Cargar entregas desde el backend
   */
  cargarEntregas(): void {
    this.cargando = true;
    this.error = '';
    
    this.deliveriesService.getDeliveries().subscribe({
      next: (deliveries) => {
        console.log('✅ Entregas recibidas del backend:', deliveries);
        
        // Mapear entregas del backend a formato local
        this.entregas = deliveries.map(delivery => {
          const cliente = this.clientes.find(c => c.id === delivery.customer_id) || {
            id: delivery.customer_id,
            name: `Cliente #${delivery.customer_id}`,
            address: 'Dirección no disponible'
          };
          
          return {
            id: delivery.id || 0,
            ventaId: delivery.id || 0,
            fecha: delivery.date || new Date().toISOString().split('T')[0],
            clienteId: delivery.customer_id,
            clienteNombre: cliente.name,
            direccion: cliente.address || 'Dirección no disponible',
            items: delivery.sale_items?.length || 0,
            total: delivery.total || 0,
            estado: delivery.delivery_status || 'pending',
            comentarios: delivery.comments
          };
        });
        
        this.aplicarFiltros();
        this.cargando = false;
        this.mensaje = `${this.entregas.length} entrega(s) cargadas desde el servidor`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al cargar entregas:', error);
        this.cargando = false;
        
        if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else if (error.status === 404) {
          this.error = 'El servidor está despertando... Intenta de nuevo en 1-2 minutos.';
        } else {
          this.error = `Error al cargar entregas: ${error.message || 'Error desconocido'}`;
        }
        
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  /**
   * Aplicar filtros a las entregas
   */
  aplicarFiltros(): void {
    let resultado = [...this.entregas];
    
    // Filtrar por estado
    if (this.estadoFiltro !== 'todos') {
      resultado = resultado.filter(e => e.estado === this.estadoFiltro);
    }
    
    // Filtrar por búsqueda (cliente, ID)
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(e => 
        e.clienteNombre.toLowerCase().includes(busquedaLower) ||
        e.id.toString().includes(busquedaLower) ||
        e.direccion.toLowerCase().includes(busquedaLower)
      );
    }
    
    this.entregasFiltradas = resultado;
  }

  /**
   * Marcar entrega como en progreso
   */
  marcarEnProgreso(entrega: EntregaLocal): void {
    if (entrega.estado !== 'pending') {
      this.error = 'Solo se pueden marcar como en progreso las entregas pendientes';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    
    if (!confirm(`¿Marcar entrega #${entrega.id} como en progreso?`)) {
      return;
    }
    
    this.procesando = true;
    this.error = '';
    
    this.deliveriesService.markInProgress(entrega.id).subscribe({
      next: (delivery) => {
        console.log('✅ Entrega marcada como en progreso:', delivery);
        
        // Actualizar localmente
        const index = this.entregas.findIndex(e => e.id === entrega.id);
        if (index !== -1) {
          this.entregas[index].estado = 'in_progress';
        }
        
        this.aplicarFiltros();
        this.procesando = false;
        this.mensaje = `Entrega #${entrega.id} marcada como en progreso`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al actualizar entrega:', error);
        this.procesando = false;
        this.error = `Error: ${error.message || 'No se pudo actualizar la entrega'}`;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  /**
   * Confirmar entrega
   */
  confirmarEntrega(entrega: EntregaLocal): void {
    if (entrega.estado === 'confirmed') {
      this.error = 'Esta entrega ya está confirmada';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    
    if (entrega.estado === 'cancelled') {
      this.error = 'No se puede confirmar una entrega cancelada';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    
    if (!confirm(`¿Confirmar la entrega #${entrega.id} para ${entrega.clienteNombre}?`)) {
      return;
    }
    
    this.procesando = true;
    this.error = '';
    
    this.deliveriesService.confirmDelivery(entrega.id).subscribe({
      next: (delivery) => {
        console.log('✅ Entrega confirmada:', delivery);
        
        // Actualizar localmente
        const index = this.entregas.findIndex(e => e.id === entrega.id);
        if (index !== -1) {
          this.entregas[index].estado = 'confirmed';
        }
        
        this.aplicarFiltros();
        this.procesando = false;
        this.mensaje = `Entrega #${entrega.id} confirmada exitosamente`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al confirmar entrega:', error);
        this.procesando = false;
        this.error = `Error: ${error.message || 'No se pudo confirmar la entrega'}`;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  /**
   * Cancelar entrega
   */
  cancelarEntrega(entrega: EntregaLocal): void {
    if (entrega.estado === 'confirmed') {
      this.error = 'No se puede cancelar una entrega ya confirmada';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    
    if (entrega.estado === 'cancelled') {
      this.error = 'Esta entrega ya está cancelada';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    
    if (!confirm(`¿Estás seguro de cancelar la entrega #${entrega.id}?`)) {
      return;
    }
    
    this.procesando = true;
    this.error = '';
    
    this.deliveriesService.cancelDelivery(entrega.id).subscribe({
      next: (delivery) => {
        console.log('✅ Entrega cancelada:', delivery);
        
        // Actualizar localmente
        const index = this.entregas.findIndex(e => e.id === entrega.id);
        if (index !== -1) {
          this.entregas[index].estado = 'cancelled';
        }
        
        this.aplicarFiltros();
        this.procesando = false;
        this.mensaje = `Entrega #${entrega.id} cancelada`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al cancelar entrega:', error);
        this.procesando = false;
        this.error = `Error: ${error.message || 'No se pudo cancelar la entrega'}`;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  /**
   * Obtener clase CSS según el estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'in_progress':
        return 'badge bg-info';
      case 'confirmed':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Obtener texto del estado
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Limpiar mensajes
   */
  limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }
}
