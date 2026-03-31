import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  Gift, 
  Wallet,
  Settings,
  Bell,
  X,
  PlusCircle,
  Shapes,
  Library,
  ArrowRight,
  Target,
  Activity,
  CheckCircle2
} from 'lucide-react';

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';
const BDG_API = 'http://localhost:8080/api/budgets';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE' });
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [catRes, trxRes, bdgRes] = await Promise.all([
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`),
        axios.get(`${BDG_API}/user/${userId}/current`).catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data);
      setTransactions(trxRes.data);
      setBudgets(bdgRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load category statistics');
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CAT_API}/user/${userId}`, formData);
      toast.success('Category architecture updated!');
      setIsModalOpen(false);
      setFormData({ name: '', type: 'EXPENSE' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom structure?')) return;
    try {
      await axios.delete(`${CAT_API}/${id}`);
      toast.success('Category removed');
      fetchData();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const getCategorySpending = (catId) => {
    return transactions
      .filter(t => t.category?.categoryId === catId)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getTransactionCount = (catId) => {
    return transactions.filter(t => t.category?.categoryId === catId).length;
  };

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += (t.amount || 0);
    else acc.expense += (t.amount || 0);
    return acc;
  }, { income: 0, expense: 0 });

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('food')) return <Utensils />;
    if (n.includes('transport')) return <Car />;
    if (n.includes('rent') || n.includes('home')) return <Home />;
    if (n.includes('shop')) return <ShoppingBag />;
    if (n.includes('gym') || n.includes('fitness')) return <FitnessCenter />;
    if (n.includes('dog') || n.includes('pet')) return <Pets />;
    if (n.includes('game')) return <div className="p-1 border border-current rounded">🎮</div>;
    if (n.includes('bill') || n.includes('util')) return <Zap />;
    if (n.includes('gift')) return <Gift />;
    if (n.includes('salary')) return <Wallet />;
    return <Shapes />;
  };

  const coreCategories = categories.filter(c => c.user === null);
  const customCategories = categories.filter(c => c.user !== null);

  // Most used category
  const mostUsed = categories
    .map(c => ({ name: c.name, count: getTransactionCount(c.categoryId) }))
    .sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

  return (
    <div className="max-w-[1400px] mx-auto w-full p-10 space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Hero Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Category <br />
            <span className="text-orange-600">Management.</span>
          </h1>
          <p className="text-slate-500 max-w-lg text-lg font-medium leading-relaxed">
            Organize your financial ecosystem with surgical precision. Manage default tags and create custom structures to track every cent.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-slate-900/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group shrink-0"
        >
          <Library size={22} className="group-hover:rotate-12 transition-transform" />
          <span>Add New Category</span>
        </button>
      </section>

      <div className="grid grid-cols-12 gap-10">
        {/* Main Content Column */}
        <div className="col-span-12 lg:col-span-8 space-y-16">
          
          {/* Core Categories Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Core Categories</h2>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreCategories.map(cat => (
                <div key={cat.categoryId} className="group bg-white p-8 rounded-[40px] border border-slate-100 flex items-center gap-8 transition-all hover:translate-y-[-6px] hover:shadow-2xl hover:border-orange-100">
                  <div className={`size-20 rounded-[28px] flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg ${
                    cat.type === 'INCOME' ? 'bg-green-50 text-green-600 shadow-green-100' : 'bg-orange-50 text-orange-600 shadow-orange-100'
                  }`}>
                    {React.cloneElement(getIcon(cat.name), { size: 32 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-black text-xl text-slate-800 truncate">{cat.name}</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Monthly Avg</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">${getCategorySpending(cat.categoryId).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Custom Architecture Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Custom Architecture</h2>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>
            <div className="bg-slate-50/50 rounded-[48px] p-4 space-y-3 border border-slate-100">
              {customCategories.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic flex flex-col items-center gap-4">
                  <Shapes size={48} strokeWidth={1} />
                  <span>No custom structures created yet.</span>
                </div>
              ) : (
                customCategories.map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between p-6 bg-white rounded-[32px] shadow-sm group hover:shadow-xl hover:-translate-x-1 transition-all border border-transparent hover:border-orange-50">
                    <div className="flex items-center gap-6">
                      <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                        {getIcon(cat.name)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{cat.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{cat.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">${getCategorySpending(cat.categoryId).toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getTransactionCount(cat.categoryId)} TRANSACTIONS</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(cat.categoryId)}
                          className="p-3 hover:bg-red-50 rounded-2xl text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Insights Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Quick Insights Card */}
          <div className="bg-slate-900 text-white p-10 rounded-[48px] space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-16 -top-16 size-64 bg-orange-600/30 blur-[80px] rounded-full"></div>
            <div className="relative space-y-10">
              <h3 className="text-2xl font-black tracking-tight">Monthly Insights</h3>
              
              <div className="space-y-8">
                {/* Insight 1 */}
                <div className="flex gap-5 group cursor-default">
                  <div className="shrink-0 size-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Most Active</p>
                    <p className="text-xl font-black text-white">{mostUsed.name}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{mostUsed.count} transactions this month</p>
                  </div>
                </div>

                {/* Insight 2 */}
                <div className="flex gap-5 group cursor-default">
                  <div className="shrink-0 size-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total Flow</p>
                    <p className="text-xl font-black text-white">${totals.expense.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Outbound capital</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between font-black text-sm uppercase tracking-widest text-slate-400">
                  <span>Efficiency Ratio</span>
                  <span className="text-orange-500">78%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)]" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Aesthetic Poster Card */}
          <div className="relative rounded-[48px] overflow-hidden group min-h-[400px] shadow-xl">
            <img 
              alt="Planning" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent flex flex-col justify-end p-10 space-y-4">
              <div className="size-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-white text-2xl font-black tracking-tight">Optimization Engine</h4>
              <p className="text-slate-200 text-sm font-medium leading-relaxed opacity-80">
                Consolidate your 'Dining Out' categories to identify true lifestyle costs and leakage.
              </p>
              <button className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                <span>Read precision tips</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
            <div className="flex items-center justify-between p-10 pb-5">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">New Structure</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 pt-5 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Label Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-lg"
                  placeholder="e.g. Workspace Assets"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Internal Type</label>
                <div className="flex gap-4 p-2 bg-slate-50 rounded-[32px]">
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                    className={`flex-1 py-4 rounded-3xl font-black transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-400'}`}
                   >Expense</button>
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'INCOME'})}
                    className={`flex-1 py-4 rounded-3xl font-black transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-xl' : 'text-slate-400'}`}
                   >Income</button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95 text-lg mt-4"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icons
function FitnessCenter({size=24}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7v10M18 7v10M2 12h20M7 10h10M7 14h10M4 10v4M20 10v4"/></svg> }
function Pets({size=24}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9.5" cy="4.5" r="2.5"/><circle cx="14.5" cy="4.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M12 18.5a6.5 6.5 0 0 1-6.5-6.5h13a6.5 6.5 0 0 1-6.5 6.5z"/></svg> }
