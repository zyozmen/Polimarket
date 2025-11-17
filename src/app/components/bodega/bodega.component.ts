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
  productoId: string;
  cantidad: number;
  proveedor: string;
  proveedorId: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
  observaciones: string;
  fechaEstimada?: string;
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
  productosFiltrados: Producto[] = [];
  proveedores: any[] = [];
  
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
    proveedorId: '',
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
    
    // Cargar proveedores
    const proveedoresGuardados = localStorage.getItem('proveedores');
    if (proveedoresGuardados) {
      this.proveedores = JSON.parse(proveedoresGuardados);
    }
    
    this.actualizarCategorias();
    this.aplicarFiltros();
  }

  guardarProductos(): void {
    localStorage.setItem('productos', JSON.stringify(this.productos));
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
    
    // Buscar proveedor por nombre
    const proveedor = this.proveedores.find(p => p.nombre === producto.proveedor);
    
    this.nuevaSolicitud = {
      productoId: producto.id,
      cantidad: producto.stockMinimo - producto.stock > 0 ? producto.stockMinimo - producto.stock : 1,
      proveedorId: proveedor?.id || '',
      observaciones: ''
    };
    this.limpiarMensajes();
  }

  crearSolicitud(): void {
    if (!this.productoSeleccionado || this.nuevaSolicitud.cantidad <= 0) {
      this.error = 'Ingrese una cantidad válida';
      return;
    }

    if (!this.nuevaSolicitud.proveedorId) {
      this.error = 'Seleccione un proveedor';
      return;
    }

    // ⚠️ VALIDACIÓN: Verificar si ya existe una solicitud pendiente o aprobada para este producto
    const solicitudesGuardadas = localStorage.getItem('solicitudes');
    const solicitudesExistentes: SolicitudProveedor[] = solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : [];
    
    const solicitudPendiente = solicitudesExistentes.find(s => 
      s.productoId === this.productoSeleccionado!.id && 
      (s.estado === 'Pendiente' || s.estado === 'Aprobada')
    );

    if (solicitudPendiente) {
      this.error = `Ya existe una solicitud ${solicitudPendiente.estado.toLowerCase()} para este producto. ` +
                   `Por favor espere a que sea procesada antes de crear una nueva solicitud.`;
      return;
    }

    // Buscar información del proveedor
    const proveedor = this.proveedores.find(p => p.id === this.nuevaSolicitud.proveedorId);
    
    const solicitud: SolicitudProveedor = {
      id: Date.now().toString(),
      fecha: new Date(),
      producto: this.productoSeleccionado.nombre,
      productoId: this.productoSeleccionado.id,
      cantidad: this.nuevaSolicitud.cantidad,
      proveedor: proveedor?.nombre || 'Sin proveedor',
      proveedorId: this.nuevaSolicitud.proveedorId,
      estado: 'Pendiente',
      observaciones: this.nuevaSolicitud.observaciones
    };

    // Guardar en localStorage (se gestiona desde Proveedores)
    solicitudesExistentes.unshift(solicitud);
    localStorage.setItem('solicitudes', JSON.stringify(solicitudesExistentes));
    
    this.mensaje = 'Solicitud creada exitosamente. Puede gestionarla desde el módulo de Proveedores';
    this.cerrarFormularios();
  }

  getProductosStockBajo(): Producto[] {
    return this.productos.filter(p => p.stock < p.stockMinimo);
  }

  getEstadoStockClass(producto: Producto): string {
    if (producto.stock === 0) return 'stock-critico';
    if (producto.stock < producto.stockMinimo) return 'stock-bajo';
    return 'stock-normal';
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
