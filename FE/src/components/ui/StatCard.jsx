import React from 'react';

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => {
  // Check if value is zero or contains only zero-like data (e.g. "0 đ")
  const isZero = value === 0 || value === "0 đ" || value === "0.0 đ";
  
  // Format currency consistently
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('vi-VN') 
    : value;

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 group overflow-hidden relative">
      <div className="absolute -right-20 -bottom-20 size-60 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
      
      <div className="relative space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${isPositive ? 'bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white'}`}>
                <Icon size={20} strokeWidth={3} />
            </div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">{title}</h3>
          </div>
          {change !== "0" && (
            <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}%
            </div>
          )}
        </div>

        <div className="space-y-1 pl-1">
          <p className={`text-3xl lg:text-4xl font-black tracking-tighter transition-colors duration-500 ${isZero ? 'text-slate-200' : 'text-slate-900'}`}>
            {displayValue} <span className="text-xl font-bold ml-0.5 opacity-30">đ</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;