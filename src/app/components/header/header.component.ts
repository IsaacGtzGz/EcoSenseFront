import { Component, AfterViewChecked} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})

export class HeaderComponent implements AfterViewChecked {
  nombreUsuario: string = ''; // Inicializa el nombre de usuario
  rolUsuario: string = ''; // Rol del usuario
  estaLogueado: boolean = false; // Inicializa el estado de logueo
  esAdministrador: boolean = false; // Para verificar si es administrador

  constructor(private router: Router, private authService: AuthService) {
    this.verificarSesion();

    // Escucha cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.verificarSesion(); // actualiza si hay cambio de ruta
      }
    });
  }

  verificarSesion() {
    this.estaLogueado = this.authService.isLoggedIn();

    if (this.estaLogueado) {
      const user = this.authService.getUser();
      this.nombreUsuario = user?.nombre || user?.usuario || 'Usuario';
      this.rolUsuario = this.authService.getRole() || 'Sin rol';
      this.esAdministrador = this.authService.isAdmin();
    } else {
      this.nombreUsuario = '';
      this.rolUsuario = '';
      this.esAdministrador = false;
    }
  }

  // Aplica la clase admin-layout al body si es admin logueado
  ngAfterViewChecked() {
    if (this.esAdministrador && this.estaLogueado) {
      document.body.classList.add('admin-layout');
    } else {
      document.body.classList.remove('admin-layout');
    }
  }

  cerrarSesion() {
    this.authService.logout(); // Usa el método del servicio
    this.router.navigate(['/login']); // redirige al login
  }
}
