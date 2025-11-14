# PoliMarket - Sistema Integral de Gestión Empresarial

Aplicación Angular para la gestión completa de operaciones empresariales, incluyendo recursos humanos, inventario, ventas, proveedores y entregas.

## 🚀 Características Principales

### 🔐 Autenticación y Permisos
- **Login con múltiples usuarios**: Admin, vendedores y personal con permisos específicos
- **Sistema de permisos granular**: Control de acceso por módulo
- **Gestión de usuarios**: Creación y administración de usuarios desde RRHH
- **Credenciales predeterminadas**:
  - Admin: `admin` / `admin123` (acceso total)
  - Vendedor: `vendedor1` / `vendedor123` (solo Ventas)
  - Personal: `personal` / `personal123` (Bodega y Entregas)

### 👥 Módulo de Recursos Humanos
- Gestión completa de usuarios del sistema
- Asignación y revocación de permisos por módulo
- Creación de nuevos usuarios con credenciales personalizadas
- Vista de permisos activos por usuario

### 📦 Módulo de Bodega
- **Consulta de inventario**: Visualización completa de productos
- **Actualización de stock**: Entradas y salidas con registro de movimientos
- **Alertas de stock bajo**: Notificaciones automáticas
- **Solicitudes a proveedores**: Gestión de pedidos con estados
- **Información detallada**: Código, nombre, descripción, categoría, proveedor, precio y stock

### 💰 Módulo de Ventas
- **Gestión de clientes**: CRUD completo con tipos (VIP, Regular, Nuevo)
- **Catálogo de productos**: Visualización de productos disponibles con proveedor
- **Carrito de compras inteligente**:
  - Actualización automática de stock en tiempo real
  - Controles de cantidad: incrementar, decrementar, agregar todo el stock
  - Validación automática de disponibilidad
  - Restauración de stock al eliminar o cancelar
- **Procesamiento de ventas**:
  - Selección de método de pago (Efectivo, Tarjeta, Transferencia)
  - Cálculo automático de descuentos e IVA (19%)
  - Resumen detallado con subtotal, descuento, impuestos y total
  - Actualización automática de inventario
  - Conversión automática de clientes nuevos a regulares
- **Historial de ventas**: Registro completo de transacciones

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v17)

## 🛠️ Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Instalar Angular CLI globalmente (si no lo tienes):
```bash
npm install -g @angular/cli
```

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
│   │   │   ├── vendedor-list/      # Módulo de Recursos Humanos
│   │   │   ├── bodega/             # Módulo de Inventario
│   │   │   ├── ventas/             # Módulo de Ventas
│   │   │   ├── proveedores/        # Módulo de Proveedores
│   │   │   └── entregas/           # Módulo de Entregas
│   │   ├── models/
│   │   │   └── vendedor.model.ts   # Interfaces y tipos
│   │   ├── services/
│   │   │   └── recursos-humanos.service.ts  # Servicio de autenticación
│   │   ├── app-routing.module.ts   # Configuración de rutas
│   │   ├── app.module.ts           # Módulo principal
│   │   ├── app.component.ts        # Componente raíz con menú
│   │   └── app.component.html      # Navegación principal
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Arquitectura de Datos

La aplicación funciona completamente en el frontend usando **localStorage** para persistencia:

### Datos Almacenados
- `token`: Token de autenticación del usuario actual
- `permisos`: Lista de módulos accesibles por el usuario
- `credenciales`: Usuarios creados dinámicamente
- `usuarios`: Lista de usuarios del sistema
- `productos`: Inventario de productos (compartido con Bodega)
- `clientes`: Base de datos de clientes
- `ventas`: Historial de transacciones
- `solicitudes`: Solicitudes a proveedores

## 🎯 Flujo de Trabajo Principal

