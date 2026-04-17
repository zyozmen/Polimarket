# PoliMarket

Aplicacion Angular para operacion comercial con modulos de ventas, entregas, bodega, proveedores y recursos humanos.

Este README esta basado en el codigo actual del repositorio (no en una intencion futura), para que sirva como guia real de:

- Como esta compuesto el proyecto
- Como interactuan sus modulos
- Como levantarlo y depurarlo
- Como continuar su evolucion tecnica

## 1) Resumen tecnico

- Framework: Angular 17
- UI: Bootstrap 5 + Bootstrap Icons
- Estado: mayormente local en componentes (localStorage), con integraciones HTTP selectivas
- APIs externas:
  - Ventas: https://ventas-al0w.onrender.com (via proxy /ventas-api en desarrollo)
  - RRHH: https://akira.sedbaq.com.co/rrhh (via proxy /rrhh-api)

### Estado funcional por modulo

- Login: autenticacion local (credenciales hardcodeadas y dinamicas en localStorage)
- Recursos Humanos: gestion local de usuarios/permisos + integracion RRHH para crear/consultar/autorizar vendedor
- Ventas: integrado con API de ventas (clientes, productos, ventas)
- Entregas: integrado con API de deliveries
- Bodega: logica local (inventario y solicitudes en localStorage)
- Proveedores: logica local (proveedores y solicitudes en localStorage)

## 2) Estructura del proyecto

Raiz:

- angular.json: configuracion de build/serve/test
- package.json: scripts y dependencias
- proxy.conf.js / proxy.conf.json: proxy para desarrollo local
- src/environments: configuracion por entorno
- src/app: modulos, componentes y servicios

Carpeta src/app:

- app.module.ts: registro principal de componentes e interceptor
- app-routing.module.ts: rutas publicas
- app.component.*: shell general + menu por permisos
- components/: pantallas por modulo
- services/: clientes HTTP y servicios auxiliares
- guards/: guard de autenticacion (actualmente no aplicado en rutas)
- interceptors/: interceptor de errores HTTP
- models/: tipos y enums del dominio

## 3) Dependencias y scripts

Scripts principales:

- npm start
  - Ejecuta ng serve --proxy-config proxy.conf.js
- npm run build
- npm test

Dependencias clave:

