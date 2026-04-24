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
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import { MOCK_DATA } from '../../utils/mockData';

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';
const BDG_API = 'http://localhost:8080/api/budgets';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', imageUrl: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (isDemo) {
      setCategories(MOCK_DATA.categories);
      setTransactions(MOCK_DATA.transactions);
      setBudgets(MOCK_DATA.budgets);
      return;
    }

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading image...');

    try {
      const res = await axios.post('http://localhost:8080/api/files/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success('Image uploaded!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${CAT_API}/${editingCatId}`, formData);
      } else {
        await axios.post(`${CAT_API}/user/${userId}`, formData);
      }
      toast.success(isEditMode ? 'Category updated!' : 'Category architecture updated!');
      setIsModalOpen(false);
      setFormData({ name: '', type: 'EXPENSE', imageUrl: '' });
      setIsEditMode(false);
      setEditingCatId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleEditClick = (cat) => {
    setFormData({
      name: cat.name,
      type: cat.type,
      imageUrl: cat.imageUrl || ''
    });
    setEditingCatId(cat.categoryId);
    setIsEditMode(true);
    setIsModalOpen(true);
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
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex justify-between items-center gap-4 px-2">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h2>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Architecture Control</p>
        </div>
        <button 
          onClick={() => { setFormData({ name: '', type: 'EXPENSE', imageUrl: '' }); setIsEditMode(false); setEditingCatId(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all text-xs uppercase tracking-widest"
        >
          <PlusCircle size={16} />
          <span>New Structure</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Categories</h3>
              <div className="h-px flex-1 bg-slate-100 ml-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreCategories.map(cat => (
                <div key={cat.categoryId} className="group relative bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:border-orange-200 hover:shadow-sm">
                  {cat.imageUrl ? (
                    <div className="size-11 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${
                      cat.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600'
                    }`}>
                      {React.cloneElement(getIcon(cat.name), { size: 18 })}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight group-hover:text-orange-600 transition-colors">{cat.name}</h4>
                    <p className="text-base font-black text-slate-900 tracking-tight mt-0.5">{getCategorySpending(cat.categoryId).toLocaleString()} <span className="text-[10px] opacity-30">đ</span></p>
                  </div>
                  <button 
                    onClick={() => handleEditClick(cat)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-orange-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                  >
                    <Edit size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Custom Architecture</h3>
              <div className="h-px flex-1 bg-slate-100 ml-4"></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {customCategories.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Shapes size={32} className="mx-auto text-slate-200" strokeWidth={1.5} />
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">No custom structures found</p>
                </div>
              ) : (
                customCategories.map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center gap-4">
                      {cat.imageUrl ? (
                        <div className="size-10 rounded-lg overflow-hidden border border-slate-100">
                          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          {React.cloneElement(getIcon(cat.name), { size: 16 })}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{cat.name}</h4>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{cat.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{getCategorySpending(cat.categoryId).toLocaleString()} <span className="text-[10px] opacity-30">đ</span></p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{getTransactionCount(cat.categoryId)} Entries</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 text-slate-300 hover:text-orange-600 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.categoryId)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-6 relative overflow-hidden shadow-xl h-fit">
            <div className="absolute -right-8 -top-8 size-32 bg-orange-600/20 blur-[40px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative space-y-6">
              <h3 className="text-lg font-bold tracking-tight border-b border-white/5 pb-4">Financial Pulse</h3>
              <div className="space-y-5">
                <div className="flex gap-4 group cursor-default">
                  <div className="shrink-0 size-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Most Active Hub</p>
                    <p className="text-base font-bold text-white uppercase">{mostUsed.name}</p>
                    <p className="text-[9px] text-slate-400 font-medium italic">{mostUsed.count} records processed</p>
                  </div>
                </div>
                <div className="flex gap-4 group cursor-default">
                  <div className="shrink-0 size-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total Outflow</p>
                    <p className="text-base font-bold text-white">{totals.expense.toLocaleString()} <span className="text-[10px] opacity-30">đ</span></p>
                    <p className="text-[9px] text-slate-400 font-medium italic">Monthly Expenditure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-50">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{isEditMode ? 'Update' : 'New'} Structure</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isEditMode ? 'Modification Protocol' : 'Expansion Protocol'}</p>
               </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 pt-4 overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Cover Image URL or Upload</label>
                    <div className="flex gap-2">
                        <input 
                        type="text"
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        className="flex-1 min-w-0 bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-300 text-sm"
                        placeholder="https://..."
                        />
                        <label className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-4 rounded-[20px] cursor-pointer transition-colors flex items-center justify-center text-[10px] uppercase tracking-widest relative overflow-hidden group">
                           {isUploading ? '...' : (
                               <div className="flex items-center gap-2"><UploadCloud size={14}/> Upload</div>
                           )}
                           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                    </div>
                </div>
                <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest mt-4"
                >
                    {isEditMode ? 'Apply Updates' : 'Initialize Category'}
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
