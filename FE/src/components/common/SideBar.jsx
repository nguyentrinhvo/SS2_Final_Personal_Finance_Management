import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, User, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
  { name: 'Giao dịch', path: '/transactions', icon: Wallet },
  { name: 'Báo cáo', path: '/reports', icon: PieChart },
  { name: 'Mục tiêu', path: '/goals', icon: Target },
  { name: 'Tài khoản', path: '/accounts', icon: User },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">FinanceApp</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 p-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}