### Gestión de Ventas
1. **Autenticación**: Usuario inicia sesión con credenciales
2. **Selección de cliente**: Desde la lista de clientes, clic en "Realizar Venta"
3. **Navegación a productos**: Pestaña "Productos Disponibles" se activa
4. **Agregar productos al carrito**:
   - Usar controles − / + para ajustar cantidad
   - Botón MAX para agregar todo el stock
   - Stock se actualiza automáticamente en tiempo real
5. **Revisar carrito**: Pestaña "Realizar Venta" muestra resumen
6. **Configurar venta**:
   - Seleccionar método de pago
   - Aplicar descuento (opcional)
   - Agregar notas
7. **Procesar venta**: Sistema actualiza inventario y registra transacción

### Gestión de Inventario
1. **Consultar stock**: Vista general con filtros por categoría y búsqueda
2. **Actualizar stock**: Entradas/salidas con razón del movimiento
3. **Solicitar productos**: Crear solicitudes a proveedores cuando el stock es bajo

## 🎨 Características de la UI

- **Diseño moderno y responsive**: Funciona en todos los dispositivos
- **Navegación intuitiva**: Menú superior con acceso rápido basado en permisos
- **Feedback visual inmediato**: 
  - Actualización de stock en tiempo real
  - Mensajes de éxito y error
  - Estados de carga
  - Badges de estado (stock, tipo cliente, etc.)
- **Controles optimizados**:
  - Botones de cantidad sin campos editables
  - Validaciones automáticas
  - Confirmaciones para acciones críticas
- **Información detallada**: Proveedores, categorías, precios y disponibilidad

## 🔐 Sistema de Permisos

### Módulos del Sistema
- **BODEGA**: Gestión de inventario
- **VENTAS**: Procesamiento de ventas y clientes
- **RECURSOS_HUMANOS**: Administración de usuarios
- **PROVEEDORES**: Gestión de proveedores (próximamente)
- **ENTREGAS**: Control de entregas (próximamente)

### Tipos de Usuario
- **Admin**: Acceso completo a todos los módulos
- **Vendedor**: Solo acceso a Ventas
- **Personal**: Acceso a Bodega y Entregas
- **Personalizado**: Permisos asignados desde RRHH

## 📊 Características Técnicas del Módulo de Ventas

### Actualización Automática de Stock
- **Tiempo real**: Stock se decrementa al agregar al carrito
- **Reversible**: Se restaura al eliminar items o cancelar venta
- **Sincronizado**: Cambios se reflejan en Bodega inmediatamente
- **Validado**: No permite agregar más unidades que las disponibles

### Cálculos Automáticos
- **Subtotal**: Suma de todos los items
- **Descuento**: Porcentaje configurable sobre subtotal
- **IVA**: 19% sobre subtotal con descuento aplicado
- **Total**: Cálculo final automático

### Información de Productos
- Código único
- Nombre y descripción
- Categoría con badge visual
- Proveedor identificado
- Precio formateado en COP
- Stock disponible con indicadores de color

## 📦 Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **TypeScript**: Lenguaje de programación
- **RxJS**: Programación reactiva con Observables
- **Angular Forms**: FormsModule para formularios
- **LocalStorage API**: Persistencia de datos
- **CSS3**: Estilos personalizados con diseño moderno
- **Responsive Design**: Compatible con todos los dispositivos

## 🧪 Testing

Para ejecutar las pruebas:
```bash
ng test
```

## 🚀 Próximas Funcionalidades

- [ ] Módulo de Proveedores completo
- [ ] Módulo de Entregas con tracking
- [ ] Reportes y analytics de ventas
- [ ] Exportación de datos a PDF/Excel
- [ ] Sistema de notificaciones
- [ ] Dashboard con métricas clave

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del desarrollo de PoliMarket - Sistema Integral de Gestión Empresarial.

## 👥 Autor

Desarrollado para PoliMarket

---

**Nota**: La aplicación funciona completamente en el frontend sin necesidad de backend. Todos los datos se almacenan en localStorage del navegador.
