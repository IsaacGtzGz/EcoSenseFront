import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LecturaService, Lectura } from '../../services/lectura.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
// Importar servicio y modelo de alerta
import { AlertaService } from '../../services/alerta.service';
import { Alerta } from '../../models/alerta.model';
// Registrar los componentes de Chart.js
Chart.register(...registerables);
// Importar servicio y modelo de dispositivo
import { DispositivoService } from '../../services/dispositivo.service';
import { Dispositivo } from '../../models/dispositivo.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  lectura: Lectura | null = null;
  intervalo: any;
  chart: Chart | null = null;
// Agregar propiedad para almacenar alertas
  alertas: Alerta[] = [];
// Agregar propiedad para almacenar dispositivos
  dispositivos: Dispositivo[] = [];



  constructor(
    private lecturaService: LecturaService,
    private alertaService: AlertaService,
    private dispositivoService: DispositivoService
  ) {}

  ngOnInit() {
    this.cargarLectura();
    this.cargarAlertas();
    this.cargarDispositivos();


    // Configurar intervalo para actualizar lecturas
    this.intervalo = setInterval(() => {
      this.cargarLectura();
      this.cargarUltimasLecturas(); // Actualizar estado de dispositivos
      if (this.chart) {
        this.actualizarGrafico();
      }
    }, 30000); // cada 30s
  }

  ngAfterViewInit() {
    this.inicializarGrafico();
    this.cargarHistorico();
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
    if (this.chart) {
      this.chart.destroy();
    }
  }

  cargarLectura() {
    const dispositivoId = 1; // o el que esté asignado al usuario
    this.lecturaService.obtenerUltimaLectura(dispositivoId).subscribe({
      next: (data) => {
        this.lectura = data;
      },
      error: (err) => {
        console.error("Error obteniendo la lectura:", err);
      }
    });
  }

  cargarAlertas() {
    const dispositivoId = 1;
    this.alertaService.obtenerAlertasRecientes(dispositivoId).subscribe({
      next: (data) => {
        this.alertas = data;
      },
      error: (err) => {
        console.error("Error al obtener alertas:", err);
      }
    });
  }


  getEstado(valor: number, tipo: string): string {
    if (valor == null) return 'unknown';

    switch (tipo) {
      case 'co2': return valor <= 800 ? 'good' : valor <= 1200 ? 'warning' : 'danger';
      case 'pm1_0':
      case 'pm2_5':
      case 'pm10': return valor <= 35 ? 'good' : valor <= 75 ? 'warning' : 'danger';
      case 'temperatura': return valor >= 20 && valor <= 27 ? 'good' : 'warning';
      case 'humedad': return valor >= 40 && valor <= 60 ? 'good' : 'warning';
      case 'presion': return valor >= 980 && valor <= 1030 ? 'good' : 'warning';
      default: return 'unknown';
    }
  }

  getTextoEstado(valor: number, tipo: string): string {
    const estado = this.getEstado(valor, tipo);
    switch (estado) {
      case 'good': return 'Óptimo';
      case 'warning': return 'Moderado';
      case 'danger': return 'Crítico';
      default: return 'Desconocido';
    }
  }

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  inicializarGrafico() {
    if (this.chartCanvas) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'CO₂ (ppm)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3
              },
              {
                label: 'PM2.5 (µg/m³)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.3
              },
              {
                label: 'Temperatura (°C)',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3
              },
              {
                label: 'Humedad (%)',
                data: [],
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Tendencias de Calidad del Aire'
              },
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                suggestedMin: 0,
                suggestedMax: 1000,
                title: {
                  display: true,
                  text: 'Valores'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Tiempo'
                }
              }
            }
          }
        });
      }
    }
  }

  actualizarGrafico() {
    this.cargarHistorico();
  }

  cargarHistorico() {
    const dispositivoId = 1;
    this.lecturaService.obtenerHistoricoLecturas(dispositivoId).subscribe({
      next: (lecturas) => {
        if (this.chart && lecturas.length > 0) {
          const labels = lecturas.map(l => new Date(l.timestamp).toLocaleTimeString());
          const co2 = lecturas.map(l => l.co2);
          const pm25 = lecturas.map(l => l.pm2_5);
          const temperatura = lecturas.map(l => l.temperatura);
          const humedad = lecturas.map(l => l.humedad);

          this.chart.data.labels = labels;
          this.chart.data.datasets[0].data = co2;
          this.chart.data.datasets[1].data = pm25;
          this.chart.data.datasets[2].data = temperatura;
          this.chart.data.datasets[3].data = humedad;

          this.chart.update();
        }
      },
      error: (err) => {
        console.error("Error al obtener histórico:", err);
      }
    });
  }

  obtenerIconoAlerta(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'CO2': '🌬️',
      'PM1.0': '🦠',
      'PM2.5': '💨',
      'PM10': '🏭',
      'Temperatura': '🌡️',
      'Humedad': '💧',
      'Presion': '⏲️',
      'General': '⚠️'
    };
    return iconos[tipo] || '⚠️';
  }

  generarMensajeAlerta(alerta: Alerta): string {
    const tipo = alerta.tipoAlerta;
    const valor = alerta.valorMedido;
    const umbral = alerta.umbral;

    let unidad = '';
    switch (tipo) {
      case 'CO2': unidad = 'ppm'; break;
      case 'PM1.0':
      case 'PM2.5':
      case 'PM10': unidad = 'µg/m³'; break;
      case 'Temperatura': unidad = '°C'; break;
      case 'Humedad': unidad = '%'; break;
      case 'Presion': unidad = 'hPa'; break;
    }

    return `${tipo} excedió el umbral: ${valor}${unidad} > ${umbral}${unidad}`;
  }

  obtenerNivelAlerta(alerta: Alerta): string {
    const valor = alerta.valorMedido;
    const umbral = alerta.umbral;
    const exceso = ((valor - umbral) / umbral) * 100;

    if (exceso <= 20) return 'Moderado';
    if (exceso <= 50) return 'Alto';
    return 'Crítico';
  }

  obtenerUbicacionAlerta(): string {
    return 'Oficina Principal'; // Por ahora fijo, se puede hacer dinámico más tarde
  }

  calcularTiempo(fecha: string): string {
    const fechaAlerta = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fechaAlerta.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Hace unos segundos';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    return `Hace ${diffHoras} h`;
  }

  // Método para cargar dispositivos
  cargarDispositivos() {
    this.dispositivoService.obtenerTodos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
        // Cargar la última lectura para cada dispositivo
        this.cargarUltimasLecturas();
      },
      error: (err) => {
        console.error("Error al obtener dispositivos:", err);
      }
    });
  }

  // Método para cargar la última lectura de cada dispositivo
  cargarUltimasLecturas() {
    this.dispositivos.forEach(dispositivo => {
      this.lecturaService.obtenerUltimaLectura(dispositivo.idDispositivo).subscribe({
        next: (lectura) => {
          // Actualizar el dispositivo con la última lectura
          dispositivo.ultimaLectura = new Date(lectura.timestamp);
        },
        error: (err) => {
          console.warn(`No hay lecturas para dispositivo ${dispositivo.nombre}:`, err);
          // Mantener ultimaLectura como undefined
        }
      });
    });
  }

  estaEnLinea(dispositivo: Dispositivo): boolean {
    if (!dispositivo.ultimaLectura) return false;

    const ultima = new Date(dispositivo.ultimaLectura);
    const ahora = new Date();
    const diferencia = (ahora.getTime() - ultima.getTime()) / 60000; // en minutos
    return diferencia <= 5;
  }

}
