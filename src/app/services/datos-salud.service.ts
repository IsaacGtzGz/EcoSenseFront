import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatoSalud {
  idUsuario: number;
  fechaNacimiento: string;
  genero: string;
  alturaCm: number;
  pesoKg: number;
  enfermedadesRespiratorias?: string;
  alergias?: string;
  observaciones?: string;
  observacionesPersonalizadas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatosSaludService {
  private apiUrl = 'https://localhost:7181/api/datossalud';

  constructor(private http: HttpClient) {}

  // Obtener datos de salud del usuario actual
  getDatosSalud(idUsuario: number): Observable<DatoSalud> {
    return this.http.get<DatoSalud>(`${this.apiUrl}/${idUsuario}`);
  }

  // Crear datos de salud
  createDatosSalud(datosSalud: DatoSalud): Observable<any> {
    return this.http.post(this.apiUrl, datosSalud);
  }

  // Actualizar datos de salud
  updateDatosSalud(idUsuario: number, datosSalud: DatoSalud): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idUsuario}`, datosSalud);
  }

  // Eliminar datos de salud
  deleteDatosSalud(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idUsuario}`);
  }

  // Obtener recomendaciones personalizadas
  getRecomendaciones(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idUsuario}/recomendaciones`);
  }
}
