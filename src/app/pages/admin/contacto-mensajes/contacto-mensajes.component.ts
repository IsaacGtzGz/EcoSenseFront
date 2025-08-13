import { Component, OnInit } from '@angular/core';
import { ContactoService } from '../../../services/contacto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto-mensajes',
  templateUrl: './contacto-mensajes.component.html',
  styleUrls: ['./contacto-mensajes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ContactoMensajesComponent implements OnInit {
  mensajes: any[] = [];
  loading = true;
  error = '';

  constructor(private contactoService: ContactoService) {}

  ngOnInit(): void {
    this.contactoService.getMensajes().subscribe({
      next: (data: any) => {
        this.mensajes = data.map((m: any) => ({
          ...m,
          mostrarRespuesta: false,
          asuntoRespuesta: 'Respuesta a tu mensaje de EcoSense',
          textoRespuesta: '\n\nSaludos cordiales,\nEquipo EcoSense\nwww.ecosense.com.mx\nsoporte@ecosense.com.mx',
          respuestaEnviada: false,
          errorRespuesta: ''
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los mensajes.';
        this.loading = false;
      }
    });
  }

  enviarRespuesta(mensaje: any) {
    mensaje.respuestaEnviada = false;
    mensaje.errorRespuesta = '';
    this.contactoService.enviarRespuesta({
      email: mensaje.correo,
      asunto: mensaje.asuntoRespuesta,
      mensaje: mensaje.textoRespuesta
    }).subscribe({
      next: () => {
        mensaje.respuestaEnviada = true;
        mensaje.mostrarRespuesta = false;
      },
      error: () => {
        mensaje.errorRespuesta = 'Error al enviar la respuesta.';
      }
    });
  }

  copiarCorreo(correo: string) {
    navigator.clipboard.writeText(correo);
    alert('Correo copiado: ' + correo);
  }
}
