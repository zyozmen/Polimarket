import { Component, OnInit } from '@angular/core';

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  categorias: string[];
  activo: boolean;
}

interface SolicitudProveedor {
  id: string;
  fecha: Date;
  producto: string;
  productoId: string;
  cantidad: number;
  proveedor: string;
  proveedorId: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
  observaciones: string;
  fechaEstimada?: Date;
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  categoria: string;
}

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  seccionActiva: 'proveedores' | 'solicitudes' | 'crear-solicitud' = 'solicitudes';
  
  // Datos
  proveedores: Proveedor[] = [];
  solicitudes: SolicitudProveedor[] = [];
  productos: Producto[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  solicitudesFiltradas: SolicitudProveedor[] = [];
  
  // Búsqueda y filtros
  busquedaProveedor = '';
  busquedaSolicitud = '';
  estadoFiltro = 'todos';
  proveedorFiltro = 'todos';
  
  // Formularios
  mostrarFormProveedor = false;
  proveedorSeleccionado: Proveedor | null = null;
  
  nuevoProveedor: Proveedor = {
    id: '',
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    categorias: [],
    activo: true
  };
  
  nuevaSolicitud = {
    productoId: '',
    cantidad: 0,
    proveedorId: '',
    observaciones: '',
    fechaEstimada: ''
  };
  
  // UI
  mensaje = '';
  error = '';

  constructor() {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar proveedores
    const proveedoresGuardados = localStorage.getItem('proveedores');
    if (proveedoresGuardados) {
      this.proveedores = JSON.parse(proveedoresGuardados);
    } else {
      // Datos de ejemplo
      this.proveedores = [
        {
          id: '1',
          nombre: 'Tech Solutions',
          contacto: 'Juan Pérez',
          telefono: '3001234567',
          email: 'contacto@techsolutions.com',
          direccion: 'Calle 100 #15-20',
          ciudad: 'Bogotá',
          categorias: ['Electrónica', 'Computadores'],
          activo: true
        },
        {
          id: '2',
          nombre: 'Office Supplies',
          contacto: 'María García',
          telefono: '3109876543',
          email: 'ventas@officesupplies.com',
          direccion: 'Carrera 50 #12-34',
          ciudad: 'Medellín',
          categorias: ['Periféricos', 'Suministros'],
          activo: true
        },
        {
          id: '3',
          nombre: 'Gaming Pro',
          contacto: 'Carlos López',
          telefono: '3205555555',
          email: 'info@gamingpro.com',
          direccion: 'Avenida 68 #45-67',
          ciudad: 'Cali',
          categorias: ['Periféricos', 'Gaming'],
          activo: true
        }
      ];
      this.guardarProveedores();
    }
    
    // Cargar solicitudes
    const solicitudesGuardadas = localStorage.getItem('solicitudes');
    if (solicitudesGuardadas) {
      this.solicitudes = JSON.parse(solicitudesGuardadas);
    }
    
    // Cargar productos
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      this.productos = JSON.parse(productosGuardados);
    }
    
    this.aplicarFiltros();
  }

  guardarProveedores(): void {
    localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
  }

  guardarSolicitudes(): void {
    localStorage.setItem('solicitudes', JSON.stringify(this.solicitudes));
  }

  cambiarSeccion(seccion: 'proveedores' | 'solicitudes' | 'crear-solicitud'): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();
    this.cerrarFormularios();
  }

  aplicarFiltros(): void {
    // Filtrar proveedores
    this.proveedoresFiltrados = this.proveedores.filter(p => {
      const coincideBusqueda = !this.busquedaProveedor || 
        p.nombre.toLowerCase().includes(this.busquedaProveedor.toLowerCase()) ||
        p.ciudad.toLowerCase().includes(this.busquedaProveedor.toLowerCase());
      
      return coincideBusqueda;
    });
    
    // Filtrar solicitudes
    this.solicitudesFiltradas = this.solicitudes.filter(s => {
      const coincideBusqueda = !this.busquedaSolicitud || 
        s.producto.toLowerCase().includes(this.busquedaSolicitud.toLowerCase()) ||
        s.proveedor.toLowerCase().includes(this.busquedaSolicitud.toLowerCase());
      
      const coincideEstado = this.estadoFiltro === 'todos' || 
        s.estado === this.estadoFiltro;
      
      const coincideProveedor = this.proveedorFiltro === 'todos' || 
        s.proveedor === this.proveedorFiltro;
      
      return coincideBusqueda && coincideEstado && coincideProveedor;
    });
  }

  // ==================== Gestión de Proveedores ====================

  abrirFormProveedor(proveedor?: Proveedor): void {
    if (proveedor) {
      this.proveedorSeleccionado = { ...proveedor };
      this.nuevoProveedor = { ...proveedor };
    } else {
      this.proveedorSeleccionado = null;
      this.nuevoProveedor = {
        id: '',
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        categorias: [],
        activo: true
      };
    }
    this.mostrarFormProveedor = true;
    this.limpiarMensajes();
  }

  guardarProveedor(): void {
    if (!this.nuevoProveedor.nombre || !this.nuevoProveedor.contacto) {
      this.error = 'Nombre y contacto son obligatorios';
      return;
    }
    
    if (this.proveedorSeleccionado) {
      // Actualizar proveedor existente
      const index = this.proveedores.findIndex(p => p.id === this.proveedorSeleccionado!.id);
      if (index > -1) {
        this.proveedores[index] = { ...this.nuevoProveedor };
        this.mensaje = 'Proveedor actualizado exitosamente';
      }
    } else {
      // Crear nuevo proveedor
      const proveedor: Proveedor = {
        ...this.nuevoProveedor,
        id: Date.now().toString()
      };
      this.proveedores.push(proveedor);
      this.mensaje = 'Proveedor creado exitosamente';
    }
    
    this.guardarProveedores();
    this.aplicarFiltros();
    this.cerrarFormularios();
  }

  eliminarProveedor(id: string): void {
    const proveedor = this.proveedores.find(p => p.id === id);
    if (proveedor && confirm(`¿Está seguro de eliminar al proveedor "${proveedor.nombre}"?`)) {
      this.proveedores = this.proveedores.filter(p => p.id !== id);
      this.guardarProveedores();
      this.aplicarFiltros();
      this.mensaje = 'Proveedor eliminado exitosamente';
    }
  }

  toggleEstadoProveedor(proveedor: Proveedor): void {
    const index = this.proveedores.findIndex(p => p.id === proveedor.id);
    if (index > -1) {
      this.proveedores[index].activo = !this.proveedores[index].activo;
      this.guardarProveedores();
      this.aplicarFiltros();
      this.mensaje = `Proveedor ${this.proveedores[index].activo ? 'activado' : 'desactivado'}`;
    }
  }

  // ==================== Gestión de Solicitudes ====================

  crearSolicitud(): void {
    if (!this.nuevaSolicitud.productoId || this.nuevaSolicitud.cantidad <= 0 || !this.nuevaSolicitud.proveedorId) {
      this.error = 'Complete todos los campos obligatorios';
      return;
    }

    const producto = this.productos.find(p => p.id === this.nuevaSolicitud.productoId);
    const proveedor = this.proveedores.find(p => p.id === this.nuevaSolicitud.proveedorId);

    if (!producto || !proveedor) {
      this.error = 'Producto o proveedor no encontrado';
      return;
    }

    const solicitud: SolicitudProveedor = {
      id: Date.now().toString(),
      fecha: new Date(),
      producto: producto.nombre,
      productoId: producto.id,
      cantidad: this.nuevaSolicitud.cantidad,
      proveedor: proveedor.nombre,
      proveedorId: proveedor.id,
      estado: 'Pendiente',
      observaciones: this.nuevaSolicitud.observaciones,
      fechaEstimada: this.nuevaSolicitud.fechaEstimada ? new Date(this.nuevaSolicitud.fechaEstimada) : undefined
    };

    this.solicitudes.unshift(solicitud);
    this.guardarSolicitudes();
    this.mensaje = 'Solicitud creada exitosamente';
    this.nuevaSolicitud = {
      productoId: '',
      cantidad: 0,
      proveedorId: '',
      observaciones: '',
      fechaEstimada: ''
    };
    this.cambiarSeccion('solicitudes');
  }

  cambiarEstadoSolicitud(solicitud: SolicitudProveedor, nuevoEstado: 'Aprobada' | 'Rechazada' | 'Entregada'): void {
    const index = this.solicitudes.findIndex(s => s.id === solicitud.id);
    if (index > -1) {
      this.solicitudes[index].estado = nuevoEstado;
      
      // Si la solicitud fue entregada, actualizar el stock del producto
      if (nuevoEstado === 'Entregada') {
        const producto = this.productos.find(p => p.id === solicitud.productoId);
        if (producto) {
          producto.stock += solicitud.cantidad;
          localStorage.setItem('productos', JSON.stringify(this.productos));
          this.mensaje = `Solicitud entregada y stock actualizado (+${solicitud.cantidad} unidades)`;
        }
      } else {
        this.mensaje = `Solicitud ${nuevoEstado.toLowerCase()}`;
      }
      
      this.guardarSolicitudes();
      this.aplicarFiltros();
    }
  }

  eliminarSolicitud(id: string): void {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
      this.guardarSolicitudes();
      this.aplicarFiltros();
      this.mensaje = 'Solicitud eliminada';
    }
  }

  getProductosStockBajo(): Producto[] {
    return this.productos.filter(p => p.stock < p.stockMinimo);
  }

  getSolicitudesPendientes(): SolicitudProveedor[] {
    return this.solicitudes.filter(s => s.estado === 'Pendiente');
  }

  // ==================== UI Helpers ====================

  getEstadoSolicitudClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'estado-pendiente';
      case 'Aprobada': return 'estado-aprobada';
      case 'Rechazada': return 'estado-rechazada';
      case 'Entregada': return 'estado-entregada';
      default: return '';
    }
  }

  cerrarFormularios(): void {
    this.mostrarFormProveedor = false;
    this.proveedorSeleccionado = null;
  }

  limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }
}
