import React from 'react';

const mockGoals = [
  { id: 1, name: 'New Car', progress: 75, target: 20000, current: 15000, color: 'bg-orange-500' },
  { id: 2, name: 'Emergency Fund', progress: 42, target: 10000, current: 4200, color: 'bg-orange-400' },
  { id: 3, name: 'Summer Trip', progress: 90, target: 3000, current: 2700, color: 'bg-orange-600' },
];

export default function ActiveGoals() {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Active Goals</h3>
        <button className="text-orange-600 font-bold hover:underline transition-all text-sm">View All</button>
      </div>
      <div className="space-y-8">
        {mockGoals.map((goal) => (
          <div key={goal.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-700">{goal.name}</span>
              <span className="text-sm font-bold text-slate-400">{goal.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`${goal.color} h-full transition-all duration-500`} 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-xs font-bold text-slate-300">
              <span>${goal.current.toLocaleString()}/${goal.target.toLocaleString()}</span>
            </div>
          </div>
        ))}
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-100 rounded-[20px] text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all font-bold">
          <span className="text-lg">+</span> New Goal
        </button>
      </div>
    </div>
  );
}
