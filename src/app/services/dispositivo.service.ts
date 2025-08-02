import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dispositivo } from '../models/dispositivo.model';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {
  private apiUrl = 'https://localhost:7181/api/dispositivos';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(this.apiUrl);
  }

}
