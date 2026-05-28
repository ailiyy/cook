import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/menu');
    } catch {
      setError('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24">
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-2 text-center">登录</h1>
      <p className="text-warm-400 text-sm text-center mb-8">欢迎回来，请输入您的账号</p>
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-200 p-6">
        <div className="mb-5">
          <label className="block text-sm font-medium text-warm-700 mb-2">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50 placeholder:text-warm-300"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-warm-700 mb-2">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50 placeholder:text-warm-300"
            placeholder="请输入密码"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700 disabled:opacity-40"
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <p className="mt-5 text-center text-sm text-warm-400">
          还没有账号？{' '}
          <Link to="/register" className="text-accent-600 hover:text-accent-700 font-medium">
            注册
          </Link>
        </p>
      </form>
    </div>
  );
}
