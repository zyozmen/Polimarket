import { Component, OnInit, HostListener } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CustomersService, Customer } from '../../services/customers.service';
import { ProductsService, Product } from '../../services/products.service';
import { forkJoin } from 'rxjs';

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
  procesandoVenta = false;
  
  // Búsqueda y detalle de venta por ID
  ventaIdBusqueda: number | null = null;
  ventaDetalle: Venta | null = null;
  cargandoVentaDetalle = false;

  constructor(
    private salesService: SalesService,
    private customersService: CustomersService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.cargarTodoEnParalelo();
  }

  /**
   * Carga todos los datos en paralelo para mejor rendimiento
   */
  cargarTodoEnParalelo(): void {
    this.cargandoClientes = true;
    this.cargandoProductos = true;
    this.cargandoVentas = true;
    this.error = '';

    forkJoin({
      clientes: this.customersService.getCustomers(),
      productos: this.productsService.getProducts(),
      ventas: this.salesService.getSales()
    }).subscribe({
      next: ({ clientes, productos, ventas }) => {
        // Mapear clientes
        this.clientes = clientes.map(customer => ({
          id: customer.id?.toString() || '',
          nombre: customer.name || '',
          documento: customer.identification || '',
          email: customer.email || '',
          telefono: customer.phone || '',
          direccion: customer.address || '',
          ciudad: '',
          tipoCliente: 'Regular' as 'Regular' | 'VIP' | 'Nuevo'
        }));

        // Mapear productos
        this.productos = productos.map(product => ({
          id: product.id?.toString() || '',
          codigo: `PROD-${product.id}`,
          nombre: product.name || '',
          descripcion: product.description || '',
          precio: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
          stock: product.stock || 0,
          categoria: product.category || '',
          proveedor: 'N/A'
        }));

        // Mapear ventas
        this.ventas = ventas.map(venta => {
          const cliente = this.clientes.find(c => c.id === venta.customer_id?.toString());
          const items = (venta.sale_items || []).map(item => {
            const producto = this.productos.find(p => p.id === item.product_id?.toString());
            return {
              producto: {
                id: item.product_id?.toString() || '',
                codigo: producto?.codigo || `PROD-${item.product_id}`,
                nombre: producto?.nombre || `Producto #${item.product_id}`,
                descripcion: producto?.descripcion || '',
                precio: item.price || 0,
                stock: producto?.stock || 0,
                categoria: producto?.categoria || '',
                proveedor: producto?.proveedor || ''
              },
              cantidad: item.quantity || 0,
              subtotal: item.total_item || 0
            };
          });

          return {
            id: venta.id?.toString() || '',
            fecha: venta.date || '',
            clienteId: venta.customer_id?.toString() || '',
            clienteNombre: cliente?.nombre || `Cliente #${venta.customer_id}`,
            items: items,
            subtotal: typeof venta.total === 'string' ? parseFloat(venta.total) : (venta.total || 0),
            descuento: 0,
            impuesto: 0,
            total: typeof venta.total === 'string' ? parseFloat(venta.total) : (venta.total || 0),
            metodoPago: 'Efectivo',
            estado: this.mapearEstadoEntrega(venta.delivery_status),
            vendedor: `Vendedor #${venta.seller_id}`
          };
        });

        this.cargandoClientes = false;
        this.cargandoProductos = false;
        this.cargandoVentas = false;
        this.aplicarFiltros();
        
        console.log(`✅ Datos cargados: ${this.clientes.length} clientes, ${this.productos.length} productos, ${this.ventas.length} ventas`);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.cargandoClientes = false;
        this.cargandoProductos = false;
        this.cargandoVentas = false;
        
        if (error.status === 404) {
          this.error = 'El servidor está despertando... Espera 1-2 minutos e intenta de nuevo.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor.';
        } else {
          this.error = `Error: ${error.message || 'Error desconocido'}`;
        }
        
        // Cargar desde localStorage como respaldo
        this.cargarClientesDesdeLocalStorage();
      }
    });
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
        this.ventas = ventasBackend.map(venta => {
          // Buscar el cliente por ID para obtener su nombre
          const cliente = this.clientes.find(c => c.id === venta.customer_id?.toString());
          
          // Buscar información de productos para los items
          const items = (venta.sale_items || []).map(item => {
            const producto = this.productos.find(p => p.id === item.product_id?.toString());
            return {
              producto: {
                id: item.product_id?.toString() || '',
                codigo: producto?.codigo || `PROD-${item.product_id}`,
                nombre: producto?.nombre || `Producto #${item.product_id}`,
                descripcion: producto?.descripcion || '',
                precio: item.price || 0,
                stock: producto?.stock || 0,
                categoria: producto?.categoria || '',
                proveedor: producto?.proveedor || ''
              },
              cantidad: item.quantity || 0,
              subtotal: item.total_item || 0
            };
          });
          
          return {
            id: venta.id?.toString() || '',
            fecha: venta.date || '',
            clienteId: venta.customer_id?.toString() || '',
            clienteNombre: cliente?.nombre || `Cliente #${venta.customer_id}`,
            items: items,
            subtotal: typeof venta.total === 'string' ? parseFloat(venta.total) : (venta.total || 0),
            descuento: 0,
            impuesto: 0,
            total: typeof venta.total === 'string' ? parseFloat(venta.total) : (venta.total || 0),
            metodoPago: 'Efectivo',
            estado: this.mapearEstadoEntrega(venta.delivery_status),
            vendedor: `Vendedor #${venta.seller_id}`
          };
        });
        
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
    this.cambiarSeccion('productos'); // Navegar a productos en lugar de realizar-venta
    this.mensaje = `Venta iniciada para ${cliente.nombre}. Seleccione productos para agregar al carrito.`;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => this.mensaje = '', 3000);
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
    console.log('🔵 procesarVenta() llamado');
    console.log('Cliente seleccionado:', this.clienteVenta);
    console.log('Carrito:', this.carrito);
    
    if (!this.clienteVenta) {
      this.error = 'Debe seleccionar un cliente';
      console.error('❌ No hay cliente seleccionado');
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (this.carrito.length === 0) {
      this.error = 'El carrito está vacío';
      console.error('❌ El carrito está vacío');
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.procesandoVenta = true;
    this.error = '';
    console.log('✅ Validaciones pasadas, procesando venta...');

    // Preparar datos para el backend
    const saleRequest = {
      sale: {
        customer_id: parseInt(this.clienteVenta.id),
        seller_id: 1, // ID fijo por ahora, se puede mejorar con autenticación real
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        comments: this.notasVenta || `Venta procesada - ${this.metodoPago}`,
        sale_items_attributes: this.carrito.map(item => ({
          product_id: parseInt(item.producto.id),
          quantity: item.cantidad,
          comment: `${item.producto.nombre}`,
          discount: this.descuentoPorcentaje
        }))
      }
    };

    console.log('📤 Enviando petición al backend:', saleRequest);

    // Enviar al backend
    this.salesService.createSale(saleRequest).subscribe({
      next: (ventaCreada) => {
        console.log('✅ Venta creada en el backend:', ventaCreada);
        
        const total = this.calcularTotal();
        this.mensaje = `¡Venta #${ventaCreada.id} procesada exitosamente! Total: ${this.formatearPrecio(total)}`;
        
        // Limpiar carrito
        this.carrito = [];
        this.clienteVenta = null;
        this.metodoPago = 'Efectivo';
        this.descuentoPorcentaje = 0;
        this.notasVenta = '';
        this.procesandoVenta = false;
        
        // Recargar todos los datos desde el backend para obtener stock actualizado
        this.cargarTodoEnParalelo();
        
        // Volver a clientes después de 2 segundos
        setTimeout(() => {
          this.cambiarSeccion('clientes');
          this.limpiarMensajes();
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error al crear venta:', error);
        this.procesandoVenta = false;
        
        if (error.status === 404) {
          this.error = 'El servidor está despertando... Intenta de nuevo en 1-2 minutos.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else if (error.error?.errors) {
          // Errores de validación del backend
          const errores = error.error.errors.join(', ');
          this.error = `Error de validación: ${errores}`;
        } else {
          this.error = `Error al procesar la venta: ${error.message || 'Error desconocido'}`;
        }
        
        // Restaurar stock si hubo error
        this.carrito.forEach(item => {
          const productoEnLista = this.productos.find(p => p.id === item.producto.id);
          if (productoEnLista) {
            productoEnLista.stock += item.cantidad;
          }
        });
        
        setTimeout(() => this.error = '', 5000);
      }
    });
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
    
    // Mensaje informativo
    const ventasCliente = this.obtenerVentasCliente(cliente.id);
    this.mensaje = `Mostrando ${ventasCliente.length} venta(s) de ${cliente.nombre}`;
    setTimeout(() => this.mensaje = '', 3000);
  }

  /**
   * Volver a mostrar todas las ventas
   */
  volverAlHistorialCompleto(): void {
    this.clienteVentasFiltro = null;
    this.mensaje = `Mostrando todas las ventas (${this.ventas.length})`;
    setTimeout(() => this.mensaje = '', 3000);
  }

  /**
   * Buscar venta por ID usando el servicio del backend
   */
  buscarVentaPorId(): void {
    if (!this.ventaIdBusqueda) {
      this.error = 'Por favor ingrese un ID de venta';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.cargandoVentaDetalle = true;
    this.error = '';

    this.salesService.getSaleById(this.ventaIdBusqueda).subscribe({
      next: (saleData) => {
        console.log('✅ Venta obtenida del backend:', saleData);
        
        // Mapear la venta del backend a formato local
        const cliente = this.clientes.find(c => c.id === saleData.customer_id?.toString()) || {
          id: saleData.customer_id?.toString() || '0',
          nombre: `Cliente #${saleData.customer_id}`,
          documento: '',
          email: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          tipoCliente: 'Nuevo' as const
        };

        const items: ItemCarrito[] = (saleData.sale_items || []).map(item => {
          const producto = this.productos.find(p => p.id === item.product_id?.toString()) || {
            id: item.product_id?.toString() || '0',
            codigo: '',
            nombre: `Producto #${item.product_id}`,
            descripcion: '',
            precio: item.price || 0,
            stock: 0,
            categoria: '',
            proveedor: ''
          };

          return {
            producto: producto,
            cantidad: item.quantity,
            subtotal: item.total_item || (item.price || 0) * item.quantity
          };
        });

        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const descuento = 0;
        const impuesto = subtotal * 0.19;
        const totalSale = typeof saleData.total === 'string' ? parseFloat(saleData.total) : saleData.total;
        const total = totalSale || subtotal + impuesto - descuento;

        this.ventaDetalle = {
          id: saleData.id?.toString() || '0',
          fecha: saleData.date || new Date().toISOString(),
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          items: items,
          subtotal: subtotal,
          descuento: descuento,
          impuesto: impuesto,
          total: total,
          metodoPago: 'Efectivo',
          estado: 'Completada',
          vendedor: `Vendedor #${saleData.seller_id}`,
          notasVenta: saleData.comments
        };

        this.cargandoVentaDetalle = false;
        this.abrirModalDetalle();
      },
      error: (error) => {
        console.error('❌ Error al buscar venta:', error);
        this.cargandoVentaDetalle = false;
        
        if (error.status === 404) {
          this.error = `No se encontró la venta con ID ${this.ventaIdBusqueda}`;
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar al servidor';
        } else {
          this.error = `Error al buscar la venta: ${error.message || 'Error desconocido'}`;
        }
        
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  /**
   * Ver detalle de una venta desde la tabla
   */
  verDetalleVenta(ventaId: string): void {
    // Buscar la venta en el array local
    const venta = this.ventas.find(v => v.id === ventaId);
    if (venta) {
      this.ventaDetalle = venta;
      this.abrirModalDetalle();
    }
  }

  /**
   * Abrir modal de detalle
   */
  abrirModalDetalle(): void {
    const modalElement = document.getElementById('modalDetalleVenta');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // Crear backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modalBackdrop';
      document.body.appendChild(backdrop);
    }
  }

  /**
   * Cerrar modal de detalle
   */
  cerrarModalDetalle(): void {
    const modalElement = document.getElementById('modalDetalleVenta');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // Remover backdrop
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
    
    this.ventaDetalle = null;
    this.ventaIdBusqueda = null;
  }

  /**
   * Atajos de teclado para agilizar el proceso de venta
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Solo funciona en la sección de realizar venta
    if (this.seccionActiva !== 'realizar-venta') return;
    
    // Ctrl+Enter o F2: Procesar venta
    if ((event.ctrlKey && event.key === 'Enter') || event.key === 'F2') {
      event.preventDefault();
      if (!this.procesandoVenta && this.carrito.length > 0 && this.clienteVenta) {
        this.procesarVenta();
      }
    }
    
    // Esc: Cancelar venta
    if (event.key === 'Escape' && !this.procesandoVenta) {
      event.preventDefault();
      this.cancelarVenta();
    }
  }

  // TrackBy functions para optimizar renderizado de listas
  trackByVentaId(index: number, venta: Venta): string {
    return venta.id;
  }

  trackByClienteId(index: number, cliente: Cliente): string {
    return cliente.id;
  }

  trackByProductoId(index: number, producto: Producto): string {
    return producto.id;
  }
}
