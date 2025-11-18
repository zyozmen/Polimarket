# PoliMarket - Sistema de Gestión de Ventas y Entregas

Aplicación Angular para la gestión completa de ventas, clientes, inventario y entregas. Conectada a APIs REST externas para funcionalidad completa.

## 🚀 Características Principales

### 💰 Módulo de Ventas
- **✅ Gestión de clientes con API REST**: 
  - CRUD completo integrado con backend Rails
  - Crear, editar, eliminar clientes en tiempo real
  - Sincronización automática con servidor
  - Respaldo con localStorage en caso de error
- **✅ Catálogo de productos con API REST**: 
  - Carga de productos desde backend Rails
  - Visualización de productos disponibles con stock
  - Botón de actualización manual desde servidor
  - Respaldo con localStorage en caso de error
- **✅ Historial de ventas desde servidor**: 
  - Consulta de ventas desde backend Rails
  - **Tabla compacta** para mejor visualización y lectura
  - **Búsqueda de venta por ID** con campo de búsqueda dedicado
  - **Modal de detalles** mostrando información completa de cualquier venta
  - Visualización de items y estados de entrega
  - Mapeo automático de estados (Pendiente, En Progreso, Confirmado, Cancelado)
  - **Filtrado por cliente**: Ver historial de ventas de un cliente específico
  - Botón "Ver Historial" en cada tarjeta de cliente
  - Alerta informativa mostrando el cliente filtrado
  - Opción para volver a ver todas las ventas
  - Botón 👁️ en cada fila para ver detalles instantáneamente
- **✅ Procesamiento de ventas con API REST**:
  - Crear ventas en tiempo real en el backend
  - **Aside/Sidebar del carrito** visible durante selección de productos
  - **Checkout integrado** sin necesidad de cambiar de sección
  - Información del cliente siempre visible en el carrito
  - Selección ágil de cliente y productos
  - Actualización visual instantánea del stock
  - **Sincronización de stock** correcta: recarga desde backend después de procesar
  - Múltiples items por venta
  - Cálculo automático de totales con IVA y descuentos
  - Indicador de progreso durante el procesamiento
  - Recarga automática del historial después de crear
  - **Atajos de teclado**: Ctrl+Enter o F2 para procesar, Esc para cancelar
  - Manejo inteligente de errores con mensajes claros
  - Total visible en el botón de procesar para decisión rápida
  - **UX moderna**: Carrito sticky que sigue al usuario durante el scroll

### 👥 Módulo de Recursos Humanos
- **✅ Integración completa con API RRHH** (`https://akira.sedbaq.com.co/rrhh`):
  - Crear vendedores en servidor externo
  - Consultar vendedores por ID con tarjeta de resultados
  - Autorizar vendedores con botón condicional según estado
  - Manejo de errores personalizado (500 → "Vendedor no encontrado")
  - Validación de duplicados en solicitudes
- **Gestión local de usuarios**: Login y permisos con localStorage

### 📦 Módulo de Bodega (Inventario)
- **Consulta de inventario**: Visualización completa de productos
- **Información detallada**: Nombre, descripción, precio, stock y categoría
- **Búsqueda y filtrado**: Localiza productos rápidamente
- **Gestión de solicitudes**: Crear solicitudes a proveedores
- **Validación de duplicados**: Previene solicitudes duplicadas

### 🚚 Módulo de Entregas
- **Gestión de entregas**: Visualiza todas las entregas asociadas a ventas
- **Control de estados**:
  - Pendiente: Entrega recién creada
  - En progreso: Entrega en camino
  - Confirmada: Entrega completada exitosamente
  - Cancelada: Entrega cancelada
- **Acciones disponibles**:
  - Marcar como "En progreso"
  - Confirmar entrega
  - Cancelar entrega

### 🏪 Módulo de Proveedores
- **Gestión de proveedores**: CRUD completo local
- **Solicitudes de stock**: Ver y gestionar solicitudes desde Bodega
- **Estados**: Pendiente, Aprobada, Rechazada, Entregada
- **Actualización automática de inventario** al marcar como entregada

## 🔄 Flujo de Solicitudes de Stock

