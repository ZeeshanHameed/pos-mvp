import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore, QuerySnapshot, DocumentChange } from 'firebase-admin/firestore';

@WebSocketGateway({ cors: true })
export class OrdersGateway implements OnModuleInit {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  onModuleInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Firestore listener -> broadcast updates
    this.db.collection('orders').onSnapshot(
      (snap: QuerySnapshot) => {
        snap.docChanges().forEach((change: DocumentChange) => {
          const data = change.doc.data();
          if (change.type === 'added') this.emitCreated(data);
          else if (change.type === 'modified') this.emitUpdated(data);
        });
      },
      (err) => {
        this.logger.error('Firestore orders listener error; relying on manual emits', err as any);
      },
    );
  }

  emitCreated(order: any) {
    this.logger.log(`Emitting order:created for order ${order.id}`);
    this.server.emit('order:created', order);
  }

  emitUpdated(order: any) {
    this.logger.log(`Emitting order:updated for order ${order.id}`);
    this.server.emit('order:updated', { orderId: order.id, updates: order });
  }

  emitStatusChanged(orderId: string, status: string) {
    this.logger.log(`Emitting order:statusChanged for order ${orderId} - status: ${status}`);
    this.server.emit('order:statusChanged', { orderId, status });
  }
}

