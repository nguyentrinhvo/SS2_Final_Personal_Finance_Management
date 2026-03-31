import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  FileDown, 
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
  Edit,
  Trash2,
  ArrowLeftRight
} from 'lucide-react';

const TRX_API = 'http://localhost:8080/api/transactions';
const ACC_API = 'http://localhost:8080/api/accounts';
const CAT_API = 'http://localhost:8080/api/categories';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  
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
    if (!userId) {
       console.log("No userId found in localStorage");
       return;
    }
    
    // Individual fetches to prevent one failing fetch from blocking everything
    try {
      const res = await axios.get(`${ACC_API}/user/${userId}`);
      setAccounts(res.data);
      if (res.data.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: res.data[0].accountId }));
      }
    } catch (err) { console.error("Accounts fetch failed", err); }

    try {
      const res = await axios.get(`${CAT_API}/user/${userId}`);
      setCategories(res.data);
      if (res.data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.data[0].categoryId }));
      }
    } catch (err) { 
        console.error("Categories fetch failed", err);
        // Fallback or alert if categories are crucial
    }

    try {
      const res = await axios.get(`${TRX_API}/user/${userId}/all`);
      setTransactions(res.data);
    } catch (err) { console.error("Transactions fetch failed", err); }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.categoryId) {
      toast.error('Vui lòng chọn tài khoản và danh mục');
      return;
    }
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        note: formData.note,
        transactionDate: formData.transactionDate + 'T00:00:00',
        account: { accountId: parseInt(formData.accountId) },
        category: { categoryId: parseInt(formData.categoryId) }
      };

      if (editingTrx) {
        await axios.put(`${TRX_API}/${editingTrx.transactionId}`, payload);
        toast.success('Giao dịch đã được cập nhật');
      } else {
        await axios.post(TRX_API, payload);
        toast.success('Giao dịch đã được ghi nhận');
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi thực hiện yêu cầu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await axios.delete(`${TRX_API}/${id}`);
      toast.success('Đã xóa');
      fetchData();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const openAdd = () => {
    setEditingTrx(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      note: '',
      accountId: accounts[0]?.accountId || '',
      categoryId: categories.find(c => c.type === 'EXPENSE')?.categoryId || categories[0]?.categoryId || '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrx(null);
  };

  const getCategoryIcon = (name) => {
    if (!name) return <ShoppingCart size={18} />;
    const n = name.toLowerCase();
    if (n.includes('shop')) return <ShoppingCart size={18} />;
    if (n.includes('food') || n.includes('eat') || n.includes('ăn')) return <Utensils size={18} />;
    if (n.includes('bill') || n.includes('điện') || n.includes('nước')) return <Zap size={18} />;
    if (n.includes('car') || n.includes('transport') || n.includes('xe')) return <Car size={18} />;
    if (n.includes('lương') || n.includes('salary') || n.includes('income')) return <Wallet size={18} />;
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
    <div className="max-w-7xl mx-auto w-full space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage and track your financial activity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Income</p>
           <p className="text-2xl font-black text-green-600">${totals.income.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
           <p className="text-2xl font-black text-red-600">${totals.expense.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Flow</p>
           <p className="text-2xl font-black text-blue-600">${(totals.income - totals.expense).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" 
              placeholder="Search..." 
            />
          </div>
          <div className="flex gap-3">
             <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="px-4 py-4 rounded-2xl bg-slate-50 border-none font-bold">
                <option value="ALL">All Accounts</option>
                {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTrx.map((trx) => (
              <tr key={trx.transactionId} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-slate-500">{new Date(trx.transactionDate).toLocaleDateString()}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-orange-600 border border-slate-100">{getCategoryIcon(trx.category?.name)}</div>
                    <div>
                      <p className="text-[15px] font-black text-slate-900">{trx.note || 'No description'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{trx.category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600">{trx.account?.accountName}</td>
                <td className="px-8 py-6 text-right">
                  <span className={`text-[17px] font-black ${trx.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                    {trx.type === 'INCOME' ? '+' : '-'}${trx.amount?.toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="relative inline-block text-left">
                     <button onClick={() => setShowMenuId(showMenuId === trx.transactionId ? null : trx.transactionId)} className="p-2 text-slate-400 hover:text-orange-600"><MoreVertical size={20} /></button>
                     {showMenuId === trx.transactionId && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2">
                           <button onClick={() => openEdit(trx)} className="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Edit</button>
                           <button onClick={() => handleDelete(trx.transactionId)} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50">Delete</button>
                        </div>
                     )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - The critical fix for buttons */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Proper visible Close button at the top */}
            <div className="sticky top-0 bg-white p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">{editingTrx ? 'Edit' : 'Add'} Transaction</h3>
              <button 
                onClick={closeModal}
                className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex gap-4 p-1.5 bg-slate-50 rounded-3xl">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-3 rounded-2xl font-black transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-3 rounded-2xl font-black transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Income
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                  <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note</label>
                  <input type="text" required value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account</label>
                    <select required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20">
                      <option value="">Select...</option>
                      {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20">
                      <option value="">Select...</option>
                      {categories.filter(c => c.type === formData.type).map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                   <input type="date" required value={formData.transactionDate} onChange={(e) => setFormData({...formData, transactionDate: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-2">
                 <button type="button" onClick={closeModal} className="flex-1 bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl relative z-10">Huỷ bỏ</button>
                 <button type="submit" className="flex-[2] bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-600/20">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
