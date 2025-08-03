import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css'],
  standalone: false
})
export class UsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = '';
  showDeleteModal = false;
  userToDelete: Usuario | null = null;

  constructor(
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

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        console.log('Usuarios cargados:', usuarios);
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  editarUsuario(id: number) {
    console.log('Editando usuario con ID:', id);
    this.router.navigate(['/admin/usuarios/editar', id]);
  }

  eliminarUsuario(usuario: Usuario) {
    this.userToDelete = usuario;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.usuariosService.deleteUsuario(this.userToDelete.idUsuario!).subscribe({
        next: () => {
          this.cargarUsuarios(); // Recargar la lista
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert('Error al eliminar usuario');
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  nuevoUsuario() {
    this.router.navigate(['/admin/usuarios/nuevo']);
  }

  getRoleBadgeClass(rol: string): string {
    switch (rol) {
      case 'Administrador':
        return 'badge-admin';
      case 'Usuario':
        return 'badge-user';
      default:
        return 'badge-default';
    }
  }
}
