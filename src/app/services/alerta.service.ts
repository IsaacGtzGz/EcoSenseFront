import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = 'https://localhost:7181/api/alertas';

  constructor(private http: HttpClient) {}

  obtenerAlertasRecientes(dispositivoId: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/dispositivo/${dispositivoId}`);
  }

  obtenerTodasLasAlertas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}`);
  }
}
