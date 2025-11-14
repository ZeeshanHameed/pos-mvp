import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { CreateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems = this.cartService.cartItems;
  total = this.cartService.total;
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    public cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      customerName: ['', Validators.required],
      deliveryAddress: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Redirect if cart is empty
    if (this.cartItems().length === 0) {
      this.notificationService.showWarning('Your cart is empty');
      this.router.navigate(['/menu']);
      return;
    }
  }

  updateQuantity(itemId: string, qty: number): void {
    this.cartService.updateQuantity(itemId, qty);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
    if (this.cartItems().length === 0) {
      this.notificationService.showInfo('Cart is empty');
      this.router.navigate(['/menu']);
    }
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.notificationService.showError('Please fill in all required fields');
      return;
    }

    if (this.cartItems().length === 0) {
      this.notificationService.showError('Cart is empty');
      return;
    }

    this.submitting.set(true);

    const orderData: CreateOrderRequest = {
      items: this.cartItems(),
      order_type: 'online',
      customer: {
        name: this.checkoutForm.value.customerName,
        delivery_address: this.checkoutForm.value.deliveryAddress,
      },
    };

    this.orderService.createOrder(orderData).subscribe({
      next: response => {
        this.submitting.set(false);
        this.notificationService.showSuccess('Order placed successfully!');

        // Set the order data immediately so tracking page doesn't need to fetch
        this.orderService.setCurrentOrder(response.data.order);

        // Clear cart and reset form
        this.cartService.clearCart();
        this.checkoutForm.reset();

        // Mark form as pristine and untouched to prevent validation errors
        Object.keys(this.checkoutForm.controls).forEach(key => {
          this.checkoutForm.controls[key].setErrors(null);
          this.checkoutForm.controls[key].markAsPristine();
          this.checkoutForm.controls[key].markAsUntouched();
        });

        // Navigate to order tracking page
        this.router.navigate(['/order', response.data.orderId]);
      },
      error: error => {
        this.submitting.set(false);
        const errorMessage = error.error?.message || 'Failed to place order';
        this.notificationService.showError(errorMessage);
        console.error('Order creation error:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }
}

