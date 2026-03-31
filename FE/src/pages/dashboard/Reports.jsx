import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Activity,
  Calculator
} from 'lucide-react';

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';

export default function Reports() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [catRes, trxRes] = await Promise.all([
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`)
      ]);
      setCategories(catRes.data);
      setTransactions(trxRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Aggregate data for bar chart (Income vs Expense)
  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += (t.amount || 0);
    else acc.expense += (t.amount || 0);
    return acc;
  }, { income: 0, expense: 0 });

  const summaryData = [
    { name: 'Income', value: totals.income, color: '#10b981' },
    { name: 'Expense', value: totals.expense, color: '#f43f5e' }
  ];

  // Aggregate spending by category for pie chart
  const categorySpending = categories
    .filter(c => c.type === 'EXPENSE')
    .map(cat => {
      const spent = transactions
        .filter(t => t.category?.categoryId === cat.categoryId)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return { 
        name: cat.name, 
        value: spent 
      };
    })
    .filter(c => c.value > 0);

  const COLORS = ['#ea580c', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

  return (
    <div className="max-w-[1400px] mx-auto w-full p-10 space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] ml-1">Precision Analytics</p>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">Financial Reports</h1>
          <p className="text-slate-500 max-w-lg text-lg font-medium">Deep-dive into your spending patterns and capital flows.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <Download size={20} />
            <span>Generate PDF</span>
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm space-y-2 group hover:shadow-xl transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Cash Flow</p>
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-slate-900">${(totals.income - totals.expense).toLocaleString()}</span>
             <TrendingUp className="text-green-500" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm space-y-2 group hover:shadow-xl transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Burn Rate</p>
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-slate-900">82%</span>
             <TrendingUp className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm space-y-2 group hover:shadow-xl transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Transaction</p>
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-slate-900">${(totals.expense / (transactions.length || 1)).toFixed(2)}</span>
             <Activity className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm space-y-2 group hover:shadow-xl transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Categories</p>
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-slate-900">{categories.length}</span>
             <Calculator className="text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Main Charts */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
           <div className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-800">Income vs Expenses</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-[#10b981] rounded-full"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-[#f43f5e] rounded-full"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontWeight: 800 }} />
                    <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={80}>
                      {summaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
           <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl h-full flex flex-col justify-between">
              <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-4">Spending Structure</h3>
              <p className="text-slate-400 font-medium text-sm mb-8">Asset distribution across core categories this month.</p>
              
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-8">
                 {categorySpending.map((entry, index) => (
                   <div key={entry.name} className="flex items-center gap-2">
                     <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase truncate">{entry.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
