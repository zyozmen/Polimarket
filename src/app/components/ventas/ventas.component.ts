import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CustomersService, Customer } from '../../services/customers.service';
import { ProductsService, Product } from '../../services/products.service';

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
  notasVenta?: string;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  seccionActiva: 'clientes' | 'ventas' | 'productos' | 'realizar-venta' = 'clientes';
  
  // Datos
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  ventas: Venta[] = [];
  clientesFiltrados: Cliente[] = [];
  productosFiltrados: Producto[] = [];
  
  // Carrito de compras
  carrito: ItemCarrito[] = [];
  clienteVenta: Cliente | null = null;
  clienteVentasFiltro: Cliente | null = null; // Cliente para filtrar historial de ventas
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
  cargandoVentas = false;
  cargandoClientes = false;
  cargandoProductos = false;

  constructor(
    private salesService: SalesService,
    private customersService: CustomersService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.cargarClientesDesdeBackend();
    this.cargarProductosDesdeBackend();
    this.cargarDatos();
    this.cargarVentasDesdeBackend();
  }

  /**
   * Carga los clientes desde el backend REST
   */
  cargarClientesDesdeBackend(): void {
    this.cargandoClientes = true;
    this.error = '';
    
    this.customersService.getCustomers().subscribe({
      next: (customersBackend) => {
        console.log('✅ Clientes cargados desde el backend:', customersBackend);
        
        // Mapear Customer (backend) a Cliente (interfaz local)
        this.clientes = customersBackend.map(customer => ({
          id: customer.id?.toString() || '',
          nombre: customer.name || '',
          documento: customer.identification || '',
          email: customer.email || '',
          telefono: customer.phone || '',
          direccion: customer.address || '',
          ciudad: '', // No existe en backend, campo local
          tipoCliente: 'Regular' as 'Regular' | 'VIP' | 'Nuevo' // Por defecto
        }));
        
        this.cargandoClientes = false;
        this.aplicarFiltros();
        console.log(`${this.clientes.length} clientes cargados desde el servidor`);
      },
      error: (error) => {
        console.error('❌ Error al cargar clientes:', error);
        
        if (error.status === 404) {
          this.error = 'El servidor está despertando... Por favor espera 1-2 minutos e intenta de nuevo.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else {
          this.error = `Error al cargar clientes: ${error.message || 'Error desconocido'}`;
        }
        
        this.cargandoClientes = false;
        
        // Cargar desde localStorage como respaldo
        this.cargarClientesDesdeLocalStorage();
      }
    });
  }

  /**
   * Respaldo: carga clientes desde localStorage
   */
  private cargarClientesDesdeLocalStorage(): void {
    const clientesGuardados = localStorage.getItem('clientes');
    if (clientesGuardados) {
      this.clientes = JSON.parse(clientesGuardados);
      this.aplicarFiltros();
    }
  }

  cargarDatos(): void {
    // Los clientes se cargan desde cargarClientesDesdeBackend()
    // Los productos se cargan desde cargarProductosDesdeBackend()
    // Las ventas se cargan desde cargarVentasDesdeBackend()
    
    // Solo aplicar filtros iniciales
    this.aplicarFiltros();
  }

  /**
   * Carga las ventas desde el backend REST
   */
  cargarVentasDesdeBackend(): void {
    this.cargandoVentas = true;
    this.error = '';
    
    this.salesService.getSales().subscribe({
      next: (ventasBackend) => {
        console.log('✅ Ventas cargadas desde el backend:', ventasBackend);
        
        // Mapear las ventas del backend al formato local
        this.ventas = ventasBackend.map(venta => ({
          id: venta.id?.toString() || '',
          fecha: venta.date || '',
          clienteId: venta.customer_id?.toString() || '',
          clienteNombre: `Cliente #${venta.customer_id}`, // El backend no devuelve el nombre
          items: (venta.sale_items || []).map(item => ({
            producto: {
              id: item.product_id?.toString() || '',
              codigo: '',
              nombre: `Producto #${item.product_id}`,
              descripcion: '',
              precio: item.price || 0,
              stock: 0,
              categoria: '',
              proveedor: ''
            },
            cantidad: item.quantity || 0,
            subtotal: item.total_item || 0
          })),
          subtotal: venta.total || 0,
          descuento: 0,
          impuesto: 0,
          total: venta.total || 0,
          metodoPago: 'Efectivo',
          estado: this.mapearEstadoEntrega(venta.delivery_status),
          vendedor: `Vendedor #${venta.seller_id}`
        }));
        
        this.cargandoVentas = false;
        this.mensaje = `${this.ventas.length} ventas cargadas desde el servidor`;
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al cargar ventas:', error);
        
        if (error.status === 404) {
          console.warn('⚠️ El servidor está despertando o el endpoint /sales no está disponible');
        } else if (error.status === 0) {
          console.warn('⚠️ No se pudo conectar al servidor para cargar ventas');
        } else {
          console.warn(`⚠️ Error al cargar ventas: ${error.message || 'Error desconocido'}`);
        }
        
        this.cargandoVentas = false;
        
        // Cargar ventas desde localStorage como respaldo (sin mostrar error)
        const ventasGuardadas = localStorage.getItem('ventas');
        if (ventasGuardadas) {
          this.ventas = JSON.parse(ventasGuardadas);
          console.log('✅ Ventas cargadas desde localStorage como respaldo');
        }
      }
    });
  }

  /**
   * Carga los productos desde el backend REST
   */
  cargarProductosDesdeBackend(): void {
    this.cargandoProductos = true;
    this.error = '';

    this.productsService.getProducts().subscribe({
      next: (productsBackend) => {
        console.log('✅ Productos cargados desde el backend:', productsBackend);
        
        // Mapear Product (backend) a Producto (interfaz local)
        this.productos = productsBackend.map(product => ({
          id: product.id?.toString() || '',
          codigo: `PROD-${product.id}`,
          nombre: product.name || '',
          descripcion: product.description || '',
          precio: product.price || 0,
          stock: product.stock || 0,
          stockMinimo: 10,
          categoria: product.category || 'General',
          proveedor: 'Sin especificar',
          cantidadAgregar: 1
        }));
        
        // Extraer categorías únicas
        this.categorias = ['todas', ...new Set(this.productos.map(p => p.categoria))];
        
        this.cargandoProductos = false;
        this.aplicarFiltros();
        console.log(`${this.productos.length} productos cargados desde el servidor`);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        
        if (error.status === 404) {
          this.error = 'El servidor está despertando... Por favor espera 1-2 minutos e intenta de nuevo.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else {
          this.error = `Error al cargar productos: ${error.message || 'Error desconocido'}`;
        }
        
        this.cargandoProductos = false;
        
        // Cargar desde localStorage como respaldo
        this.cargarProductosDesdeLocalStorage();
      }
    });
  }

  /**
   * Carga productos desde localStorage como respaldo
   */
  cargarProductosDesdeLocalStorage(): void {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      this.productos = JSON.parse(productosGuardados);
      this.categorias = ['todas', ...new Set(this.productos.map(p => p.categoria))];
      this.aplicarFiltros();
      console.log('⚠️ Productos cargados desde localStorage como respaldo');
    } else {
      console.log('⚠️ No hay productos en localStorage');
    }
  }

  /**
   * Mapea el estado de entrega del backend al estado de venta local
   */
  private mapearEstadoEntrega(deliveryStatus?: string): 'Completada' | 'Pendiente' | 'Cancelada' {
    if (!deliveryStatus) return 'Pendiente';
    
    switch (deliveryStatus) {
      case 'confirmed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'pending':
      case 'in_progress':
      default:
        return 'Pendiente';
    }
  }

  actualizarCategorias(): void {
    const cats = new Set(this.productos.map(p => p.categoria));
    this.categorias = Array.from(cats);
  }

  cambiarSeccion(seccion: 'clientes' | 'ventas' | 'productos' | 'realizar-venta'): void {
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

    this.cargandoClientes = true;
    this.limpiarMensajes();
    
    if (this.clienteSeleccionado) {
      // Actualizar cliente existente en el backend
      const customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
        identification: this.nuevoCliente.documento,
        name: this.nuevoCliente.nombre,
        email: this.nuevoCliente.email,
        address: this.nuevoCliente.direccion,
        phone: this.nuevoCliente.telefono
      };

      this.customersService.updateCustomer(parseInt(this.clienteSeleccionado.id), customerData).subscribe({
        next: (customerActualizado) => {
          console.log('✅ Cliente actualizado:', customerActualizado);
          this.mensaje = 'Cliente actualizado exitosamente';
          this.cargandoClientes = false;
          this.cargarClientesDesdeBackend(); // Recargar lista
          this.cerrarFormularios();
        },
        error: (error) => {
          console.error('❌ Error al actualizar cliente:', error);
          this.error = `Error al actualizar cliente: ${error.message}`;
          this.cargandoClientes = false;
        }
      });
    } else {
      // Crear nuevo cliente en el backend
      const customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
        identification: this.nuevoCliente.documento,
        name: this.nuevoCliente.nombre,
        email: this.nuevoCliente.email,
        address: this.nuevoCliente.direccion,
        phone: this.nuevoCliente.telefono
      };

      this.customersService.createCustomer(customerData).subscribe({
        next: (customerCreado) => {
          console.log('✅ Cliente creado:', customerCreado);
          this.mensaje = 'Cliente creado exitosamente';
          this.cargandoClientes = false;
          this.cargarClientesDesdeBackend(); // Recargar lista
          this.cerrarFormularios();
        },
        error: (error) => {
          console.error('❌ Error al crear cliente:', error);
          this.error = `Error al crear cliente: ${error.message}`;
          this.cargandoClientes = false;
        }
      });
    }
  }

  eliminarCliente(id: string): void {
    const cliente = this.clientes.find(c => c.id === id);
    if (cliente && confirm(`¿Está seguro de eliminar al cliente "${cliente.nombre}"?`)) {
      this.cargandoClientes = true;
      this.limpiarMensajes();

      this.customersService.deleteCustomer(parseInt(id)).subscribe({
        next: () => {
          console.log('✅ Cliente eliminado');
          this.mensaje = 'Cliente eliminado exitosamente';
          this.cargandoClientes = false;
          this.cargarClientesDesdeBackend(); // Recargar lista
        },
        error: (error: any) => {
          console.error('❌ Error al eliminar cliente:', error);
          this.error = `Error al eliminar cliente: ${error.message}`;
          this.cargandoClientes = false;
        }
      });
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

    // Actualizar tipo de cliente si es necesario (solo localmente, no afecta el backend)
    if (this.clienteVenta.tipoCliente === 'Nuevo') {
      const cliente = this.clientes.find(c => c.id === this.clienteVenta!.id);
      if (cliente) {
        cliente.tipoCliente = 'Regular';
        // Ya no guardamos en localStorage, el backend maneja la persistencia
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

  /**
   * Retorna las ventas filtradas según el cliente seleccionado
   */
  get ventasFiltradas(): Venta[] {
    if (this.clienteVentasFiltro) {
      return this.ventas.filter(v => v.clienteId === this.clienteVentasFiltro!.id);
    }
    return this.ventas;
  }

  /**
   * Ver historial de ventas de un cliente específico
   */
  verHistorialCliente(cliente: Cliente): void {
    this.clienteVentasFiltro = cliente;
    this.cambiarSeccion('ventas');
  }

  /**
   * Volver a mostrar todas las ventas
   */
  volverAlHistorialCompleto(): void {
    this.clienteVentasFiltro = null;
  }
}
