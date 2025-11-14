import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { OrderService } from './order.service';
import { NotificationService } from './notification.service';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSyncService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private unsubscribeOrder: Unsubscribe | null = null;

  connected = signal(false);

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    // Only initialize if Firebase config is provided
    if (environment.firebase.apiKey && environment.firebase.projectId) {
      try {
        this.app = initializeApp(environment.firebase);
        this.db = getFirestore(this.app);
        this.connected.set(true);
      } catch (error) {
        console.warn('Firebase initialization failed, will use WebSocket fallback:', error);
        this.connected.set(false);
      }
    } else {
      console.info('Firebase config not provided, using WebSocket-only mode');
      this.connected.set(false);
    }
  }

  startOrderSync(orderId: string): void {
    if (!this.db) {
      console.warn('Firebase not initialized, cannot start order sync');
      return;
    }

    try {
      const orderRef = doc(this.db, 'orders', orderId);

      this.unsubscribeOrder = onSnapshot(
        orderRef,
        snapshot => {
          this.connected.set(true);

          if (snapshot.exists()) {
            const orderData = snapshot.data() as Order;
            this.orderService.updateOrderStatus(orderData);

            // Notify on status change
            this.notificationService.showInfo(
              `Order status updated: ${orderData.order_status}`
            );
          }
        },
        error => {
          console.error('Firebase order sync error:', error);
          this.connected.set(false);
          this.notificationService.showWarning('Real-time sync disconnected, using fallback');
        }
      );
    } catch (error) {
      console.error('Failed to start Firebase order sync:', error);
      this.connected.set(false);
    }
  }

  stopOrderSync(): void {
    if (this.unsubscribeOrder) {
      this.unsubscribeOrder();
      this.unsubscribeOrder = null;
    }
  }

  isConnected(): boolean {
    return this.connected();
  }
}

