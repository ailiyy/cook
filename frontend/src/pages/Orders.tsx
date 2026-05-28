import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../types';
import { getMyOrders } from '../api';
import { useAuth } from '../store/auth';
import { useCurrency } from '../store/currency';

const statusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: '待确认', cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
  confirmed: { text: '已确认', cls: 'bg-blue-50 text-blue-600 border border-blue-100' },
  cooking: { text: '制作中', cls: 'bg-orange-50 text-orange-600 border border-orange-100' },
  completed: { text: '已完成', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  cancelled: { text: '已取消', cls: 'bg-red-50 text-red-500 border border-red-100' },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warm-200 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">我的订单</h1>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-warm-400 text-sm mb-4">暂无订单</p>
          <button
            onClick={() => navigate('/menu')}
            className="px-5 py-2 rounded-xl text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100"
          >
            去点菜
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status];
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-warm-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-warm-400">订单 #{order.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                    {status.text}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-warm-600">{item.dish.name} × {item.quantity}</span>
                      <span className="text-warm-700">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {order.remark && (
                  <p className="text-xs text-warm-400 mt-3 bg-warm-50 px-3 py-2 rounded-lg">
                    备注：{order.remark}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-warm-100">
                  <span className="text-xs text-warm-400">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <span className="font-semibold text-accent-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
