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
    const n = name?.toLowerCase() || '';
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

  const coreKeywords = ['food', 'eat', 'transport', 'xe', 'shopping', 'bill', 'điện', 'nước', 'rent', 'salary', 'income', 'health', 'y tế', 'education', 'học'];
  
  const coreCategories = categories.filter(c => 
    c.user === null || coreKeywords.some(kw => c.name.toLowerCase().includes(kw))
  );
  const customCategories = categories.filter(c => 
    c.user !== null && !coreKeywords.some(kw => c.name.toLowerCase().includes(kw))
  );

  const mostUsed = categories
    .map(c => ({ name: c.name, count: getTransactionCount(c.categoryId) }))
    .sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

  return (
    <div className="max-w-[1400px] mx-auto w-full p-4 lg:p-10 space-y-8 animate-in fade-in duration-700 pb-20">
      
      <section className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group shrink-0 text-sm uppercase tracking-widest"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
          <span>New Architecture</span>
        </button>
      </section>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Core Categories</h2>
              <div className="h-[1px] flex-1 bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreCategories.map(cat => (
                <div key={cat.categoryId} className="group bg-white p-6 rounded-[32px] border border-slate-50 flex items-center gap-6 transition-all hover:shadow-xl hover:border-orange-100">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-sm ${
                    cat.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600 group-hover:bg-orange-600 group-hover:text-white'
                  }`}>
                    {React.cloneElement(getIcon(cat.name), { size: 24 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-black text-slate-800 truncate uppercase tracking-tight">{cat.name}</h3>
                    </div>
                    <div className="text-xl font-black text-slate-900 tracking-tighter">{getCategorySpending(cat.categoryId).toLocaleString()} đ</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Custom Architecture</h2>
              <div className="h-[1px] flex-1 bg-slate-100"></div>
            </div>
            <div className="bg-slate-50/30 rounded-[40px] p-2 space-y-2 border border-slate-50">
              {customCategories.length === 0 ? (
                <div className="p-12 text-center text-slate-300 font-bold italic flex flex-col items-center gap-4">
                  <Shapes size={40} strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-widest">No custom structures</span>
                </div>
              ) : (
                customCategories.map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between p-5 bg-white rounded-[28px] shadow-sm group hover:shadow-xl transition-all border border-transparent">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        {getIcon(cat.name)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight">{cat.name}</h4>
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{cat.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="font-black text-slate-900">{getCategorySpending(cat.categoryId).toLocaleString()} đ</div>
                        <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{getTransactionCount(cat.categoryId)} ENTRIES</div>
                      </div>
                      <button 
                        onClick={() => handleDelete(cat.categoryId)}
                        className="p-2.5 hover:bg-red-50 rounded-xl text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[48px] space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-16 -top-16 size-48 bg-orange-600/20 blur-[60px] rounded-full"></div>
            <div className="relative space-y-10">
              <h3 className="text-2xl font-black tracking-tight">Financial Pulse</h3>
              <div className="space-y-8">
                <div className="flex gap-4 group cursor-default">
                  <div className="shrink-0 size-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Most Active Hub</p>
                    <p className="text-lg font-black text-white uppercase">{mostUsed.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">{mostUsed.count} records processed</p>
                  </div>
                </div>
                <div className="flex gap-4 group cursor-default">
                  <div className="shrink-0 size-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Total Outflow</p>
                    <p className="text-lg font-black text-white">{totals.expense.toLocaleString()} đ</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Monthly Expenditure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between p-10 pb-4 border-b border-slate-50">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter">New Structure</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expansion Protocol</p>
               </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 pt-6 overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Label Identity</label>
                    <input 
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-black text-slate-900 focus:ring-4 focus:ring-orange-500/10 text-lg placeholder:text-slate-100"
                    placeholder="Structure Name..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Behavior Pattern</label>
                    <div className="flex gap-4 p-1.5 bg-slate-50 rounded-[30px]">
                    <button 
                        type="button" 
                        onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                        className={`flex-1 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-400'}`}
                    >Expense</button>
                    <button 
                        type="button" 
                        onClick={() => setFormData({...formData, type: 'INCOME'})}
                        className={`flex-1 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-xl' : 'text-slate-400'}`}
                    >Income</button>
                    </div>
                </div>
                <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest mt-4"
                >
                    Initialize Category
                </button>
                </form>
            </div>
            <div className="p-6 bg-slate-50 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocol v1.0 • System Registry</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FitnessCenter({size=24}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7v10M18 7v10M2 12h20M7 10h10M7 14h10M4 10v4M20 10v4"/></svg> }
function Pets({size=24}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9.5" cy="4.5" r="2.5"/><circle cx="14.5" cy="4.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M12 18.5a6.5 6.5 0 0 1-6.5-6.5h13a6.5 6.5 0 0 1-6.5 6.5z"/></svg> }
