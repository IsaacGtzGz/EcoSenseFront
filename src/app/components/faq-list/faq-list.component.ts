import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQ {
  pregunta: string;
  respuesta: string;
  open?: boolean;
}

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FaqListComponent {
  faqs: FAQ[] = [
    {
      pregunta: '¿Qué sensores incluye el dispositivo?',
      respuesta: 'EcoSense mide CO₂, PM2.5, PM10, temperatura, humedad y presión.',
      open: false
    },
    {
      pregunta: '¿Cómo se instala EcoSense?',
      respuesta: 'Solo conecta el dispositivo a la corriente y sigue la guía de configuración en la app.',
      open: false
    },
    {
      pregunta: '¿Qué tipo de alertas recibiré?',
      respuesta: 'Recibirás notificaciones push y correos electrónicos cuando los valores sean críticos.',
      open: false
    },
    {
      pregunta: '¿Funciona sin conexión a internet?',
      respuesta: 'EcoSense requiere conexión WiFi para enviar datos y alertas.',
      open: false
    },
    {
      pregunta: '¿Cómo actualizo el firmware?',
      respuesta: 'Las actualizaciones se realizan automáticamente vía OTA.',
      open: false
    },
    {
      pregunta: '¿Qué garantía tiene el producto?',
      respuesta: 'EcoSense cuenta con 1 año de garantía contra defectos de fabricación.',
      open: false
    },
    {
      pregunta: '¿Puedo ver los datos desde mi celular?',
      respuesta: 'Sí, puedes acceder a los datos desde la app móvil y la web.',
      open: false
    },
    {
      pregunta: '¿Cómo contacto soporte técnico?',
      respuesta: 'Puedes escribirnos desde el formulario de contacto en la web o por correo.',
      open: false
    }
  ];
}
