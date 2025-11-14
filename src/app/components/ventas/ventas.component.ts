import { Component, OnInit } from '@angular/core';

interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  tipoCliente: 'Regular' | 'VIP' | 'Nuevo';
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoria: string;
  proveedor: string;
  imagen?: string;
  cantidadAgregar?: number;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

interface Venta {
  id: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  estado: 'Completada' | 'Pendiente' | 'Cancelada';
  vendedor: string;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  seccionActiva: 'clientes' | 'productos' | 'realizar-venta' = 'clientes';
  
  // Datos
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  ventas: Venta[] = [];
  clientesFiltrados: Cliente[] = [];
  productosFiltrados: Producto[] = [];
  
  // Carrito de compras
  carrito: ItemCarrito[] = [];
  clienteVenta: Cliente | null = null;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' = 'Efectivo';
  descuentoPorcentaje = 0;
  notasVenta = '';
  
  // Búsqueda y filtros
  busquedaClientes = '';
  tipoClienteFiltro = 'todos';
  busquedaProductos = '';
  categoriaFiltro = 'todas';
  categorias: string[] = [];
  
  // Formularios
  mostrarFormCliente = false;
  clienteSeleccionado: Cliente | null = null;
  
  nuevoCliente: Cliente = {
    id: '',
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    tipoCliente: 'Nuevo'
  };
  
  // UI
  mensaje = '';
  error = '';