1. **Bodega detecta stock bajo**: El sistema identifica automáticamente productos bajo el mínimo
2. **Crear solicitud en Bodega**: El usuario puede crear una solicitud especificando producto, proveedor y cantidad
3. **Gestionar en Proveedores**: Las solicitudes se gestionan completamente desde el módulo de Proveedores
4. **Actualización automática**: Cuando se marca como "Entregada", el stock se actualiza automáticamente en el inventario

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v17+)
- **Backend Rails**: API REST en `https://ventas-al0w.onrender.com`
- **API RRHH**: API externa en `https://akira.sedbaq.com.co/rrhh`

## 🛠️ Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Instalar Angular CLI globalmente (si no lo tienes):
```bash
npm install -g @angular/cli
```

3. Configurar la URL del backend (opcional):
   - Edita `src/environments/environment.ts` si tu backend está en otra URL

## 🏃 Ejecutar la Aplicación

### Modo desarrollo
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

**Nota**: El comando `npm start` inicia el servidor con configuración de proxy para evitar errores CORS con la API RRHH externa.

### Modo producción
```bash
npm run build
```

Los archivos compilados se guardarán en el directorio `dist/`

## 📁 Estructura del Proyecto

```
Polimarket/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Componente de autenticación
│   │   │   ├── vendedor-list/      # Listado de vendedores
│   │   │   ├── bodega/             # Módulo de Inventario
│   │   │   ├── ventas/             # Módulo de Ventas
│   │   │   ├── proveedores/        # Módulo de Proveedores
│   │   │   └── entregas/           # Módulo de Entregas
│   │   ├── models/
│   │   │   └── vendedor.model.ts   # Interfaces y tipos
│   │   ├── services/
│   │   │   ├── auth.service.ts         # Servicio de autenticación
│   │   │   ├── recursos-humanos.service.ts  # Gestión local de usuarios
│   │   │   ├── rrhh-api.service.ts     # ✅ API RRHH externa
│   │   │   ├── customers.service.ts    # ✅ Servicio de clientes (Rails API)
│   │   │   ├── products.service.ts     # Servicio de productos (Rails API)
│   │   │   ├── sales.service.ts        # ✅ Servicio de ventas (Rails API)
│   │   │   ├── deliveries.service.ts   # Servicio de entregas (Rails API)
│   │   │   ├── bodega.service.ts       # Gestión local de inventario
│   │   │   ├── proveedores.service.ts  # Gestión local de proveedores
│   │   │   └── entregas.service.ts     # Gestión local de entregas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # Interceptor HTTP con manejo de errores
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Guard de autenticación
│   │   ├── environments/
│   │   │   ├── environment.ts      # Configuración desarrollo
│   │   │   └── environment.prod.ts # Configuración producción
│   │   ├── app-routing.module.ts   # Configuración de rutas
│   │   ├── app.module.ts           # Módulo principal
│   │   └── app.component.ts        # Componente raíz
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── proxy.conf.json             # ✅ Configuración proxy CORS
├── angular.json
├── package.json
├── tsconfig.json
├── SERVICES_CHECKLIST.md       # ✅ Estado de integración de servicios
├── BACKEND_INTEGRATION.md      # Documentación de integración
└── README.md
```

## 🔌 Integración con APIs REST

### 📊 Estado de Integración

| Servicio | Estado | Funcionalidad |
|----------|--------|---------------|
| **RRHH API** | ✅ Completo | Crear, consultar y autorizar vendedores |
| **Customers** | ✅ Completo | CRUD completo de clientes |
| **Sales** | ✅ Completo | Listar, filtrar, crear, buscar por ID con modal, aside del carrito |
| **Products** | ✅ Integrado | Carga en módulo Ventas con actualización manual |
| **Deliveries** | ⚠️ Pendiente | Servicio listo, UI pendiente |

Ver detalles completos en `SERVICES_CHECKLIST.md`

### Configuración de Backends

