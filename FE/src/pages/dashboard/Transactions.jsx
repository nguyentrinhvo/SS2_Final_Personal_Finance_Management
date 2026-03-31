import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  FileDown, 
  Calendar, 
  Tag as TagIcon, 
  Landmark, 
  Filter, 
  MoreVertical, 
  ShoppingCart, 
  Wallet, 
  Utensils, 
  Zap, 
  Car, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';

const TRX_API = 'http://localhost:8080/api/transactions';
const ACC_API = 'http://localhost:8080/api/accounts';
const CAT_API = 'http://localhost:8080/api/categories';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modals & States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    note: '',
    accountId: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [trxRes, accRes, catRes] = await Promise.all([
        axios.get(`${TRX_API}/user/${userId}/all`),
        axios.get(`${ACC_API}/user/${userId}`),
        axios.get(`${CAT_API}/user/${userId}`)
      ]);
      setTransactions(trxRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      
      if (accRes.data.length > 0) {
        setFormData(prev => ({ ...prev, accountId: accRes.data[0].accountId }));
      }
      if (catRes.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: catRes.data[0].categoryId }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        note: formData.note,
        transactionDate: formData.transactionDate + 'T00:00:00',
        account: { accountId: formData.accountId },
        category: { categoryId: formData.categoryId }
      };

      if (editingTrx) {
        await axios.put(`${TRX_API}/${editingTrx.transactionId}`, payload);
        toast.success('Transaction updated');
      } else {
        await axios.post(TRX_API, payload);
        toast.success('Transaction added');
      }
      
      setIsModalOpen(false);
      setEditingTrx(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`${TRX_API}/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const openEdit = (trx) => {
    setEditingTrx(trx);
    setFormData({
      amount: trx.amount,
      type: trx.type,
      note: trx.note,
      accountId: trx.account?.accountId || '',
      categoryId: trx.category?.categoryId || '',
      transactionDate: trx.transactionDate.split('T')[0]
    });
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('shop')) return <ShoppingCart size={18} />;
    if (n.includes('food') || n.includes('eat') || n.includes('dining')) return <Utensils size={18} />;
    if (n.includes('bill') || n.includes('utility')) return <Zap size={18} />;
    if (n.includes('car') || n.includes('transport')) return <Car size={18} />;
    if (n.includes('salary') || n.includes('income')) return <Wallet size={18} />;
    return <ShoppingCart size={18} />;
  };

  const filteredTrx = transactions.filter(t => {
    const matchesSearch = t.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = filterAccount === 'ALL' || t.account?.accountId.toString() === filterAccount;
    const matchesCategory = filterCategory === 'ALL' || t.category?.categoryId.toString() === filterCategory;
    return matchesSearch && matchesAccount && matchesCategory;
  });

  const totals = transactions.reduce((acc, t) => {
    const val = t.amount || 0;
    if (t.type === 'INCOME') acc.income += val;
    else acc.expense += val;
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage and track your financial activity across all accounts.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
            <FileDown size={20} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => { setEditingTrx(null); setFormData({ ...formData, amount: '', note: '' }); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-slate-50 text-slate-900 focus:border-orange-500/20 focus:bg-white transition-all font-bold" 
              placeholder="Search by description or notes..." 
              type="text"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl font-bold text-slate-700 focus:border-orange-500/20 focus:bg-white transition-all outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>
            
            <select 
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl font-bold text-slate-700 focus:border-orange-500/20 focus:bg-white transition-all outline-none"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
            </select>

            <button className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-orange-600/10 text-orange-600 font-black hover:bg-orange-600/20 transition-all">
              <Filter size={20} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTrx.map((trx) => (
                <tr key={trx.transactionId} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-500">
                    {new Date(trx.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-orange-600 border border-slate-100">
                        {getCategoryIcon(trx.category?.name || '')}
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-slate-900">{trx.note || 'No description'}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID: {trx.transactionId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      trx.type === 'INCOME' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {trx.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Landmark size={14} className="text-slate-300" />
                      <span className="text-sm font-bold text-slate-600">{trx.account?.accountName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-[17px] font-black ${trx.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                      {trx.type === 'INCOME' ? '+' : '-'}${trx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenuId(showMenuId === trx.transactionId ? null : trx.transactionId)}
                        className="p-2.5 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-slate-400 hover:text-orange-600"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {showMenuId === trx.transactionId && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => openEdit(trx)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(trx.transactionId)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTrx.length === 0 && (
          <div className="py-20 text-center space-y-3">
             <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-200">
                <ArrowLeftRight size={40} />
             </div>
             <p className="text-slate-400 font-bold">No transactions matched your filters.</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-green-50 border border-green-100 rounded-[32px] space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-xl"><TrendingUp size={18} /></div>
            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Total Income</p>
          </div>
          <p className="text-3xl font-black text-green-900">${totals.income.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-orange-50 border border-orange-100 rounded-[32px] space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-xl"><TrendingDown size={18} /></div>
            <p className="text-xs font-black text-orange-700 uppercase tracking-widest">Total Expense</p>
          </div>
          <p className="text-3xl font-black text-orange-900">${totals.expense.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-blue-50 border border-blue-100 rounded-[32px] space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-xl"><CheckCircle size={18} /></div>
            <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Net Cash Flow</p>
          </div>
          <p className="text-3xl font-black text-blue-900">${(totals.income - totals.expense).toLocaleString()}</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">{editingTrx ? 'Edit' : 'Add'} Transaction</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingTrx(null); }} className="p-2 hover:bg-slate-50 rounded-2xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${formData.type === 'EXPENSE' ? 'bg-orange-600 text-white' : 'bg-slate-50 text-slate-500'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${formData.type === 'INCOME' ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-500'}`}
                >
                  Income
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ($)</label>
                  <input 
                    type="number" step="0.01" required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    type="date" required
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note / Description</label>
                <input 
                  type="text" required
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none"
                  placeholder="e.g. Weekly Grocery"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</label>
                  <select 
                    required
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none"
                  >
                    {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none"
                  >
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] text-lg mt-4"
              >
                {editingTrx ? 'Save Changes' : 'Record Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowLeftRight({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 16V4"></path><path d="m3 8 4-4 4 4"></path><path d="M17 8v12"></path><path d="m21 16-4 4-4-4"></path></svg>
}
