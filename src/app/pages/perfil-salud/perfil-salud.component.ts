import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosSaludService, DatoSalud } from '../../services/datos-salud.service';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-perfil-salud',
  standalone: false,
  templateUrl: './perfil-salud.component.html',
  styleUrl: './perfil-salud.component.css'
})
export class PerfilSaludComponent implements OnInit {
  datosSalud: DatoSalud | null = null;
  recomendaciones: string[] = [];
  loading = false;
  error = '';
  success = '';
  editando = false;

  // Propiedades para manejo de usuarios
  targetUserId: number | null = null; // ID del usuario a configurar (null = usuario actual)
  targetUserName = ''; // Nombre del usuario a configurar
  isAdminMode = false; // Si es admin configurando otro usuario
  perfilGuardado = false; // Control para habilitar botón de volver

  // Formulario
  formData: DatoSalud = {
    idUsuario: 0,
    fechaNacimiento: '',
    genero: '',
    alturaCm: 0,
    pesoKg: 0,
    enfermedadesRespiratorias: '',
    alergias: '',
    observaciones: '',
    observacionesPersonalizadas: ''
  };

  // Opciones médicas con checkboxes
  enfermedadesOptions = [
    { id: 'asma', label: 'Asma', checked: false },
    { id: 'epoc', label: 'EPOC', checked: false },
    { id: 'bronquitis', label: 'Bronquitis crónica', checked: false },
    { id: 'rinitis', label: 'Rinitis alérgica', checked: false },
    { id: 'sinusitis', label: 'Sinusitis crónica', checked: false },
    { id: 'ninguna_enfermedad', label: 'Ninguna', checked: false }
  ];

  alergiasOptions = [
    { id: 'polen', label: 'Polen', checked: false },
    { id: 'acaros', label: 'Ácaros del polvo', checked: false },
    { id: 'humo', label: 'Humo de cigarrillo', checked: false },
    { id: 'productos_quimicos', label: 'Productos químicos', checked: false },
    { id: 'contaminacion', label: 'Contaminación del aire', checked: false },
    { id: 'moho', label: 'Moho y humedad', checked: false },
    { id: 'pelo_animales', label: 'Pelo de animales', checked: false },
    { id: 'ninguna_alergia', label: 'Ninguna', checked: false }
  ];

  observacionesOptions = [
    { id: 'medicamentos', label: 'Medicamentos respiratorios', checked: false },
    { id: 'inhaladores', label: 'Uso de inhaladores', checked: false },
    { id: 'oxigeno', label: 'Terapia de oxígeno', checked: false },
    { id: 'ejercicio_limitado', label: 'Ejercicio limitado por respiración', checked: false },
    { id: 'fumador', label: 'Fumador actual', checked: false },
    { id: 'ex_fumador', label: 'Ex-fumador', checked: false },
    { id: 'exposicion_laboral', label: 'Exposición laboral a contaminantes', checked: false },
    { id: 'ninguna_observacion', label: 'Ninguna', checked: false }
  ];

  constructor(
    private datosSaludService: DatosSaludService,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar si es modo admin (configurando usuario específico)
    const routeUserId = this.route.snapshot.paramMap.get('id');
    if (routeUserId) {
      // Modo admin: configurar salud de usuario específico
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.isAdminMode = true;
      this.targetUserId = parseInt(routeUserId);
      this.formData.idUsuario = this.targetUserId;

      // Cargar información del usuario objetivo
      this.cargarUsuarioObjetivo();
    } else {
      // Modo normal: configurar salud propia
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.formData.idUsuario = userId;
        this.targetUserId = userId;
      }
    }

