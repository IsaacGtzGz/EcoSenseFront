import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UmbralesService, ConfiguracionUmbral } from '../../../services/umbrales.service';
import { DispositivosService, Dispositivo } from '../../../services/dispositivos.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-umbrales-config',
  standalone: false,
  templateUrl: './umbrales-config.component.html',
  styleUrl: './umbrales-config.component.css'
})
export class UmbralesConfigComponent implements OnInit {
  dispositivos: Dispositivo[] = [];
  umbrales: ConfiguracionUmbral[] = [];
  dispositivoSeleccionado: string = ''; // Cambiar a string porque viene del select
  umbralActual: ConfiguracionUmbral | null = null;
  loading = false;
  error = '';
  success = '';

  // Valores por defecto para nuevos umbrales
  umbralDefecto: ConfiguracionUmbral = {
    idDispositivo: 0,
    co2Max: 1000,
    pm1Max: 50,
    pm2_5Max: 35,
    pm10Max: 150,
    temperaturaMax: 30,
    humedadMax: 70,
    presionMax: 1050
  };

  constructor(
    private umbralesService: UmbralesService,
    private dispositivosService: DispositivosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar que sea administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.cargarDispositivos();
    this.cargarUmbrales();
  }

  cargarDispositivos() {
    this.loading = true;
    this.dispositivosService.getDispositivos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar dispositivos';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  cargarUmbrales() {
    console.log('=== CARGANDO UMBRALES ===');
    this.umbralesService.getUmbrales().subscribe({
      next: (umbrales) => {
        console.log('✓ Umbrales cargados:', umbrales);
        this.umbrales = umbrales;
      },
      error: (err) => {
        console.error('✗ Error al cargar umbrales:', err);
        console.error('Status:', err.status);
        console.error('URL:', 'https://localhost:7181/api/umbrales');
      }
    });
  }

  seleccionarDispositivo() {
    if (!this.dispositivoSeleccionado) {
      this.umbralActual = null;
      return;
    }

    console.log('=== SELECCIONANDO DISPOSITIVO ===');
    console.log('Dispositivo seleccionado:', this.dispositivoSeleccionado, typeof this.dispositivoSeleccionado);
    console.log('Umbrales disponibles:', this.umbrales.map(u => ({ idDispositivo: u.idDispositivo, idUmbral: u.idUmbral })));

    // Buscar umbral existente para este dispositivo
    const dispositivoId = parseInt(this.dispositivoSeleccionado);
    const umbralExistente = this.umbrales.find(u => u.idDispositivo === dispositivoId);

    console.log('Umbral existente encontrado:', umbralExistente);

    if (umbralExistente) {
      this.umbralActual = { ...umbralExistente };
      console.log('Umbral copiado para edición:', this.umbralActual);
    } else {
      // Crear nuevo umbral con valores por defecto
      console.log('Creando nuevo umbral con valores por defecto');
      this.umbralActual = {
        ...this.umbralDefecto,
        idDispositivo: dispositivoId
      };
      console.log('Nuevo umbral creado:', this.umbralActual);
    }
  }

  guardarUmbral() {
    if (!this.umbralActual) return;

    console.log('=== INICIANDO GUARDADO DE UMBRAL ===');
    console.log('Umbral actual:', this.umbralActual);
    console.log('¿Es actualización?', !!this.umbralActual.idUmbral);

    this.loading = true;
    this.error = '';
    this.success = '';

    const operacion = this.umbralActual.idUmbral
      ? this.umbralesService.updateUmbral(this.umbralActual.idUmbral, this.umbralActual)
      : this.umbralesService.createUmbral(this.umbralActual);

    operacion.subscribe({
      next: (response) => {
        console.log('✓ Respuesta exitosa del servidor:', response);
        this.success = response.mensaje || 'Umbrales guardados correctamente';
        this.loading = false;

        // Actualizar el ID del umbral si se creó uno nuevo
        if (response.idUmbral && !this.umbralActual!.idUmbral) {
          this.umbralActual!.idUmbral = response.idUmbral;
        }

        this.cargarUmbrales();

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        console.error('✗ Error detallado:', err);
        let mensajeError = 'Error al guardar umbrales';
        if (err.status === 0) {
          mensajeError = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.';
        } else if (err.error?.mensaje) {
          mensajeError = err.error.mensaje;
        }

        this.error = mensajeError;
        this.loading = false;
      }
    });
  }

  eliminarUmbral() {
    if (!this.umbralActual?.idUmbral) return;

    if (confirm('¿Está seguro de que desea eliminar este umbral?')) {
      this.loading = true;
      this.umbralesService.deleteUmbral(this.umbralActual.idUmbral).subscribe({
        next: () => {
          this.success = 'Umbral eliminado correctamente';
          this.umbralActual = null;
          this.dispositivoSeleccionado = '';
          this.cargarUmbrales();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al eliminar el umbral';
          this.loading = false;
        }
      });
    }
  }

  obtenerNombreDispositivo(idDispositivo: number): string {
    const dispositivo = this.dispositivos.find(d => d.idDispositivo === idDispositivo);
    return dispositivo ? dispositivo.nombre : 'Dispositivo desconocido';
  }
}
