import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import type { CartItem } from '../types';

interface LayoutProps {
  cart: CartItem[];
}

export default function Layout({ cart }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-warm-800 tracking-tight flex items-center gap-2">
            <span className="text-xl">🍜</span>
            <span>点菜系统</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/menu" className="px-3 py-2 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100">
              菜单
            </Link>
            <Link to="/cart" className="px-3 py-2 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 relative">
              购物车
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="px-3 py-2 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100">
                  我的订单
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100">
                    管理后台
                  </Link>
                )}
                <div className="w-px h-5 bg-warm-200 mx-2" />
                <span className="text-sm text-warm-500">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-2 rounded-lg text-sm text-warm-400 hover:text-red-500 hover:bg-red-50"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100">
                  登录
                </Link>
                <Link to="/register" className="ml-1 px-4 py-2 rounded-lg text-sm font-medium bg-warm-800 text-white hover:bg-warm-700">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