- @angular/* 17
- rxjs
- bootstrap
- bootstrap-icons

## 4) Rutas y navegacion

Rutas configuradas:

- /login
- /bodega
- /ventas
- /recursos-humanos
- /proveedores
- /entregas

Notas importantes:

- No hay canActivate aplicado en app-routing.module.ts.
- El acceso visual se controla desde el menu en app.component.html usando permisos cargados por RecursosHumanosService.
- Si un usuario navega manualmente por URL, hoy no hay bloqueo real por guard.

## 5) Autenticacion, permisos y sesion

Servicio principal en uso: RecursosHumanosService

Flujo actual:

1. LoginComponent envia usuario/password a RecursosHumanosService.autenticar.
2. Se validan credenciales hardcodeadas o dinamicas de localStorage.
3. Se genera token simulado (mock), se guardan token y permisos en localStorage.
4. AppComponent escucha permisos$ y muestra/oculta opciones de menu.

Credenciales base de desarrollo:

- admin / admin123 -> todos los modulos
- vendedor1 / vendedor123 -> ventas
- personal / personal123 -> bodega y entregas

## 6) Capa HTTP y manejo de errores

Interceptor global: HttpErrorInterceptor

Responsabilidades:

- Agrega Content-Type: application/json en metodos no GET/DELETE
- Traduce errores comunes (404, 422, 500) a mensajes manejables
- Devuelve Error personalizado con status, statusText y payload

## 7) Integraciones reales y servicios

### Servicios realmente usados por componentes

- RrhhApiService
  - POST /rrhh-api/vendedor/crear
  - GET /rrhh-api/vendedor/:id
  - POST /rrhh-api/vendedor/autorizar/:id
- CustomersService
  - GET/POST/PATCH/DELETE /ventas-api/customers
- ProductsService
  - GET /ventas-api/products
- SalesService
  - GET /ventas-api/sales
  - GET /ventas-api/sales/:id
  - POST /ventas-api/sales
- DeliveriesService
  - GET /ventas-api/deliveries
  - POST /ventas-api/deliveries/:id/confirm
  - POST /ventas-api/deliveries/:id/cancel
  - POST /ventas-api/deliveries/:id/in_progress (disponible en servicio)

### Servicios presentes pero no conectados a pantallas actuales

- AuthService
- AuthGuard (existe pero no aplicado en rutas)
- VendedorService
- BodegaService
- ProveedoresService
- VentasService
- EntregasService

Estos parecen servicios de plantilla/expansion y no son la base operativa actual del UI.

## 8) Como interactuan los modulos

### Flujo RRHH y permisos

- Recursos Humanos permite crear usuarios locales con permisos.
- Login usa esos permisos para habilitar modulos en el menu.
- El mismo modulo consume RRHH externa para operaciones sobre vendedor remoto.

### Flujo ventas -> entregas

1. Ventas carga clientes, productos y ventas en paralelo (forkJoin).
2. Al procesar venta, se crea en backend Rails.
3. Backend gestiona estado de entrega asociado.
4. Entregas consulta deliveries y permite confirmar/cancelar.

### Flujo bodega <-> proveedores (localStorage)

1. Bodega detecta stock bajo y crea solicitud.
2. Solicitud se guarda en localStorage.
3. Proveedores carga esas solicitudes y cambia estado.
4. Si pasa a Entregada, incrementa stock del producto en localStorage.

## 9) Configuracion de entorno y proxy

environment.ts (desarrollo):

- apiUrl: /ventas-api

environment.prod.ts (produccion):

- apiUrl: https://ventas-al0w.onrender.com

proxy.conf.js en desarrollo:

- /ventas-api -> https://ventas-al0w.onrender.com
- /rrhh-api -> https://akira.sedbaq.com.co/rrhh

## 10) Como ejecutar localmente

Requisitos:

- Node.js 18+
- npm 9+
- Angular CLI 17+

Pasos:

1. Instalar dependencias
   - npm install
2. Levantar en desarrollo
   - npm start
3. Abrir
   - http://localhost:4200

Build:

- npm run build

## 11) Problemas frecuentes

- Error de conexion o 404 al backend de ventas:
  - El servicio de Render puede estar en cold start, esperar 1-2 minutos y reintentar.
- CORS:
  - En desarrollo, usar npm start para asegurar proxy activo.
- Menu visible pero ruta no protegida:
  - Actualmente no hay guard aplicado por ruta; es una brecha conocida.

## 12) Deuda tecnica identificada

1. Seguridad de rutas
- Aplicar AuthGuard y permisos por data en RouterModule.

2. Estrategia de autenticacion duplicada
- Existe AuthService con enfoque JWT real, pero la app usa RecursosHumanosService mock.
- Unificar en una sola estrategia.

3. Doble fuente de datos
- Parte del sistema es API real y parte localStorage.
- Definir arquitectura objetivo (todo API o estrategia offline-first formal).

4. Servicios no usados
- Limpiar o integrar servicios plantilla para reducir confusion.

5. Atajos de teclado en ventas
- El listener depende de la seccion realizar-venta, pero esa vista esta deshabilitada.

6. Duplicacion de carga Bootstrap
- Bootstrap se incluye por angular.json, styles.css e index.html.
- Mantener una sola via para evitar redundancia.

## 13) Como continuar (hoja de ruta sugerida)

### Fase 1 - Estabilizar (alta prioridad)

1. Proteger rutas con AuthGuard y reglas de permisos por modulo.
2. Unificar autenticacion (elegir AuthService real o formalizar RecursosHumanosService).
3. Corregir atajos de ventas para que funcionen en la vista actual.

### Fase 2 - Unificar datos

1. Migrar Bodega y Proveedores a backend real (o declarar modo local explicitamente).
2. Centralizar modelos compartidos para cliente/producto/venta/entrega.
3. Estandarizar estados de entrega entre backend y frontend.

### Fase 3 - Calidad y mantenibilidad

1. Agregar pruebas unitarias y pruebas de integracion de flujos clave.
2. Documentar contratos de API en un archivo dedicado por servicio.
3. Depurar servicios no usados y codigo muerto.

## 14) Referencia rapida de archivos clave

- src/app/app.module.ts
- src/app/app-routing.module.ts
- src/app/app.component.ts
- src/app/components/login/login.component.ts
- src/app/components/vendedor-list/vendedor-list.component.ts
- src/app/components/ventas/ventas.component.ts
- src/app/components/entregas/entregas.component.ts
- src/app/components/bodega/bodega.component.ts
- src/app/components/proveedores/proveedores.component.ts
- src/app/services/recursos-humanos.service.ts
- src/app/services/rrhh-api.service.ts
- src/app/services/customers.service.ts
- src/app/services/products.service.ts
- src/app/services/sales.service.ts
- src/app/services/deliveries.service.ts
- src/environments/environment.ts
- proxy.conf.js

---

Si vas a continuar el desarrollo en equipo, el siguiente mejor paso es cerrar primero la brecha de seguridad de rutas y luego decidir una estrategia unica de persistencia (API vs localStorage) para evitar comportamientos inconsistentes entre modulos.
