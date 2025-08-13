import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService, Usuario } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-usuario-form',
  standalone: false,
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  @Input() modoCliente: boolean = false;
  usuarioForm: FormGroup;
  isEditing = false;
  loading = false;
  error = '';
  success = '';
  usuarioId: number | null = null;

  // Propiedades para countdown y redirección
  showCountdown = false;
  countdownSeconds = 15;
  createdUserId: number | null = null;

  // ID fijo para evitar errores de ExpressionChanged
  randomId = Math.random().toString(36).substring(7);
  roles = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Usuario', label: 'Usuario' },
    { value: 'Cliente', label: 'Cliente' }
  ];

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      empresa: ['', [Validators.required]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', [Validators.required]],
      rol: ['Usuario', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Si es modo cliente, cargar el usuario autenticado y ajustar el formulario
    if (this.modoCliente) {
      const usuarioActual = this.authService.getUser();
      const usuarioId = this.authService.getCurrentUserId();
      if (usuarioActual && usuarioId) {
        this.usuarioId = usuarioId;
        this.isEditing = true;
        this.cargarUsuario();
        // Ocultar campos de rol y empresa
        this.usuarioForm.get('rol')?.disable();
        this.usuarioForm.get('empresa')?.disable();
        // En modo edición, la contraseña no es requerida
        this.usuarioForm.get('contraseña')?.clearValidators();
        this.usuarioForm.get('confirmarContrasena')?.clearValidators();
        this.usuarioForm.get('contraseña')?.updateValueAndValidity();
        this.usuarioForm.get('confirmarContrasena')?.updateValueAndValidity();
      }
    } else {
      // Verificar que sea administrador
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Verificar si estamos editando
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.usuarioId = +params['id'];
          this.isEditing = true;
          this.cargarUsuario();
          // En modo edición, la contraseña no es requerida
          this.usuarioForm.get('contraseña')?.clearValidators();
          this.usuarioForm.get('confirmarContrasena')?.clearValidators();
          this.usuarioForm.get('contraseña')?.updateValueAndValidity();
          this.usuarioForm.get('confirmarContrasena')?.updateValueAndValidity();
        }
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('contraseña');
    const confirmPassword = form.get('confirmarContrasena');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  cargarUsuario() {
    if (!this.usuarioId) return;

    this.loading = true;
    this.usuariosService.getUsuario(this.usuarioId).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          telefono: usuario.telefono,
          rol: usuario.rol
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.error = 'Error al cargar usuario';
        this.loading = false;
      }
    });
  }

  async onSubmit() {
    if (this.usuarioForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = { ...this.usuarioForm.value };

    // Validar duplicados
    const errorDuplicado = await this.validarDuplicados(formData);
    if (errorDuplicado) {
      this.error = errorDuplicado;
      this.loading = false;
      return;
    }

    // En modo edición, solo incluir contraseña si se proporcionó
    if (this.isEditing && !formData.contraseña) {
      delete formData.contraseña;
      delete formData.confirmarContrasena;
    } else {
      delete formData.confirmarContrasena;
    }

    // Asegurar que todos los campos obligatorios estén presentes en el PUT
    if (this.isEditing && this.usuarioId) {
      formData.idUsuario = this.usuarioId;
      // Si algún campo obligatorio falta, lo rellenamos con el valor actual del formulario
      formData.nombre = formData.nombre || this.usuarioForm.get('nombre')?.value || '';
      formData.correo = formData.correo || this.usuarioForm.get('correo')?.value || '';
      formData.telefono = formData.telefono || this.usuarioForm.get('telefono')?.value || '';
      formData.empresa = formData.empresa || this.usuarioForm.get('empresa')?.value || '';
      formData.rol = formData.rol || this.usuarioForm.get('rol')?.value || '';
    }

    if (this.isEditing && this.usuarioId) {
      formData.idUsuario = this.usuarioId;
      this.usuariosService.updateUsuario(this.usuarioId, formData).subscribe({
        next: () => {
          this.success = 'Usuario actualizado exitosamente';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/usuarios']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.error = 'Error al actualizar usuario';
          this.loading = false;
        }
      });
    } else {
      this.usuariosService.createUsuario(formData).subscribe({
        next: (usuario) => {
          this.success = 'Usuario creado exitosamente';
          this.loading = false;
          this.createdUserId = usuario.idUsuario || null;

          // Iniciar countdown para redirección a perfil de salud
          this.showCountdown = true;
          this.startCountdown();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.error = 'Error al crear usuario';
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'nombre': return 'El nombre completo es requerido';
          case 'correo': return 'El correo electrónico es requerido';
          case 'telefono': return 'El teléfono es requerido';
          case 'contraseña': return 'La contraseña es requerida';
          case 'confirmarContrasena': return 'Debes confirmar la contraseña';
          case 'rol': return 'Debes seleccionar un rol';
          default: return `${fieldName} es requerido`;
        }
      }
      if (field.errors['minlength']) {
        if (fieldName === 'nombre') return 'El nombre debe tener al menos 2 caracteres';
        if (fieldName === 'contraseña') return 'La contraseña debe tener al menos 6 caracteres';
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) return 'Ingresa un correo electrónico válido';
      if (field.errors['pattern']) {
        if (fieldName === 'telefono') return 'El teléfono debe tener exactamente 10 dígitos';
        if (fieldName === 'nombre') return 'El nombre solo puede contener letras y espacios';
        return 'Formato no válido';
      }
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  cancel() {
    if (this.modoCliente) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/admin/usuarios']);
    }
  }

  // Validar duplicados antes de enviar
  private async validarDuplicados(formData: any): Promise<string | null> {
    try {
      // Obtener todos los usuarios para validar duplicados
      const usuarios = await this.usuariosService.getUsuarios().toPromise();

      if (!usuarios) return null;

      // Filtrar el usuario actual si estamos editando
      const otrosUsuarios = this.isEditing
        ? usuarios.filter(u => u.idUsuario !== this.usuarioId)
        : usuarios;

      // Validar email duplicado
      const emailExiste = otrosUsuarios.some(u =>
        u.correo.toLowerCase() === formData.correo.toLowerCase()
      );
      if (emailExiste) {
        return 'Ya existe un usuario con este correo electrónico';
      }

      // Validar teléfono duplicado
      const telefonoExiste = otrosUsuarios.some(u =>
        u.telefono === formData.telefono
      );
      if (telefonoExiste) {
        return 'Ya existe un usuario con este número de teléfono';
      }

      // Validar nombre duplicado (exacto)
      const nombreExiste = otrosUsuarios.some(u =>
        u.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim()
      );
      if (nombreExiste) {
        return 'Ya existe un usuario con este nombre completo';
      }

      return null; // No hay duplicados
    } catch (error) {
      console.error('Error al validar duplicados:', error);
      return 'Error al validar datos. Intenta nuevamente.';
    }
  }

  // Método para iniciar countdown y redirección
  startCountdown() {
    const interval = setInterval(() => {
      this.countdownSeconds--;

      if (this.countdownSeconds <= 0) {
        clearInterval(interval);
        this.redirectToHealthProfile();
      }
    }, 1000);
  }

  // Redireccionar al perfil de salud del usuario recién creado
  redirectToHealthProfile() {
    if (this.createdUserId) {
      // Redirigir a una ruta especial para configurar salud de usuario
      this.router.navigate(['/admin/usuarios', this.createdUserId, 'configurar-salud']);
    } else {
      this.router.navigate(['/admin/usuarios']);
    }
  }

  // Método para cancelar la redirección
  cancelRedirect() {
    this.showCountdown = false;
    this.countdownSeconds = 15;
    // Redirigir a la lista de usuarios
    this.router.navigate(['/admin/usuarios']);
  }

  // Método para redirigir a editar perfil de salud
  editarPerfilSalud() {
    if (this.isEditing && this.usuarioId) {
      this.router.navigate(['/admin/usuarios', this.usuarioId, 'configurar-salud']);
    }
  }
}
