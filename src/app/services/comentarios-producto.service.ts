import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComentarioProducto {
  id?: number;
  usuario: string;
  comentario: string;
  estrellas: number;
  fecha: string;
  productoId: number;
}

@Injectable({ providedIn: 'root' })
export class ComentariosProductoService {
  private apiUrl = 'https://localhost:7181/api/comentarios-producto';

  constructor(private http: HttpClient) {}

  obtenerComentarios(productoId: number): Observable<ComentarioProducto[]> {
    return this.http.get<ComentarioProducto[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  agregarComentario(comentario: ComentarioProducto): Observable<any> {
    return this.http.post<any>(this.apiUrl, comentario);
  }
}
