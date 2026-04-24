import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, Trash2, ArrowRight, Check } from 'lucide-react';
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
  const notifRef = useRef(null);
  const userId = localStorage.getItem('userId');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const [budgetsRes, trxsRes, goalsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/budgets/user/${userId}/current`),
          axios.get(`http://localhost:8080/api/transactions/user/${userId}/all`),
          axios.get(`http://localhost:8080/api/goals/user/${userId}`)
        ]);
        
        const currentMonth = new Date().getMonth();
        const clearedStr = localStorage.getItem('clearedNotifications') || '[]';
        const clearedIds = JSON.parse(clearedStr);

        const newNotifs = [];

        // 1. Check Budgets (Exceeded & Warning)
        budgetsRes.data.forEach(b => {
          const spent = trxsRes.data
            .filter(t => t.category?.categoryId === b.category?.categoryId && new Date(t.transactionDate).getMonth() === currentMonth)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          
          if (spent > b.amountLimit) {
            const notifId = `budget_exceeded_${b.budgetId}_${currentMonth}`;
            if (!clearedIds.includes(notifId)) {
              newNotifs.push({
                id: notifId,
                type: 'BUDGET_EXCEEDED',
                severity: 'danger',
                message: `Budget Exceeded: ${b.category?.name}`,
                detail: `Spent ${spent.toLocaleString()} / ${b.amountLimit.toLocaleString()} đ`,
                link: '/dashboard/budgets'
              });
            }
          } else if (spent >= b.amountLimit * 0.95) {
            const notifId = `budget_warning_${b.budgetId}_${currentMonth}`;
            if (!clearedIds.includes(notifId)) {
              newNotifs.push({
                id: notifId,
                type: 'BUDGET_WARNING',
                severity: 'warning',
                message: `Budget Critical: ${b.category?.name}`,
                detail: `Only ${((1 - spent/b.amountLimit)*100).toFixed(0)}% remaining today.`,
                link: '/dashboard/budgets'
              });
            }
          }
        });

        // 2. Check Goals (Completed)
        goalsRes.data.forEach(g => {
            if (g.currentAmount >= g.targetAmount) {
                const notifId = `goal_completed_${g.goalId}`;
                if (!clearedIds.includes(notifId)) {
                    newNotifs.push({
                        id: notifId,
                        type: 'GOAL_COMPLETED',
                        severity: 'success',
                        message: `Goal Achieved: ${g.name}`,
                        detail: `Successfully saved ${g.targetAmount.toLocaleString()} đ. Congrats!`,
                        link: '/dashboard/goals'
                    });
                }
            }
        });
        // 3. Check Transactions (Incomplete Info)
        trxsRes.data.forEach(t => {
            const isOthers = t.category?.name?.toLowerCase() === 'others';
            const isUnknown = t.account?.accountName?.toLowerCase() === 'unknown';
            
            if (isOthers || isUnknown) {
                const notifId = `trx_incomplete_${t.transactionId}`;
                if (!clearedIds.includes(notifId)) {
                    newNotifs.push({
                        id: notifId,
                        type: 'TRX_INCOMPLETE',
                        severity: 'warning',
                        message: `Manual Update Needed`,
                        detail: `${t.note || 'Transaction'}: ${isOthers ? 'Others category' : ''}${isOthers && isUnknown ? ' & ' : ''}${isUnknown ? 'Unknown account' : ''}`,
                        link: '/dashboard/transactions'
                    });
                }
            }
        });
        setNotifications(newNotifs.reverse());

        const viewedStr = localStorage.getItem('viewedNotifications') || '[]';
        const viewedIds = JSON.parse(viewedStr);
        const unread = newNotifs.filter(n => !viewedIds.includes(n.id));
        setBadgeCount(unread.length);

      } catch(err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    window.addEventListener('transactionRefresh', fetchNotifications);
    return () => window.removeEventListener('transactionRefresh', fetchNotifications);
  }, [userId]);

  const handleOpenDropdown = () => {
      setShowNotifications(!showNotifications);
      if (!showNotifications) {
          setBadgeCount(0);
          const viewedIds = notifications.map(n => n.id);
          localStorage.setItem('viewedNotifications', JSON.stringify(viewedIds));
      }
  };

  const handleClearAllNotifications = () => {
      const allIds = notifications.map(n => n.id);
      const prevCleared = JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
      localStorage.setItem('clearedNotifications', JSON.stringify([...prevCleared, ...allIds]));
      setNotifications([]);
      setBadgeCount(0);
      setShowNotifications(false);
      setShowAllModal(false);
  };

  const handleClearSingle = (e, id) => {
      e.stopPropagation();
      const prevCleared = JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
      localStorage.setItem('clearedNotifications', JSON.stringify([...prevCleared, id]));
      setNotifications(notifications.filter(n => n.id !== id));
  };

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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-6 border-b border-slate-50 relative z-30">
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
        <div className="relative" ref={notifRef}>
          <button 
             onClick={handleOpenDropdown}
             className="bg-slate-50 p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl relative transition-all group">
            <Bell size={18} />
            {badgeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {badgeCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 w-[300px] sm:w-[340px] mt-2 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                 <h4 className="font-extrabold text-slate-800">Notifications</h4>
                 {notifications.length > 0 && (
                   <button onClick={handleClearAllNotifications} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                      <Trash2 size={12} /> Clear all
                   </button>
                 )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                 {notifications.length > 0 ? (
                   <>
                     {notifications.slice(0, 3).map(n => (
                       <div 
                          key={n.id} 
                          onClick={() => { setShowNotifications(false); navigate(n.link); }}
                          className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group relative"
                       >
                          <div className="flex items-start gap-3 pr-6">
                             <div className={`p-2 rounded-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${
                                n.severity === 'danger' ? 'bg-red-100 text-red-600' : 
                                n.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                             }`}>
                                {n.type === 'GOAL_COMPLETED' ? <Check size={16} /> : <Bell size={16} />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors truncate">{n.message}</p>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                                    {n.detail}
                                </p>
                             </div>
                          </div>
                          <button 
                            onClick={(e) => handleClearSingle(e, n.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={14} />
                          </button>
                       </div>
                     ))}
                     {notifications.length > 3 && (
                       <button 
                          onClick={() => { setShowNotifications(false); setShowAllModal(true); }}
                          className="w-full text-center px-4 py-3 text-[11px] font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                       >
                         See all ({notifications.length}) notifications →
                       </button>
                     )}
                   </>
                 ) : (
                   <div className="px-4 py-8 text-center text-slate-400 text-xs font-medium">No new notifications</div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* See All Notifications Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Bell size={18} /></div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Alert Center</h3>
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={handleClearAllNotifications} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Clear All">
                    <Trash2 size={18} />
                 </button>
                 <button onClick={() => setShowAllModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all">
                    <X size={18} />
                 </button>
              </div>
            </div>
            
            <div className="p-2 max-h-[400px] overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {notifications.map(n => (
                     <div 
                        key={n.id} 
                        onClick={() => { setShowAllModal(false); navigate(n.link); }}
                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group relative"
                     >
                        <div className={`p-2.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform ${
                            n.severity === 'danger' ? 'bg-red-50 text-red-500' : 
                            n.severity === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {n.type === 'GOAL_COMPLETED' ? <Check size={18} /> : <Bell size={18} />}
                        </div>
                        <div className="flex-1 mt-0.5 pr-6">
                           <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">{n.message}</p>
                           <p className="text-[11px] font-semibold text-slate-500 mt-1">
                               {n.detail}
                           </p>
                        </div>
                        <button 
                          onClick={(e) => handleClearSingle(e, n.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={16} />
                        </button>
                     </div>
                  ))}
                </div>
            </div>
            <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of notices</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}