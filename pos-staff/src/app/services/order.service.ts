import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  OrderStatus,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Angular Signals for reactive state
  orders = signal<Order[]>([]);
  activeOrders = signal<Order[]>([]);
  completedOrders = signal<Order[]>([]);
  loading = signal(false);

  // BehaviorSubject for RxJS compatibility
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<CreateOrderResponse> {
    this.loading.set(true);
    return this.http.post<CreateOrderResponse>(`${environment.apiUrl}/orders`, orderData).pipe(
      tap(() => {
        this.loading.set(false);
      })
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<any> {
    const payload: UpdateOrderStatusRequest = { order_status: status };
    return this.http.patch(`${environment.apiUrl}/orders/${orderId}/status`, payload);
  }

  setOrders(orders: Order[]): void {
    this.orders.set(orders);
    this.ordersSubject.next(orders);
    this.updateOrderCategories(orders);
  }

  addOrder(order: Order): void {
    const currentOrders = this.orders();
    const updatedOrders = [order, ...currentOrders];
    this.setOrders(updatedOrders);
  }

  updateOrder(orderId: string, updates: Partial<Order>): void {
    const currentOrders = this.orders();
    const updatedOrders = currentOrders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    this.setOrders(updatedOrders);
  }

  private updateOrderCategories(orders: Order[]): void {
    const active = orders.filter(
      order =>
        order.order_status === 'Pending' ||
        order.order_status === 'In Progress' ||
        order.order_status === 'Ready'
    );
    const completed = orders.filter(order => order.order_status === 'Completed');

    this.activeOrders.set(active);
    this.completedOrders.set(completed);
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders().find(order => order.id === orderId);
  }
}

