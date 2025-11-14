import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { OrderService } from '../../services/order.service';
import { FirebaseSyncService } from '../../services/firebase-sync.service';
import { WebSocketService } from '../../services/websocket.service';
import { NotificationService } from '../../services/notification.service';
import { OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
  ],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss',
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order = this.orderService.currentOrder;
  loading = this.orderService.loading;
  orderId: string | null = null;

  firebaseConnected = this.firebaseSync.connected;
  wsConnected = this.wsService.connected;

  connectionStatus = computed(() => {
    if (this.firebaseConnected()) return 'Firebase';
    if (this.wsConnected()) return 'WebSocket';
    return 'Offline';
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    private firebaseSync: FirebaseSyncService,
    private wsService: WebSocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');

    if (!this.orderId) {
      this.notificationService.showError('Invalid order ID');
      this.router.navigate(['/menu']);
      return;
    }

    // Load order details only if not already set (from checkout)
    if (!this.order()) {
      this.loadOrder();
    }

    // Start real-time sync
    this.startRealTimeSync();
  }

  ngOnDestroy(): void {
    this.firebaseSync.stopOrderSync();
    this.wsService.disconnect();
  }

  loadOrder(retryCount = 0): void {
    if (!this.orderId) return;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: () => {
        // Order loaded successfully
      },
      error: error => {
        // If order not found and we haven't retried too many times, retry after delay
        // This handles the race condition where order is still being written to Firestore
        if (error.status === 404 && retryCount < 3) {
          console.log(`Order not found, retrying in ${(retryCount + 1) * 1000}ms... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            this.loadOrder(retryCount + 1);
          }, (retryCount + 1) * 1000); // Exponential backoff: 1s, 2s, 3s
        } else {
          this.notificationService.showError('Failed to load order details');
          console.error('Order load error:', error);
        }
      },
    });
  }

  startRealTimeSync(): void {
    if (!this.orderId) return;

    // Try Firebase first
    this.firebaseSync.startOrderSync(this.orderId);

    // Start WebSocket as fallback after 2 seconds
    setTimeout(() => {
      if (!this.firebaseSync.isConnected()) {
        this.wsService.connect(this.orderId!);
      }
    }, 2000);
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'In Progress':
        return 'accent';
      case 'Ready':
        return 'primary';
      case 'Completed':
        return '';
      default:
        return '';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'schedule';
      case 'In Progress':
        return 'restaurant';
      case 'Ready':
        return 'done';
      case 'Completed':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  isStatusActive(status: OrderStatus): boolean {
    const currentOrder = this.order();
    if (!currentOrder) return false;

    const statusOrder: OrderStatus[] = ['Pending', 'In Progress', 'Ready', 'Completed'];
    const currentIndex = statusOrder.indexOf(currentOrder.order_status);
    const checkIndex = statusOrder.indexOf(status);

    return checkIndex <= currentIndex;
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  }

  hasDiscount(): boolean {
    const currentOrder = this.order();
    return !!(currentOrder && currentOrder.discount && currentOrder.discount > 0);
  }

  getDiscount(): number {
    return this.order()?.discount || 0;
  }

  getSubtotal(): number {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    return currentOrder.total_price + (currentOrder.discount || 0);
  }
}

