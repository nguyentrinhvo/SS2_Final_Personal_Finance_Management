import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Download,
  TrendingUp,
  AlertTriangle,
  Zap,
  Rocket
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import * as XLSX from 'xlsx';

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

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';

export default function Reports() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600 uppercase tracking-widest">Generating Analytics...</div>;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Aggregate current month data
  const currentMonthTrxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTrxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = currentMonthTrxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
  const netSavings = income - expenses;
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0;
  const savingsGoal = 40.0;
  const savingsRateColor = savingsRate >= savingsGoal ? 'bg-orange-600' : 'bg-orange-400';

  // Last Month Data for simple trend comparisons
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthTrxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  
  const lastIncome = lastMonthTrxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
  const lastExpenses = lastMonthTrxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
  
  const calculateTrend = (current, last) => {
    if (last === 0) {
        if (current === 0) return 0;
        return 100;
    }
    return (((current - last) / last) * 100).toFixed(1);
  };

  const incomeTrend = calculateTrend(income, lastIncome);
  const expenseTrend = calculateTrend(expenses, lastExpenses);

  // Category Velocity
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
  
  const COLORS = ['#ea580c', '#0369a1', '#9a3412', '#94a3b8']; // orange-600, sky-700, orange-800, slate-400

  // Cash Flow Dynamics (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dynamicsData = [];
  for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
          m += 12;
          y -= 1;
      }
      const mTrxs = transactions.filter(t => {
          const d = new Date(t.transactionDate);
          return d.getMonth() === m && d.getFullYear() === y;
      });
      const mIn = mTrxs.filter(t => t.type === 'INCOME').reduce((s,t) => s + (t.amount || 0), 0);
      const mOut = mTrxs.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + (t.amount || 0), 0);
      dynamicsData.push({
          monthName: monthNames[m],
          inflow: mIn,
          outflow: mOut
      });
  }
  const maxDynamic = Math.max(...dynamicsData.map(d => Math.max(d.inflow, d.outflow))) || 1;

  // Historical Performance Table (last 4 months)
  const historyTable = [];
  for (let i = 0; i < 4; i++) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m < 0) {
            m += 12;
            y -= 1;
        }
        const mTrxs = transactions.filter(t => {
            const d = new Date(t.transactionDate);
            return d.getMonth() === m && d.getFullYear() === y;
        });
        const mIn = mTrxs.filter(t => t.type === 'INCOME').reduce((s,t) => s + (t.amount || 0), 0);
        const mOut = mTrxs.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + (t.amount || 0), 0);
        const net = mIn - mOut;
        let status = 'Balanced';
        let statusColor = 'bg-orange-100 text-orange-600';
        if (net > 0) { status = 'Surplus'; statusColor = 'bg-sky-100 text-sky-700'; }
        if (net < 0) { status = 'Deficit'; statusColor = 'bg-red-100 text-red-600'; }
        
        historyTable.push({
            period: `${monthNames[m]} ${y}`,
            inflow: mIn,
            outflow: mOut,
            net,
            status,
            statusColor
        });
  }

  const downloadExcel = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("No data to download");
      return;
    }

    const excelData = transactions.map(t => ({
      "Transaction ID": t.transactionId,
      "Date": new Date(t.transactionDate).toLocaleDateString(),
      "Type": t.type,
      "Amount": t.amount,
      "Category": t.category?.name || "N/A",
      "Note": t.note || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    XLSX.writeFile(workbook, `finflow_report_${currentMonth + 1}_${currentYear}.xlsx`);
    toast.success("Report downloaded in Excel format");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-12 max-w-[1600px] mx-auto text-slate-900">
      
      {/* Header Section */}
      <section className="flex justify-between items-end mb-10 px-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter">Financial Reports & Analytics</h2>
          <p className="text-slate-500 mt-1">Detailed insights into your capital flow and spending velocity.</p>
        </div>
        <button onClick={downloadExcel} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-3 rounded-md font-semibold transition-all hover:bg-slate-300">
          <Download size={18} />
          Download Report
        </button>
      </section>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4">
        
        {/* Income */}
        <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-orange-600 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Income</p>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1">
            <div className="flex items-baseline gap-1">
                <span className="text-2xl 2xl:text-3xl font-extrabold tracking-tight" title={`${income.toLocaleString()} đ`}>
                   {income.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-500">đ</span>
            </div>
            <span className={`font-bold text-sm flex items-center gap-1 whitespace-nowrap ${incomeTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {incomeTrend > 0 ? '+' : ''}{incomeTrend}% 
              <TrendingUp size={14} className={incomeTrend < 0 ? 'rotate-180' : ''} />
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-slate-300 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Expenses</p>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1">
            <div className="flex items-baseline gap-1">
                <span className="text-2xl 2xl:text-3xl font-extrabold tracking-tight" title={`${expenses.toLocaleString()} đ`}>
                   {expenses.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-500">đ</span>
            </div>
            <span className={`font-bold text-sm flex items-center gap-1 whitespace-nowrap ${expenseTrend >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {expenseTrend > 0 ? '+' : ''}{expenseTrend}% 
              <TrendingUp size={14} className={expenseTrend < 0 ? 'rotate-180' : ''} />
            </span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-sky-600 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Savings</p>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1">
            <div className="flex items-baseline gap-1">
                <span className="text-2xl 2xl:text-3xl font-extrabold tracking-tight" title={`${netSavings.toLocaleString()} đ`}>
                   {netSavings.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-500">đ</span>
            </div>
            <span className={`font-bold text-sm flex items-center gap-1 whitespace-nowrap ${netSavings >= 0 ? 'text-sky-600' : 'text-red-600'}`}>
               <TrendingUp size={14} className={netSavings < 0 ? 'rotate-180' : ''} />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-12 gap-8 mb-12 px-4">
        
        {/* Category Velocity (Donut) */}
        <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold tracking-tight">Category Velocity</h3>
            <select className="bg-slate-100 border-none text-xs font-bold uppercase tracking-wider rounded px-3 py-1 ring-0 outline-none text-slate-600">
              <option>Current Month</option>
              <option>Previous Mth</option>
            </select>
          </div>
          
          <div className="flex items-center gap-12">
            {/* Recharts Pie Chart representation */}
            <div className="relative h-56 w-56 flex items-center justify-center">
                {expenses > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="text-slate-300 font-bold">No Expenses</div>
                )}
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center overflow-hidden">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Total Spend</span>
                  <span className="text-xl font-extrabold text-slate-900 truncate w-full" title={`${expenses.toLocaleString()} đ`}>
                    {formatCompactNumber(expenses)}
                  </span>
                </div>
            </div>

            {/* Legend Component */}
            <div className="flex-1 space-y-6">
               {pieData.length > 0 ? pieData.map((entry, idx) => (
                 <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                      <span className="font-semibold text-slate-800">{entry.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{((entry.value / expenses) * 100).toFixed(0)}%</span>
                 </div>
               )) : (
                 <div className="text-slate-400 italic">Add expenses to see categories...</div>
               )}
            </div>
          </div>
        </div>

        {/* Cash Flow Dynamics (Bar) */}
        <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-md shadow-sm">
          <h3 className="text-xl font-extrabold tracking-tight mb-10">Cash Flow Dynamics</h3>
          <div className="flex items-end justify-between h-56 gap-2 border-b border-slate-100 pb-2">
            
            {dynamicsData.map((data, idx) => (
               <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full">
                  <div className="w-full flex justify-center gap-[2px] items-end h-full">
                     <div 
                        className="w-4 bg-sky-700 rounded-t-sm transition-all group-hover:opacity-80" 
                        style={{ height: `${(data.inflow / maxDynamic) * 100}%`, minHeight: data.inflow > 0 ? '10px' : '0px' }}
                        title={`Inflow: ${data.inflow.toLocaleString()} đ`}
                     ></div>
                     <div 
                        className="w-4 bg-orange-600 rounded-t-sm transition-all group-hover:opacity-80" 
                        style={{ height: `${(data.outflow / maxDynamic) * 100}%`, minHeight: data.outflow > 0 ? '10px' : '0px' }}
                        title={`Outflow: ${data.outflow.toLocaleString()} đ`}
                     ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">{data.monthName}</span>
               </div>
            ))}
          </div>

          <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
             <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-700"></span> Inflow
             </div>
             <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-600"></span> Outflow
             </div>
          </div>
        </div>
      </div>

      {/* Spending Insights */}
      <section className="mb-12 px-4">
        <h3 className="text-xl font-extrabold tracking-tight mb-6">Spending Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-red-50 p-6 rounded-md relative overflow-hidden group border border-red-100/50">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all text-red-600">
               <AlertTriangle size={120} strokeWidth={1} />
             </div>
             <span className="inline-block bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm mb-3">Goal Warning</span>
             <h4 className="font-extrabold text-lg mb-2 text-slate-900">Savings Rate Low</h4>
             <p className="text-slate-600 text-sm leading-relaxed">Your target is {savingsGoal}%, but current month is at {savingsRate}%. Consider reviewing non-essential spending this week.</p>
          </div>

          <div className="bg-sky-50 p-6 rounded-md relative overflow-hidden group border border-sky-100/50">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all text-sky-700">
               <Zap size={120} strokeWidth={1} />
             </div>
             <span className="inline-block bg-sky-700 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm mb-3">Efficiency Gain</span>
             <h4 className="font-extrabold text-lg mb-2 text-slate-900">{topCats.length > 0 ? topCats[0][0] : 'Expense'} Insight</h4>
             <p className="text-slate-600 text-sm leading-relaxed">Your highest expense category accounts for {topCats.length > 0 && expenses > 0 ? ((topCats[0][1] / expenses) * 100).toFixed(0) : 0}% of all spending. Monitoring this helps retention.</p>
          </div>

          <div className="bg-orange-50 p-6 rounded-md relative overflow-hidden group border border-orange-100">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all text-orange-600">
               <Rocket size={120} strokeWidth={1} />
             </div>
             <span className="inline-block bg-orange-700 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm mb-3">Growth Opportunity</span>
             <h4 className="font-extrabold text-lg mb-2 text-slate-900">Available Surplus</h4>
             <p className="text-slate-600 text-sm leading-relaxed">You have generated {netSavings > 0 ? netSavings.toLocaleString() : 0} đ in net surplus this period. Allocate to a new goal to boost future returns.</p>
          </div>

        </div>
      </section>

      {/* Historical Performance Table */}
      <section className="mx-4 bg-white rounded-md shadow-sm overflow-hidden mb-12">
         <div className="p-8 border-b border-slate-100">
            <h3 className="text-xl font-extrabold tracking-tight">Historical Performance</h3>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Period</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Inflow</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Outflow</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Position</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {historyTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                         <td className="px-8 py-6 font-bold text-slate-900 whitespace-nowrap">{row.period}</td>
                         <td className="px-8 py-6 text-sm whitespace-nowrap">{row.inflow.toLocaleString()} đ</td>
                         <td className="px-8 py-6 text-sm text-slate-500 whitespace-nowrap">{row.outflow.toLocaleString()} đ</td>
                         <td className="px-8 py-6 text-sm font-bold text-right whitespace-nowrap">{row.net >= 0 ? '+' : ''}{row.net.toLocaleString()} đ</td>
                         <td className="px-8 py-6 text-right whitespace-nowrap">
                            <span className={`inline-block text-[10px] font-bold uppercase px-3 py-1 rounded-full ${row.statusColor}`}>
                               {row.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
         <div className="p-4 bg-slate-50 text-center">
            <button className="text-xs font-bold text-orange-700 uppercase tracking-widest hover:underline transition-all">
                View 12 Month Archive
            </button>
         </div>
      </section>

    </div>
  );
}
