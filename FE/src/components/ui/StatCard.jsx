import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, change, isPositive, icon: Icon, sparklineData }) => {
  const isZero = value === 0 || value === "0 đ" || value === "0.0 đ";
  
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('vi-VN') 
    : value;

  return (
    <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative h-fit">
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isPositive 
                ? 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' 
                : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
            }`}>
                <Icon size={14} strokeWidth={2.5} />
            </div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-slate-900 transition-colors line-clamp-1">{title}</h3>
          </div>
          {change && change !== "0" && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
              isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {isPositive ? '↑' : '↓'} {change}%
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
                 <div className="flex items-baseline gap-1 min-w-0">
                    <p className={`text-xl lg:text-2xl font-black tracking-normal transition-colors duration-300 truncate ${isZero ? 'text-slate-200' : 'text-slate-900'}`}>
                        {displayValue}
                    </p>
                    <span className="text-xs font-bold opacity-30 shrink-0">đ</span>
                 </div>
            
            {sparklineData && (
                <div className="h-8 w-16 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={isPositive ? '#16a34a' : '#dc2626'} 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
      </div>
      
      {/* Subtle background detail */}
      <div className={`absolute -right-6 -bottom-6 size-24 rounded-full opacity-[0.03] group-hover:scale-125 transition-transform duration-700 ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}></div>
    </div>
  );
};

export default StatCard;