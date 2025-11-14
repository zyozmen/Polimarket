import { Component, OnInit } from '@angular/core';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  categoria: string;
  proveedor: string;
}

interface SolicitudProveedor {
  id: string;
  fecha: Date;
  producto: string;
  cantidad: number;
  proveedor: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
  observaciones: string;
}

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  styleUrls: ['./bodega.component.css']
})
export class BodegaComponent implements OnInit {
  seccionActiva: 'stock' | 'consulta' | 'solicitudes' = 'consulta';
  
  // Datos
  productos: Producto[] = [];
  solicitudes: SolicitudProveedor[] = [];
  productosFiltrados: Producto[] = [];
  
  // Búsqueda y filtros
  busqueda = '';
  categoriaFiltro = 'todas';
  categorias: string[] = [];
  
  // Formularios
  mostrarFormStock = false;
  mostrarFormSolicitud = false;
  
  productoSeleccionado: Producto | null = null;
  
  nuevoStock = {
    cantidad: 0,
    tipo: 'entrada' as 'entrada' | 'salida'
  };
  
  nuevaSolicitud = {
    productoId: '',
    cantidad: 0,
    proveedor: '',
    observaciones: ''
  };
  
  // UI
  mensaje = '';
  error = '';

  constructor() {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar productos desde localStorage o usar datos de ejemplo
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      this.productos = JSON.parse(productosGuardados);
    } else {
      // Datos de ejemplo
      this.productos = [
        {
          id: '1',
          codigo: 'PROD001',
          nombre: 'Laptop Dell Inspiron',
          descripcion: 'Laptop 15.6", Intel i5, 8GB RAM, 256GB SSD',
          stock: 15,
          stockMinimo: 5,
          precio: 1200000,
          categoria: 'Electrónica',
          proveedor: 'Tech Solutions'
        },
        {
          id: '2',
          codigo: 'PROD002',
          nombre: 'Mouse Logitech M720',
          descripcion: 'Mouse inalámbrico ergonómico',
          stock: 45,
          stockMinimo: 20,
          precio: 85000,
          categoria: 'Periféricos',
          proveedor: 'Office Supplies'
        },
        {
          id: '3',
          codigo: 'PROD003',
          nombre: 'Teclado Mecánico RGB',
          descripcion: 'Teclado mecánico con iluminación RGB',
          stock: 3,
          stockMinimo: 10,
          precio: 150000,
          categoria: 'Periféricos',
          proveedor: 'Gaming Pro'
        },
        {
          id: '4',
          codigo: 'PROD004',
          nombre: 'Monitor Samsung 24"',
          descripcion: 'Monitor Full HD 24 pulgadas',
          stock: 8,
          stockMinimo: 5,
          precio: 450000,
          categoria: 'Electrónica',
          proveedor: 'Tech Solutions'
        }
      ];
      this.guardarProductos();
    }
    
    // Cargar solicitudes
    const solicitudesGuardadas = localStorage.getItem('solicitudes');
    if (solicitudesGuardadas) {
      this.solicitudes = JSON.parse(solicitudesGuardadas);
    }
    
    this.actualizarCategorias();
    this.aplicarFiltros();
  }

  guardarProductos(): void {
    localStorage.setItem('productos', JSON.stringify(this.productos));
  }

  guardarSolicitudes(): void {
    localStorage.setItem('solicitudes', JSON.stringify(this.solicitudes));
  }

  actualizarCategorias(): void {
    const cats = new Set(this.productos.map(p => p.categoria));
    this.categorias = Array.from(cats);
  }

  cambiarSeccion(seccion: 'stock' | 'consulta' | 'solicitudes'): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();
    this.cerrarFormularios();
  }

  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const coincideBusqueda = !this.busqueda || 
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(this.busqueda.toLowerCase());
      
      const coincideCategoria = this.categoriaFiltro === 'todas' || 
        p.categoria === this.categoriaFiltro;
      
      return coincideBusqueda && coincideCategoria;
    });
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = { ...producto };
    this.mostrarFormStock = true;
    this.nuevoStock = { cantidad: 0, tipo: 'entrada' };
    this.limpiarMensajes();
  }

  actualizarStock(): void {
    if (!this.productoSeleccionado || this.nuevoStock.cantidad <= 0) {
      this.error = 'Ingrese una cantidad válida';
      return;
    }

    const index = this.productos.findIndex(p => p.id === this.productoSeleccionado!.id);
    if (index > -1) {
      if (this.nuevoStock.tipo === 'entrada') {
        this.productos[index].stock += this.nuevoStock.cantidad;
        this.mensaje = `Stock actualizado: +${this.nuevoStock.cantidad} unidades`;
      } else {
        if (this.productos[index].stock >= this.nuevoStock.cantidad) {
          this.productos[index].stock -= this.nuevoStock.cantidad;
          this.mensaje = `Stock actualizado: -${this.nuevoStock.cantidad} unidades`;
        } else {
          this.error = 'Stock insuficiente para realizar la salida';
          return;
        }
      }
      
      this.guardarProductos();
      this.aplicarFiltros();
      this.cerrarFormularios();
    }
  }

  abrirFormSolicitud(producto: Producto): void {
    this.productoSeleccionado = { ...producto };
    this.mostrarFormSolicitud = true;
    this.nuevaSolicitud = {
      productoId: producto.id,
      cantidad: producto.stockMinimo - producto.stock > 0 ? producto.stockMinimo - producto.stock : 1,
      proveedor: producto.proveedor,
      observaciones: ''
    };
    this.limpiarMensajes();
  }

  crearSolicitud(): void {
    if (!this.productoSeleccionado || this.nuevaSolicitud.cantidad <= 0) {
      this.error = 'Ingrese una cantidad válida';
      return;
    }

    const solicitud: SolicitudProveedor = {
      id: Date.now().toString(),
      fecha: new Date(),
      producto: this.productoSeleccionado.nombre,
      cantidad: this.nuevaSolicitud.cantidad,
      proveedor: this.nuevaSolicitud.proveedor,
      estado: 'Pendiente',
      observaciones: this.nuevaSolicitud.observaciones
    };

    this.solicitudes.unshift(solicitud);
    this.guardarSolicitudes();
    this.mensaje = 'Solicitud creada exitosamente';
    this.cerrarFormularios();
  }

  cambiarEstadoSolicitud(solicitud: SolicitudProveedor, nuevoEstado: 'Aprobada' | 'Rechazada' | 'Entregada'): void {
    const index = this.solicitudes.findIndex(s => s.id === solicitud.id);
    if (index > -1) {
      this.solicitudes[index].estado = nuevoEstado;
      this.guardarSolicitudes();
      this.mensaje = `Solicitud ${nuevoEstado.toLowerCase()}`;
    }
  }

  getProductosStockBajo(): Producto[] {
    return this.productos.filter(p => p.stock < p.stockMinimo);
  }

  getEstadoStockClass(producto: Producto): string {
    if (producto.stock === 0) return 'stock-critico';
    if (producto.stock < producto.stockMinimo) return 'stock-bajo';
    return 'stock-normal';
  }

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
    this.mostrarFormStock = false;
    this.mostrarFormSolicitud = false;
    this.productoSeleccionado = null;
  }

  limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }
}
