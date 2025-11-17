import { Component, OnInit } from '@angular/core';
import { RecursosHumanosService } from '../../services/recursos-humanos.service';
import { RrhhApiService } from '../../services/rrhh-api.service';
import { Sistema } from '../../models/vendedor.model';

interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  permisos: Sistema[];
}

@Component({
  selector: 'app-vendedor-list',
  templateUrl: './vendedor-list.component.html',
  styleUrls: ['./vendedor-list.component.css']
})
export class VendedorListComponent implements OnInit {
  // Sección activa
  seccionActiva: 'usuarios' | 'permisos' = 'usuarios';
  
  // Lista de usuarios
  usuarios: Usuario[] = [];
  
  // Formulario de nuevo usuario
  nuevoUsuario = {
    usuario: '',
    password: '',
    nombre: '',
    permisos: [] as Sistema[]
  };
  
  // Gestión de permisos
  usuarioSeleccionado: Usuario | null = null;
  permisosDisponibles = Object.values(Sistema);
  
  // Control de UI
  mostrarFormulario = false;
  loading = false;
  error = '';
  mensaje = '';
  
  // Formulario para crear vendedor en API
  mostrarFormVendedorApi = false;
  nuevoVendedorApi = {
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    codigo_vendedor: ''
  };

  // Resultado de consulta de vendedor
  vendedorConsultado: any = null;
  
  // IDs para operaciones de API
  vendedorIdConsulta: string = '';
  vendedorIdAutorizar: string = '';

  constructor(
    private rrhhService: RecursosHumanosService,
    private rrhhApiService: RrhhApiService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cambiarSeccion(seccion: 'usuarios' | 'permisos'): void {
    this.seccionActiva = seccion;
    this.limpiarMensajes();
  }

  cargarUsuarios(): void {
    // Simular carga de usuarios desde localStorage o servicio
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
      this.usuarios = JSON.parse(usuariosGuardados);
    } else {
      // Usuarios por defecto
      this.usuarios = [
        { id: '1', usuario: 'admin', nombre: 'Administrador', permisos: Object.values(Sistema) },
        { id: '2', usuario: 'vendedor1', nombre: 'Vendedor Principal', permisos: [Sistema.VENTAS] },
        { id: '3', usuario: 'personal', nombre: 'Personal de Bodega', permisos: [Sistema.BODEGA, Sistema.ENTREGAS] }
      ];
      this.guardarUsuarios();
    }
  }

  guardarUsuarios(): void {
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  togglePermiso(permiso: Sistema): void {
    const index = this.nuevoUsuario.permisos.indexOf(permiso);
    if (index > -1) {
      this.nuevoUsuario.permisos.splice(index, 1);
    } else {
      this.nuevoUsuario.permisos.push(permiso);
    }
  }

  tienePermiso(permiso: Sistema): boolean {
    return this.nuevoUsuario.permisos.includes(permiso);
  }

  crearUsuario(): void {
    this.limpiarMensajes();
    
    // Validaciones
    if (!this.nuevoUsuario.usuario || !this.nuevoUsuario.password || !this.nuevoUsuario.nombre) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (this.nuevoUsuario.permisos.length === 0) {
      this.error = 'Debe seleccionar al menos un permiso';
      return;
    }

    // Verificar si el usuario ya existe
    if (this.usuarios.some(u => u.usuario === this.nuevoUsuario.usuario)) {
      this.error = 'El nombre de usuario ya existe';
      return;
    }

    // Crear usuario
    const usuario: Usuario = {
      id: Date.now().toString(),
      usuario: this.nuevoUsuario.usuario,
      nombre: this.nuevoUsuario.nombre,
      permisos: [...this.nuevoUsuario.permisos]
    };

    this.usuarios.push(usuario);
    this.guardarUsuarios();
    
    // Guardar credenciales (en producción esto iría al backend)
    const credenciales = JSON.parse(localStorage.getItem('credenciales') || '{}');
    credenciales[this.nuevoUsuario.usuario] = {
      password: this.nuevoUsuario.password,
      permisos: this.nuevoUsuario.permisos
    };
    localStorage.setItem('credenciales', JSON.stringify(credenciales));

    this.mensaje = 'Usuario creado exitosamente';
    this.limpiarFormulario();
    this.mostrarFormulario = false;
  }

  eliminarUsuario(id: string): void {
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario && confirm(`¿Está seguro de eliminar al usuario "${usuario.usuario}"?`)) {
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      this.guardarUsuarios();
      
      // Eliminar credenciales
      const credenciales = JSON.parse(localStorage.getItem('credenciales') || '{}');
      delete credenciales[usuario.usuario];
      localStorage.setItem('credenciales', JSON.stringify(credenciales));
      
      this.mensaje = 'Usuario eliminado exitosamente';
    }
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.limpiarMensajes();
  }

  togglePermisoUsuario(permiso: Sistema): void {
    if (!this.usuarioSeleccionado) return;
    
    const index = this.usuarioSeleccionado.permisos.indexOf(permiso);
    if (index > -1) {
      this.usuarioSeleccionado.permisos.splice(index, 1);
    } else {
      this.usuarioSeleccionado.permisos.push(permiso);
    }
  }

  tienePermisoUsuario(permiso: Sistema): boolean {
    return this.usuarioSeleccionado?.permisos.includes(permiso) || false;
  }

