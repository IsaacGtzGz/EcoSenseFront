import { Component } from '@angular/core';
import { FaqListComponent } from '../../components/faq-list/faq-list.component';

import { ComentariosProductoComponent } from '../../components/comentarios-producto/comentarios-producto.component';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
  standalone: true,
  imports: [FaqListComponent, ComentariosProductoComponent]
})
export class ProductoComponent {}
