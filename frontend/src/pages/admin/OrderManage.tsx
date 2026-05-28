import { useState, useEffect } from 'react';
import type { Order } from '../../types';
import { getAllOrders, updateOrderStatus } from '../../api';
import { useCurrency } from '../../store/currency';

const statusOptions = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'cooking', label: '制作中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const statusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: '待确认', cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
  confirmed: { text: '已确认', cls: 'bg-blue-50 text-blue-600 border border-blue-100' },
  cooking: { text: '制作中', cls: 'bg-orange-50 text-orange-600 border border-orange-100' },
  completed: { text: '已完成', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  cancelled: { text: '已取消', cls: 'bg-red-50 text-red-500 border border-red-100' },
};

export default function OrderManage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { formatPrice } = useCurrency();

  const loadData = (status?: string) => {
    getAllOrders(status)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleFilter = (status: string) => {
    setFilter(status);
    loadData(status || undefined);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData(filter || undefined);
    } catch {
      alert('更新失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warm-200 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">订单管理</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => handleFilter('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            filter === ''
              ? 'bg-warm-800 text-white'
              : 'bg-white text-warm-500 border border-warm-200 hover:border-warm-300 hover:text-warm-700'
          }`}
        >
          全部
        </button>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              filter === opt.value
                ? 'bg-warm-800 text-white'
                : 'bg-white text-warm-500 border border-warm-200 hover:border-warm-300 hover:text-warm-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusMap[order.status];
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-warm-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-warm-400">订单 #{order.id}</span>
                  <span className="text-xs text-warm-300">·</span>
                  <span className="text-xs text-warm-400">用户: {order.user?.username}</span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium ${status.cls} bg-transparent cursor-pointer`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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

      {orders.length === 0 && (
        <div className="text-center py-16 text-warm-400 text-sm">
          暂无订单
        </div>
      )}
    </div>
  );
}
