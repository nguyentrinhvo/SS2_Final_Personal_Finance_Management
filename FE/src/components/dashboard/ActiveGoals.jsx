import React from 'react';
import { Target, Plus, ArrowUpRight } from 'lucide-react';

export default function ActiveGoals({ goals = [] }) {
  return (
    <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex-1 space-y-5 animate-in fade-in duration-700 delay-300 hover:shadow-md transition-shadow duration-300 overflow-hidden relative h-fit">
      <div className="absolute -right-20 -top-20 size-60 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

      <div className="relative flex items-center justify-between">
        <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Milestones</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Savings Goals</p>
        </div>
        <button 
          onClick={() => window.location.href='/dashboard/goals'}
          className="p-3.5 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-2xl transition-all shadow-inner border border-slate-100 active:scale-90"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
      
      <div className="relative space-y-5 font-bold max-h-[220px] overflow-y-auto pr-2 py-1">
        {goals.map((goal) => {
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
        })}
        
        <button 
          onClick={() => window.location.href='/dashboard/goals'}
          className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all font-bold uppercase tracking-widest active:scale-95 shadow-sm group"
        >
          <Plus size={16} className="text-orange-500 group-hover:rotate-90 transition-transform" />
          <span className="text-[10px]">New Goal</span>
        </button>
      </div>
    </div>
  );
}
