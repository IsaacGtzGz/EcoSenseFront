export interface Dispositivo {
  idDispositivo: number;
  nombre: string;
  ubicacion: string;
  ultimaLectura?: Date; // opcional, lo calcularemos
}
