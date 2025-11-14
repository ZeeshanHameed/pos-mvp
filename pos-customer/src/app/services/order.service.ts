import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateOrderRequest, CreateOrderResponse, Order, GetOrderResponse } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Angular Signals for reactive state
  currentOrder = signal<Order | null>(null);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<CreateOrderResponse> {
    this.loading.set(true);
    return this.http.post<CreateOrderResponse>(`${environment.apiUrl}/orders`, orderData).pipe(
      tap(() => {
        this.loading.set(false);
      })
    );
  }

  getOrderById(orderId: string): Observable<GetOrderResponse> {
    this.loading.set(true);
    return this.http.get<GetOrderResponse>(`${environment.apiUrl}/orders/${orderId}`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentOrder.set(response.data.order);
        }
        this.loading.set(false);
      })
    );
  }

  setCurrentOrder(order: Order | null): void {
    this.currentOrder.set(order);
  }

  updateOrderStatus(order: Order): void {
    if (this.currentOrder()?.id === order.id) {
      this.currentOrder.set(order);
    }
  }
}

