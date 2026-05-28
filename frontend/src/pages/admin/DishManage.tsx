import { useState, useEffect } from 'react';
import type { Dish, Category } from '../../types';
import { getDishes, getCategories, createDish, updateDish, deleteDish } from '../../api';
import { useCurrency } from '../../store/currency';

export default function DishManage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    available: true,
  });

  const loadData = () => {
    Promise.all([getDishes(), getCategories()])
      .then(([dishesRes, catsRes]) => {
        setDishes(dishesRes.data);
        setCategories(catsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      category_id: parseInt(form.category_id),
      available: form.available,
    };
    try {
      if (editing) {
        await updateDish(editing.id, data);
      } else {
        await createDish(data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', price: '', image_url: '', category_id: '', available: true });
      loadData();
    } catch {
      alert('操作失败');
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditing(dish);
    setForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      image_url: dish.image_url,
      category_id: dish.category_id.toString(),
      available: dish.available,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      await deleteDish(id);
      loadData();
    } catch {
      alert('删除失败');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-warm-900 tracking-tight">菜品管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', price: '', image_url: '', category_id: '', available: true }); }}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700"
        >
          添加菜品
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-warm-800 mb-5">
            {editing ? '编辑菜品' : '添加菜品'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">价格</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">分类</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                required
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">图片 URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                placeholder="可选"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-warm-600 mb-1.5">描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="rounded border-warm-300"
              />
              <label htmlFor="available" className="text-sm text-warm-600">上架</label>
            </div>
            <div className="md:col-span-2 flex gap-2 pt-2">
              <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700">
                保存
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2 rounded-xl text-sm font-medium text-warm-500 border border-warm-200 hover:bg-warm-50">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">名称</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">分类</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">价格</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">状态</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish.id} className="border-b border-warm-50 last:border-b-0 hover:bg-warm-50/50">
                <td className="px-5 py-3.5 text-sm text-warm-800">{dish.name}</td>
                <td className="px-5 py-3.5 text-sm text-warm-500">{dish.category?.name}</td>
                <td className="px-5 py-3.5 text-sm text-warm-700">{formatPrice(dish.price)}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    dish.available
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-warm-100 text-warm-400 border border-warm-200'
                  }`}>
                    {dish.available ? '上架' : '下架'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleEdit(dish)} className="text-sm text-accent-600 hover:text-accent-700 mr-3">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(dish.id)} className="text-sm text-red-400 hover:text-red-500">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
