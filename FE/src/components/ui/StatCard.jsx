import React from 'react';

export default function StatCard({ title, value, change, isPositive, icon: Icon }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
      <div className="space-y-3">
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-[34px] font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        <div className="pt-2 flex items-center gap-2">
          <span className={`text-sm font-black flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : '-'}{change}%
          </span>
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">vs. last month</span>
        </div>
      </div>
      <div className="bg-[#FFF4ED] p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
        <Icon size={24} className="text-orange-600" />
      </div>
    </div>
  );
}