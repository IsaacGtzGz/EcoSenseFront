import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})

export class HeaderComponent {
  nombreUsuario: string = ''; // Inicializa el nombre de usuario
  estaLogueado: boolean = false; // Inicializa el estado de logueo

  constructor(private router: Router) {
    this.verificarSesion();

    // Escucha cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.verificarSesion(); // actualiza si hay cambio de ruta
      }
    });
  }

  verificarSesion() {
    const user = localStorage.getItem('usuario');

    if (user) {
      const parsed = JSON.parse(user);
      this.nombreUsuario = parsed.nombre;
      this.estaLogueado = true; // Si hay usuario, se considera logueado
    } else {
      this.nombreUsuario = '';
      this.estaLogueado = false; // Si no hay usuario, no está logueado
     }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario'); // elimina el usuario del localStorage
    this.router.navigate(['/login']); // redirige al login
  }
}
