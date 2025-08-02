import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lectura {
  idLectura: number;
  idDispositivo: number;
  timestamp: string;
  co2: number;
  pm1_0: number;
  pm2_5: number;
  pm10: number;
  temperatura: number;
  humedad: number;
  presion: number;
}

@Injectable({
  providedIn: 'root'
})
export class LecturaService {
  private apiUrl = 'https://localhost:7181/api/Lecturas'; // Cambia esto si tu puerto o dominio es diferente

  constructor(private http: HttpClient) {}

  obtenerUltimaLectura(idDispositivo: number): Observable<Lectura> {
    return this.http.get<Lectura>(`${this.apiUrl}/ultima/${idDispositivo}`);
  }

  obtenerHistoricoLecturas(idDispositivo: number, horas: number = 24) {
    return this.http.get<Lectura[]>(`${this.apiUrl}/historico/${idDispositivo}?horas=${horas}`);
  }

}