    if (this.targetUserId) {
      this.cargarDatosSalud();
      this.cargarRecomendaciones();
    }
  }

  cargarUsuarioObjetivo() {
    if (this.targetUserId && this.isAdminMode) {
      this.usuariosService.getUsuario(this.targetUserId).subscribe({
        next: (usuario) => {
          this.targetUserName = usuario.nombre;
        },
        error: (error) => {
          console.error('Error al cargar usuario:', error);
          this.error = 'Error al cargar información del usuario';
        }
      });
    }
  }

  cargarDatosSalud() {
    this.loading = true;
    this.datosSaludService.getDatosSalud(this.formData.idUsuario).subscribe({
      next: (datos) => {
        this.datosSalud = datos;
        this.formData = { ...datos };
        this.perfilGuardado = true; // Ya tiene datos guardados
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          // No tiene datos de salud aún
          this.editando = true;
        } else {
          this.error = 'Error al cargar datos de salud';
        }
        this.loading = false;
      }
    });
  }

  cargarRecomendaciones() {
    this.datosSaludService.getRecomendaciones(this.formData.idUsuario).subscribe({
      next: (response) => {
        this.recomendaciones = response.recomendaciones || [];
      },
      error: (err) => {
        console.error('Error al cargar recomendaciones:', err);
      }
    });
  }

  editarPerfil() {
    this.editando = true;
    this.error = '';
    this.success = '';

    // Si hay datos existentes, cargar los checkboxes
    if (this.datosSalud) {
      this.formData = { ...this.datosSalud };
      this.cargarCheckboxesDesdeString();
    }
  }

  cancelarEdicion() {
    this.editando = false;
    if (this.datosSalud) {
      this.formData = { ...this.datosSalud };
    }
    this.error = '';
    this.success = '';
  }

  guardarDatos() {
    if (!this.validarFormulario()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const operacion = this.datosSalud
      ? this.datosSaludService.updateDatosSalud(this.formData.idUsuario, this.formData)
      : this.datosSaludService.createDatosSalud(this.formData);

    operacion.subscribe({
      next: (response) => {
        this.success = response.mensaje || 'Datos guardados correctamente';
        this.datosSalud = { ...this.formData };
        this.editando = false;
        this.loading = false;
        this.perfilGuardado = true; // Habilitar botón de volver
        this.cargarRecomendaciones(); // Actualizar recomendaciones

        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al guardar los datos';
        this.loading = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.formData.fechaNacimiento) {
      this.error = 'La fecha de nacimiento es obligatoria';
      return false;
    }
    if (!this.formData.genero) {
      this.error = 'El género es obligatorio';
      return false;
    }
    if (this.formData.alturaCm <= 0 || this.formData.alturaCm > 250) {
      this.error = 'La altura debe estar entre 1 y 250 cm';
      return false;
    }
    if (this.formData.pesoKg <= 0 || this.formData.pesoKg > 500) {
      this.error = 'El peso debe estar entre 1 y 500 kg';
      return false;
    }
    return true;
  }

  // Métodos para manejar checkboxes médicos
  onEnfermedadChange(opcionId: string, checked: boolean) {
    const opcion = this.enfermedadesOptions.find(o => o.id === opcionId);
    if (opcion) {
      opcion.checked = checked;

      if (opcionId === 'ninguna_enfermedad' && checked) {
        // Si selecciona "Ninguna", desmarcar todas las demás
        this.enfermedadesOptions.forEach(o => {
          if (o.id !== 'ninguna_enfermedad') {
            o.checked = false;
          }
        });
      } else if (opcionId !== 'ninguna_enfermedad' && checked) {
        // Si selecciona cualquier enfermedad, desmarcar "Ninguna"
        const ningunaOpcion = this.enfermedadesOptions.find(o => o.id === 'ninguna_enfermedad');
        if (ningunaOpcion) {
          ningunaOpcion.checked = false;
        }
      }

      this.actualizarEnfermedadesString();
    }
  }

  onAlergiaChange(opcionId: string, checked: boolean) {
    const opcion = this.alergiasOptions.find(o => o.id === opcionId);
    if (opcion) {
      opcion.checked = checked;

      if (opcionId === 'ninguna_alergia' && checked) {
        // Si selecciona "Ninguna", desmarcar todas las demás
        this.alergiasOptions.forEach(o => {
          if (o.id !== 'ninguna_alergia') {
            o.checked = false;
          }
        });
      } else if (opcionId !== 'ninguna_alergia' && checked) {
        // Si selecciona cualquier alergia, desmarcar "Ninguna"
        const ningunaOpcion = this.alergiasOptions.find(o => o.id === 'ninguna_alergia');
        if (ningunaOpcion) {
          ningunaOpcion.checked = false;
        }
      }

      this.actualizarAlergiasString();
    }
  }

  onObservacionChange(opcionId: string, checked: boolean) {
    const opcion = this.observacionesOptions.find(o => o.id === opcionId);
    if (opcion) {
      opcion.checked = checked;

      if (opcionId === 'ninguna_observacion' && checked) {
        // Si selecciona "Ninguna", desmarcar todas las demás
        this.observacionesOptions.forEach(o => {
          if (o.id !== 'ninguna_observacion') {
            o.checked = false;
          }
        });
      } else if (opcionId !== 'ninguna_observacion' && checked) {
        // Si selecciona cualquier observación, desmarcar "Ninguna"
        const ningunaOpcion = this.observacionesOptions.find(o => o.id === 'ninguna_observacion');
        if (ningunaOpcion) {
          ningunaOpcion.checked = false;
        }
      }

      this.actualizarObservacionesString();
    }
  }

  private actualizarEnfermedadesString() {
    const seleccionadas = this.enfermedadesOptions
      .filter(o => o.checked && o.id !== 'ninguna_enfermedad')
      .map(o => o.label);

    if (seleccionadas.length === 0) {
      const ningunaSeleccionada = this.enfermedadesOptions.find(o => o.id === 'ninguna_enfermedad' && o.checked);
      this.formData.enfermedadesRespiratorias = ningunaSeleccionada ? 'Ninguna' : '';
    } else {
      this.formData.enfermedadesRespiratorias = seleccionadas.join(', ');
    }
  }

  private actualizarAlergiasString() {
    const seleccionadas = this.alergiasOptions
      .filter(o => o.checked && o.id !== 'ninguna_alergia')
      .map(o => o.label);

    if (seleccionadas.length === 0) {
      const ningunaSeleccionada = this.alergiasOptions.find(o => o.id === 'ninguna_alergia' && o.checked);
      this.formData.alergias = ningunaSeleccionada ? 'Ninguna' : '';
    } else {
      this.formData.alergias = seleccionadas.join(', ');
    }
  }

  private actualizarObservacionesString() {
    const seleccionadas = this.observacionesOptions
      .filter(o => o.checked && o.id !== 'ninguna_observacion')
      .map(o => o.label);

    if (seleccionadas.length === 0) {
      const ningunaSeleccionada = this.observacionesOptions.find(o => o.id === 'ninguna_observacion' && o.checked);
      this.formData.observaciones = ningunaSeleccionada ? 'Ninguna' : '';
    } else {
      this.formData.observaciones = seleccionadas.join(', ');
    }
  }

  private cargarCheckboxesDesdeString() {
    // Cargar enfermedades
    if (this.formData.enfermedadesRespiratorias) {
      if (this.formData.enfermedadesRespiratorias.toLowerCase() === 'ninguna') {
        const ningunaOpcion = this.enfermedadesOptions.find(o => o.id === 'ninguna_enfermedad');
        if (ningunaOpcion) ningunaOpcion.checked = true;
      } else {
        const enfermedades = this.formData.enfermedadesRespiratorias.split(',').map(e => e.trim().toLowerCase());
        this.enfermedadesOptions.forEach(opcion => {
          if (opcion.id !== 'ninguna_enfermedad') {
            opcion.checked = enfermedades.some(e =>
              opcion.label.toLowerCase().includes(e) || e.includes(opcion.label.toLowerCase())
            );
          }
        });
      }
    }

    // Cargar alergias
    if (this.formData.alergias) {
      if (this.formData.alergias.toLowerCase() === 'ninguna') {
        const ningunaOpcion = this.alergiasOptions.find(o => o.id === 'ninguna_alergia');
        if (ningunaOpcion) ningunaOpcion.checked = true;
      } else {
        const alergias = this.formData.alergias.split(',').map(a => a.trim().toLowerCase());
        this.alergiasOptions.forEach(opcion => {
          if (opcion.id !== 'ninguna_alergia') {
            opcion.checked = alergias.some(a =>
              opcion.label.toLowerCase().includes(a) || a.includes(opcion.label.toLowerCase())
            );
          }
        });
      }
    }

    // Cargar observaciones
    if (this.formData.observaciones) {
      if (this.formData.observaciones.toLowerCase() === 'ninguna') {
        const ningunaOpcion = this.observacionesOptions.find(o => o.id === 'ninguna_observacion');
        if (ningunaOpcion) ningunaOpcion.checked = true;
      } else {
        const observaciones = this.formData.observaciones.split(',').map(o => o.trim().toLowerCase());
        this.observacionesOptions.forEach(opcion => {
          if (opcion.id !== 'ninguna_observacion') {
            opcion.checked = observaciones.some(o =>
              opcion.label.toLowerCase().includes(o) || o.includes(opcion.label.toLowerCase())
            );
          }
        });
      }
    }
  }

  calcularEdad(): number {
    if (!this.formData.fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(this.formData.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  calcularIMC(): number {
    if (this.formData.alturaCm <= 0 || this.formData.pesoKg <= 0) return 0;
    const alturaM = this.formData.alturaCm / 100;
    return Math.round((this.formData.pesoKg / (alturaM * alturaM)) * 100) / 100;
  }

  getIMCCategoria(): string {
    const imc = this.calcularIMC();
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }
}
