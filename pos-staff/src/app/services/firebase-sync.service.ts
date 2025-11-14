import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  query,
  onSnapshot,
  Unsubscribe,
  orderBy,
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { OrderService } from './order.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSyncService {
  private app: FirebaseApp;
  private db: Firestore;
  private unsubscribeOrders: Unsubscribe | null = null;

  connected = signal(false);
  syncing = signal(false);

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app);
  }

  startOrdersSync(): void {
    if (this.unsubscribeOrders) {
      return; // Already syncing
    }

    this.syncing.set(true);
    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, orderBy('order_date', 'desc'));

    this.unsubscribeOrders = onSnapshot(
      q,
      snapshot => {
        this.connected.set(true);
        const orders: Order[] = [];

        snapshot.forEach(doc => {
          const data = doc.data() as Order;
          orders.push(data);
        });

        this.orderService.setOrders(orders);

        // Detect new orders
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const order = change.doc.data() as Order;
            // Only notify if it's a new order (not initial load)
            if (!snapshot.metadata.hasPendingWrites) {
              this.notificationService.showSuccess(`New order received: ${order.id}`);
            }
          } else if (change.type === 'modified') {
            const order = change.doc.data() as Order;
            this.notificationService.showInfo(
              `Order ${order.id} updated to ${order.order_status}`
            );
          }
        });
      },
      error => {
        console.error('Firebase sync error:', error);
        this.connected.set(false);
        this.notificationService.showError('Firebase sync lost. Switching to WebSocket...');
      }
    );
  }

  stopOrdersSync(): void {
    if (this.unsubscribeOrders) {
      this.unsubscribeOrders();
      this.unsubscribeOrders = null;
      this.syncing.set(false);
      this.connected.set(false);
    }
  }

  isConnected(): boolean {
    return this.connected();
  }
}

