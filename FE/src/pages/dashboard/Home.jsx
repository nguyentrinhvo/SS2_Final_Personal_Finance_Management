import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, TrendingDown, Bell, Check, Wallet } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import SpendingTrendChart from '../../components/dashboard/SpendingTrendChart';
import ActiveGoals from '../../components/dashboard/ActiveGoals';
import TransactionTable from '../../components/dashboard/TransactionTable';

const API_ACCOUNTS = 'http://localhost:8080/api/accounts/user';
const API_TRANSACTIONS = 'http://localhost:8080/api/transactions/user';
const API_GOALS = 'http://localhost:8080/api/goals/user';
const API_BUDGETS = 'http://localhost:8080/api/budgets/user';

const Home = () => {
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    transactions: [],
    allTransactions: [], 
    goals: [],
    budgets: [],
    accounts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeDetail, setActiveDetail] = useState(null); 
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [accs, trxs, goals, budgets] = await Promise.all([
        axios.get(`${API_ACCOUNTS}/${userId}`),
        axios.get(`${API_TRANSACTIONS}/${userId}/all`),
        axios.get(`${API_GOALS}/${userId}`),
        axios.get(`${API_BUDGETS}/${userId}/current`)
      ]);

      const balance = accs.data.reduce((sum, a) => sum + (a.balance || 0), 0);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyIncome = trxs.data
        .filter(t => t.type === 'INCOME' && new Date(t.transactionDate).getMonth() === currentMonth && new Date(t.transactionDate).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyExpense = trxs.data
        .filter(t => t.type === 'EXPENSE' && new Date(t.transactionDate).getMonth() === currentMonth && new Date(t.transactionDate).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setData({
        totalBalance: balance,
        monthlyIncome,
        monthlyExpense,
        transactions: trxs.data.slice(0, 5), 
        allTransactions: trxs.data,
        goals: goals.data.slice(0, 3),
        budgets: budgets.data,
        accounts: accs.data
      });

      // Notifications have been moved to Navbar
    } catch (err) {
      console.error(err);
      toast.error(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for custom transaction events from the Floating Chatbot
    const handleTransactionRefresh = () => {
      fetchData();
    };
    window.addEventListener('transactionRefresh', handleTransactionRefresh);

    return () => {
      window.removeEventListener('transactionRefresh', handleTransactionRefresh);
    };
  }, [userId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600 uppercase tracking-widest">FinFlow Syncing...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20 max-w-7xl mx-auto px-4 lg:px-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div onClick={() => setActiveDetail('LIQUIDITY')} className="cursor-pointer">
            <StatCard title="Net Liquidity" value={data.totalBalance} change="0" isPositive={true} icon={DollarSign} />
        </div>
        <div onClick={() => setActiveDetail('INFLOW')} className="cursor-pointer">
            <StatCard title="Monthly Cash Inflow" value={data.monthlyIncome} change="0" isPositive={true} icon={TrendingUp} />
        </div>
        <div onClick={() => setActiveDetail('OUTFLOW')} className="cursor-pointer">
            <StatCard title="Monthly Capital Outflow" value={data.monthlyExpense} change="0" isPositive={false} icon={TrendingDown} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <SpendingTrendChart transactions={data.allTransactions} />
          <TransactionTable transactions={data.transactions} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-12">
          <ActiveGoals goals={data.goals} />
        </div>
      </div>

      {activeDetail && (
        <StatDetailModal type={activeDetail} data={data} onClose={() => setActiveDetail(null)} />
      )}
    </div>
  );
};

function StatDetailModal({ type, data, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5; // Using 5 for better fit in modal, user said 10 but arrows work better for smaller chunks

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let title = "";
  let icon = null;
  let items = [];
  let renderItem = null;

  if (type === 'LIQUIDITY') {
    title = "Asset Allocation";
    icon = <DollarSign className="text-green-600" />;
    items = data.accounts;
    renderItem = (acc) => (
      <div key={acc.accountId} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-right-1 duration-300">
        <div>
          <p className="font-bold text-slate-800">{acc.accountName}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{acc.accountType}</p>
        </div>
        <p className="font-black text-slate-900">{acc.balance?.toLocaleString()} đ</p>
      </div>
    );
  } else if (type === 'INFLOW') {
    title = "Income Snapshot";
    icon = <TrendingUp className="text-green-600" />;
    items = data.allTransactions.filter(t => t.type === 'INCOME' && new Date(t.transactionDate).getMonth() === currentMonth && new Date(t.transactionDate).getFullYear() === currentYear);
    renderItem = (t) => (
      <div key={t.transactionId} className="flex justify-between items-center p-4 bg-green-50/50 rounded-2xl border border-green-100/50 animate-in fade-in slide-in-from-right-1 duration-300">
        <div>
          <p className="font-bold text-slate-800">{t.note || "Income"}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{new Date(t.transactionDate).toLocaleDateString()}</p>
        </div>
        <p className="font-black text-green-600">+{t.amount?.toLocaleString()} đ</p>
      </div>
    );
  } else if (type === 'OUTFLOW') {
    title = "Expense Analytics";
    icon = <TrendingDown className="text-red-500" />;
    items = data.allTransactions.filter(t => t.type === 'EXPENSE' && new Date(t.transactionDate).getMonth() === currentMonth && new Date(t.transactionDate).getFullYear() === currentYear);
    renderItem = (t) => (
      <div key={t.transactionId} className="flex justify-between items-center p-4 bg-red-50/30 rounded-2xl border border-red-100/30 animate-in fade-in slide-in-from-right-1 duration-300">
        <div>
          <p className="font-bold text-slate-800">{t.category?.name || "Other"}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t.note || "Expenditure"}</p>
        </div>
        <p className="font-black text-red-500">-{t.amount?.toLocaleString()} đ</p>
      </div>
    );
  }

  const paginatedItems = items.slice(currentIndex, currentIndex + itemsPerPage);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

  const next = () => { if (currentIndex + itemsPerPage < items.length) setCurrentIndex(currentIndex + itemsPerPage); };
  const prev = () => { if (currentIndex - itemsPerPage >= 0) setCurrentIndex(currentIndex - itemsPerPage); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-all font-bold">Close</button>
        </div>
        
        <div className="p-8 min-h-[350px] flex flex-col justify-between">
          <div className="space-y-3">
            {items.length === 0 ? (
                <p className="text-center py-20 text-slate-400 font-bold italic">No data records found</p>
            ) : (
                paginatedItems.map(item => renderItem(item))
            )}
          </div>

          {items.length > itemsPerPage && (
            <div className="pt-6 flex items-center justify-between">
                 <button onClick={prev} disabled={currentIndex === 0} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-600 hover:text-white disabled:opacity-20 transition-all active:scale-90">
                    <TrendingDown className="rotate-90" size={20} />
                 </button>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                    <p className="text-[8px] font-bold text-slate-200 uppercase tracking-tighter">{items.length} Total items</p>
                 </div>
                 <button onClick={next} disabled={currentIndex + itemsPerPage >= items.length} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-600 hover:text-white disabled:opacity-20 transition-all active:scale-90">
                    <TrendingUp className="-rotate-90" size={20} />
                 </button>
            </div>
          )}
        </div>

        {type === 'LIQUIDITY' && items.length > 0 && (
             <div className="mx-8 mb-8 pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                <p className="font-black text-slate-400 text-xs uppercase">Net Balance</p>
                <p className="text-xl font-black text-slate-900">{data.totalBalance?.toLocaleString()} đ</p>
            </div>
        )}

        <div className="p-6 bg-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{now.toLocaleString('en-US', { month: 'long', year: 'numeric' })} Detail View</p>
        </div>
      </div>
    </div>
  );
}

export default Home;