import { useState, useEffect } from 'react';
import type { User } from '../../types';
import { getUsers, deleteUser, updateUserRole } from '../../api';
import { useAuth } from '../../store/auth';

export default function UserManage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const loadData = () => {
    getUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该用户？')) return;
    try {
      await deleteUser(id);
      loadData();
    } catch {
      alert('删除失败');
    }
  };

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(user.id, newRole);
      loadData();
    } catch {
      alert('操作失败');
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
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">用户管理</h1>

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">用户名</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">角色</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">注册时间</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-warm-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-warm-50 last:border-b-0 hover:bg-warm-50/50">
                <td className="px-5 py-3.5 text-sm text-warm-500">#{user.id}</td>
                <td className="px-5 py-3.5 text-sm text-warm-800 font-medium">{user.username}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-accent-50 text-accent-600 border border-accent-100'
                      : 'bg-warm-100 text-warm-500 border border-warm-200'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-warm-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  {user.id !== currentUser?.id && (
                    <>
                      <button
                        onClick={() => handleRoleToggle(user)}
                        className="text-sm text-accent-600 hover:text-accent-700 mr-3"
                      >
                        {user.role === 'admin' ? '设为用户' : '设为管理员'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-sm text-red-400 hover:text-red-500"
                      >
                        删除
                      </button>
                    </>
                  )}
                  {user.id === currentUser?.id && (
                    <span className="text-xs text-warm-300">当前用户</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
