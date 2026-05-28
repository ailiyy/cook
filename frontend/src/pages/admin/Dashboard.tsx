import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Stats } from '../../types';
import { getStats } from '../../api';
import { useCurrency } from '../../store/currency';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warm-200 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">管理后台</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: '总订单数', value: (stats?.total_orders || 0).toString(), color: 'text-warm-800' },
          { label: '总收入', value: formatPrice(stats?.total_revenue || 0), color: 'text-accent-600' },
          { label: '待处理订单', value: (stats?.pending_orders || 0).toString(), color: 'text-amber-600' },
          { label: '已完成订单', value: (stats?.completed_orders || 0).toString(), color: 'text-emerald-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-warm-200 p-5">
            <p className="text-xs text-warm-400 mb-2">{item.label}</p>
            <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/admin/dishes', title: '菜品管理', desc: '添加、编辑、删除菜品', icon: '🍽️' },
          { to: '/admin/categories', title: '分类管理', desc: '管理菜品分类', icon: '📂' },
          { to: '/admin/orders', title: '订单管理', desc: '查看和处理订单', icon: '📋' },
          { to: '/admin/users', title: '用户管理', desc: '查看用户、修改角色', icon: '👥' },
          { to: '/admin/settings', title: '系统设置', desc: '币种与通知配置', icon: '⚙️' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-2xl border border-warm-200 p-5 hover:border-warm-300 hover:shadow-sm"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h2 className="font-semibold text-warm-800">{item.title}</h2>
            <p className="text-warm-400 text-sm mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
