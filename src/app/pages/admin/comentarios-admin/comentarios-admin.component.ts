import { Component, OnInit } from '@angular/core';
import { FaqService, FaqComentario } from '../../../services/faq.service';

@Component({
  selector: 'app-comentarios-admin',
  templateUrl: './comentarios-admin.component.html',
  styleUrls: ['./comentarios-admin.component.css'],
  standalone: false
})
export class ComentariosAdminComponent implements OnInit {
  comentarios: FaqComentario[] = [];
  respuesta: Record<number, string> = {};

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios() {
    this.faqService.obtenerComentarios().subscribe({
      next: (data: FaqComentario[]) => this.comentarios = data,
      error: () => this.comentarios = []
    });
  }

  responderComentario(id?: number) {
    if (typeof id !== 'number') return;
    const resp = this.respuesta[id];
    if (!resp?.trim()) return;
    this.faqService.responderComentario(id, resp).subscribe({
      next: () => {
        this.cargarComentarios();
        this.respuesta[id] = '';
      }
    });
  }

  destacarComentario(id?: number, destacado?: boolean) {
    if (typeof id !== 'number' || typeof destacado !== 'boolean') return;
    this.faqService.destacarComentario(id, destacado).subscribe({
      next: () => this.cargarComentarios()
    });
  }

  eliminarComentario(id?: number) {
    if (typeof id !== 'number') return;
    if (!confirm('¿Seguro que deseas eliminar este comentario?')) return;
    this.faqService.eliminarComentario(id).subscribe({
      next: () => this.cargarComentarios()
    });
  }
}
