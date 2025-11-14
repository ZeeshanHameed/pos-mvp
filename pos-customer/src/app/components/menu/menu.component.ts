import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  menuItems = this.menuService.menuItems;
  loading = this.menuService.loading;
  cartItemCount = this.cartService.itemCount;

  constructor(
    public menuService: MenuService,
    public cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMenu();
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

  goToCheckout(): void {
    if (this.cartItemCount() === 0) {
      this.notificationService.showWarning('Your cart is empty');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  isOutOfStock(item: MenuItem): boolean {
    return item.remaining_stock <= 0;
  }

  isLowStock(item: MenuItem): boolean {
    return item.remaining_stock > 0 && item.remaining_stock <= 5;
  }
}

