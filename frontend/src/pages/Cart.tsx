import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types';
import { createOrder } from '../api';
import { useAuth } from '../store/auth';
import { useCurrency } from '../store/currency';

interface CartProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

export default function Cart({ cart, setCart }: CartProps) {
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const total = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const updateQuantity = (dishId: number, delta: number) => {
    setCart(cart.map((item) => {
      if (item.dish.id === dishId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      await createOrder({
        items: cart.map((item) => ({ dish_id: item.dish.id, quantity: item.quantity })),
        remark,
      });
      setCart([]);
      navigate('/orders');
    } catch {
      alert('下单失败');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="text-5xl mb-4">🛒</div>
        <p className="text-warm-400 text-sm mb-4">购物车是空的</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-5 py-2 rounded-xl text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100"
        >
          去点菜
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">购物车</h1>
      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        {cart.map((item) => (
          <div key={item.dish.id} className="flex items-center justify-between px-5 py-4 border-b border-warm-100 last:border-b-0">
            <div>
              <h3 className="font-medium text-warm-800">{item.dish.name}</h3>
              <p className="text-accent-600 text-sm mt-0.5">{formatPrice(item.dish.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.dish.id, -1)}
                className="w-7 h-7 rounded-lg border border-warm-200 text-warm-400 hover:text-warm-700 hover:border-warm-300 flex items-center justify-center text-sm"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium text-warm-700">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dish.id, 1)}
                className="w-7 h-7 rounded-lg border border-warm-200 text-warm-400 hover:text-warm-700 hover:border-warm-300 flex items-center justify-center text-sm"
              >
                +
              </button>
              <span className="w-20 text-right text-sm font-medium text-warm-700">
                {formatPrice(item.dish.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
        <div className="p-5 bg-warm-50">
          <textarea
            placeholder="备注（可选）"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-white placeholder:text-warm-300 mb-4"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <span className="text-warm-500 text-sm">
              合计：<span className="text-lg font-semibold text-accent-600">{formatPrice(total)}</span>
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700 disabled:opacity-40"
            >
              {loading ? '提交中...' : '提交订单'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
