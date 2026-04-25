import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowRight, 
  Calendar,
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  PieChart,
  ArrowUpRight,
  Zap,
  BarChart3
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import SpendingTrendChart from '../../components/dashboard/SpendingTrendChart';
import ActiveGoals from '../../components/dashboard/ActiveGoals';
import TransactionTable from '../../components/dashboard/TransactionTable';
import { MOCK_DATA } from '../../utils/mockData';

import { API_BASE_URL } from '../../utils/api';

const API_ACCOUNTS = `${API_BASE_URL}/api/accounts/user`;
const API_TRANSACTIONS = `${API_BASE_URL}/api/transactions/user`;
const API_GOALS = `${API_BASE_URL}/api/goals/user`;
const API_BUDGETS = `${API_BASE_URL}/api/budgets/user`;

const Home = () => {
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    prevMonthIncome: 0,
    prevMonthExpense: 0,
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
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (isDemo) {
      const accs = MOCK_DATA.accounts;
      const trxs = MOCK_DATA.transactions;
      const goals = MOCK_DATA.goals;
      const budgets = MOCK_DATA.budgets;

      const balance = accs.reduce((sum, a) => sum + (a.balance || 0), 0);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const filterTrx = (m, y, type) => trxs
        .filter(t => t.type === type && new Date(t.transactionDate).getMonth() === m && new Date(t.transactionDate).getFullYear() === y)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyIncome = filterTrx(currentMonth, currentYear, 'INCOME');
      const monthlyExpense = filterTrx(currentMonth, currentYear, 'EXPENSE');
      const prevMonthIncome = filterTrx(prevMonth, prevYear, 'INCOME');
      const prevMonthExpense = filterTrx(prevMonth, prevYear, 'EXPENSE');

      setData({
        totalBalance: balance,
        monthlyIncome,
        monthlyExpense,
        prevMonthIncome,
        prevMonthExpense,
        transactions: trxs.slice(0, 5),
        allTransactions: trxs,
        goals: goals.slice(0, 3),
        budgets: budgets,
        accounts: accs
      });
      setLoading(false);
      return;
    }

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
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const filterTrx = (m, y, type) => trxs.data
        .filter(t => t.type === type && new Date(t.transactionDate).getMonth() === m && new Date(t.transactionDate).getFullYear() === y)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyIncome = filterTrx(currentMonth, currentYear, 'INCOME');
      const monthlyExpense = filterTrx(currentMonth, currentYear, 'EXPENSE');
      const prevMonthIncome = filterTrx(prevMonth, prevYear, 'INCOME');
      const prevMonthExpense = filterTrx(prevMonth, prevYear, 'EXPENSE');

      setData({
        totalBalance: balance,
        monthlyIncome,
        monthlyExpense,
        prevMonthIncome,
        prevMonthExpense,
        transactions: trxs.data.slice(0, 5), 
        allTransactions: trxs.data,
        goals: goals.data.slice(0, 3),
        budgets: budgets.data,
        accounts: accs.data
      });
    } catch (err) {
      console.error(err);
      toast.error(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleTransactionRefresh = () => fetchData();
    window.addEventListener('transactionRefresh', handleTransactionRefresh);
    return () => window.removeEventListener('transactionRefresh', handleTransactionRefresh);
  }, [userId]);

  const stats = useMemo(() => {
    const calcChange = (curr, prev) => {
        if (!prev) return curr > 0 ? "100" : "0";
        return (((curr - prev) / prev) * 100).toFixed(1);
    };

    const getSparkline = (type) => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => ({
            date,
            value: data.allTransactions
                .filter(t => t.type === type && t.transactionDate.startsWith(date))
                .reduce((sum, t) => sum + (t.amount || 0), 0)
        }));
    };

    const surplus = data.monthlyIncome - data.monthlyExpense;
    const prevSurplus = data.prevMonthIncome - data.prevMonthExpense;

    return [
      {
        id: 'LIQUIDITY',
        title: "Net Liquidity",
        value: data.totalBalance,
        change: null, // Total balance change logic usually requires snapshots, leaving as null or static
        isPositive: true,
        icon: DollarSign,
        sparkline: getSparkline('EXPENSE').map(v => ({ ...v, value: data.totalBalance - v.value })) // Mocking balance trend
      },
      {
        id: 'INFLOW',
        title: "Monthly Inflow",
        value: data.monthlyIncome,
        change: calcChange(data.monthlyIncome, data.prevMonthIncome),
        isPositive: data.monthlyIncome >= data.prevMonthIncome,
        icon: TrendingUp,
        sparkline: getSparkline('INCOME')
      },
      {
        id: 'OUTFLOW',
        title: "Monthly Outflow",
        value: data.monthlyExpense,
        change: calcChange(data.monthlyExpense, data.prevMonthExpense),
        isPositive: data.monthlyExpense < data.prevMonthExpense,
        icon: TrendingDown,
        sparkline: getSparkline('EXPENSE')
      },
      {
        id: 'SURPLUS',
        title: "Net Surplus",
        value: surplus,
        change: calcChange(surplus, prevSurplus),
        isPositive: surplus >= prevSurplus,
        icon: Zap,
        sparkline: getSparkline('INCOME').map((v, i) => ({ date: v.date, value: v.value - getSparkline('EXPENSE')[i].value }))
      }
    ];
  }, [data]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600 uppercase tracking-widest">FinFlow Syncing...</div>;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-[1600px] mx-auto px-4 lg:px-6">
      
      {/* Row 1: KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.id} onClick={() => s.id !== 'SURPLUS' && setActiveDetail(s.id)} className={s.id !== 'SURPLUS' ? 'cursor-pointer h-fit' : 'h-fit'}>
            <StatCard {...s} sparklineData={s.sparkline} />
          </div>
        ))}
      </div>

      {/* Row 2: Quick Actions (Extended) */}
      <QuickActions />

      {/* Row 3: Main Content Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          <SpendingTrendChart transactions={data.allTransactions} />
          <TransactionTable transactions={data.transactions} />
        </div>

        {/* Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
           <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Financial Health</h3>
                <PieChart size={16} className="text-orange-500" />
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Savings Rate</span>
                    <span className="text-slate-900">{Math.round((data.monthlyIncome > 0 ? (data.monthlyIncome - data.monthlyExpense) / data.monthlyIncome : 0) * 100)}%</span>
                 </div>
                 <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600" style={{ width: `${Math.round((data.monthlyIncome > 0 ? (data.monthlyIncome - data.monthlyExpense) / data.monthlyIncome : 0) * 100)}%` }}></div>
                 </div>
              </div>
           </div>
           
           <ActiveGoals goals={data.goals} />
           
           <div className="bg-slate-900 text-white px-6 py-5 rounded-2xl space-y-5 relative overflow-hidden group h-fit">
              <div className="absolute -right-8 -top-8 size-32 bg-orange-600/20 blur-[40px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col gap-4">
                <h4 className="text-base font-bold tracking-tight flex items-center gap-2 text-white">
                    <ArrowUpRight size={18} className="text-orange-500" />
                    Premium Insights
                </h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Your spending on <span className="text-white font-bold">Utilities</span> is 12% lower than last month. Keep it up!</p>
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2 group/btn">
                    View full report <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
           </div>
        </div>
      </div>

      {activeDetail && (
        <StatDetailModal type={activeDetail} data={data} onClose={() => setActiveDetail(null)} />
      )}
    </div>
  );
};

function QuickActions() {
    const navigate = useNavigate();
    const actions = [
        { name: 'Add Transaction', icon: Plus, color: 'bg-orange-50 text-orange-600', path: '/dashboard/transactions' },
        { name: 'View Accounts', icon: Wallet, color: 'bg-blue-50 text-blue-600', path: '/dashboard/accounts' },
        { name: 'Set Budget', icon: PieChart, color: 'bg-purple-50 text-purple-600', path: '/dashboard/budgets' },
        { name: 'Reports', icon: BarChart3, color: 'bg-green-50 text-green-600', path: '/dashboard/reports' },
    ];

    return (
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 shrink-0 px-2 border-r border-slate-100">
                <Zap size={18} className="text-orange-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Protocol</h3>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map(action => (
                    <button 
                        key={action.name} 
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                    >
                        <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-900 whitespace-nowrap">{action.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function StatDetailModal({ type, data, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3; 

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
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-all font-bold">Close</button>
        </div>
        
        <div className="p-6 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3">
            {items.length === 0 ? (
                <p className="text-center py-20 text-slate-400 font-bold italic">No data records found</p>
            ) : (
                paginatedItems.map(item => renderItem(item))
            )}
          </div>

          {items.length > itemsPerPage && (
            <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                 <button onClick={prev} disabled={currentIndex === 0} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-600 hover:text-white disabled:opacity-20 transition-all active:scale-90 shadow-sm">
                    <ChevronLeft size={20} />
                 </button>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{items.length} Total items</p>
                 </div>
                 <button onClick={next} disabled={currentIndex + itemsPerPage >= items.length} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-600 hover:text-white disabled:opacity-20 transition-all active:scale-90 shadow-sm">
                    <ChevronRight size={20} />
                 </button>
            </div>
          )}
        </div>

        {type === 'LIQUIDITY' && items.length > 0 && (
             <div className="mx-6 mb-6 pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                <p className="font-black text-slate-400 text-xs uppercase">Net Balance</p>
                <p className="text-xl font-black text-slate-900">{data.totalBalance?.toLocaleString()} đ</p>
            </div>
        )}

        <div className="p-4 bg-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{now.toLocaleString('en-US', { month: 'long', year: 'numeric' })} Detail View</p>
        </div>
      </div>
    </div>
  );
}

export default Home;