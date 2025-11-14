import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { MenuItem } from '../../models/menu.model';
import { CreateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-create-order',
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
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  submitting = signal(false);

  // Computed signals
  menuItems = computed(() => this.menuService.menuItems());
  cartItems = computed(() => this.cartService.cartItems());
  subtotal = computed(() => this.cartService.subtotal());
  discount = computed(() => this.cartService.discount());
  total = computed(() => this.cartService.total());
  itemCount = computed(() => this.cartService.itemCount());
  loading = computed(() => this.menuService.loading());

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    public cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      discount: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadMenu();

    // Watch discount changes
    this.orderForm.get('discount')?.valueChanges.subscribe(value => {
      this.cartService.setDiscount(value || 0);
    });
  }

  loadMenu(): void {
    this.menuService.loadMenu().subscribe({
      error: error => {
        this.notificationService.showError('Failed to load menu items');
        console.error('Menu load error:', error);
      },
    });
  }

  addToCart(item: MenuItem): void {
    if (item.remaining_stock <= 0) {
      this.notificationService.showWarning(`${item.name} is out of stock`);
      return;
    }

    this.cartService.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
    });

    this.notificationService.showSuccess(`${item.name} added to cart`);
  }

  removeFromCart(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  updateQuantity(itemId: string, qty: number): void {
    this.cartService.updateQuantity(itemId, qty);
  }

  placeOrder(): void {
    if (this.orderForm.invalid) {
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
      discount: this.discount(),
      order_type: 'in-store',
      customer: {
        name: this.orderForm.value.customerName,
      },
    };

    this.orderService.createOrder(orderData).subscribe({
      next: response => {
        this.submitting.set(false);
        this.notificationService.showSuccess(
          response.data.message || 'Order placed successfully!'
        );
        this.cartService.clearCart();
        this.orderForm.reset();
        this.router.navigate(['/dashboard']);
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
    this.router.navigate(['/dashboard']);
  }
}