#### Environment Variables (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://ventas-al0w.onrender.com',
  apiTimeout: 30000,
  enableDebug: true
};
```

#### Proxy CORS (`proxy.conf.json`)
```json
{
  "/rrhh-api": {
    "target": "https://akira.sedbaq.com.co",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/rrhh-api": "/rrhh"
    }
  }
}
```

### Endpoints Disponibles

#### 🌐 API RRHH (Externa - `https://akira.sedbaq.com.co/rrhh`)
```typescript
// Crear vendedor
POST /rrhh-api/vendedor/crear
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "documento": "123456789",
  "email": "juan@example.com",
  "codigo_vendedor": "V001"
}

// Obtener vendedor por ID
GET /rrhh-api/vendedor/:id

// Autorizar vendedor
POST /rrhh-api/vendedor/autorizar/:id

// Crear administrador
POST /rrhh-api/administrador/crear
{
  "nombre": "Admin",
  "apellido": "Principal",
  "documento": "987654321",
  "email": "admin@example.com",
  "cargo": "Gerente"
}
```

#### 👥 Clientes (`/customers`) - Rails API
```typescript
// Listar todos los clientes
GET /customers

// Obtener un cliente
GET /customers/:id

// Crear cliente
POST /customers
{
  "customer": {
    "identification": "12345678",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "address": "Calle Principal 123",
    "phone": "555-1234"
  }
}

// Actualizar cliente
PATCH /customers/:id
{
  "customer": {
    "name": "Juan Pérez Actualizado"
  }
}

// Eliminar cliente
DELETE /customers/:id
```

#### 📦 Productos (`/products`) - Rails API
```typescript
// Listar todos los productos
GET /products

// Obtener un producto
GET /products/:id
```

#### 💰 Ventas (`/sales`) - Rails API
```typescript
// Listar todas las ventas
GET /sales

// Obtener una venta
GET /sales/:id

// Crear venta
POST /sales
{
  "sale": {
    "customer_id": 1,
    "seller_id": 1,
    "date": "2025-11-14",
    "comments": "Entrega urgente",
    "sale_items_attributes": [
      {
        "product_id": 1,
        "quantity": 2,
        "comment": "",
        "discount": 0
      }
    ]
  }
}
```

#### 🚚 Entregas (`/deliveries`) - Rails API
```typescript
// Listar todas las entregas
GET /deliveries

// Marcar como en progreso
POST /deliveries/:id/in_progress

// Confirmar entrega
POST /deliveries/:id/confirm

// Cancelar entrega
POST /deliveries/:id/cancel
```

## 🎯 Ejemplos de Uso de Servicios

### Ejemplo 1: Gestión Completa de Clientes (Integrado con API)
```typescript
import { Component, OnInit } from '@angular/core';
import { CustomersService, Customer } from '../../services/customers.service';

export class ClientesComponent implements OnInit {
  clientes: Customer[] = [];
  loading = false;
  error = '';

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
        console.log(`${data.length} clientes cargados desde API`);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  crearCliente() {
    const nuevoCliente: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
      identification: '123456789',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      address: 'Calle 123',
      phone: '555-1234'
    };

    this.customersService.createCustomer(nuevoCliente).subscribe({
      next: (cliente) => {
        console.log('Cliente creado:', cliente);
        this.cargarClientes(); // Recargar lista
      },
      error: (error) => this.error = error.message
    });
  }

  eliminarCliente(id: number) {
    if (confirm('¿Eliminar cliente?')) {
      this.customersService.deleteCustomer(id).subscribe({
        next: () => {
          console.log('Cliente eliminado');
          this.cargarClientes(); // Recargar lista
        },
        error: (error) => this.error = error.message
      });
    }
  }
}
```

### Ejemplo 2: Listar Ventas desde Backend
```typescript
import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';

export class VentasComponent implements OnInit {
  ventas: any[] = [];
  loading = false;

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.cargarVentas();
  }

  cargarVentas() {
    this.loading = true;
    
    this.salesService.getSales().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.loading = false;
        console.log(`${ventas.length} ventas cargadas desde servidor`);
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
}
```

### Ejemplo 3: Integración completa con API RRHH Externa
```typescript
import { Component } from '@angular/core';
import { RrhhApiService } from '../../services/rrhh-api.service';

export class RecursosHumanosComponent {
  vendedorConsultado: any = null;
  loading = false;
  error = '';

  constructor(private rrhhService: RrhhApiService) {}

  consultarVendedor(id: number) {
    this.loading = true;
    this.error = '';
    
    this.rrhhService.obtenerVendedor(id).subscribe({
      next: (vendedor) => {
        this.vendedorConsultado = vendedor;
        this.loading = false;
        console.log('Vendedor:', vendedor);
      },
      error: (error) => {
        // Manejo personalizado de errores
        if (error.status === 500) {
          this.error = 'Vendedor no encontrado';
        } else {
          this.error = error.message;
        }
        this.loading = false;
      }
    });
  }

  autorizarVendedor(id: number) {
    this.loading = true;
    
    this.rrhhService.autorizarVendedor(id).subscribe({
      next: (response) => {
        if (response.autorizado) {
          // Actualizar estado local
          if (this.vendedorConsultado && this.vendedorConsultado.id === id) {
            this.vendedorConsultado.estado_autorizacion = true;
          }
          alert('Vendedor autorizado exitosamente');
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }
}
```

