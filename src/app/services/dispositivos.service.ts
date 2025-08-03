import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dispositivo {
  idDispositivo?: number;
  nombre: string;
  ubicacion: string;
  mac: string; // Cambiado de macAddress a mac
  sector?: string; // Campo sector del backend
  idUsuario: number;
  fechaRegistro?: string; // Fecha de registro
  usuario?: {
    idUsuario: number;
    nombre: string;
    correo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DispositivosService {
  private apiUrl = 'https://localhost:7181/api/dispositivos';

  constructor(private http: HttpClient) {}

  // Obtener todos los dispositivos
  getDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(this.apiUrl);
  }

  // Obtener dispositivo por ID
  getDispositivo(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo dispositivo
  createDispositivo(dispositivo: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.apiUrl, dispositivo);
  }

  // Actualizar dispositivo
  updateDispositivo(id: number, dispositivo: Dispositivo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dispositivo);
  }

  // Eliminar dispositivo
  deleteDispositivo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
