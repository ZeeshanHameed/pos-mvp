export interface MenuItem {
  id: string;
  name: string;
  price: number;
  total_stock: number;
  remaining_stock: number;
}

export interface MenuResponse {
  success: boolean;
  data: {
    items: MenuItem[];
  };
}

