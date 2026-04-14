import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  Landmark, 
  CreditCard, 
  Wallet, 
  RefreshCw, 
  MoreVertical, 
  Send, 
  History, 
  Plus, 
  ShoppingBag, 
  Briefcase, 
  Plane,
  Trash2,
  Edit,
  X,
  UploadCloud
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/accounts';
const TRX_API_URL = 'http://localhost:8080/api/transactions';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(null); 
  
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'BANK',
    balance: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const userId = localStorage.getItem('userId');

  // Helper for dots
  const formatDisplay = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const cleanNum = (val) => {
    return val.toString().replace(/\./g, '');
  };

  const fetchAccounts = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${TRX_API_URL}/user/${userId}/recent?limit=5`);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('TRX fetch error:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
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
    if (!userId) return;

    try {
      if (editingAccount) {
        await axios.put(`${API_BASE_URL}/${editingAccount.accountId}`, {
          accountName: formData.accountName,
          accountType: formData.accountType,
          balance: parseFloat(cleanNum(formData.balance)) || 0,
          imageUrl: formData.imageUrl
        });
        toast.success('Account updated!');
      } else {
        await axios.post(`${API_BASE_URL}/user/${userId}`, {
          accountName: formData.accountName,
          accountType: formData.accountType,
          balance: parseFloat(cleanNum(formData.balance)) || 0,
          imageUrl: formData.imageUrl
        });
        toast.success('Account created!');
      }
      closeModal();
      fetchAccounts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${accountId}`);
      toast.success('Account deleted');
      fetchAccounts();
      setShowAccountMenu(null);
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance.toString(),
        imageUrl: account.imageUrl || ''
      });
    } else {
      setEditingAccount(null);
      setFormData({ accountName: '', accountType: 'BANK', balance: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const filteredAccounts = activeTab === 'ALL' 
    ? accounts 
    : accounts.filter(a => a.accountType === activeTab);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'BANK': return <Landmark size={28} />;
      case 'CREDIT': return <CreditCard size={28} />;
      case 'E-WALLET': return <Wallet size={28} />;
      case 'CASH': return <Wallet size={28} />;
      case 'INVESTMENT': return <TrendingUpIcon size={28} />;
      default: return <Landmark size={28} />;
    }
  };

  const getAccountColors = (type) => {
    switch (type) {
      case 'BANK': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CREDIT': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'E-WALLET': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'CASH': return 'bg-green-50 text-green-600 border-green-100';
      case 'INVESTMENT': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Accounts</h2>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Financial Foundations</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-all text-sm"
        >
          <PlusCircle size={20} />
          <span>New Account</span>
        </button>
      </div>

      <div className="border-b border-slate-100 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-8 min-w-max">
          {[
            { id: 'ALL', label: 'All Assets', count: accounts.length },
            { id: 'BANK', label: 'Bank' },
            { id: 'E-WALLET', label: 'E-Wallet' },
            { id: 'INVESTMENT', label: 'Investment' },
            { id: 'CASH', label: 'Cash' },
            { id: 'CREDIT', label: 'Credit Card' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 flex items-center gap-2 transition-all border-b-[3px] text-[11px] uppercase tracking-widest ${
                activeTab === tab.id 
                ? 'border-orange-600 text-slate-900 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAccounts.map((account) => (
          <div key={account.accountId} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-8">
                {account.imageUrl ? (
                  <div className="size-16 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center border border-slate-100 transition-all duration-500 group-hover:scale-110">
                    <img src={account.imageUrl} alt={account.accountName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${getAccountColors(account.accountType)}`}>
                      {getAccountIcon(account.accountType)}
                  </div>
                )}
                
                <div className="relative">
                    <button 
                    onClick={() => setShowAccountMenu(showAccountMenu === account.accountId ? null : account.accountId)}
                    className="p-2 text-slate-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    >
                    <MoreVertical size={20} />
                    </button>
                    
                    {showAccountMenu === account.accountId && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAccountMenu(null)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                            onClick={() => { openModal(account); setShowAccountMenu(null); }}
                            className="w-full flex items-center gap-4 px-6 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors uppercase tracking-widest"
                            >
                            <Edit size={14} /> Edit
                            </button>
                            <button 
                            onClick={() => handleDelete(account.accountId)}
                            className="w-full flex items-center gap-4 px-6 py-3 text-xs font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
                            >
                            <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </>
                    )}
                </div>
                </div>

                <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-orange-600 transition-colors uppercase tracking-tighter">
                    {account.accountName}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                    {account.accountType} Account
                </p>
                </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Available Balance</p>
              <div className="flex items-baseline gap-2 overflow-hidden">
                <span className="text-3xl font-black text-slate-900 truncate tracking-tighter">
                  {account.balance?.toLocaleString('vi-VN')} <span className="text-sm font-bold opacity-30 ml-0.5">đ</span>
                </span>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => openModal()}
          className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 hover:border-orange-600 hover:bg-orange-50/50 transition-all duration-300 group min-h-[300px]"
        >
          <div className="p-5 rounded-3xl bg-slate-50 text-slate-300 group-hover:bg-orange-100 group-hover:text-orange-600 group-hover:rotate-90 transition-all mb-6">
            <Plus size={40} />
          </div>
          <p className="font-black text-slate-900 text-lg uppercase tracking-widest leading-none mb-2">Add Account</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Connect your assets</p>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden relative animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between p-10 pb-6 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {editingAccount ? 'Update' : 'New'} Account
              </h3>
              <button onClick={closeModal} className="p-3 hover:bg-red-50 rounded-2xl text-slate-300 hover:text-red-500 transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 pt-6 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Label</label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-slate-900"
                  placeholder="e.g. My Savings"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Financial Channel</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-slate-900 appearance-none"
                >
                  <option value="BANK">Bank Account</option>
                  <option value="CREDIT">Credit Card</option>
                  <option value="E-WALLET">Digital Wallet</option>
                  <option value="CASH">Cash Holdings</option>
                  <option value="INVESTMENT">Investment Portfolio</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Opening Volume (đ)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formatDisplay(formData.balance)}
                    onChange={(e) => setFormData({...formData, balance: cleanNum(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-2xl text-slate-900"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cover Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="flex-1 min-w-0 bg-slate-50 border-none rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm"
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
                className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] transition-all shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-[0.2em] mt-4"
              >
                {editingAccount ? 'Commit Changes' : 'Open Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingUpIcon({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
}
function TrendingDownIcon({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
}
