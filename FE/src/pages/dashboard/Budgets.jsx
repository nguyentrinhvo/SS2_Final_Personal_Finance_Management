import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, TrendingUp, AlertCircle, X, Check, Wallet, PieChart, MoreHorizontal, UploadCloud } from 'lucide-react';
import { MOCK_DATA } from '../../utils/mockData';

import { API_BASE_URL } from '../../utils/api';

const API_BUDGETS = `${API_BASE_URL}/api/budgets`;
const API_CATEGORIES = `${API_BASE_URL}/api/categories/user`;
const API_TRANSACTIONS = `${API_BASE_URL}/api/transactions/user`;

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
    amountLimit: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);

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
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (isDemo) {
      setBudgets(MOCK_DATA.budgets);
      setCategories(MOCK_DATA.categories.filter(c => c.type === 'EXPENSE'));
      setTransactions(MOCK_DATA.transactions);
      setLoading(false);
      return;
    }

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading image...');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/files/upload`, uploadData, {
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
    if (!formData.categoryId) {
        toast.error('Please select a category');
        return;
    }
    try {
      const payload = {
        category: { categoryId: parseInt(formData.categoryId) },
        amountLimit: parseFloat(cleanNum(formData.amountLimit)),
        imageUrl: formData.imageUrl
      };

      if (isEditMode) {
        payload.budgetId = editingBudgetId;
      }

      await axios.post(`${API_BUDGETS}/user/${userId}`, payload);
      
      toast.success(isEditMode ? 'Budget updated!' : 'Budget created!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
      window.dispatchEvent(new Event('transactionRefresh'));
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      categoryId: budget.category?.categoryId.toString(),
      amountLimit: budget.amountLimit.toString(),
      imageUrl: budget.imageUrl || ''
    });
    setEditingBudgetId(budget.budgetId);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ categoryId: '', amountLimit: '', imageUrl: '' });
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
      window.dispatchEvent(new Event('transactionRefresh'));
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
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex justify-between items-center gap-4 px-2">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Budgets</h2>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Monthly Spending Control</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={16} />
          <span>Set Limit</span>
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map(b => {
            const spent = calculateSpent(b.category?.categoryId);
            const limit = b.amountLimit || 1;
            const percent = Math.min(100, (spent / limit) * 100);
            const isOver = spent > limit;

            return (
              <div key={b.budgetId} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group h-fit">
                <div className="flex justify-between items-start mb-4">
                  {b.imageUrl ? (
                    <div className="size-12 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-slate-100">
                      <img src={b.imageUrl} alt="Budget Cover" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`p-2.5 rounded-xl ${isOver ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      <PieChart size={20} />
                    </div>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(b)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(b.budgetId)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors uppercase">{b.category?.name || 'Category'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Protocol Limit: {limit.toLocaleString('vi-VN')} <span className="text-[10px] opacity-40">đ</span>
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex justify-between items-baseline px-0.5 gap-2 overflow-hidden">
                    <div className="text-xl font-black text-slate-900 tracking-tight truncate">
                      {spent.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-300">đ</span>
                    </div>
                    <span className={`font-black text-xs whitespace-nowrap ${isOver ? 'text-red-500' : 'text-orange-600'}`}>{Math.round(percent)}%</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.3)]'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                {isOver && (
                   <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                      <AlertCircle size={10} />
                      Exceeded Monthly Allowance
                   </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-10 border border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
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
             <div className="p-5 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900">{isEditMode ? 'Edit' : 'New'} Budget</h3>
                <button onClick={resetForm} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    required disabled={isEditMode}
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 appearance-none disabled:opacity-50"
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cover Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 min-w-0 bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-sm"
                      placeholder="https://..."
                    />
                    <label className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-4 rounded-[16px] cursor-pointer transition-colors flex items-center justify-center text-[10px] uppercase tracking-widest relative overflow-hidden group">
                        {isUploading ? '...' : (
                            <div className="flex items-center gap-2"><UploadCloud size={14}/> Upload</div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {isEditMode ? 'Update' : 'Confirm'} Limit
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
