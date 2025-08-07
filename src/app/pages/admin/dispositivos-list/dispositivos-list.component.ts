import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DispositivosService, Dispositivo } from '../../../services/dispositivos.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dispositivos-list',
  standalone: false,
  templateUrl: './dispositivos-list.component.html',
  styleUrls: ['./dispositivos-list.component.css']
})
export class DispositivosListComponent implements OnInit {
  dispositivos: Dispositivo[] = [];
  loading = false;
  error = '';
  showDeleteModal = false;
  deviceToDelete: Dispositivo | null = null;
  showForceConfirm = false;

  constructor(
    private dispositivosService: DispositivosService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar que sea administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.loading = true;
    this.error = '';

    this.dispositivosService.getDispositivos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dispositivos:', error);
        this.error = 'Error al cargar dispositivos';
        this.loading = false;
      }
    });
  }

  nuevoDispositivo() {
    this.router.navigate(['/admin/dispositivos/nuevo']);
  }

  editarDispositivo(id: number) {
    this.router.navigate(['/admin/dispositivos/editar', id]);
  }

  // Método para abrir el modal de confirmación
  showDeleteConfirm(device: Dispositivo) {
    this.deviceToDelete = device;
    this.showDeleteModal = true;
    this.showForceConfirm = false;
    this.error = '';
  }

  eliminarDispositivo(dispositivo: Dispositivo) {
    this.showDeleteConfirm(dispositivo);
  }

  confirmDelete() {
    if (!this.deviceToDelete?.idDispositivo) return;

    this.dispositivosService.deleteDispositivo(this.deviceToDelete.idDispositivo).subscribe({
      next: (response) => {
        console.log('Dispositivo eliminado exitosamente');
        this.cargarDispositivos();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error al eliminar dispositivo:', error);

        // Manejo específico de errores
        if (error.status === 400) {
          this.error = 'No se puede eliminar el dispositivo porque tiene lecturas asociadas';
          this.showForceConfirm = true; // Mostrar la opción de forzar eliminación
        } else if (error.status === 404) {
          this.error = 'Dispositivo no encontrado';
        } else if (error.status === 500) {
          this.error = 'Error interno del servidor al eliminar dispositivo';
        } else {
          this.error = 'Error desconocido al eliminar dispositivo';
        }
      }
    });
  }

  // Nuevo método para eliminación forzada
  forceDelete() {
    if (!this.deviceToDelete?.idDispositivo) return;

    this.dispositivosService.deleteDispositivo(this.deviceToDelete.idDispositivo, true).subscribe({
      next: (response) => {
        console.log('Dispositivo eliminado forzadamente:', response);
        this.cargarDispositivos();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error en eliminación forzada:', error);
        this.error = 'Error al eliminar dispositivo forzadamente';
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deviceToDelete = null;
    this.showForceConfirm = false;
    this.error = '';
  }

  showDeleteModal_click() {
    this.closeDeleteModal();
  }

  getStatusClass(device: Dispositivo): string {
    // Por ahora todos en línea, más tarde implementaremos lógica real
    return 'online';
  }

  getStatusText(device: Dispositivo): string {
    return 'En línea';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Sin fecha';

    // Si es string, convertir a Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';

    return dateObj.toLocaleDateString('es-ES');
  }
}
