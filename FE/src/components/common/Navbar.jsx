import React, { useState } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Map paths to titles
  const getTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/dashboard/transactions': return 'Transactions';
      case '/dashboard/accounts': return 'Accounts';
      case '/dashboard/budgets': return 'Budgets';
      case '/dashboard/goals': return 'Goals';
      case '/dashboard/reports': return 'Reports';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-24 bg-white flex items-center justify-between px-10 border-b border-slate-50">
      {/* Title */}
      <span className="text-[26px] font-black text-slate-900 tracking-tight">
        {getTitle(location.pathname)}
      </span>


      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-[320px] bg-slate-100/50 border-transparent rounded-2xl py-3 pl-12 pr-6 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-orange-500/5 outline-none transition-all"
          />
        </div>

        <button className="bg-slate-100/50 p-3 text-slate-500 hover:text-orange-600 hover:bg-white rounded-2xl relative transition-all group">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8FAFC]"></span>
        </button>

        {/* User Profile (shows only when sidebar is collapsed) */}
        {isSidebarCollapsed && (
          <div className="relative ml-2">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border-2 border-orange-100 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-orange-200"
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1-auto-format" 
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate">Alex Morgan Jenkins</p>
                  <p className="text-xs font-medium text-slate-500 truncate">alex@finance.com</p>
                </div>
                <button 
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}