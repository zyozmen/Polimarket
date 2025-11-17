# PoliMarket - Sistema de Gestión de Ventas y Entregas

Aplicación Angular para la gestión completa de ventas, clientes, inventario y entregas. Conectada a una API REST construida con Ruby on Rails.

## 🚀 Características Principales

### 💰 Módulo de Ventas
- **Gestión de clientes**: CRUD completo de clientes con validación
- **Catálogo de productos**: Visualización de productos disponibles
- **Registro de ventas**:
  - Selección de cliente y vendedor
  - Múltiples items por venta
  - Descuentos por item
  - Cálculo automático de totales
  - Comentarios adicionales
- **Historial de ventas**: Consulta de todas las ventas realizadas

### 📦 Módulo de Bodega (Productos)
- **Consulta de inventario**: Visualización completa de productos
- **Información detallada**: Nombre, descripción, precio, stock y categoría
- **Búsqueda y filtrado**: Localiza productos rápidamente

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

### 👥 Módulo de Clientes
- **CRUD completo**: Crear, leer, actualizar clientes
- **Información**: Identificación, nombre, email, dirección, teléfono
- **Validación**: Campos requeridos y formatos correctos
  - Actualización automática de inventario al marcar como entregada
  - Historial completo con filtros por estado y proveedor
- **Alertas inteligentes**: Productos que necesitan reabastecimiento
- **Información completa**: Nombre, contacto, teléfono, email, dirección, ciudad, categorías

## 🔄 Flujo de Solicitudes de Stock

1. **Bodega detecta stock bajo**: El sistema identifica automáticamente productos bajo el mínimo
2. **Crear solicitud en Bodega**: El usuario puede crear una solicitud especificando producto, proveedor y cantidad
3. **Gestionar en Proveedores**: Las solicitudes se gestionan completamente desde el módulo de Proveedores
4. **Actualización automática**: Cuando se marca como "Entregada", el stock se actualiza automáticamente en el inventario

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v17)
- **Backend Rails**: API REST corriendo en `http://localhost:3000`

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
O también:
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`

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
│   │   │   ├── customers.service.ts    # Servicio de clientes
│   │   │   ├── products.service.ts     # Servicio de productos
│   │   │   ├── sales.service.ts        # Servicio de ventas
│   │   │   └── deliveries.service.ts   # Servicio de entregas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # Interceptor HTTP para manejo de errores
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
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Conexión con el Backend

### Configuración
La aplicación se conecta a una API REST de Ruby on Rails:

- **URL Base**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Sin autenticación**: No requiere tokens JWT

### Endpoints Disponibles

#### Clientes (`/customers`)
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
```

#### Productos (`/products`)
```typescript
// Listar todos los productos
GET /products

// Obtener un producto
GET /products/:id
```

#### Ventas (`/sales`)
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

#### Entregas (`/deliveries`)
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

### Ejemplo 1: Listar Clientes
```typescript
import { Component, OnInit } from '@angular/core';
import { CustomersService } from '../../services/customers.service';

export class ClientesComponent implements OnInit {
  clientes: any[] = [];

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.customersService.getCustomers().subscribe({
      next: (data) => {
        this.clientes = data;
        console.log('Clientes cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        alert('Error al cargar clientes: ' + error.message);
      }
    });
  }
}
```

### Ejemplo 2: Crear una Venta
```typescript
import { Component } from '@angular/core';
import { SalesService } from '../../services/sales.service';

export class VentasComponent {
  constructor(private salesService: SalesService) {}

  crearVenta() {
    const venta = {
      sale: {
        customer_id: 1,
        seller_id: 1,
        date: new Date().toISOString().split('T')[0],
        comments: 'Venta de prueba',
        sale_items_attributes: [
          {
            product_id: 1,
            quantity: 2,
            comment: '',
            discount: 0
          },
          {
            product_id: 2,
            quantity: 1,
            comment: 'Producto especial',
            discount: 5
          }
        ]
      }
    };

    this.salesService.createSale(venta).subscribe({
      next: (response) => {
        console.log('Venta creada exitosamente:', response);
        alert('Venta #' + response.id + ' creada con éxito');
      },
      error: (error) => {
        console.error('Error al crear venta:', error);
        alert('Error: ' + error.message);
      }
    });
  }
}
```

### Ejemplo 3: Gestionar Entregas
```typescript
import { Component, OnInit } from '@angular/core';
import { DeliveriesService } from '../../services/deliveries.service';

export class EntregasComponent implements OnInit {
  entregas: any[] = [];
  entregasPendientes: any[] = [];

  constructor(private deliveriesService: DeliveriesService) {}

  ngOnInit() {
    this.cargarEntregas();
  }

  cargarEntregas() {
    this.deliveriesService.getDeliveries().subscribe({
      next: (data) => {
        this.entregas = data;
        this.entregasPendientes = data.filter(e => e.delivery_status === 'pending');
      },
      error: (error) => console.error('Error:', error)
    });
  }

  marcarEnProgreso(id: number) {
    this.deliveriesService.markInProgress(id).subscribe({
      next: (response) => {
        console.log('Entrega actualizada:', response);
        this.cargarEntregas();
      },
      error: (error) => alert('Error: ' + error.message)
    });
  }

  confirmarEntrega(id: number) {
    this.deliveriesService.confirmDelivery(id).subscribe({
      next: (response) => {
        console.log('Entrega confirmada:', response);
        this.cargarEntregas();
      },
      error: (error) => alert('Error: ' + error.message)
    });
  }

  cancelarEntrega(id: number) {
    if (confirm('¿Está seguro de cancelar esta entrega?')) {
      this.deliveriesService.cancelDelivery(id).subscribe({
        next: () => {
          alert('Entrega cancelada');
          this.cargarEntregas();
        },
        error: (error) => alert('Error: ' + error.message)
      });
    }
  }
}
```

### Ejemplo 4: Actualizar Cliente
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
1. Seleccionar cliente de la lista
2. Agregar productos al carrito:
   - Elegir producto
   - Especificar cantidad
   - Aplicar descuento (opcional)
   - Agregar comentarios

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
curl http://localhost:3000/up
```

Debería devolver `200 OK` si el backend está funcionando.

### Probar endpoints manualmente
```bash
# Listar clientes
curl http://localhost:3000/customers

# Crear cliente
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"customer":{"identification":"12345","name":"Test","email":"test@test.com","address":"Test St","phone":"555-0000"}}'

# Crear venta
curl -X POST http://localhost:3000/sales \
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
  apiUrl: 'http://localhost:3000',
  apiTimeout: 30000,
  enableDebug: true
};

// environment.prod.ts (Producción)
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com',
  apiTimeout: 30000,
  enableDebug: false
};
```

## 🚀 Próximas Funcionalidades

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

## 👥 Autor

Desarrollado para PoliMarket

---

**Nota**: Esta aplicación se conecta a un backend Ruby on Rails. Asegúrate de que el backend esté corriendo en `http://localhost:3000` antes de iniciar la aplicación.
