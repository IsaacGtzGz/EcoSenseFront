import { Component } from '@angular/core';
import { CotizacionService } from '../../../services/cotizacion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cotizaciones-admin',
  templateUrl: './cotizaciones-admin.component.html',
  styleUrls: ['./cotizaciones-admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CotizacionesAdminComponent {
  cotizaciones: any[] = [];
  loading = true;
  error = '';

  constructor(private cotizacionService: CotizacionService) {}

  ngOnInit(): void {
    this.cotizacionService.obtenerCotizaciones().subscribe({
      next: (data: any) => {
        this.cotizaciones = data.map((c: any) => ({
          ...c,
          mostrarRespuesta: false,
          asuntoRespuesta: 'Respuesta a tu solicitud de cotización',
          textoRespuesta: '',
          respuestaEnviada: false,
          errorRespuesta: ''
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las cotizaciones.';
        this.loading = false;
      }
    });
  }

  enviarRespuesta(cotizacion: any) {
    cotizacion.respuestaEnviada = false;
    cotizacion.errorRespuesta = '';
    this.cotizacionService.enviarRespuesta({
      email: cotizacion.correo,
      asunto: cotizacion.asuntoRespuesta,
      mensaje: cotizacion.textoRespuesta
    }).subscribe({
      next: () => {
        cotizacion.respuestaEnviada = true;
        cotizacion.mostrarRespuesta = false;
      },
      error: () => {
        cotizacion.errorRespuesta = 'Error al enviar la respuesta.';
      }
    });
  }

  copiarCorreo(correo: string) {
    navigator.clipboard.writeText(correo);
    alert('Correo copiado: ' + correo);
  }
}
