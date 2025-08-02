import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioLogin } from '../../models/usuario-login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})

export class LoginComponent {
  correo: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const usuario: UsuarioLogin = {
      correo: this.correo,
      contraseña: this.password
    };

    this.authService.login(usuario).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        // Aquí podrías guardar el JWT/token si lo usas

        localStorage.setItem('usuario', JSON.stringify(res));
        // Redirigir al dashboard después del login exitoso
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.error = 'Correo o contraseña incorrectos.';
      }
    });
  }

    ngOnInit(): void {
    const user = localStorage.getItem('usuario');
    if (user) {
      this.router.navigate(['/dashboard']); // redirige automáticamente si ya estás logueado
    }
  }

}
