import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  Target,
  FileText,
  Briefcase,
  LayoutGrid,
  LogOut,
  User,
  Settings
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

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: localStorage.getItem('fullName') || 'User',
    email: localStorage.getItem('email') || 'user@finance.com',
    avatarUrl: localStorage.getItem('avatarUrl') || ''
  });

  useEffect(() => {
    const handleRefresh = () => {
      setProfile({
        fullName: localStorage.getItem('fullName') || 'User',
        email: localStorage.getItem('email') || 'user@finance.com',
        avatarUrl: localStorage.getItem('avatarUrl') || ''
      });
    };
    window.addEventListener('profileRefresh', handleRefresh);
    return () => window.removeEventListener('profileRefresh', handleRefresh);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-[240px] bg-white flex flex-col h-full border-r border-slate-100 transition-all duration-300 relative z-50">
      {/* Top Section: Logo */}
      <div className="p-5 pb-6 flex justify-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-orange-600 p-2.5 rounded-xl shadow-xl shadow-orange-600/20 shrink-0 transform group-hover:rotate-12 transition-transform">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tighter block leading-none">FinFlow</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 py-2 px-4 rounded-xl transition-all duration-500 group relative ${isActive
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 font-black'
                : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50 font-bold'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-600 transition-colors'} />
              <span className="text-[13px]">{item.name}</span>
              {isActive && <div className="absolute right-4 size-1.5 bg-orange-600 rounded-full animate-pulse"></div>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout Section at Bottom */}
      <div className="p-4 border-t border-slate-50 space-y-3">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all duration-300 group"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="text-[13px]">Log Out</span>
        </button>

        <Link 
          to="/dashboard/profile"
          className="w-full flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-transparent hover:border-orange-200 hover:bg-white hover:shadow-lg transition-all duration-500 group"
        >
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                alt="Profile"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 rounded-xl bg-orange-100 items-center justify-center text-orange-600 font-black text-[14px] ${profile.avatarUrl ? 'hidden' : 'flex'}`}
            >
              {profile.fullName.charAt(0)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-[13px] font-black text-slate-900 truncate leading-none mb-1 group-hover:text-orange-600 transition-colors">{profile.fullName}</p>
            <p className="text-[10px] font-bold text-slate-400 truncate leading-none opacity-80">{profile.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}