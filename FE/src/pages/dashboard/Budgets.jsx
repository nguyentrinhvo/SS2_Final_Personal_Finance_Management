import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Trash2, 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag, 
  Zap, 
  MoreVertical, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  LayoutGrid
} from 'lucide-react';

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';
const BDG_API = 'http://localhost:8080/api/budgets';

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', amountLimit: '' });
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [catRes, trxRes, bdgRes] = await Promise.all([
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`),
        axios.get(`${BDG_API}/user/${userId}/current`)
      ]);
      setCategories(catRes.data.filter(c => c.type === 'EXPENSE'));
      setTransactions(trxRes.data);
      setBudgets(bdgRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load budget data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BDG_API}/user/${userId}`, {
        amountLimit: parseFloat(formData.amountLimit),
        category: { categoryId: parseInt(formData.categoryId) },
        user: { userId: parseInt(userId) }
      });
      toast.success('Budget threshold set!');
      setIsModalOpen(false);
      setFormData({ categoryId: '', amountLimit: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to set budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await axios.delete(`${BDG_API}/${id}`);
      toast.success('Budget removed');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getSpeningForCategory = (catId) => {
    return transactions
      .filter(t => t.category?.categoryId === catId)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('food')) return <Utensils />;
    if (n.includes('transport')) return <Car />;
    if (n.includes('rent') || n.includes('home')) return <Home />;
    if (n.includes('shop')) return <ShoppingBag />;
    if (n.includes('bill') || n.includes('util')) return <Zap />;
    if (n.includes('game')) return <div className="p-1 border border-current rounded">🎮</div>;
    return <LayoutGrid />;
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.amountLimit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpeningForCategory(b.category?.categoryId), 0);
  const remaining = totalBudgeted - totalSpent;

  return (
    <div className="max-w-7xl mx-auto w-full p-8 space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] ml-1">Monthly Analytics</p>
          <h1 className="text-5xl font-black tracking-tighter text-slate-800">Budget Management</h1>
          <p className="text-slate-500 max-w-lg font-medium">Real-time tracking of your financial thresholds and goals.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2">
            <Download size={20} />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            <span>New Budget</span>
          </button>
        </div>
      </section>

      {/* Summary Pulse */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[32px] border-l-8 border-orange-600 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Budget</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">${totalBudgeted.toLocaleString()}</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">USD</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border-l-8 border-blue-600 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Spending</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">${totalSpent.toLocaleString()}</span>
            <span className="flex items-center text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={14} /> 12%
            </span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border-l-8 border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Balance</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">${remaining.toLocaleString()}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
              remaining >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {remaining >= 0 ? 'Safe to Spend' : 'Limit Exceeded'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-10">
        {/* Budget Cards */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
            Category Breakdowns
            <span className="bg-slate-50 text-slate-400 text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-widest">{budgets.length} TOTAL</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {budgets.map(b => {
              const spent = getSpeningForCategory(b.category?.categoryId);
              const limit = b.amountLimit || 0;
              const percent = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
              const overLimit = spent > limit;

              return (
                <div 
                  key={b.budgetId} 
                  className={`bg-white p-8 rounded-[32px] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative group ${
                    overLimit ? 'border-red-100 ring-4 ring-red-50/50' : 'border-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      overLimit ? 'bg-red-600 text-white' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {getIcon(b.category?.name || '')}
                    </div>
                    {overLimit && (
                      <div className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest animate-pulse">
                        Over Limit
                      </div>
                    )}
                    <button onClick={() => handleDelete(b.budgetId)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className={`font-black text-xl ${overLimit ? 'text-red-600' : 'text-slate-800'}`}>
                      {b.category?.name}
                    </h4>
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">${spent.toLocaleString()}</span>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">/ ${limit.toLocaleString()} Limit</span>
                      </div>
                      <span className={`text-sm font-black ${overLimit ? 'text-red-600' : 'text-slate-500'}`}>
                        {Math.round((spent/limit)*100)}%
                      </span>
                    </div>
                    
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          overLimit ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    {overLimit && (
                      <p className="text-[11px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 pt-2">
                        <AlertTriangle size={14} />
                        Exceeded limit by ${(spent-limit).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Insights */}
        <aside className="col-span-12 lg:col-span-4 space-y-10">
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 size-48 bg-orange-600/20 blur-[80px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700"></div>
            <div className="relative space-y-8">
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] block">Precision Insights</span>
              <h3 className="text-3xl font-black tracking-tighter leading-[1.1]">You're doing better than 84% of users.</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Your adherence to the "Food" budget has improved by 22% compared to last July.</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Best Month</p>
                  <p className="text-xl font-black">May</p>
                </div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Adherence</p>
                  <p className="text-xl font-black">94%</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Add/Set budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative">
             <div className="flex items-center justify-between p-10 pb-5">
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Set Limit</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 pt-5 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Category Threshold</label>
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Limit Amount ($)</label>
                  <input 
                    type="number" required
                    value={formData.amountLimit}
                    onChange={e => setFormData({...formData, amountLimit: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-lg"
                    placeholder="0.00"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95 text-lg mt-4"
                >
                  Create Budget
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
