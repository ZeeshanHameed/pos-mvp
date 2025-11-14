import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.scss'],
})
export class OrderDetailsDialogComponent {
  order: Order;
  isActive: boolean;
  selectedStatus: OrderStatus;
  updating = signal(false);

  statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Ready', 'Completed'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { order: Order; isActive: boolean },
    private dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {
    this.order = data.order;
    this.isActive = data.isActive;
    this.selectedStatus = this.order.order_status;
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

  getTotalItems(): number {
    return this.order.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getSubtotal(): number {
    return this.order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  updateStatus(): void {
    if (this.selectedStatus === this.order.order_status) {
      this.notificationService.showInfo('Status is already set to ' + this.selectedStatus);
      return;
    }

    this.updating.set(true);
    this.orderService.updateOrderStatus(this.order.id, this.selectedStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Order status updated to ${this.selectedStatus}`);
        this.updating.set(false);
        this.dialogRef.close({ updated: true });
      },
      error: (error) => {
        this.notificationService.showError('Failed to update order status');
        console.error('Error updating order status:', error);
        this.updating.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

