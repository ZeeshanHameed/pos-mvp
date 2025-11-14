import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { OrderService } from './order.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  connected = signal(false);

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      this.notificationService.showSuccess('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
      this.notificationService.showWarning('WebSocket disconnected');
    });

    this.socket.on('reconnect', () => {
      this.connected.set(true);
      this.notificationService.showSuccess('WebSocket reconnected');
    });

    // Listen for order events
    this.socket.on('order:created', (order: Order) => {
      this.orderService.addOrder(order);
      this.notificationService.showSuccess(`New order received: ${order.id}`);
    });

    this.socket.on('order:updated', (data: { orderId: string; updates: Partial<Order> }) => {
      this.orderService.updateOrder(data.orderId, data.updates);
      this.notificationService.showInfo(`Order ${data.orderId} updated`);
    });

    this.socket.on('order:statusChanged', (data: { orderId: string; status: string }) => {
      this.orderService.updateOrder(data.orderId, { order_status: data.status as any });
      this.notificationService.showInfo(`Order ${data.orderId} status: ${data.status}`);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      this.notificationService.showError('WebSocket error occurred');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.connected();
  }
}

