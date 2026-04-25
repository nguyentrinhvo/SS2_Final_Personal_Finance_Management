import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Download,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as RechartsLegend
} from 'recharts';
import * as XLSX from 'xlsx';
import { MOCK_DATA } from '../../utils/mockData';

const formatCompactNumber = (number) => {
    if (number === 0) return '0';
    const isNegative = number < 0;
    const absNumber = Math.abs(number);
    let formatted;
    if (absNumber < 1000) {
        formatted = absNumber.toString();
    } else if (absNumber >= 1000 && absNumber < 1_000_000) {
        formatted = (absNumber / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (absNumber >= 1_000_000 && absNumber < 1_000_000_000) {
        formatted = (absNumber / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
        formatted = (absNumber / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    return isNegative ? '-' + formatted : formatted;
}

import { API_BASE_URL } from '../../utils/api';

const CAT_API = `${API_BASE_URL}/api/categories`;
const TRX_API = `${API_BASE_URL}/api/transactions`;

export default function Reports() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (isDemo) {
      setCategories(MOCK_DATA.categories);
      setTransactions(MOCK_DATA.transactions);
      setLoading(false);
      return;
    }

    if (!userId) return;
    try {
      const [catRes, trxRes] = await Promise.all([
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`),
      ]);
      setCategories(catRes.data);
      setTransactions(trxRes.data);
    } catch (err) {
      toast.error('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-900 animate-pulse uppercase tracking-tight text-[10px]">Processing Analytics...</p>
    </div>
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTrxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTrxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = currentMonthTrxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
  const netSavings = income - expenses;
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthTrxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  
  const lastIncome = lastMonthTrxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
  const lastExpenses = lastMonthTrxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
  
  const calculateTrend = (current, last) => {
    if (last === 0) return current === 0 ? 0 : 100;
    return (((current - last) / last) * 100).toFixed(1);
  };

  const incomeTrend = calculateTrend(income, lastIncome);
  const expenseTrend = calculateTrend(expenses, lastExpenses);

  const expenseTrxs = currentMonthTrxs.filter(t => t.type === 'EXPENSE');
  const catVelocity = {};
  expenseTrxs.forEach(t => {
    const catName = t.category?.name || 'Other';
    catVelocity[catName] = (catVelocity[catName] || 0) + (t.amount || 0);
  });
  
  const sortedCats = Object.entries(catVelocity).sort((a,b) => b[1]-a[1]);
  const topCats = sortedCats.slice(0, 3);
  const otherCats = sortedCats.slice(3).reduce((acc, curr) => acc + curr[1], 0);
  
  const pieData = topCats.map(([name, val]) => ({ name, value: val }));
  if (otherCats > 0) pieData.push({ name: 'Other', value: otherCats });
  
  const COLORS = ['#ea580c', '#0369a1', '#f97316', '#7dd3fc'];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dynamicsData = [];
  for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      const mTrxs = transactions.filter(t => {
          const d = new Date(t.transactionDate);
          return d.getMonth() === m && d.getFullYear() === y;
      });
      dynamicsData.push({
          monthName: monthNames[m],
          inflow: mTrxs.filter(t => t.type === 'INCOME').reduce((s,t) => s + (t.amount || 0), 0),
          outflow: mTrxs.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + (t.amount || 0), 0)
      });
  }

  const historyTable = [];
  for (let i = 0; i < 4; i++) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m < 0) { m += 12; y -= 1; }
        const mTrxs = transactions.filter(t => {
            const d = new Date(t.transactionDate);
            return d.getMonth() === m && d.getFullYear() === y;
        });
        const mIn = mTrxs.filter(t => t.type === 'INCOME').reduce((s,t) => s + (t.amount || 0), 0);
        const mOut = mTrxs.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + (t.amount || 0), 0);
        const net = mIn - mOut;
        let status = 'BALANCED';
        let statusColor = 'bg-slate-50 text-slate-500';
        if (net > 0) { status = 'SURPLUS'; statusColor = 'bg-emerald-50 text-emerald-600'; }
        if (net < 0) { status = 'DEFICIT'; statusColor = 'bg-red-50 text-red-600'; }
        
        historyTable.push({ period: `${monthNames[m]} ${y}`, inflow: mIn, outflow: mOut, net, status, statusColor });
  }

  const downloadExcel = () => {
    if (!transactions.length) return toast.error("No data available");
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      "ID": t.transactionId, "Date": new Date(t.transactionDate).toLocaleDateString(),
      "Type": t.type, "Amount": t.amount, "Category": t.category?.name || "N/A"
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const filename = localStorage.getItem('isDemoMode') === 'true' ? 'FinFlowReportDemo' : `FinFlow_Report_${Date.now()}`;
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success("Archive exported successfully");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000 pb-20 px-4">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Reports</h2>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Dynamic Financial Analytics</p>
        </div>
        <button onClick={downloadExcel} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all text-xs uppercase tracking-widest">
          <Download size={16} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inflow', val: income, trend: incomeTrend, color: 'emerald' },
          { label: 'Total Outflow', val: expenses, trend: expenseTrend, color: 'red' },
          { label: 'Net Liquidity', val: netSavings, trend: null, color: 'slate' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{card.label}</p>
              {card.trend !== null && (
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${parseFloat(card.trend) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {parseFloat(card.trend) > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {Math.abs(parseFloat(card.trend))}%
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{card.val.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-slate-400">đ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Yield (Donut) - Col Span 1 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm lg:col-span-1 flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-slate-50 rounded-2xl text-orange-600"><PieIcon size={18} /></div>
             <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Category Yield</h3>
          </div>
          
          <div className="flex flex-col xl:flex-row items-center justify-center gap-6 py-4 uppercase">
            <div className="relative size-52 shrink-0">
                {expenses > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        cx="50%" cy="50%" 
                        innerRadius={68} outerRadius={78} 
                        paddingAngle={5} dataKey="value" 
                        stroke="none" cornerRadius={6}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {pieData.map((e, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ display: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-200 uppercase font-black text-[8px] tracking-tight text-center">No Records</div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight mb-1 truncate max-w-[120px]">
                    {activeIndex !== null ? pieData[activeIndex].name : 'Total Flow'}
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                    {activeIndex !== null ? pieData[activeIndex].value.toLocaleString('vi-VN') : expenses.toLocaleString('vi-VN')}
                  </span>
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[180px]">
               {pieData.length > 0 ? pieData.map((e, idx) => (
                 <div key={idx} className="flex items-center gap-3 py-1.5 px-2 group hover:bg-slate-50 rounded-xl transition-all">
                    <div className="flex items-center gap-2 flex-1">
                       <span className="shrink-0 h-1.5 w-1.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-900 transition-colors truncate">{e.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 w-10 text-right">{((e.value / expenses) * 100).toFixed(0)}%</span>
                 </div>
               )) : null}
            </div>
          </div>
        </div>

        {/* Cash Flow Dynamics (Modern Bar Chart) - Col Span 2 */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm lg:col-span-2 border-b-4 border-b-sky-600/10 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-slate-50 rounded-2xl text-sky-700"><BarChart3 size={18} /></div>
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Flow Momentum</h3>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-tight">
               <div className="flex items-center gap-2 text-sky-800"><span className="h-2 w-2 rounded-full bg-sky-700"></span> Current In</div>
               <div className="flex items-center gap-2 text-orange-600"><span className="h-2 w-2 rounded-full bg-orange-600"></span> Current Out</div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={formatCompactNumber} width={40} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 4 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex flex-col gap-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">{label}</p>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                              <span className="text-[11px] font-bold text-slate-500 uppercase">{entry.name}:</span>
                              <span className="text-[11px] font-black text-slate-900">{entry.value.toLocaleString('vi-VN')} đ</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="inflow" fill="#0369a1" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="outflow" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Performance Table - Strategic Log */}
      <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden border-b-4 border-b-slate-100">
         <div className="px-4 md:px-8 py-5 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-white rounded-2xl border border-slate-100 text-slate-500"><Activity size={20} /></div>
               <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Strategic History Log</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/50 rounded-full">
                <Layers size={12} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Verified Archival Ledger</span>
            </div>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full text-left table-fixed min-w-[900px]">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="w-[180px] px-4 md:px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-tight whitespace-nowrap">Operational Period</th>
                      <th className="w-[120px] px-4 md:px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-tight text-right whitespace-nowrap">Cash Inflow</th>
                      <th className="w-[120px] px-4 md:px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-tight text-right whitespace-nowrap">Cash Outflow</th>
                      <th className="w-[150px] px-4 md:px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-tight text-right whitespace-nowrap">Net Asset Value</th>
                      <th className="w-[140px] px-4 md:px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-tight text-right whitespace-nowrap">Registry Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {historyTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-all group">
                         <td className="px-4 md:px-8 py-3.5 text-[13px] font-bold text-slate-800 flex items-center gap-3 whitespace-nowrap">
                            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                <Calendar size={14} />
                            </div>
                            {row.period}
                         </td>
                         <td className="px-4 md:px-8 py-3.5 text-right font-bold text-slate-600 transition-colors group-hover:text-slate-900 whitespace-nowrap">
                            {row.inflow.toLocaleString()} <span className="text-[10px] text-slate-400">đ</span>
                         </td>
                         <td className="px-4 md:px-8 py-3.5 text-right font-bold text-slate-500 transition-colors group-hover:text-slate-900 whitespace-nowrap">
                            {row.outflow.toLocaleString()} <span className="text-[10px] text-slate-400">đ</span>
                         </td>
                         <td className="px-4 md:px-8 py-3.5 text-right font-black text-slate-900 transition-colors whitespace-nowrap">
                            <span className={row.net >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {row.net >= 0 ? '+' : ''}{row.net.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">đ</span>
                         </td>
                         <td className="px-4 md:px-8 py-3.5 text-right whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center min-w-[70px] text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl ${row.statusColor} shadow-sm border border-black/5`}>
                               {row.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
         
         <div className="p-6 bg-slate-50/20 text-center border-t border-slate-50">
            <button className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-wider hover:text-orange-600 hover:border-orange-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto active:scale-95">
                <Layers size={14} /> Deep Analysis & Archive Access
            </button>
         </div>
      </section>

    </div>
  );
}