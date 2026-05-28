import { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';

export default function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', sort_order: '0' });

  const loadData = () => {
    getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, sort_order: parseInt(form.sort_order) || 0 };
    try {
      if (editing) {
        await updateCategory(editing.id, data);
      } else {
        await createCategory(data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', sort_order: '0' });
      loadData();
    } catch {
      alert('操作失败');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, sort_order: cat.sort_order.toString() });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      await deleteCategory(id);
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
        <h1 className="text-2xl font-semibold text-warm-900 tracking-tight">分类管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', sort_order: '0' }); }}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700"
        >
          添加分类
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-warm-800 mb-5">
            {editing ? '编辑分类' : '添加分类'}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">排序</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50 w-20"
              />
            </div>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700">
              保存
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2 rounded-xl text-sm font-medium text-warm-500 border border-warm-200 hover:bg-warm-50">
              取消
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">名称</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">排序</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-warm-50 last:border-b-0 hover:bg-warm-50/50">
                <td className="px-5 py-3.5 text-sm text-warm-800">{cat.name}</td>
                <td className="px-5 py-3.5 text-sm text-warm-500">{cat.sort_order}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleEdit(cat)} className="text-sm text-accent-600 hover:text-accent-700 mr-3">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-400 hover:text-red-500">
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
