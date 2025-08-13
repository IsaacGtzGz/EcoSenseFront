import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeContacto {
  nombre: string;
  email: string;
  mensaje: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private apiUrl = 'https://localhost:7181/api/contacto';

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: MensajeContacto): Observable<any> {
    return this.http.post<any>(this.apiUrl, mensaje);
  }

  obtenerMensajes(): Observable<MensajeContacto[]> {
    return this.http.get<MensajeContacto[]>(this.apiUrl);
  }

  getMensajes() {
    return this.http.get<any[]>(`${this.apiUrl}/mensajes`);
  }

  enviarRespuesta(data: { email: string; asunto: string; mensaje: string }) {
    return this.http.post<any>(`${this.apiUrl}/responder`, data);
  }
}
