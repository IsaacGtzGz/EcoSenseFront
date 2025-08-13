import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CotizacionService, Cotizacion } from '../../services/cotizacion.service';

@Component({
  selector: 'app-cotizar',
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CotizarComponent {
  nombre = '';
  correo = '';
  tipoProducto = '';
  cantidad = 1;
  requerimientos = '';
  resultado: string | null = null;
  enviando = false;

  productos = [
    { nombre: 'EcoSense', precio: 48500 }
  ];
  precioBase = 48500;

  constructor(private cotizacionService: CotizacionService) {
    this.tipoProducto = 'EcoSense';
  }

  calcularCosto(): number {
    let costo = this.precioBase * this.cantidad;
    if (this.requerimientos.trim().length > 0) {
      costo *= 1.1;
    }
    return Math.round(costo);
  }

  enviarCotizacion() {
    // Validación de campos
    if (!this.nombre.trim() || !this.correo.trim() || this.cantidad <= 0) {
      this.resultado = 'Por favor, completa todos los campos y asegúrate que la cantidad sea mayor a 0.';
      return;
    }
    this.enviando = true;
    const datos: Cotizacion = {
      nombre: this.nombre,
      correo: this.correo,
      tipoProducto: 'EcoSense', // Forzar valor correcto
      cantidad: this.cantidad,
      requerimientos: this.requerimientos,
      costo: 0 // El backend lo calcula
    };
    this.cotizacionService.solicitarCotizacion(datos).subscribe({
      next: (resp: any) => {
        let mensaje = `El costo estimado es $${resp.costo} MXN. Te contactaremos por correo.`;
        if (this.requerimientos.trim().length > 0) {
          mensaje += ' (Incluye 10% extra por requerimientos especiales)';
        }
        this.resultado = mensaje;
        this.enviando = false;
      },
      error: (err) => {
        this.resultado = err?.error?.mensaje || 'Hubo un error al solicitar la cotización.';
        this.enviando = false;
      }
    });
  }
}
