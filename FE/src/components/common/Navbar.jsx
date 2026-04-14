import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar({ toggleMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = (path) => {
    if (path.includes('transactions')) return 'Transactions';
    if (path.includes('accounts')) return 'Accounts';
    if (path.includes('budgets')) return 'Budgets';
    if (path.includes('goals')) return 'Goals';
    if (path.includes('reports')) return 'Reports';
    if (path.includes('categories')) return 'Categories';
    if (path.includes('profile')) return 'Profile Settings';
    return 'Dashboard';
  };

  // Transaction search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!searchQuery.trim() || !userId) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/transactions/user/${userId}/all`);
        const data = await res.json();
        const filtered = data.filter(t =>
          t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6);
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 lg:h-18 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-50 relative z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
          {getTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search transactions */}
        <div className="hidden md:flex relative group" ref={searchRef}>
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { navigate('/dashboard/transactions'); setShowSearchResults(false); } }}
            className="w-[160px] lg:w-[240px] bg-slate-50 border-transparent rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:ring-4 focus:ring-orange-500/5 outline-none transition-all"
          />
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full right-0 w-[320px] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {searchLoading ? (
                <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map(trx => (
                    <button
                      key={trx.transactionId}
                      onClick={() => { navigate('/dashboard/transactions'); setSearchQuery(''); setShowSearchResults(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{trx.note || 'No description'}</p>
                        <p className="text-[10px] font-medium text-slate-400">{trx.category?.name}</p>
                      </div>
                      <span className={`text-xs font-black whitespace-nowrap ${trx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                        {trx.type === 'INCOME' ? '+' : '-'}{trx.amount?.toLocaleString()} đ
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => { navigate('/dashboard/transactions'); setShowSearchResults(false); }}
                    className="w-full text-center px-4 py-2 text-[10px] font-bold text-orange-600 hover:bg-orange-50 border-t border-slate-50 mt-1"
                  >
                    View all transactions →
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">No transactions found</div>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button className="bg-slate-50 p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl relative transition-all group">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}