import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.scss'],
})
export class ManageOrdersComponent implements OnInit {
  activeOrders = computed(() => this.orderService.activeOrders());
  loading = computed(() => this.orderService.loading());

  statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Ready', 'Completed'];

  constructor(
    public orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Orders are already synced via Firebase/WebSocket from dashboard
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    if (order.order_status === newStatus) {
      return;
    }

    // Validate status transitions
    if (!this.isValidTransition(order.order_status, newStatus)) {
      this.notificationService.showError('Invalid status transition');
      return;
    }

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.orderService.updateOrder(order.id, { order_status: newStatus });
        this.notificationService.showSuccess(
          `Order ${order.id.substring(0, 8)} updated to ${newStatus}`
        );
      },
      error: error => {
        const errorMessage = error.error?.message || 'Failed to update order status';
        this.notificationService.showError(errorMessage);
        console.error('Status update error:', error);
      },
    });
  }

  isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      Pending: ['In Progress', 'Completed'],
      'In Progress': ['Ready', 'Completed'],
      Ready: ['Completed'],
      Completed: [],
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
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

  getAvailableStatuses(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      Pending: ['In Progress', 'Completed'],
      'In Progress': ['Ready', 'Completed'],
      Ready: ['Completed'],
      Completed: [],
    };

    return transitions[currentStatus] || [];
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

