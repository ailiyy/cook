import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="mb-6 text-6xl">🍜</div>
      <h1 className="text-4xl font-semibold text-warm-900 tracking-tight mb-3">
        点菜系统
      </h1>
      <p className="text-warm-400 text-lg mb-10 max-w-md">
        美味佳肴，一键下单
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/menu"
          className="px-8 py-3 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700 shadow-sm"
        >
          开始点菜
        </Link>
        {!user && (
          <Link
            to="/login"
            className="px-8 py-3 rounded-xl text-sm font-medium text-warm-600 bg-white border border-warm-200 hover:border-warm-300 hover:text-warm-800"
          >
            登录
          </Link>
        )}
      </div>
    </div>
  );
}
