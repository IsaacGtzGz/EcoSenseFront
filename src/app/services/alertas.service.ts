import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  idAlerta: number;
  idLectura: number;
  tipoAlerta: string;
  mensaje: string;
  timestamp: Date;
  valorMedido: number;
  umbralExcedido: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private apiUrl = 'https://localhost:7181/api/alertas';

  constructor(private http: HttpClient) {}

  // Obtener todas las alertas
  getAlertas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.apiUrl);
  }

  // Obtener alertas por dispositivo
  getAlertasPorDispositivo(idDispositivo: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/dispositivo/${idDispositivo}`);
  }

  // Obtener alertas recientes
  getAlertasRecientes(cantidad: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/recientes/${cantidad}`);
  }

  // Obtener alerta por ID
  getAlerta(id: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  // Eliminar alerta
  deleteAlerta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
