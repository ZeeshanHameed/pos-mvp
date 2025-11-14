export type OrderStatus = 'Pending' | 'In Progress' | 'Ready' | 'Completed';
export type OrderType = 'online' | 'in-store';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Customer {
  name: string;
  delivery_address?: string | null;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total_price: number;
  discount?: number;
  order_status: OrderStatus;
  order_date: any; // Firestore Timestamp
  order_by: any | null;
  order_type: OrderType;
  customer: Customer;
  error_type?: string | null;
  reason?: string | null;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  discount?: number;
  order_type: OrderType;
  customer: Customer;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    order: Order;
  };
}

export interface GetOrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
}

export interface CartItem extends OrderItem {
  // qty is already in OrderItem
}

