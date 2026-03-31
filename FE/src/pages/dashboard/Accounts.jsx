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
  X
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/accounts';
const TRX_API_URL = 'http://localhost:8080/api/transactions';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(null); // stores accountId
  
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'BANK',
    balance: ''
  });
  const userId = localStorage.getItem('userId');

  const fetchAccounts = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${TRX_API_URL}/user/${userId}/recent?limit=5`);
      setTransactions(response.data);
    } catch (error) {
      console.error('TRX fetch error:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      if (editingAccount) {
        await axios.put(`${API_BASE_URL}/${editingAccount.accountId}`, {
          accountName: formData.accountName,
          accountType: formData.accountType,
          balance: parseFloat(formData.balance) || 0
        });
        toast.success('Account updated!');
      } else {
        await axios.post(`${API_BASE_URL}/user/${userId}`, {
          accountName: formData.accountName,
          accountType: formData.accountType,
          balance: parseFloat(formData.balance) || 0
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
        balance: account.balance
      });
    } else {
      setEditingAccount(null);
      setFormData({ accountName: '', accountType: 'BANK', balance: '' });
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
      case 'INVESTMENT': return <TrendingUp size={28} />;
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
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Management</h1>
          <p className="text-slate-500 max-w-md">Overview of your financial ecosystem. Manage bank accounts, digital wallets, and physical assets.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all w-fit"
        >
          <PlusCircle size={20} />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Tabs / Filtering */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-8 min-w-max">
          {[
            { id: 'ALL', label: 'All Accounts', count: accounts.length },
            { id: 'BANK', label: 'Bank Accounts' },
            { id: 'E-WALLET', label: 'E-Wallets' },
            { id: 'INVESTMENT', label: 'Investment' },
            { id: 'CASH', label: 'Cash' },
            { id: 'CREDIT', label: 'Credit Card' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'border-orange-600 text-orange-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.accountId} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl flex items-center justify-center border ${getAccountColors(account.accountType)}`}>
                {getAccountIcon(account.accountType)}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowAccountMenu(showAccountMenu === account.accountId ? null : account.accountId)}
                  className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <MoreVertical size={20} />
                </button>
                
                {showAccountMenu === account.accountId && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in zoom-in duration-150">
                    <button 
                      onClick={() => { openModal(account); setShowAccountMenu(null); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(account.accountId)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">
                {account.accountName}
              </h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {account.accountType} Account
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  ${account.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card Placeholder */}
        <button 
          onClick={() => openModal()}
          className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10 hover:border-orange-600 hover:bg-orange-50/30 transition-all duration-300 group min-h-[250px]"
        >
          <div className="p-4 rounded-full bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all mb-4">
            <Plus size={32} />
          </div>
          <p className="font-bold text-slate-700 text-lg">Add New Account</p>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Connect a bank or digital wallet</p>
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
          <button className="text-sm font-bold text-orange-600 hover:text-orange-700">View All</button>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium italic">
              No recent transactions found
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map((trx) => (
                <div key={trx.transactionId} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-2xl flex items-center justify-center ${
                      trx.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {trx.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-[15px]">{trx.note || 'No description'}</p>
                      <p className="text-xs font-semibold text-slate-400">
                        {trx.account?.accountName} • {new Date(trx.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-[17px] ${trx.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                      {trx.type === 'INCOME' ? '+' : '-'}${trx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">
                {editingAccount ? 'Edit Account' : 'New Account'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Account Name</label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold text-slate-800"
                  placeholder="e.g. Primary Savings"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold text-slate-800 appearance-none"
                >
                  <option value="BANK">Bank Account</option>
                  <option value="CREDIT">Credit Card</option>
                  <option value="E-WALLET">Digital Wallet</option>
                  <option value="CASH">Cash</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl pl-10 pr-6 py-4 focus:outline-none transition-all font-bold text-slate-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] text-lg mt-4"
              >
                {editingAccount ? 'Save Changes' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icons
function TrendingUp({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
}
function TrendingDown({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
}