  constructor() {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar clientes
    const clientesGuardados = localStorage.getItem('clientes');
    if (clientesGuardados) {
      this.clientes = JSON.parse(clientesGuardados);
    } else {
      // Datos de ejemplo
      this.clientes = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          documento: '1234567890',
          email: 'juan.perez@email.com',
          telefono: '3001234567',
          direccion: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          tipoCliente: 'VIP'
        },
        {
          id: '2',
          nombre: 'María García',
          documento: '9876543210',
          email: 'maria.garcia@email.com',
          telefono: '3009876543',
          direccion: 'Carrera 45 #12-34',
          ciudad: 'Medellín',
          tipoCliente: 'Regular'
        },
        {
          id: '3',
          nombre: 'Carlos López',
          documento: '5555555555',
          email: 'carlos.lopez@email.com',
          telefono: '3105555555',
          direccion: 'Avenida 68 #23-45',
          ciudad: 'Cali',
          tipoCliente: 'Regular'
        },
        {
          id: '4',
          nombre: 'Ana Martínez',
          documento: '1111111111',
          email: 'ana.martinez@email.com',
          telefono: '3201111111',
          direccion: 'Calle 80 #10-20',
          ciudad: 'Bogotá',
          tipoCliente: 'Nuevo'
        }
      ];
      this.guardarClientes();
    }
    
    // Cargar productos desde bodega
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      this.productos = JSON.parse(productosGuardados);
      // Inicializar cantidadAgregar para cada producto
      this.productos.forEach(p => p.cantidadAgregar = 1);
    }
    
    // Cargar ventas
    const ventasGuardadas = localStorage.getItem('ventas');
    if (ventasGuardadas) {
      this.ventas = JSON.parse(ventasGuardadas);
    }
    
    this.actualizarCategorias();
    this.aplicarFiltros();
  }

  guardarClientes(): void {
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
  }

  actualizarCategorias(): void {
    const cats = new Set(this.productos.map(p => p.categoria));
    this.categorias = Array.from(cats);
  }

  cambiarSeccion(seccion: 'clientes' | 'productos' | 'realizar-venta'): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();
    this.cerrarFormularios();
  }

  aplicarFiltros(): void {
    // Filtrar clientes
    this.clientesFiltrados = this.clientes.filter(c => {
      const coincideBusqueda = !this.busquedaClientes || 
        c.nombre.toLowerCase().includes(this.busquedaClientes.toLowerCase()) ||
        c.documento.includes(this.busquedaClientes);
      
      const coincideTipo = this.tipoClienteFiltro === 'todos' || 
        c.tipoCliente === this.tipoClienteFiltro;
      
      return coincideBusqueda && coincideTipo;
    });
    
    // Filtrar productos
    this.productosFiltrados = this.productos.filter(p => {
      const coincideBusqueda = !this.busquedaProductos || 
        p.nombre.toLowerCase().includes(this.busquedaProductos.toLowerCase()) ||
        p.codigo.toLowerCase().includes(this.busquedaProductos.toLowerCase());
      
      const coincideCategoria = this.categoriaFiltro === 'todas' || 
        p.categoria === this.categoriaFiltro;
      
      return coincideBusqueda && coincideCategoria;
    });
  }

  abrirFormCliente(cliente?: Cliente): void {
    if (cliente) {
      this.clienteSeleccionado = { ...cliente };
      this.nuevoCliente = { ...cliente };
    } else {
      this.clienteSeleccionado = null;
      this.nuevoCliente = {
        id: '',
        nombre: '',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        tipoCliente: 'Nuevo'
      };
    }
    this.mostrarFormCliente = true;
    this.limpiarMensajes();
  }

  guardarCliente(): void {
    // Validar campos obligatorios
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.documento) {
      this.error = 'Nombre y documento son obligatorios';
      return;
    }
    
    if (this.clienteSeleccionado) {
      // Actualizar cliente existente
      const index = this.clientes.findIndex(c => c.id === this.clienteSeleccionado!.id);
      if (index > -1) {
        this.clientes[index] = { ...this.nuevoCliente };
        this.mensaje = 'Cliente actualizado exitosamente';
      }
    } else {
      // Crear nuevo cliente
      const cliente: Cliente = {
        ...this.nuevoCliente,
        id: Date.now().toString()
      };
      this.clientes.push(cliente);
      this.mensaje = 'Cliente creado exitosamente';
    }
    
    this.guardarClientes();
    this.aplicarFiltros();
    this.cerrarFormularios();
  }

  eliminarCliente(id: string): void {
    const cliente = this.clientes.find(c => c.id === id);
    if (cliente && confirm(`¿Está seguro de eliminar al cliente "${cliente.nombre}"?`)) {
      this.clientes = this.clientes.filter(c => c.id !== id);
      this.guardarClientes();
      this.aplicarFiltros();
      this.mensaje = 'Cliente eliminado exitosamente';
    }
  }

  getTipoClienteClass(tipo: string): string {
    switch (tipo) {
      case 'VIP': return 'tipo-vip';
      case 'Regular': return 'tipo-regular';
      case 'Nuevo': return 'tipo-nuevo';
      default: return '';
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'sin-stock';
    if (stock < 10) return 'stock-bajo';
    return 'stock-disponible';
  }

  cerrarFormularios(): void {
    this.mostrarFormCliente = false;
    this.clienteSeleccionado = null;
  }

  limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(precio);
  }

  // ==================== Gestión de Carrito ====================

  iniciarVenta(cliente: Cliente): void {
    this.clienteVenta = cliente;
    this.carrito = [];
    this.metodoPago = 'Efectivo';
    this.descuentoPorcentaje = 0;
    this.notasVenta = '';
    this.cambiarSeccion('realizar-venta');
    this.mensaje = `Venta iniciada para ${cliente.nombre}`;
  }

  incrementarCantidad(producto: Producto): void {
    if (!producto.cantidadAgregar) {
      producto.cantidadAgregar = 1;
    }
    if (producto.cantidadAgregar < producto.stock) {
      producto.cantidadAgregar++;
    }
  }

  decrementarCantidad(producto: Producto): void {
    if (!producto.cantidadAgregar) {
      producto.cantidadAgregar = 1;
    }
    if (producto.cantidadAgregar > 1) {
      producto.cantidadAgregar--;
    }
  }

  agregarTodoStock(producto: Producto): void {
    producto.cantidadAgregar = producto.stock;
  }

  resetearCantidad(producto: Producto): void {
    producto.cantidadAgregar = 1;
  }

  agregarAlCarrito(producto: Producto, cantidad: number = 1): void {
    if (producto.stock === 0) {
      this.error = 'Producto sin stock disponible';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (cantidad <= 0) {
      this.error = 'La cantidad debe ser mayor a 0';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (cantidad > producto.stock) {
      this.error = `Solo hay ${producto.stock} unidades disponibles`;
      setTimeout(() => this.error = '', 3000);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad <= (itemExistente.producto.stock + itemExistente.cantidad)) {
        // Restaurar stock temporal del producto en la lista
        const productoEnLista = this.productos.find(p => p.id === producto.id);
        if (productoEnLista) {
          productoEnLista.stock += itemExistente.cantidad;
        }
        
        // Actualizar cantidad en carrito
        itemExistente.cantidad = nuevaCantidad;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
        
        // Decrementar stock visual
        if (productoEnLista) {
          productoEnLista.stock -= nuevaCantidad;
        }
        itemExistente.producto.stock = productoEnLista?.stock || 0;
        
        this.mensaje = `Cantidad actualizada: ${producto.nombre} (${itemExistente.cantidad} unidades)`;
      } else {
        this.error = `No hay suficiente stock disponible. Máximo: ${itemExistente.producto.stock + itemExistente.cantidad} unidades`;
        setTimeout(() => this.error = '', 3000);
        return;
      }
    } else {
      const item: ItemCarrito = {
        producto: { ...producto },
        cantidad: cantidad,
        subtotal: producto.precio * cantidad
      };
      this.carrito.push(item);
      
      // Decrementar stock visual inmediatamente
      const productoEnLista = this.productos.find(p => p.id === producto.id);
      if (productoEnLista) {
        productoEnLista.stock -= cantidad;
        item.producto.stock = productoEnLista.stock;
      }
      
      this.mensaje = `Producto agregado: ${producto.nombre} (${cantidad} unidades)`;
    }
    
    this.aplicarFiltros();
    setTimeout(() => this.mensaje = '', 2000);
  }

  actualizarCantidad(item: ItemCarrito, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarDelCarrito(item);
      return;
    }

    const productoEnLista = this.productos.find(p => p.id === item.producto.id);
    const stockDisponibleTotal = productoEnLista ? productoEnLista.stock + item.cantidad : item.cantidad;

    if (cantidad > stockDisponibleTotal) {
      this.error = `Solo hay ${stockDisponibleTotal} unidades disponibles`;
      setTimeout(() => this.error = '', 3000);
      return;
    }

    // Restaurar stock anterior
    if (productoEnLista) {
      productoEnLista.stock += item.cantidad;
    }

    // Actualizar cantidad y decrementar nuevo stock
    item.cantidad = cantidad;
    item.subtotal = item.cantidad * item.producto.precio;
    
    if (productoEnLista) {
      productoEnLista.stock -= cantidad;
      item.producto.stock = productoEnLista.stock;
    }
    
    this.aplicarFiltros();
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    // Restaurar stock visual
    const productoEnLista = this.productos.find(p => p.id === item.producto.id);
    if (productoEnLista) {
      productoEnLista.stock += item.cantidad;
    }
    
    this.carrito = this.carrito.filter(i => i !== item);
    this.aplicarFiltros();
    this.mensaje = 'Producto eliminado del carrito';
    setTimeout(() => this.mensaje = '', 2000);
  }

  calcularSubtotal(): number {
    return this.carrito.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularDescuento(): number {
    return this.calcularSubtotal() * (this.descuentoPorcentaje / 100);
  }

  calcularImpuesto(): number {
    const subtotalConDescuento = this.calcularSubtotal() - this.calcularDescuento();
    return subtotalConDescuento * 0.19; // IVA del 19%
  }

  calcularTotal(): number {
    return this.calcularSubtotal() - this.calcularDescuento() + this.calcularImpuesto();
  }

  // ==================== Procesamiento de Ventas ====================

  procesarVenta(): void {
    if (!this.clienteVenta) {
      this.error = 'Debe seleccionar un cliente';
      return;
    }

    if (this.carrito.length === 0) {
      this.error = 'El carrito está vacío';
      return;
    }

    // Crear la venta (el stock ya está actualizado visualmente)
    const venta: Venta = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      clienteId: this.clienteVenta.id,
      clienteNombre: this.clienteVenta.nombre,
      items: [...this.carrito],
      subtotal: this.calcularSubtotal(),
      descuento: this.calcularDescuento(),
      impuesto: this.calcularImpuesto(),
      total: this.calcularTotal(),
      metodoPago: this.metodoPago,
      estado: 'Completada',
      vendedor: localStorage.getItem('token') || 'Sistema'
    };

    // Guardar productos con stock actualizado en localStorage (sincroniza con bodega)
    localStorage.setItem('productos', JSON.stringify(this.productos));

    // Guardar venta
    this.ventas.push(venta);
    localStorage.setItem('ventas', JSON.stringify(this.ventas));

    // Actualizar tipo de cliente si es necesario
    if (this.clienteVenta.tipoCliente === 'Nuevo') {
      const cliente = this.clientes.find(c => c.id === this.clienteVenta!.id);
      if (cliente) {
        cliente.tipoCliente = 'Regular';
        this.guardarClientes();
      }
    }

    this.mensaje = `¡Venta procesada exitosamente! Total: ${this.formatearPrecio(venta.total)}`;
    
    // Limpiar carrito y volver a clientes
    this.carrito = [];
    this.clienteVenta = null;
    this.metodoPago = 'Efectivo';
    this.descuentoPorcentaje = 0;
    this.notasVenta = '';
    
    setTimeout(() => {
      this.cambiarSeccion('clientes');
      this.limpiarMensajes();
    }, 2000);
  }

  cancelarVenta(): void {
    if (this.carrito.length > 0) {
      if (!confirm('¿Está seguro de cancelar la venta? Se perderán los datos del carrito.')) {
        return;
      }
      
      // Restaurar stock de todos los productos en el carrito
      this.carrito.forEach(item => {
        const productoEnLista = this.productos.find(p => p.id === item.producto.id);
        if (productoEnLista) {
          productoEnLista.stock += item.cantidad;
        }
      });
    }
    
    this.carrito = [];
    this.clienteVenta = null;
    this.metodoPago = 'Efectivo';
    this.descuentoPorcentaje = 0;
    this.notasVenta = '';
    this.cambiarSeccion('clientes');
    this.aplicarFiltros();
    this.limpiarMensajes();
  }

  obtenerVentasCliente(clienteId: string): Venta[] {
    return this.ventas.filter(v => v.clienteId === clienteId);
  }

  getTotalVentasCliente(clienteId: string): number {
    return this.obtenerVentasCliente(clienteId)
      .reduce((total, venta) => total + venta.total, 0);
  }
}
