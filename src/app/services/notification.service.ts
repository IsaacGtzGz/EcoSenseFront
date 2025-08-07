import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  // Mostrar notificación de éxito
  success(title: string, message: string, duration: number = 5000): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  // Mostrar notificación de error
  error(title: string, message: string, duration: number = 7000): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration
    });
  }

  // Mostrar notificación de advertencia
  warning(title: string, message: string, duration: number = 6000): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  // Mostrar notificación de información
  info(title: string, message: string, duration: number = 5000): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Mostrar confirmación con botones
  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void): string {
    const id = this.generateId();
    const newNotification: Notification = {
      type: 'warning',
      title,
      message,
      duration: 0, // No auto-cerrar
      id,
      actions: [
        {
          label: 'Cancelar',
          action: () => {
            this.remove(id);
            if (onCancel) onCancel();
          },
          style: 'secondary'
        },
        {
          label: 'Confirmar',
          action: () => {
            this.remove(id);
            onConfirm();
          },
          style: 'danger'
        }
      ]
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);
    return id;
  }

  // Mostrar notificación personalizada
  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-cerrar si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  // Remover notificación específica
  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  // Limpiar todas las notificaciones
  clear(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
