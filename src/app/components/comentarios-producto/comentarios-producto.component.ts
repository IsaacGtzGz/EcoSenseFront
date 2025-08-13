import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comentario {
  usuario: string;
  comentario: string;
  estrellas: number;
  fecha: string;

}


@Component({
  selector: 'app-comentarios-producto',
  templateUrl: './comentarios-producto.component.html',
  styleUrls: ['./comentarios-producto.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DecimalPipe]
})
export class ComentariosProductoComponent {
  comentarios: Comentario[] = [
    { usuario: 'Anónimo', comentario: 'Wow', estrellas: 5, fecha: '8/11/25, 11:32 AM' },
    { usuario: 'Anónimo', comentario: 'Está increible!!!\nRespuesta: Muchas gracias', estrellas: 5, fecha: '8/11/25, 11:09 AM' },
    { usuario: 'Anónimo', comentario: 'Hi', estrellas: 5, fecha: '8/11/25, 10:57 AM' },
    { usuario: 'Anónimo', comentario: 'Ulises te amo\nRespuesta: Yo tambien te amo', estrellas: 5, fecha: '8/9/25, 10:29 AM' },
    { usuario: 'Anónimo', comentario: 'Holaaa\nRespuesta: QUE OCUPAAAS', estrellas: 5, fecha: '8/9/25, 2:19 AM' }
  ];
  promedioEstrellas: number = 5;
  @Output() nuevoComentario = new EventEmitter<{ comentario: string; estrellas: number }>();

  comentarioTexto: string = '';
  comentarioEstrellas: number = 5;

  agregarComentario() {
    if (this.comentarioTexto.trim()) {
      this.nuevoComentario.emit({
        comentario: this.comentarioTexto,
        estrellas: this.comentarioEstrellas
      });
      this.comentarioTexto = '';
      this.comentarioEstrellas = 5;
    }
  }
}
