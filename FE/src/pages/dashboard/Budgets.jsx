import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, TrendingUp, AlertCircle, X, Check, Wallet, PieChart, MoreHorizontal } from 'lucide-react';

const API_BUDGETS = 'http://localhost:8080/api/budgets';
const API_CATEGORIES = 'http://localhost:8080/api/categories/user';
const API_TRANSACTIONS = 'http://localhost:8080/api/transactions/user';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    categoryId: '',
    amountLimit: ''
  });

  // Helper to format string with dots for UI
  const formatDisplay = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper to clean dots before saving
  const cleanNum = (val) => {
    return val.toString().replace(/\./g, '');
  };

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [budRes, catRes, trxRes] = await Promise.all([
        axios.get(`${API_BUDGETS}/user/${userId}/current`),
        axios.get(`${API_CATEGORIES}/${userId}`),
        axios.get(`${API_TRANSACTIONS}/${userId}/all`)
      ]);
      setBudgets(budRes.data || []);
      setCategories((catRes.data || []).filter(c => c.type === 'EXPENSE'));
      setTransactions(trxRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
        toast.error('Please select a category');
        return;
    }
    try {
      const payload = {
        category: { categoryId: parseInt(formData.categoryId) },
        amountLimit: parseFloat(cleanNum(formData.amountLimit))
      };

      if (isEditMode) {
        payload.budgetId = editingBudgetId;
      }

      await axios.post(`${API_BUDGETS}/user/${userId}`, payload);
      
      toast.success(isEditMode ? 'Budget updated!' : 'Budget created!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      categoryId: budget.category?.categoryId.toString(),
      amountLimit: budget.amountLimit.toString()
    });
    setEditingBudgetId(budget.budgetId);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ categoryId: '', amountLimit: '' });
    setIsEditMode(false);
    setEditingBudgetId(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await axios.delete(`${API_BUDGETS}/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const calculateSpent = (catId) => {
    const now = new Date();
    return transactions
      .filter(t => t.category?.categoryId === catId && t.type === 'EXPENSE' && new Date(t.transactionDate).getMonth() === now.getMonth() && new Date(t.transactionDate).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-orange-600 animate-pulse uppercase tracking-widest text-xs">Loading Budgets...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Budgets</h2>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Monthly Spending Control</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
        >
          <Plus size={20} />
          <span className="text-sm">Set Limit</span>
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(b => {
            const spent = calculateSpent(b.category?.categoryId);
            const limit = b.amountLimit || 1;
            const percent = Math.min(100, (spent / limit) * 100);
            const isOver = spent > limit;

            return (
              <div key={b.budgetId} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 flex flex-col hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start">
                  <div className={`p-3.5 rounded-2xl ${isOver ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    <PieChart size={24} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(b)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(b.budgetId)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight capitalize">{b.category?.name || 'Category'}</h3>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    Limit: {limit.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-baseline px-1 gap-2 overflow-hidden">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter truncate">
                      {spent.toLocaleString('vi-VN')} <span className="text-xs text-slate-300 ml-0.5">đ</span>
                    </div>
                    <span className={`font-black text-sm whitespace-nowrap ${isOver ? 'text-red-500' : 'text-orange-600'}`}>{Math.round(percent)}%</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.3)]'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                {isOver && (
                   <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 p-2 rounded-xl border border-red-100 animate-pulse">
                      <AlertCircle size={12} />
                      Over Budget Limit
                   </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] p-16 border border-dashed border-slate-200 flex flex-col items-center text-center space-y-6">
            <div className="p-8 bg-slate-50 rounded-[32px] text-slate-300"><Wallet size={48} /></div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Budgets Set</h3>
                <p className="text-slate-400 font-bold text-xs max-w-[200px] mx-auto">Create spending limits for your expense categories.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all text-xs uppercase tracking-widest"
            >
                Start Budgeting
            </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
             <div className="p-8 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900">{isEditMode ? 'Edit' : 'New'} Budget</h3>
                <button onClick={resetForm} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    required disabled={isEditMode}
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 appearance-none disabled:opacity-50"
                  >
                    <option value="">Select Structure...</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monthly Limit (đ)</label>
                  <input 
                    type="text" required
                    value={formatDisplay(formData.amountLimit)}
                    onChange={e => setFormData({...formData, amountLimit: cleanNum(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="e.g. 1.000.000"
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {isEditMode ? 'Update' : 'Confirm'} Limit
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
