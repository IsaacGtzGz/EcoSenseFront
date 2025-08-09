import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FaqComentario {
  id?: number;
  pregunta: string;
  respuesta?: string;
  autor: string;
  fecha: string;
  destacado?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private apiUrl = 'https://localhost:7181/api/faq';

  constructor(private http: HttpClient) {}

  enviarComentario(comentario: FaqComentario): Observable<any> {
    return this.http.post<any>(this.apiUrl, comentario);
  }

  obtenerComentarios(): Observable<FaqComentario[]> {
    return this.http.get<FaqComentario[]>(this.apiUrl);
  }

  responderComentario(id: number, respuesta: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/responder`, { respuesta });
  }

  destacarComentario(id: number, destacado: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/destacar`, { destacado });
  }

    eliminarComentario(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
