export interface Alerta {
  idAlerta: number;
  idLectura: number;
  tipoAlerta: string;
  valorMedido: number;
  umbral: number;
  timestamp: string; // ISO string
  lectura?: any;
}
