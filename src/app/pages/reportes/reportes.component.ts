import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService, ReporteRequest, DatosReporte, ReporteExportado } from '../../services/reportes.service';
import { DispositivosService } from '../../services/dispositivos.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
    { value: 'co2', label: 'CO₂' },
    { value: 'pm1_0', label: 'PM1.0' },
    { value: 'pm2_5', label: 'PM2.5' },
    { value: 'pm10', label: 'PM10' },
    { value: 'temperatura', label: 'Temperatura' },
    { value: 'humedad', label: 'Humedad' }
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
    private authService: AuthService,
    private notificationService: NotificationService
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
    this.dispositivosService.getDispositivos().subscribe({
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

      // Convertir correctamente los valores opcionales
      const idDispositivo = formData.idDispositivo && formData.idDispositivo !== ''
        ? parseInt(formData.idDispositivo)
        : undefined;

      const tipoSensor = formData.tipoSensor && formData.tipoSensor !== ''
        ? formData.tipoSensor
        : undefined;

      this.reportesService.obtenerDatosReporte(
        formData.fechaInicio,
        formData.fechaFin,
        idDispositivo,
        tipoSensor
      ).subscribe({
        next: (datos) => {
          this.datosReporte = datos;
          this.mostrarVistaPevia = true;
          this.cargandoDatos = false;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
          if (error.status === 400) {
            this.notificationService.warning('⚠️ Datos inválidos', 'Verifique las fechas y filtros seleccionados');
          } else if (error.status === 404) {
            this.notificationService.info('📊 Sin datos', 'No se encontraron datos para los filtros especificados');
          } else {
            this.notificationService.error('❌ Error', 'Error al obtener los datos del reporte');
          }
          this.cargandoDatos = false;
        }
      });
    }
  }

  generarReporte(tipo: 'csv' | 'pdf') {
    if (this.reporteForm.valid) {
      const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.notificationService.error('🔒 Acceso denegado', 'Usuario no autenticado');
      return;
    }      this.generandoReporte = true;
      const formData = this.reporteForm.value;

      const request: ReporteRequest = {
        idUsuario: userId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        idDispositivo: formData.idDispositivo && formData.idDispositivo !== ''
          ? parseInt(formData.idDispositivo)
          : undefined,
        tipoSensor: formData.tipoSensor && formData.tipoSensor !== ''
          ? formData.tipoSensor
          : undefined
      };

      const generarReporte$ = tipo === 'csv'
        ? this.reportesService.generarReporteCSV(request)
        : this.reportesService.generarReportePDF(request);

      generarReporte$.subscribe({
        next: (response) => {
          this.notificationService.show({
            type: 'success',
            title: '✅ ¡Éxito!',
            message: response.mensaje,
            duration: 5000,
            actions: [
              {
                label: '📂 Abrir archivo',
                action: () => {
                  window.open(`https://localhost:7181${response.url}`, '_blank');
                },
                style: 'primary'
              }
            ]
          });
          this.reportesService.descargarArchivo(response.url, response.archivo);
          this.cargarHistorial(); // Actualizar historial
          this.generandoReporte = false;
        },
        error: (error) => {
          console.error('Error al generar reporte:', error);
          if (error.status === 400) {
            this.notificationService.warning('⚠️ Datos inválidos', 'Verifique las fechas y filtros seleccionados');
          } else if (error.status === 404) {
            this.notificationService.info('📊 Sin datos', 'No se encontraron datos para generar el reporte');
          } else {
            this.notificationService.error('❌ Error', 'Error al generar el reporte');
          }
          this.generandoReporte = false;
        }
      });
    }
  }

  descargarReporte(reporte: ReporteExportado) {
    // Extraer solo el nombre del archivo de la ruta completa
    const nombreArchivo = reporte.rutaArchivo.split('\\').pop() || reporte.rutaArchivo.split('/').pop() || 'reporte';
    const url = `/reportes/${nombreArchivo}`;

    this.reportesService.descargarArchivo(url, `reporte_${reporte.idReporte}.${reporte.tipoReporte.toLowerCase()}`);
  }

  toggleVistaPrevia() {
    this.mostrarVistaPevia = !this.mostrarVistaPevia;
  }

  toggleHistorial() {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearValor(valor: number): string {
    return Number(valor).toFixed(2);
  }

  formatearValorCompleto(dato: any): string {
    const valores = [];
    if (dato.co2 !== null && dato.co2 !== undefined) valores.push(`CO₂: ${dato.co2}`);
    if (dato.pm25 !== null && dato.pm25 !== undefined) valores.push(`PM2.5: ${dato.pm25}`);
    if (dato.pm10 !== null && dato.pm10 !== undefined) valores.push(`PM10: ${dato.pm10}`);
    if (dato.temperatura !== null && dato.temperatura !== undefined) valores.push(`T: ${dato.temperatura}°C`);
    if (dato.humedad !== null && dato.humedad !== undefined) valores.push(`H: ${dato.humedad}%`);
    return valores.length > 0 ? valores.join(', ') : 'Sin datos';
  }
}
