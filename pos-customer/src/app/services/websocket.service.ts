import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { OrderService } from './order.service';
import { NotificationService } from './notification.service';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  connected = signal(false);
  private currentOrderId: string | null = null;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  connect(orderId?: string): void {
    if (this.socket?.connected) {
      return;
    }

    if (orderId) {
      this.currentOrderId = orderId;
    }

    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.connected.set(false);
    });

    // Listen for order status updates
    this.socket.on('order:statusChanged', (data: { orderId: string; status: string }) => {
      console.log('WebSocket received order:statusChanged', data);
      if (this.currentOrderId && data.orderId === this.currentOrderId) {
        const currentOrder = this.orderService.currentOrder();
        if (currentOrder) {
          // Update order status directly
          this.orderService.setCurrentOrder({ ...currentOrder, order_status: data.status as any });
          this.notificationService.showInfo(`Order status updated: ${data.status}`);
        }
      }
    });

    this.socket.on('order:updated', (data: { orderId: string; updates: Partial<Order> }) => {
      console.log('WebSocket received order:updated', data);
      if (this.currentOrderId && data.orderId === this.currentOrderId) {
        const currentOrder = this.orderService.currentOrder();
        if (currentOrder) {
          this.orderService.setCurrentOrder({ ...currentOrder, ...data.updates });
        }
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
      this.currentOrderId = null;
    }
  }

  isConnected(): boolean {
    return this.connected();
  }
}