  guardarPermisos(): void {
    if (!this.usuarioSeleccionado) return;
    
    if (this.usuarioSeleccionado.permisos.length === 0) {
      this.error = 'El usuario debe tener al menos un permiso';
      return;
    }

    // Actualizar usuario en la lista
    const index = this.usuarios.findIndex(u => u.id === this.usuarioSeleccionado!.id);
    if (index > -1) {
      this.usuarios[index] = { ...this.usuarioSeleccionado };
      this.guardarUsuarios();
      
      // Actualizar credenciales
      const credenciales = JSON.parse(localStorage.getItem('credenciales') || '{}');
      if (credenciales[this.usuarioSeleccionado.usuario]) {
        credenciales[this.usuarioSeleccionado.usuario].permisos = this.usuarioSeleccionado.permisos;
        localStorage.setItem('credenciales', JSON.stringify(credenciales));
      }
      
      this.mensaje = 'Permisos actualizados exitosamente';
      this.usuarioSeleccionado = null;
    }
  }

  cancelarEdicion(): void {
    this.usuarioSeleccionado = null;
    this.limpiarMensajes();
  }

  limpiarFormulario(): void {
    this.nuevoUsuario = {
      usuario: '',
      password: '',
      nombre: '',
      permisos: []
    };
  }

  limpiarMensajes(): void {
    this.error = '';
    this.mensaje = '';
  }

  getNombrePermiso(permiso: Sistema): string {
    const nombres: { [key in Sistema]: string } = {
      [Sistema.BODEGA]: 'Bodega',
      [Sistema.VENTAS]: 'Ventas',
      [Sistema.RECURSOS_HUMANOS]: 'Recursos Humanos',
      [Sistema.PROVEEDORES]: 'Proveedores',
      [Sistema.ENTREGAS]: 'Entregas'
    };
    return nombres[permiso];
  }

  // ============= MÉTODOS PARA INTEGRACIÓN CON API RRHH =============

  toggleFormVendedorApi(): void {
    this.mostrarFormVendedorApi = !this.mostrarFormVendedorApi;
    if (!this.mostrarFormVendedorApi) {
      this.limpiarFormVendedorApi();
    }
  }

  crearVendedorApi(): void {
    this.limpiarMensajes();
    
    // Validaciones
    if (!this.nuevoVendedorApi.nombre || !this.nuevoVendedorApi.apellido || 
        !this.nuevoVendedorApi.documento || !this.nuevoVendedorApi.email || 
        !this.nuevoVendedorApi.codigo_vendedor) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;

    this.rrhhApiService.crearVendedor(this.nuevoVendedorApi).subscribe({
      next: (response) => {
        console.log('✅ Vendedor creado en API RRHH:', response);
        this.mensaje = response.message || 'Vendedor creado exitosamente en el servidor';
        this.limpiarFormVendedorApi();
        this.mostrarFormVendedorApi = false;
        this.loading = false;
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.mensaje = '', 5000);
      },
      error: (error) => {
        console.error('❌ Error al crear vendedor en API:', error);
        if (error.status === 500) {
          this.error = 'Error al crear vendedor. Por favor, verifique los datos e intente nuevamente';
        } else {
          this.error = `Error al crear vendedor: ${error.message}`;
        }
        this.loading = false;
      }
    });
  }

  autorizarVendedorApi(): void {
    this.limpiarMensajes();

    // Si hay un vendedor consultado, usar su ID
    const id = this.vendedorConsultado ? this.vendedorConsultado.id : parseInt(this.vendedorIdAutorizar);
    
    if (!id || isNaN(id)) {
      this.error = 'ID inválido';
      return;
    }

    this.loading = true;

    this.rrhhApiService.autorizarVendedor(id).subscribe({
      next: (response) => {
        console.log('✅ Vendedor autorizado:', response);
        if (response.autorizado) {
          this.mensaje = `Vendedor #${id} autorizado exitosamente`;
          this.vendedorIdAutorizar = '';
          
          // Actualizar el estado del vendedor consultado si existe
          if (this.vendedorConsultado && this.vendedorConsultado.id === id) {
            this.vendedorConsultado.estado_autorizacion = true;
          }
        } else {
          this.error = `No se pudo autorizar al vendedor #${id}`;
        }
        this.loading = false;
        setTimeout(() => this.limpiarMensajes(), 5000);
      },
      error: (error) => {
        console.error('❌ Error al autorizar vendedor:', error);
        if (error.status === 500) {
          this.error = 'Vendedor no encontrado';
        } else {
          this.error = `Error: ${error.message}`;
        }
        this.loading = false;
      }
    });
  }

  consultarVendedorApi(): void {
    this.limpiarMensajes();
    this.vendedorConsultado = null;

    if (!this.vendedorIdConsulta) {
      this.error = 'Debe ingresar un ID de vendedor';
      return;
    }

    const id = parseInt(this.vendedorIdConsulta);
    if (isNaN(id)) {
      this.error = 'ID inválido';
      return;
    }

    this.loading = true;

    this.rrhhApiService.obtenerVendedor(id).subscribe({
      next: (vendedor) => {
        console.log('✅ Vendedor obtenido:', vendedor);
        this.vendedorConsultado = vendedor;
        this.mensaje = 'Vendedor consultado exitosamente';
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al consultar vendedor:', error);
        if (error.status === 500) {
          this.error = 'Vendedor no encontrado';
        } else {
          this.error = `Error: ${error.message}`;
        }
        this.loading = false;
      }
    });
  }

  cerrarResultadoConsulta(): void {
    this.vendedorConsultado = null;
    this.limpiarMensajes();
  }

  limpiarFormVendedorApi(): void {
    this.nuevoVendedorApi = {
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      codigo_vendedor: ''
    };
  }
}
