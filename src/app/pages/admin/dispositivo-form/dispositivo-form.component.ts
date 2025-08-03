import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DispositivosService, Dispositivo } from '../../../services/dispositivos.service';
import { UsuariosService, Usuario } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dispositivo-form',
  standalone: false,
  templateUrl: './dispositivo-form.component.html',
  styleUrls: ['./dispositivo-form.component.css']
})
export class DispositivoFormComponent implements OnInit {
  dispositivoForm: FormGroup;
  isEditing = false;
  loading = false;
  error = '';
  success = '';
  dispositivoId: number | null = null;
  dispositivoOriginal: any = null; // Para almacenar el dispositivo original
  usuarios: Usuario[] = [];
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private dispositivosService: DispositivosService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dispositivoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_]+$/)]],
      ubicacion: ['', [Validators.required, Validators.minLength(3)]],
      macAddress: ['', [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/)]],
      idUsuario: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Verificar que sea administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.cargarUsuarios();

    // Verificar si estamos editando
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.dispositivoId = +params['id'];
        this.isEditing = true;
        this.cargarDispositivo();
      }
    });
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  cargarDispositivo() {
    if (!this.dispositivoId) return;

    this.loading = true;
    this.dispositivosService.getDispositivo(this.dispositivoId).subscribe({
      next: (dispositivo: Dispositivo) => {
        // Almacenar el dispositivo original para preservar campos como fechaRegistro
        this.dispositivoOriginal = dispositivo;

        this.dispositivoForm.patchValue({
          nombre: dispositivo.nombre || '',
          ubicacion: dispositivo.ubicacion || '',
          macAddress: dispositivo.mac || '', // El backend devuelve 'mac', lo mapeamos a 'macAddress' del formulario
          idUsuario: dispositivo.idUsuario?.toString() || ''
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar dispositivo:', error);
        this.error = this.formatBackendError(error);
        this.loading = false;
      }
    });
  }

  async onSubmit() {
    if (this.dispositivoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = { ...this.dispositivoForm.value };

    // Limpiar y validar datos
    formData.nombre = formData.nombre?.trim();
    formData.ubicacion = formData.ubicacion?.trim();
    formData.macAddress = formData.macAddress?.toUpperCase().replace(/[:-]/g, '').match(/.{2}/g)?.join(':') || formData.macAddress;
    formData.idUsuario = parseInt(formData.idUsuario);

    // Validaciones adicionales
    if (!formData.nombre || formData.nombre.length < 2) {
      this.error = 'El nombre del dispositivo es requerido y debe tener al menos 2 caracteres';
      this.loading = false;
      return;
    }

    if (!formData.macAddress || !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.macAddress)) {
      this.error = 'La dirección MAC no tiene un formato válido';
      this.loading = false;
      return;
    }

    if (!formData.idUsuario || isNaN(formData.idUsuario)) {
      this.error = 'Debes seleccionar un usuario responsable válido';
      this.loading = false;
      return;
    }    // Validar duplicados
    const errorDuplicado = await this.validarDuplicados(formData);
    if (errorDuplicado) {
      this.error = errorDuplicado;
      this.loading = false;
      return;
    }

    // Mapear los campos al formato esperado por el backend
    const deviceData: any = {
      nombre: formData.nombre,
      ubicacion: formData.ubicacion,
      mac: formData.macAddress, // El backend espera 'mac', no 'macAddress'
      idUsuario: formData.idUsuario,
      sector: this.dispositivoOriginal?.sector || '' // Incluir sector (campo requerido por el modelo)
    };

    // Si estamos editando, incluir el ID y campos requeridos por Entity Framework
    if (this.isEditing && this.dispositivoId) {
      deviceData.idDispositivo = this.dispositivoId;
      // En modo edición, incluir la fecha de registro original para evitar conflictos
      deviceData.fechaRegistro = this.dispositivoOriginal?.fechaRegistro || new Date().toISOString();
    }

    console.log('Datos a enviar:', deviceData);

    if (this.isEditing && this.dispositivoId) {
      this.dispositivosService.updateDispositivo(this.dispositivoId, deviceData).subscribe({
        next: () => {
          this.success = 'Dispositivo actualizado exitosamente';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/dispositivos']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Error al actualizar dispositivo:', error);
          this.error = this.formatBackendError(error);
          this.loading = false;
        }
      });
    } else {
      this.dispositivosService.createDispositivo(deviceData).subscribe({
        next: () => {
          this.success = 'Dispositivo creado exitosamente';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/dispositivos']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Error al crear dispositivo:', error);
          this.error = this.formatBackendError(error);
          this.loading = false;
        }
      });
    }
  }

  // Validar duplicados
  private async validarDuplicados(formData: any): Promise<string | null> {
    try {
      const dispositivos = await this.dispositivosService.getDispositivos().toPromise();

      if (!dispositivos || dispositivos.length === 0) return null;

      // Filtrar el dispositivo actual si estamos editando
      const otrosDispositivos = this.isEditing
        ? dispositivos.filter((d: Dispositivo) => d.idDispositivo !== this.dispositivoId)
        : dispositivos;

      // Validar nombre duplicado - verificar que ambos nombres existan
      const nombreExiste = otrosDispositivos.some((d: Dispositivo) =>
        d.nombre && formData.nombre &&
        d.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim()
      );
      if (nombreExiste) {
        return 'Ya existe un dispositivo con este nombre';
      }

      // Validar MAC Address duplicado - verificar que ambas MAC existan
      const macExiste = otrosDispositivos.some((d: Dispositivo) =>
        d.mac && formData.macAddress &&
        d.mac.toLowerCase().replace(/[:-]/g, '') === formData.macAddress.toLowerCase().replace(/[:-]/g, '')
      );
      if (macExiste) {
        return 'Ya existe un dispositivo con esta dirección MAC';
      }

      return null;
    } catch (error: any) {
      console.error('Error al validar duplicados:', error);
      return 'Error al validar datos. Intenta nuevamente.';
    }
  }

  markFormGroupTouched() {
    Object.keys(this.dispositivoForm.controls).forEach(key => {
      const control = this.dispositivoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.dispositivoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'nombre': return 'El nombre del dispositivo es requerido';
          case 'ubicacion': return 'La ubicación es requerida';
          case 'macAddress': return 'La dirección MAC es requerida';
          case 'idUsuario': return 'Debes seleccionar un usuario responsable';
          default: return `${fieldName} es requerido`;
        }
      }
      if (field.errors['minlength']) {
        if (fieldName === 'nombre') return 'El nombre debe tener al menos 2 caracteres';
        if (fieldName === 'ubicacion') return 'La ubicación debe tener al menos 3 caracteres';
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'nombre') return 'El nombre solo puede contener letras, números, espacios y guiones';
        if (fieldName === 'macAddress') return 'Formato de MAC Address inválido (Ej: AA:BB:CC:DD:EE:FF)';
        return 'Formato no válido';
      }
    }
    return '';
  }

  cancel() {
    this.router.navigate(['/admin/dispositivos']);
  }

  // Formatear MAC Address mientras se escribe
  formatMacAddress(event: any) {
    let value = event.target.value.replace(/[^a-fA-F0-9]/g, '');

    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    if (value.length > 0) {
      // Formatear como XX:XX:XX:XX:XX:XX
      const formatted = value.match(/.{1,2}/g)?.join(':') || value;
      this.dispositivoForm.patchValue({
        macAddress: formatted.toUpperCase()
      }, { emitEvent: false });

      // Actualizar el valor en el input
      event.target.value = formatted.toUpperCase();
    }
  }

  // Función auxiliar para formatear errores del backend
  private formatBackendError(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      } else if (error.error.message) {
        return error.error.message;
      } else if (error.error.errors) {
        // Manejar errores de validación del backend
        const firstError = Object.values(error.error.errors)[0] as string | string[];
        return Array.isArray(firstError) ? firstError[0] : firstError;
      }
    }

    switch (error.status) {
      case 400:
        return 'Datos inválidos. Verifica la información ingresada.';
      case 401:
        return 'No tienes autorización para realizar esta acción.';
      case 403:
        return 'Acceso denegado.';
      case 404:
        return 'El dispositivo no fue encontrado.';
      case 409:
        return 'Ya existe un dispositivo con estos datos.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      default:
        return 'Error desconocido. Intenta nuevamente.';
    }
  }
}
