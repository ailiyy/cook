import axios from 'axios';
import type { LoginResponse, User, Dish, Category, Order, Stats, NotificationSettings } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { username, password });

export const register = (username: string, password: string) =>
  api.post<User>('/auth/register', { username, password });

// Dishes
export const getDishes = (categoryId?: number) =>
  api.get<Dish[]>('/dishes', { params: categoryId ? { category_id: categoryId } : {} });

export const getDish = (id: number) =>
  api.get<Dish>(`/dishes/${id}`);

export const createDish = (data: Omit<Dish, 'id' | 'category'>) =>
  api.post<Dish>('/admin/dishes', data);

export const updateDish = (id: number, data: Partial<Dish>) =>
  api.put<Dish>(`/admin/dishes/${id}`, data);

export const deleteDish = (id: number) =>
  api.delete(`/admin/dishes/${id}`);

// Categories
export const getCategories = () =>
  api.get<Category[]>('/categories');

export const createCategory = (data: { name: string; sort_order?: number }) =>
  api.post<Category>('/admin/categories', data);

export const updateCategory = (id: number, data: { name: string; sort_order?: number }) =>
  api.put<Category>(`/admin/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  api.delete(`/admin/categories/${id}`);

// Orders
export const createOrder = (data: { items: { dish_id: number; quantity: number }[]; remark?: string }) =>
  api.post<Order>('/orders', data);

export const getMyOrders = () =>
  api.get<Order[]>('/orders');

export const getOrder = (id: number) =>
  api.get<Order>(`/orders/${id}`);

export const getAllOrders = (status?: string) =>
  api.get<Order[]>('/admin/orders', { params: status ? { status } : {} });

export const updateOrderStatus = (id: number, status: string) =>
  api.put<Order>(`/admin/orders/${id}/status`, { status });

// Stats
export const getStats = () =>
  api.get<Stats>('/admin/stats');

// Users (admin)
export const getUsers = () =>
  api.get<User[]>('/admin/users');

export const deleteUser = (id: number) =>
  api.delete(`/admin/users/${id}`);

export const updateUserRole = (id: number, role: string) =>
  api.put(`/admin/users/${id}/role`, { role });

// Settings (admin)
export const getSettings = () =>
  api.get<NotificationSettings>('/admin/settings');

export const updateSettings = (settings: Record<string, string>) =>
  api.put('/admin/settings', { settings });

export const testNotification = () =>
  api.post('/admin/settings/test-notification');

export default api;
