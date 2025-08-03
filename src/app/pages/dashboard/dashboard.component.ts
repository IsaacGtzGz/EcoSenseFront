import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LecturaService, Lectura } from '../../services/lectura.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
// Importar servicio y modelo de alerta
import { AlertaService } from '../../services/alerta.service';
import { Alerta } from '../../models/alerta.model';
// Registrar los componentes de Chart.js
Chart.register(...registerables);
// Importar servicio y modelo de dispositivo (usar el correcto)
import { DispositivosService, Dispositivo } from '../../services/dispositivos.service';

// Extender el interface Dispositivo para el dashboard
interface DispositivoDashboard extends Dispositivo {
  ultimaLectura?: Date;
  estadoConexion?: 'online' | 'offline' | 'unknown';
}

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
  dispositivos: DispositivoDashboard[] = [];

  constructor(
    private lecturaService: LecturaService,
    private alertaService: AlertaService,
    private dispositivosService: DispositivosService
  ) {}

  ngOnInit() {
    // Cargar dispositivos primero, luego lecturas y alertas
    this.cargarDispositivos();

    // Configurar intervalo para actualizar lecturas
    this.intervalo = setInterval(() => {
      this.cargarLectura();
      this.cargarAlertas();
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
    // Intentar cargar lectura del primer dispositivo disponible
    if (this.dispositivos && this.dispositivos.length > 0) {
      const primerDispositivo = this.dispositivos.find(d => d.idDispositivo);
      if (primerDispositivo && primerDispositivo.idDispositivo) {
        this.lecturaService.obtenerUltimaLectura(primerDispositivo.idDispositivo).subscribe({
          next: (data) => {
            this.lectura = data;
          },
          error: (err) => {
            console.warn("No hay lecturas disponibles para mostrar:", err.status === 404 ? 'Sin datos' : err.message);
            // No mostrar error si es 404, es normal cuando no hay datos
          }
        });
      }
    } else {
      // Si no hay dispositivos, usar ID 1 como fallback
      this.lecturaService.obtenerUltimaLectura(1).subscribe({
        next: (data) => {
          this.lectura = data;
        },
        error: (err) => {
          console.warn("No hay lecturas disponibles:", err.status === 404 ? 'Sin datos' : err.message);
        }
      });
    }
  }

  cargarAlertas() {
    // Intentar cargar alertas del primer dispositivo disponible
    if (this.dispositivos && this.dispositivos.length > 0) {
      const primerDispositivo = this.dispositivos.find(d => d.idDispositivo);
      if (primerDispositivo && primerDispositivo.idDispositivo) {
        this.alertaService.obtenerAlertasRecientes(primerDispositivo.idDispositivo).subscribe({
          next: (data) => {
            this.alertas = data;
          },
          error: (err) => {
            console.warn("No hay alertas disponibles:", err.status === 404 ? 'Sin datos' : err.message);
          }
        });
      }
    } else {
      // Si no hay dispositivos, usar ID 1 como fallback
      this.alertaService.obtenerAlertasRecientes(1).subscribe({
        next: (data) => {
          this.alertas = data;
        },
        error: (err) => {
          console.warn("No hay alertas disponibles:", err.status === 404 ? 'Sin datos' : err.message);
        }
      });
    }
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
    this.dispositivosService.getDispositivos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
        console.log('Dispositivos cargados:', dispositivos);

        // Después de cargar dispositivos, cargar lecturas y alertas
        this.cargarUltimasLecturas();
        this.cargarLectura();
        this.cargarAlertas();
      },
      error: (err) => {
        console.error("Error al obtener dispositivos:", err);
      }
    });
  }

  // Método para cargar la última lectura de cada dispositivo
  cargarUltimasLecturas() {
    if (!this.dispositivos || this.dispositivos.length === 0) {
      console.log('No hay dispositivos para cargar lecturas');
      return;
    }

    this.dispositivos.forEach(dispositivo => {
      if (!dispositivo.idDispositivo) {
        console.warn(`Dispositivo ${dispositivo.nombre} no tiene ID válido`);
        dispositivo.estadoConexion = 'unknown';
        return;
      }

      this.lecturaService.obtenerUltimaLectura(dispositivo.idDispositivo).subscribe({
        next: (lectura) => {
          // Actualizar el dispositivo con la última lectura
          dispositivo.ultimaLectura = new Date(lectura.timestamp);
          dispositivo.estadoConexion = this.determinarEstadoConexion(dispositivo.ultimaLectura);
          console.log(`Lectura cargada para ${dispositivo.nombre}:`, lectura);
        },
        error: (err) => {
          // En lugar de solo mostrar error, simular algunos dispositivos como "online" si no hay datos
          if (err.status === 404) {
            console.warn(`No hay lecturas para dispositivo ${dispositivo.nombre} - Simulando estado`);
            // Simular dispositivos online de manera aleatoria para demo
            const esOnlineDemo = Math.random() > 0.5;
            if (esOnlineDemo) {
              dispositivo.ultimaLectura = new Date(Date.now() - Math.random() * 300000); // Últimos 5 min random
              dispositivo.estadoConexion = 'online';
            } else {
              dispositivo.ultimaLectura = new Date(Date.now() - Math.random() * 1800000); // Últimos 30 min random
              dispositivo.estadoConexion = 'offline';
            }
          } else {
            dispositivo.ultimaLectura = undefined;
            dispositivo.estadoConexion = 'unknown';
          }
        }
      });
    });
  }

  // Método para determinar el estado de conexión basado en la última lectura
  determinarEstadoConexion(ultimaLectura?: Date): 'online' | 'offline' | 'unknown' {
    if (!ultimaLectura) return 'offline';

    const ahora = new Date();
    const diferencia = (ahora.getTime() - ultimaLectura.getTime()) / 60000; // en minutos

    if (diferencia <= 5) return 'online';
    if (diferencia <= 30) return 'offline';
    return 'unknown';
  }

  // Método mejorado para verificar si está en línea
  estaEnLinea(dispositivo: DispositivoDashboard): boolean {
    return dispositivo.estadoConexion === 'online';
  }

  // Método para obtener el texto del estado
  getTextoEstadoDispositivo(dispositivo: DispositivoDashboard): string {
    switch (dispositivo.estadoConexion) {
      case 'online': return 'En línea';
      case 'offline': return 'Desconectado';
      case 'unknown': return 'Sin datos';
      default: return 'Desconocido';
    }
  }

  // Método para obtener el tiempo transcurrido desde la última lectura
  getTiempoUltimaLectura(dispositivo: DispositivoDashboard): string {
    if (!dispositivo.ultimaLectura) return 'Sin lecturas';

    const ahora = new Date();
    const diferencia = (ahora.getTime() - dispositivo.ultimaLectura.getTime()) / 60000; // en minutos

    if (diferencia < 1) return 'Hace menos de 1 min';
    if (diferencia < 60) return `Hace ${Math.floor(diferencia)} min`;

    const horas = Math.floor(diferencia / 60);
    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

}
