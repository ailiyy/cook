export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category: Category;
  available: boolean;
}

export interface OrderItem {
  id: number;
  dish_id: number;
  dish: Dish;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  status: 'pending' | 'confirmed' | 'cooking' | 'completed' | 'cancelled';
  total: number;
  remark: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Stats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
}

export interface NotificationSettings {
  feishu_webhook_url: string;
  feishu_enabled: string;
  dingtalk_webhook_url: string;
  dingtalk_enabled: string;
}
