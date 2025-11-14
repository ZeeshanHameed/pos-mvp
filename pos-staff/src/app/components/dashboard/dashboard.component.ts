import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { FirebaseSyncService } from '../../services/firebase-sync.service';
import { WebSocketService } from '../../services/websocket.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatBadgeModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Computed signals
  activeOrders = computed(() => this.orderService.activeOrders());
  completedOrders = computed(() => this.orderService.completedOrders());
  currentUser = computed(() => this.authService.currentUser());
  firebaseConnected = computed(() => this.firebaseSync.connected());
  wsConnected = computed(() => this.wsService.connected());

  constructor(
    public authService: AuthService,
    public orderService: OrderService,
    private firebaseSync: FirebaseSyncService,
    private wsService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start Firebase sync first
    this.firebaseSync.startOrdersSync();

    // Start WebSocket as fallback
    setTimeout(() => {
      if (!this.firebaseSync.isConnected()) {
        this.wsService.connect();
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    this.firebaseSync.stopOrdersSync();
    this.wsService.disconnect();
  }

  navigateToCreateOrder(): void {
    this.router.navigate(['/orders/create']);
  }

  navigateToOrderManagement(): void {
    this.router.navigate(['/orders/manage']);
  }

  logout(): void {
    this.authService.logout();
  }

  getStatusColor(status: string): string {
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

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  }

  getTotalPrice(order: Order): number {
    return order.total_price;
  }

  getItemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.qty, 0);
  }
}