### Ejemplo 4: Gestionar Entregas (Cuando esté integrado)
```typescript
import { Component } from '@angular/core';
import { CustomersService } from '../../services/customers.service';

export class EditarClienteComponent {
  constructor(private customersService: CustomersService) {}

  actualizarCliente(id: number) {
    const datosActualizados = {
      name: 'Nuevo Nombre',
      email: 'nuevo@email.com',
      phone: '555-9999'
    };

    this.customersService.updateCustomer(id, datosActualizados).subscribe({
      next: (response) => {
        console.log('Cliente actualizado:', response);
        alert('Cliente actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      }
    });
  }
}
```

## 🎯 Flujo de Trabajo Principal

### 1. Gestión de Clientes
1. Acceder al módulo de Clientes
2. Ver listado completo de clientes
3. Crear nuevo cliente con formulario
4. Editar información de clientes existentes

### 2. Registro de Ventas
1. Seleccionar cliente de la lista (navega automáticamente a productos)
2. **El aside del carrito aparece a la derecha**
3. Agregar productos al carrito desde el grid:
   - Elegir producto
   - Especificar cantidad con botones +/-
   - Ver subtotal en tiempo real
4. **Gestionar compra desde el aside**:
   - Ver resumen de items en el carrito
   - Ver total actualizado en tiempo real
   - Aplicar descuento porcentual
   - Seleccionar método de pago
   - Agregar notas opcionales
5. **Procesar venta** directamente desde el aside (sin cambiar de sección)
6. Stock se actualiza automáticamente desde el backend

### 3. Consulta de Ventas
1. Acceder al módulo "Historial de Ventas"
2. Ver tabla compacta con todas las ventas
3. **Buscar venta específica por ID** usando el campo de búsqueda
4. **Hacer clic en 👁️** para ver detalles completos en modal
5. **Filtrar por cliente** usando botón "Ver Historial" en tarjeta de cliente

### 4. Consulta de Inventario
1. Acceder al módulo de Bodega
2. Ver todos los productos disponibles
3. Consultar detalles: nombre, precio, stock, categoría
4. Buscar productos específicos

## 🔧 Manejo de Errores

El interceptor HTTP maneja automáticamente:

- **404**: Recurso no encontrado
- **422**: Errores de validación (muestra los campos con error)
- **500**: Error interno del servidor
- **Errores de red**: Problemas de conexión

Todos los errores se muestran en consola y mediante mensajes descriptivos.

## 📊 Características Técnicas

### Servicios REST
- **Observables**: Todas las peticiones usan RxJS Observables
- **Tipado fuerte**: Interfaces TypeScript para todas las entidades
- **Interceptor HTTP**: Manejo centralizado de errores
- **HttpParams**: Construcción segura de query strings
- **Content-Type**: Automáticamente configurado como `application/json`

### Estructura de Respuestas

#### Respuesta de Lista de Clientes
```json
[
  {
    "id": 1,
    "identification": "12345678",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "address": "Calle Principal 123",
    "phone": "555-1234",
    "created_at": "2025-11-14T10:30:00Z",
    "updated_at": "2025-11-14T10:30:00Z"
  }
]
```

#### Respuesta de Venta Creada
```json
{
  "id": 42,
  "customer_id": 1,
  "seller_id": 1,
  "date": "2025-11-14",
  "comments": "Entrega urgente",
  "total": 150.50,
  "delivery_status": "pending",
  "created_at": "2025-11-14T15:30:00Z",
  "sale_items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "price": 50.00,
      "discount": 0,
      "taxes_amount": 9.50,
      "total_item": 109.50
    }
  ]
}
```

