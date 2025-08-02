import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsuarioLogin } from '../models/usuario-login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7181/api/auth'; // ajusta el puerto si es necesario

  constructor(private http: HttpClient) {}

  login(usuario: UsuarioLogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, usuario).pipe(
      tap((response: any) => {
        // Guardar token JWT y datos del usuario
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
      })
    );
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !this.isTokenExpired();
  }

  // Verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(new Date().getTime() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true; // Si hay error al decodificar, consideramos que está expirado
    }
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  // Obtener datos del usuario
  getUser(): any {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }
}
