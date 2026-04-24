import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  ShoppingCart, 
  Wallet, 
  Utensils, 
  Zap, 
  Car, 
  CheckCircle,
  X,
  Edit,
  Trash2,
  Calendar,
  MoreVertical,
  Filter,
  ArrowRightLeft,
  ChevronRight,
  User,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft as ExportIcon
} from 'lucide-react';
import { MOCK_DATA } from '../../utils/mockData';

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
  const [filterType, setFilterType] = useState('ALL');
  
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    note: '',
    accountId: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  // Helper for dots
  const formatDisplay = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const cleanNum = (val) => {
    return val.toString().replace(/\./g, '');
  };

  const fetchData = async () => {
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (isDemo) {
      setAccounts(MOCK_DATA.accounts);
      setCategories(MOCK_DATA.categories);
      setTransactions(MOCK_DATA.transactions);
      return;
    }

    if (!userId) return;
    try {
      const [accRes, catRes, trxRes] = await Promise.all([
        axios.get(`${ACC_API}/user/${userId}`),
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`)
      ]);
      setAccounts(accRes.data || []);
      setCategories(catRes.data || []);
      setTransactions(trxRes.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();

    const handleTransactionRefresh = () => {
      fetchData();
    };
    window.addEventListener('transactionRefresh', handleTransactionRefresh);

    return () => {
      window.removeEventListener('transactionRefresh', handleTransactionRefresh);
    };
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(cleanNum(formData.amount)),
        type: formData.type,
        note: formData.note,
        transactionDate: formData.transactionDate + 'T00:00:00',
        account: formData.accountId ? { accountId: parseInt(formData.accountId) } : null,
        category: formData.categoryId ? { categoryId: parseInt(formData.categoryId) } : null,
        user: { userId: parseInt(userId) }
      };

      if (editingTrx) {
        await axios.put(`${TRX_API}/${editingTrx.transactionId}`, payload);
        toast.success('Updated');
      } else {
        await axios.post(TRX_API, payload);
        toast.success('Recorded');
      }
      
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new Event('transactionRefresh'));
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await axios.delete(`${TRX_API}/${id}`);
      toast.success('Deleted');
      fetchData();
      window.dispatchEvent(new Event('transactionRefresh'));
    } catch (error) {
      toast.error('Failed');
    }
  };

  const getCategoryIcon = (name) => {
    if (!name) return <ShoppingCart size={16} />;
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('eat') || n.includes('ăn')) return <Utensils size={16} />;
    if (n.includes('bill') || n.includes('điện') || n.includes('nước')) return <Zap size={16} />;
    if (n.includes('car') || n.includes('transport') || n.includes('xe')) return <Car size={16} />;
    if (n.includes('salary') || n.includes('income')) return <Wallet size={16} />;
    return <ShoppingCart size={16} />;
  };

  const filteredTrx = transactions.filter(t => {
    const matchesSearch = t.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = filterAccount === 'ALL' || t.account?.accountId?.toString() === filterAccount;
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesAccount && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h2>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Financial Ledger</p>
        </div>
        <button 
          onClick={() => { setEditingTrx(null); setFormData({ amount: '', type: 'EXPENSE', note: '', accountId: accounts[0]?.accountId || '', categoryId: categories[0]?.categoryId || '', transactionDate: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:outline-none focus:ring-4 focus:ring-orange-500/5 font-bold text-slate-700 placeholder:text-slate-300 text-sm transition-all" 
              placeholder="Search descriptions..." 
            />
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
             <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 font-bold text-slate-700 appearance-none min-w-[140px] text-xs">
                <option value="ALL">All Wallets</option>
                {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
             </select>
             <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 font-bold text-slate-700 appearance-none min-w-[120px] text-xs">
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-2 pl-4">Transaction Details</th>
                <th className="px-6 py-2">Category</th>
                <th className="px-6 py-2">Account</th>
                <th className="px-6 py-2 text-right pr-4">Amount</th>
                <th className="px-6 py-2"></th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {filteredTrx.map((trx) => (
                <tr key={trx.transactionId} className="group hover:bg-slate-50 transition-all duration-200">
                  <td className="px-6 py-3 pl-4 rounded-l-xl border-y border-l border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${trx.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                           {trx.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight truncate max-w-[300px] leading-none">{trx.note || 'General Entry'}</p>
                            <span className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1 uppercase">
                                <Calendar size={10} className="text-slate-300" />
                                {new Date(trx.transactionDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-y border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 uppercase tracking-wider">{trx.category?.name || 'Misc'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-y border-transparent group-hover:border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trx.account?.accountName}</span>
                  </td>
                  <td className="px-6 py-3 text-right border-y border-transparent group-hover:border-slate-100 pr-4">
                    <p className={`text-base font-black ${trx.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'} whitespace-nowrap`}>
                        {trx.type === 'INCOME' ? '+' : '-'}{trx.amount?.toLocaleString('vi-VN')} <span className="text-[10px] ml-0.5 opacity-40">đ</span>
                    </p>
                  </td>
                  <td className="px-6 py-3 pr-4 rounded-r-xl border-y border-r border-transparent group-hover:border-slate-100 text-right">
                    <div className="relative inline-block text-left">
                       <button 
                          onClick={(e) => { e.stopPropagation(); setShowMenuId(showMenuId === trx.transactionId ? null : trx.transactionId); }} 
                          className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors bg-white rounded-lg shadow-sm border border-slate-50"
                       >
                          <MoreVertical size={14} />
                       </button>
                       {showMenuId === trx.transactionId && (
                          <>
                            <div className="fixed inset-0 z-[45]" onClick={() => setShowMenuId(null)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[55] py-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingTrx(trx); setFormData({ amount: trx.amount.toString(), type: trx.type, note: trx.note, accountId: trx.account?.accountId.toString(), categoryId: trx.category?.categoryId.toString(), transactionDate: trx.transactionDate.split('T')[0] }); setIsModalOpen(true); setShowMenuId(null); }} 
                                  className="w-full text-left px-8 py-4 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-4 transition-all uppercase tracking-widest border-b border-slate-50 last:border-0"
                               >
                                  <Edit size={16} className="text-slate-400" /> 
                                  Edit
                               </button>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(trx.transactionId); setShowMenuId(null); }} 
                                  className="w-full text-left px-8 py-4 text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-4 transition-all uppercase tracking-widest"
                               >
                                  <Trash2 size={16} /> 
                                  Delete
                               </button>
                            </div>
                          </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrx.length === 0 && (
            <div className="py-20 text-center space-y-4">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-200"><ArrowRightLeft size={32} /></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No entries found matching filters</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 overflow-hidden border border-slate-100">
            <div className="p-6 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTrx ? 'Update' : 'New'} Record</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{formData.type}</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 pt-4 overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex p-1.5 bg-slate-50 rounded-[28px]">
                    <button type="button" onClick={() => setFormData({...formData, type: 'EXPENSE'})} className={`flex-1 py-4 font-black rounded-[24px] text-xs uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-xl' : 'text-slate-400'}`}>Expense</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'INCOME'})} className={`flex-1 py-4 font-black rounded-[24px] text-xs uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-xl' : 'text-slate-400'}`}>Income</button>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Value (đ)</label>
                    <input 
                        type="text" required 
                        value={formatDisplay(formData.amount)} 
                        onChange={(e) => setFormData({...formData, amount: cleanNum(e.target.value)})} 
                        className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-black text-xl text-slate-900 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-200" 
                        placeholder="0" 
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                    <input type="text" required value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10" placeholder="Lunch, Coffee, etc..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Wallet</label>
                        <select required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-5 font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 appearance-none">
                        <option value="">Select...</option>
                        {accounts.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-5 font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 appearance-none">
                        <option value="">Select...</option>
                        {categories.filter(c => c.type === formData.type).map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                        </select>
                    </div>
                    </div>
                    <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Event Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="date" required value={formData.transactionDate} onChange={(e) => setFormData({...formData, transactionDate: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10" />
                    </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] mt-2">
                    Commit Entry
                </button>
                </form>
            </div>
            <div className="p-6 bg-slate-50 text-center shrink-0">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocol v2.1 • High Accuracy Entry</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
