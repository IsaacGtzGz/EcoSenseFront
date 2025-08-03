import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfiguracionUmbral {
  idUmbral?: number;
  idDispositivo: number;
  co2Max: number;
  pm1Max: number;
  pm2_5Max: number;
  pm10Max: number;
  temperaturaMax: number;
  humedadMax: number;
  presionMax: number;
  fechaConfiguracion?: string;
  dispositivo?: {
    idDispositivo: number;
    nombre: string;
    ubicacion: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UmbralesService {
  private apiUrl = 'https://localhost:7181/api/umbrales';

  constructor(private http: HttpClient) {}

  // Obtener todos los umbrales
  getUmbrales(): Observable<ConfiguracionUmbral[]> {
    return this.http.get<ConfiguracionUmbral[]>(this.apiUrl);
  }

  // Obtener umbral por dispositivo
  getUmbralPorDispositivo(idDispositivo: number): Observable<ConfiguracionUmbral> {
    return this.http.get<ConfiguracionUmbral>(`${this.apiUrl}/${idDispositivo}`);
  }

  // Crear nuevo umbral
  createUmbral(umbral: ConfiguracionUmbral): Observable<any> {
    return this.http.post(this.apiUrl, umbral);
  }

  // Actualizar umbral
  updateUmbral(id: number, umbral: ConfiguracionUmbral): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, umbral);
  }

  // Eliminar umbral
  deleteUmbral(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