#### Respuesta de Error (422)
```json
{
  "errors": {
    "name": ["can't be blank"],
    "email": ["is invalid"]
  }
}
```

## 🎨 Características de la UI

- **Diseño moderno y responsive**: Bootstrap 5 integrado
- **Navegación intuitiva**: Menú superior con acceso rápido
- **Feedback visual inmediato**: 
  - Mensajes de éxito y error
  - Estados de carga
  - Validación de formularios
- **Tablas interactivas**: 
  - Filtrado y búsqueda
  - Acciones por fila
  - Estado visual (badges)

## 📦 Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **TypeScript 5.2**: Lenguaje de programación
- **RxJS 7.8**: Programación reactiva con Observables
- **Bootstrap 5.3**: Framework CSS
- **Bootstrap Icons 1.13**: Iconografía
- **HttpClient**: Cliente HTTP de Angular
- **Reactive Forms**: Manejo de formularios

## 🧪 Testing

Para ejecutar las pruebas:
```bash
ng test
```

## 🔍 Debugging

### Ver peticiones HTTP en la consola
Todas las peticiones y errores se registran automáticamente en la consola del navegador.

### Verificar estado del backend
```bash
curl https://ventas-al0w.onrender.com/up
```

Debería devolver `200 OK` si el backend está funcionando.

### Probar endpoints manualmente
```bash
# Listar clientes
curl https://ventas-al0w.onrender.com/customers

# Crear cliente
curl -X POST https://ventas-al0w.onrender.com/customers \
  -H "Content-Type: application/json" \
  -d '{"customer":{"identification":"12345","name":"Test","email":"test@test.com","address":"Test St","phone":"555-0000"}}'

# Crear venta
curl -X POST https://ventas-al0w.onrender.com/sales \
  -H "Content-Type: application/json" \
  -d '{"sale":{"customer_id":1,"seller_id":1,"date":"2025-11-14","sale_items_attributes":[{"product_id":1,"quantity":2}]}}'
```

## 🚀 Despliegue

### Producción
1. Actualiza `src/environments/environment.prod.ts` con la URL del backend
2. Compila para producción:
```bash
ng build --configuration production
```
3. Los archivos estarán en `dist/polimarket-app/`
4. Despliega en tu servidor web favorito (Nginx, Apache, etc.)

### Variables de entorno
```typescript
// environment.ts (Desarrollo)
export const environment = {
  production: false,
  apiUrl: 'https://ventas-al0w.onrender.com',
  apiTimeout: 30000,
  enableDebug: true
};

// environment.prod.ts (Producción)
export const environment = {
  production: true,
  apiUrl: 'https://ventas-al0w.onrender.com',
  apiTimeout: 30000,
  enableDebug: false
};
```

## 🚀 Próximas Funcionalidades

- [x] Búsqueda de ventas por ID
- [x] Modal de detalle de ventas
- [x] Tabla compacta para historial
- [x] Aside del carrito en productos
- [x] Checkout integrado sin cambiar de sección
- [ ] Integración de Deliveries Service
- [ ] Paginación en listados
- [ ] Búsqueda avanzada con filtros
- [ ] Exportación de datos a PDF/Excel
- [ ] Dashboard con métricas clave
- [ ] Autenticación con JWT
- [ ] Manejo de permisos por rol
- [ ] Notificaciones en tiempo real

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes dudas sobre los servicios o necesitas ayuda:
1. Revisa los ejemplos en este README
2. Consulta la documentación de Angular: https://angular.io/docs
3. Revisa la API en `API.txt`

## 📄 Licencia

Este proyecto es parte del desarrollo de PoliMarket - Sistema de Gestión de Ventas y Entregas.

## 👥 Autores

### Frontend (Angular)
**NELSON JAVIER PARRA HOYOS** - Desarrollo de la aplicación Angular e integración de servicios

### Backend (Ruby on Rails - API de Ventas)
**JOHAN JOSE DONADO BANDERAS** - Desarrollo del backend Rails y API REST

### Backend (API RRHH)
**ALEXIS ARIEL CARRASCO GARCIA** - Desarrollo de la API externa de Recursos Humanos

---

**Nota**: Esta aplicación se conecta a backends externos:
- **API de Ventas (Rails)**: `https://ventas-al0w.onrender.com`
- **API RRHH**: `https://akira.sedbaq.com.co/rrhh`
