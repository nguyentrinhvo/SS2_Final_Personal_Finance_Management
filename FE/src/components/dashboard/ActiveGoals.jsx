import React from 'react';
import { Target, Plus, ArrowUpRight } from 'lucide-react';

export default function ActiveGoals({ goals = [] }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex-1 space-y-10 animate-in fade-in duration-700 delay-300 hover:shadow-xl transition-shadow duration-500 overflow-hidden relative">
      <div className="absolute -right-20 -top-20 size-60 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Savings Milestones</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Financial Ambitions</p>
        </div>
        <button 
          onClick={() => window.location.href='/dashboard/goals'}
          className="p-3.5 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-2xl transition-all shadow-inner border border-slate-100 active:scale-90"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
      
      <div className="relative space-y-8 font-bold">
        {goals.length > 0 ? goals.map((goal) => {
          const progress = Math.min(100, (goal.currentAmount / (goal.targetAmount || 1)) * 100);
          return (
            <div key={goal.goalId} className="group cursor-pointer space-y-4">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                   <div className="size-2.5 bg-orange-600 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
                   <span className="font-black text-slate-800 text-lg tracking-tight group-hover:text-orange-600 transition-colors uppercase truncate max-w-[150px]">{goal.name}</span>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100 shadow-inner p-0.5">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,88,12,0.3)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-baseline px-1 text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">
                    {goal.currentAmount?.toLocaleString()} <span className="text-[8px] opacity-40 ml-0.5">đ</span>
                </span>
                <span className="text-slate-300">
                    Peak: {goal.targetAmount?.toLocaleString()} <span className="text-[8px] opacity-40 ml-0.5">đ</span>
                </span>
              </div>
            </div>
          );
        }) : (
            <div className="py-16 text-center space-y-4 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[32px]">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-sm"><Target size={24} /></div>
                <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.4em] italic mb-2">No Active Milestones</p>
            </div>
        )}
        
        <button 
          onClick={() => window.location.href='/dashboard/goals'}
          className="w-full mt-2 flex items-center justify-center gap-3 py-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400 hover:text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all font-black uppercase tracking-widest active:scale-95 shadow-sm shadow-slate-100 hover:shadow-xl hover:shadow-orange-100 group"
        >
          <Plus size={20} className="text-orange-500 group-hover:rotate-90 transition-transform" />
          <span className="text-xs">Establish New Goal</span>
        </button>
      </div>
    </div>
  );
}
