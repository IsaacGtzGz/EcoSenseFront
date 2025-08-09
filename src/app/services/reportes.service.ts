import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteRequest {
  idUsuario: number;
  fechaInicio: string; // El backend convertirá automáticamente
  fechaFin: string;    // El backend convertirá automáticamente
  idDispositivo?: number;
  tipoSensor?: string;
}

export interface ReporteResponse {
  mensaje: string;
  archivo: string;
  url: string;
  totalRegistros: number;
}

export interface DatosReporte {
  totalRegistros: number;
  rangoFechas: {
    inicio: string;
    fin: string;
  };
  datos: any[];
}

export interface ReporteExportado {
  idReporte: number;
  idUsuario: number;
  rangoInicio: string;
  rangoFin: string;
  tipoReporte: string;
  fechaExportacion: string;
  rutaArchivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'https://localhost:7181/api/Reportes';

  constructor(private http: HttpClient) { }

  // Obtener datos para vista previa del reporte
  obtenerDatosReporte(
    fechaInicio: string,
    fechaFin: string,
    idDispositivo?: number,
    sensor?: string
  ): Observable<DatosReporte> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (idDispositivo !== undefined) {
      params = params.set('idDispositivo', idDispositivo.toString());
    }

    if (sensor) {
      params = params.set('sensor', sensor);
    }

    return this.http.get<DatosReporte>(`${this.apiUrl}/datos`, { params });
  }

  // Generar reporte CSV
  generarReporteCSV(request: ReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(`${this.apiUrl}/generar-csv`, request);
  }

  // Generar reporte PDF
  generarReportePDF(request: ReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(`${this.apiUrl}/generar-pdf`, request);
  }

  // Obtener historial de reportes
  obtenerHistorialReportes(idUsuario: number): Observable<ReporteExportado[]> {
    return this.http.get<ReporteExportado[]>(`${this.apiUrl}/historial/${idUsuario}`);
  }

  // Descargar archivo
  descargarArchivo(url: string, nombreArchivo: string): void {
    const link = document.createElement('a');
    link.href = `https://localhost:7181${url}`;
    link.download = nombreArchivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
