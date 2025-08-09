import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ContactoService, MensajeContacto } from '../../services/contacto.service';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private contactoService: ContactoService
  ) {}

  // Datos del formulario de contacto
  formData = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  // Estado del envío
  enviandoMensaje = false;

  // Navegación a login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Navegación a registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Funciones específicas para cada botón
  iniciarDemo(): void {
    // Aquí implementarías un demo interactivo o redirigir a una demo
    alert('Demo interactivo próximamente. Por ahora, accede al sistema para ver las funcionalidades.');
    this.goToLogin();
  }

  solicitarAcceso(): void {
    // Navegar al formulario de contacto
    this.scrollToSection('contacto');
    alert('Completa el formulario de contacto para solicitar acceso al sistema.');
  }

  solicitarCotizacion(): void {
    // Navegar al formulario de contacto
    this.scrollToSection('contacto');
    alert('Completa el formulario de contacto para solicitar una cotización.');
  }

  agendarConsultoria(): void {
    // Navegar al formulario de contacto
    this.scrollToSection('contacto');
    alert('Completa el formulario de contacto para agendar una consultoría.');
  }

  // Enviar mensaje del formulario de contacto
  enviarMensaje(): void {
    if (this.enviandoMensaje) return;

    this.enviandoMensaje = true;
    const mensaje: MensajeContacto = {
      nombre: this.formData.nombre,
      email: this.formData.email,
      mensaje: this.formData.mensaje,
      fecha: new Date().toISOString()
    };
    this.contactoService.enviarMensaje(mensaje).subscribe({
      next: () => {
        this.notificationService.success(
          '¡Mensaje enviado!',
          `¡Gracias ${this.formData.nombre}! Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.`,
          6000
        );
        this.formData = {
          nombre: '',
          email: '',
          mensaje: ''
        };
        this.enviandoMensaje = false;
      },
      error: () => {
        this.notificationService.error(
          'Error',
          'No se pudo enviar el mensaje. Intenta más tarde.'
        );
        this.enviandoMensaje = false;
      }
    });
  }

  // Scroll suave a secciones
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Información de contacto
  contactInfo = {
    email: 'isaacgtzgz@gmail.com',
    phone: '+52 477 6960975',
    address: 'Universidad Tecnológica de León'
  };

  // Características principales del sistema con iconos FontAwesome
  features = [
    {
      icon: 'fas fa-globe-americas',
      title: 'Monitoreo Ambiental',
      description: 'Seguimiento en tiempo real de la calidad del aire y condiciones ambientales con sensores de precisión'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Reportes Detallados',
      description: 'Genera reportes profesionales en PDF y CSV con análisis completos y gráficos interactivos'
    },
    {
      icon: 'fas fa-bell',
      title: 'Alertas Inteligentes',
      description: 'Notificaciones automáticas personalizables cuando se superan los umbrales establecidos'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Acceso Móvil',
      description: 'Consulta tus datos desde cualquier dispositivo, aplicación móvil nativa disponible'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Seguridad Avanzada',
      description: 'Tus datos están protegidos con encriptación de extremo a extremo y autenticación multi-factor'
    },
    {
      icon: 'fas fa-network-wired',
      title: 'Multi-Dispositivo',
      description: 'Gestiona múltiples sensores y ubicaciones desde una sola plataforma centralizada'
    }
  ];

  // Estadísticas del sistema
  stats = [
    { value: '99.9%', label: 'Disponibilidad' },
    { value: '24/7', label: 'Monitoreo' },
    { value: '< 1min', label: 'Tiempo de Respuesta' },
    { value: '∞', label: 'Datos Históricos' }
  ];
}
