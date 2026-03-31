import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', spending: 4000 },
  { name: 'Feb', spending: 3000 },
  { name: 'Mar', spending: 2000 },
  { name: 'Apr', spending: 2780 },
  { name: 'May', spending: 1890 },
  { name: 'Jun', spending: 2390 },
  { name: 'Jul', spending: 3490 },
];

export default function SpendingTrendChart() {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Spending Trend</h3>
        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">Last 6 Months</span>
      </div>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}}
                dy={10}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
                type="monotone" 
                dataKey="spending" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpending)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
