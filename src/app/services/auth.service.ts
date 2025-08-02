import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioLogin } from '../models/usuario-login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7181/api/auth'; // ajusta el puerto si es necesario

  constructor(private http: HttpClient) {}

  login(usuario: UsuarioLogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, usuario);
  }
}
