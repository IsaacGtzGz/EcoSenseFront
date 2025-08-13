import { Component, OnInit } from '@angular/core';
import { FaqService, FaqComentario } from '../../services/faq.service';

@Component({
  selector: 'app-faq-publico',
  templateUrl: './faq-publico.component.html',
  styleUrls: ['./faq-publico.component.css'],
  standalone: false
})
export class FaqPublicoComponent implements OnInit {
  // ...existing code...
  isLoggedIn(): boolean {
    return true; // Permitir comentar a cualquier usuario
  }

  goToLogin() {
    // No hace nada, ya no se requiere login
  }
  preguntas: FaqComentario[] = [];
  get comentariosOrdenados(): FaqComentario[] {
    if (!this.preguntas?.length) return [];
    const destacados = this.preguntas.filter(c => c.destacado);
    const normales = this.preguntas.filter(c => !c.destacado);
    return [...destacados, ...normales];
  }
  nuevaPregunta = '';
  enviando = false;
  estrellas = 5;

  constructor(private faqService: FaqService) {}

  ngOnInit() {
    this.faqService.obtenerComentarios().subscribe({
      next: (data: FaqComentario[]) => this.preguntas = data,
      error: () => this.preguntas = []
    });
  }

  enviarPregunta() {
    if (!this.nuevaPregunta.trim()) return;
    this.enviando = true;
    const pregunta: FaqComentario = {
      pregunta: this.nuevaPregunta,
      autor: 'Anónimo',
      fecha: new Date().toISOString(),
      destacado: false,
      estrellas: this.estrellas
    };
    this.faqService.enviarComentario(pregunta).subscribe({
      next: () => {
        (window as any).mostrarNotificacion?.('¡Comentario enviado!', 'success');
        this.nuevaPregunta = '';
        this.estrellas = 5;
        this.enviando = false;
        this.faqService.obtenerComentarios().subscribe({
          next: (data: FaqComentario[]) => this.preguntas = data
        });
      },
      error: () => {
        (window as any).mostrarNotificacion?.('Error al enviar el comentario', 'error');
        this.enviando = false;
      }
    });
  }
}
