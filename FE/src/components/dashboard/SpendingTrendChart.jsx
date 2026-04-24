import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SpendingTrendChart({ transactions = [] }) {
  // Aggregate data by month for the chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((month, index) => {
    const spending = transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.transactionDate).getMonth() === index)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return { name: month, spending };
  });

  // Only show the last 6 months or current year
  const currentMonth = new Date().getMonth();
  const displayData = chartData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  return (
    <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm flex-1 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Spending Trend</h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-100">Trend Analysis</span>
      </div>
      <div className="h-60 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f8fafc" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}}
                dy={20}
            />
            <Tooltip 
                cursor={{ stroke: '#ea580c', strokeWidth: 2, strokeDasharray: '5 5' }}
                contentStyle={{ 
                  borderRadius: '32px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                  padding: '20px',
                  background: '#221610',
                  color: '#fff'
                }}
                itemStyle={{ color: '#ea580c', fontWeight: 900, fontSize: '18px' }}
                labelStyle={{ color: '#64748b', fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                formatter={(value) => [`${value?.toLocaleString()} đ`, 'Inbound Flux']}
            />
            <Area 
                type="monotone" 
                dataKey="spending" 
                stroke="#ea580c" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorSpending)" 
                animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
