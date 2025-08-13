import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cotizacion {
  nombre: string;
  correo: string;
  tipoProducto: string;
  cantidad: number;
  requerimientos: string;
  costo: number;
}

@Injectable({ providedIn: 'root' })
export class CotizacionService {
  private apiUrl = 'https://localhost:7181/api/cotizaciones';

  constructor(private http: HttpClient) {}

  solicitarCotizacion(data: Cotizacion): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  obtenerCotizaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  enviarRespuesta(data: { email: string; asunto: string; mensaje: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/responder`, data);
  }
}
