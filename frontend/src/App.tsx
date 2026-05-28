import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './store/auth';
import { CurrencyProvider } from './store/currency';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Dashboard from './pages/admin/Dashboard';
import DishManage from './pages/admin/DishManage';
import CategoryManage from './pages/admin/CategoryManage';
import OrderManage from './pages/admin/OrderManage';
import UserManage from './pages/admin/UserManage';
import Settings from './pages/admin/Settings';
import type { CartItem } from './types';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <Routes>
      <Route path="/" element={<Layout cart={cart} />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="menu" element={<Menu cart={cart} setCart={setCart} />} />
        <Route path="cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="orders" element={<Orders />} />
        <Route path="admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="admin/dishes" element={<AdminRoute><DishManage /></AdminRoute>} />
        <Route path="admin/categories" element={<AdminRoute><CategoryManage /></AdminRoute>} />
        <Route path="admin/orders" element={<AdminRoute><OrderManage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><UserManage /></AdminRoute>} />
        <Route path="admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
