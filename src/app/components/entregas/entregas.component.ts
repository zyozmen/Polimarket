import { Component, OnInit } from '@angular/core';
import { DeliveriesService, Delivery } from '../../services/deliveries.service';
import { CustomersService, Customer } from '../../services/customers.service';
import { forkJoin } from 'rxjs';

interface EntregaLocal {
  id: number;
  ventaId: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  direccion: string;
  items: number;
  total: number;
  estado: 'pending' | 'confirmed' | 'cancelled';
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
    this.cargarDatos();
  }

  /**
   * Cargar clientes y entregas en paralelo
   */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    
    // Cargar clientes y entregas no confirmadas en paralelo
    forkJoin({
      clientes: this.customersService.getCustomers(),
      entregas: this.deliveriesService.getDeliveries()
    }).subscribe({
      next: ({ clientes, entregas }) => {
        this.clientes = clientes;
        
        // Mapear entregas con nombres reales de clientes (excluyendo confirmadas)
        this.entregas = entregas
          .filter(delivery => {
            // Filtrar entregas confirmadas del lado del cliente
            if (!delivery.delivery_status) return true;
            const estado = delivery.delivery_status.toLowerCase();
            return estado !== 'confirmada' && estado !== 'confirmed';
          })
          .map(delivery => {
          const cliente = clientes.find(c => c.id === delivery.customer_id);
          
          // Normalizar el estado del backend (viene en mayúsculas)
          let estadoNormalizado: 'pending' | 'confirmed' | 'cancelled' = 'pending';
          if (delivery.delivery_status) {
            const estado = delivery.delivery_status.toLowerCase();
            if (estado === 'pendiente' || estado === 'pending') {
              estadoNormalizado = 'pending';
            } else if (estado === 'confirmada' || estado === 'confirmed') {
              estadoNormalizado = 'confirmed';
            } else if (estado === 'cancelada' || estado === 'cancelled') {
              estadoNormalizado = 'cancelled';
            }
          }
          
          return {
            id: delivery.id || 0,
            ventaId: delivery.id || 0,
            fecha: delivery.date || new Date().toISOString().split('T')[0],
            clienteId: delivery.customer_id || 0,
            clienteNombre: cliente?.name || `Cliente #${delivery.customer_id}`,
            direccion: cliente?.address || 'Dirección no disponible',
            items: delivery.sale_items?.length || 0,
            total: typeof delivery.total === 'string' ? parseFloat(delivery.total) : (delivery.total || 0),
            estado: estadoNormalizado,
            comentarios: delivery.comments || ''
          };
        });
        
        this.aplicarFiltros();
        this.cargando = false;
        this.mensaje = `${this.entregas.length} entrega(s) cargadas`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.cargando = false;
        
        if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else if (error.status === 404) {
          this.error = 'El servidor está despertando... Intenta de nuevo en 1-2 minutos.';
        } else {
          this.error = `Error al cargar datos: ${error.message || 'Error desconocido'}`;
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

  /**
   * TrackBy para optimizar renderizado de listas
   */
  trackByEntregaId(index: number, entrega: EntregaLocal): number {
    return entrega.id;
  }
}
