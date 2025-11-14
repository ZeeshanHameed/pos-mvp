export type UserType = 'staff' | 'customer';

export interface MenuItem {
  id: string;
  name: 'pizza' | 'burger' | 'sandwich' | 'icecream' | 'cold_drink' | string;
  price: number;
  total_stock: number;
  remaining_stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  user_type: UserType;
  last_login?: FirebaseFirestore.Timestamp;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Ready' | 'Completed';
export type OrderType = 'online' | 'in-store';

export interface OrderItem {
  item_id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total_price: number;
  discount?: number;
  order_status: OrderStatus;
  order_date: FirebaseFirestore.Timestamp;
  order_by: User | null; // user object who placed the order (staff or customer)
  order_type: OrderType;
}

export interface AuditLog {
  id: string;
  action: string;
  createdBy: string; // user id or system
  timestamp: FirebaseFirestore.Timestamp;
  details?: any;
}

