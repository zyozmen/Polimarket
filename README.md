# PoliMarket - Sistema de Recursos Humanos

Aplicación Angular que consume servicios REST para la gestión de vendedores y permisos en el sistema PoliMarket.

## 🚀 Características

- **Autenticación JWT**: Login seguro con tokens
- **Gestión de Vendedores**: CRUD completo de vendedores
- **Gestión de Permisos**: Autorización y revocación de permisos por sistema
- **Auditoría**: Registro de accesos a los diferentes sistemas
- **Interfaz Moderna**: Diseño responsive con Bootstrap 5

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
│   │   │   ├── login/              # Componente de login
│   │   │   └── vendedor-list/      # Lista de vendedores
│   │   ├── models/
│   │   │   └── vendedor.model.ts   # Interfaces y tipos
│   │   ├── services/
│   │   │   └── recursos-humanos.service.ts  # Servicio REST
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

## 🔌 Configuración del Backend

Por defecto, la aplicación está configurada para consumir una API REST en:
```
http://localhost:8080/api/rrhh
```

Para cambiar la URL, edita el archivo `src/app/services/recursos-humanos.service.ts`:
```typescript
private apiUrl = 'http://tu-servidor:puerto/api/rrhh';
```

## 📡 Endpoints Consumidos

### Autenticación
- `POST /authenticate` - Login

### Vendedores
- `GET /vendedores` - Listar todos los vendedores
- `GET /vendedores/:id` - Obtener vendedor por ID
- `POST /vendedores` - Crear vendedor
- `PUT /vendedores/:id` - Actualizar vendedor
- `DELETE /vendedores/:id` - Eliminar vendedor

### Permisos
- `GET /vendedores/:id/permisos` - Listar permisos de un vendedor
- `POST /vendedores/:id/autorizar` - Autorizar permiso
- `DELETE /vendedores/:id/revocar/:tipo` - Revocar permiso
- `GET /autorizaciones` - Validar acceso a sistema

### Auditoría
- `GET /auditoria` - Historial de accesos

## 🎨 Características de la UI

- **Responsive Design**: Funciona en móviles, tablets y escritorio
- **Bootstrap 5**: Framework CSS moderno
- **Bootstrap Icons**: Iconografía profesional
- **Validación de Formularios**: Validación en tiempo real
- **Manejo de Errores**: Mensajes claros y amigables
- **Loading States**: Indicadores de carga para mejor UX

## 🔐 Seguridad

- Tokens JWT almacenados en localStorage
- Headers de autorización en todas las peticiones protegidas
- Validación de formularios
- Manejo seguro de credenciales

## 📦 Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **RxJS**: Programación reactiva
- **HttpClient**: Cliente HTTP de Angular
- **Reactive Forms**: Formularios reactivos
- **Bootstrap 5**: Framework CSS
- **TypeScript**: Lenguaje de programación

## 🧪 Testing

Para ejecutar las pruebas:
```bash
ng test
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de la Actividad Evaluativa 1 - Diseño de Software - Master en Arquitectura de Software.

## 👥 Autor

Desarrollado para PoliMarket - Sistema de Gestión de Recursos Humanos

---

**Nota**: Asegúrate de tener el backend REST corriendo antes de iniciar la aplicación Angular.
