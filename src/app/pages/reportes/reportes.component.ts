import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService, ReporteRequest, DatosReporte, ReporteExportado } from '../../services/reportes.service';
import { DispositivosService } from '../../services/dispositivos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  reporteForm!: FormGroup;
  dispositivos: any[] = [];
  tiposSensor = [
    { value: 'ph', label: 'pH' },
    { value: 'turbidez', label: 'Turbidez' },
    { value: 'temperatura', label: 'Temperatura' },
    { value: 'oxigeno', label: 'Oxígeno Disuelto' },
    { value: 'conductividad', label: 'Conductividad' }
  ];

  datosReporte: DatosReporte | null = null;
  historialReportes: ReporteExportado[] = [];

  cargandoDatos = false;
  generandoReporte = false;
  mostrarVistaPevia = false;
  mostrarHistorial = false;

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private dispositivosService: DispositivosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarDispositivos();
    this.cargarHistorial();
  }

  initForm() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.reporteForm = this.fb.group({
      fechaInicio: [hace30Dias.toISOString().split('T')[0], Validators.required],
      fechaFin: [hoy.toISOString().split('T')[0], Validators.required],
      idDispositivo: [''],
      tipoSensor: ['']
    });
  }

  cargarDispositivos() {
    this.dispositivosService.obtenerDispositivos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
      },
      error: (error) => {
        console.error('Error al cargar dispositivos:', error);
      }
    });
  }

  cargarHistorial() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.reportesService.obtenerHistorialReportes(userId).subscribe({
        next: (historial) => {
          this.historialReportes = historial;
        },
        error: (error) => {
          console.error('Error al cargar historial:', error);
        }
      });
    }
  }

  obtenerVistaPrevia() {
    if (this.reporteForm.valid) {
      this.cargandoDatos = true;
      const formData = this.reporteForm.value;

      this.reportesService.obtenerDatosReporte(
        formData.fechaInicio,
        formData.fechaFin,
        formData.idDispositivo || undefined,
        formData.tipoSensor || undefined
      ).subscribe({
        next: (datos) => {
          this.datosReporte = datos;
          this.mostrarVistaPevia = true;
          this.cargandoDatos = false;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
          alert('Error al obtener los datos del reporte');
          this.cargandoDatos = false;
        }
      });
    }
  }

  generarReporte(tipo: 'csv' | 'pdf') {
    if (this.reporteForm.valid) {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        alert('Error: Usuario no autenticado');
        return;
      }

      this.generandoReporte = true;
      const formData = this.reporteForm.value;

      const request: ReporteRequest = {
        idUsuario: userId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        idDispositivo: formData.idDispositivo || undefined,
        tipoSensor: formData.tipoSensor || undefined
      };

      const generarReporte$ = tipo === 'csv'
        ? this.reportesService.generarReporteCSV(request)
        : this.reportesService.generarReportePDF(request);

      generarReporte$.subscribe({
        next: (response) => {
          alert(response.mensaje);
          this.reportesService.descargarArchivo(response.url, response.archivo);
          this.cargarHistorial(); // Actualizar historial
          this.generandoReporte = false;
        },
        error: (error) => {
          console.error('Error al generar reporte:', error);
          alert('Error al generar el reporte');
          this.generandoReporte = false;
        }
      });
    }
  }

  descargarReporte(reporte: ReporteExportado) {
    this.reportesService.descargarArchivo(reporte.rutaArchivo, `reporte_${reporte.idReporte}.${reporte.tipoReporte.toLowerCase()}`);
  }

  toggleVistaPrevia() {
    this.mostrarVistaPevia = !this.mostrarVistaPevia;
  }

  toggleHistorial() {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearValor(valor: number): string {
    return Number(valor).toFixed(2);
  }
}
