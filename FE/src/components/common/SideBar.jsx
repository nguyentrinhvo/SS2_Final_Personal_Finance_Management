import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  Target,
  FileText,
  User,
  LogOut,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Accounts', path: '/dashboard/accounts', icon: Landmark },
  { name: 'Categories', path: '/dashboard/categories', icon: LayoutGrid },
  { name: 'Budgets', path: '/dashboard/budgets', icon: PieChart },
  { name: 'Goals', path: '/dashboard/goals', icon: Target },
  { name: 'Reports', path: '/dashboard/reports', icon: FileText },
];


export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fullName = localStorage.getItem('fullName') || 'User';
  const email = localStorage.getItem('email') || 'user@finance.com'; // I didn't store email yet, let's fix login to store email too.

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <aside className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white flex flex-col hidden lg:flex h-screen sticky top-0 border-r border-slate-100 overflow-visible transition-all duration-300 relative z-50`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-slate-200 text-slate-500 rounded-lg p-1 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm z-[60]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Section: Logo */}
      <div className="p-8 pb-6 flex justify-center">
        <div className={`flex items-center gap-3 group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-600/20 shrink-0">
            <Briefcase size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold text-slate-800 tracking-tight block">FinFlow</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Finance Tracker</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 pt-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} py-3 px-4 rounded-2xl transition-all duration-300 group ${isActive
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 font-bold'
                : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50 font-semibold'
                }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-600'} />
              {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 space-y-2 border-t border-slate-50 bg-white mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
              >
                <User size={16} />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
          <div className="pt-2">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-3 bg-slate-50/50 rounded-3xl border border-slate-100/50 flex flex-col items-center gap-3 group cursor-pointer transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1-auto-format"
                    className="w-10 h-10 rounded-full object-cover"
                    alt="user"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 break-words whitespace-normal leading-tight">{fullName}</p>
                  <p className="text-[11px] font-medium text-slate-500 break-words whitespace-normal">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}