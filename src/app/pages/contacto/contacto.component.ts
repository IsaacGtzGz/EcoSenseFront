import { Component } from '@angular/core';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  formData = {
    nombre: '',
    email: '',
    mensaje: ''
  };
  enviandoMensaje = false;

  constructor(private contactoService: ContactoService) {}

  enviarMensaje() {
    if (this.enviandoMensaje) return;
    if (!this.formData.nombre.trim() || !this.formData.email.trim() || !this.formData.mensaje.trim()) return;
    this.enviandoMensaje = true;
    const mensaje = {
      ...this.formData,
      fecha: new Date().toISOString()
    };
    this.contactoService.enviarMensaje(mensaje).subscribe({
      next: () => {
        (window as any).mostrarNotificacion?.('¡Mensaje enviado!', 'success');
        this.formData = { nombre: '', email: '', mensaje: '' };
        this.enviandoMensaje = false;
      },
      error: () => {
        (window as any).mostrarNotificacion?.('Error al enviar el mensaje', 'error');
        this.enviandoMensaje = false;
      }
    });
  }
}
