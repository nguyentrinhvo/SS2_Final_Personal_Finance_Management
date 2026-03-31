import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  X,
  CreditCard,
  Briefcase,
  Target,
  Home,
  Car,
  Activity,
  Heart,
  Plane,
  Coins
} from 'lucide-react';

const GOAL_API = 'http://localhost:8080/api/goals';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    category: 'Lifestyle',
    deadline: '',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80'
  });

  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${GOAL_API}/user/${userId}`);
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch Goals Error:', err);
      toast.error('Failed to load goals');
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${GOAL_API}/user/${userId}`, {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0)
      });
      toast.success('Goal created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        category: 'Lifestyle',
        deadline: '',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80'
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleAddFunds = async (goalId) => {
    const amount = prompt('Enter amount to contribute:');
    if (!amount || isNaN(amount)) return;
    try {
      await axios.put(`${GOAL_API}/${goalId}/add/${amount}`);
      toast.success('Funds added!');
      fetchData();
    } catch (err) {
      toast.error('Failed to add funds');
    }
  };

  const getCategoryIcon = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('car') || c.includes('transport')) return <Car size={16} />;
    if (c.includes('home') || c.includes('prop')) return <Home size={16} />;
    if (c.includes('secure') || c.includes('emergency')) return <ShieldCheck size={16} />;
    if (c.includes('life') || c.includes('vacation')) return <Plane size={16} />;
    if (c.includes('health') || c.includes('wed')) return <Heart size={16} />;
    return <Target size={16} />;
  };

  const totalSavedValue = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const avgContribution = goals.length > 0 ? totalSavedValue / goals.length : 0; 

  return (
    <div className="max-w-[1200px] mx-auto w-full p-6 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Title & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Savings Goals</h1>
          <p className="text-slate-500 font-medium">Track and manage your long-term financial milestones</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 transition-all">
            <Download size={18} />
            <span className="hidden sm:inline">Export to Excel</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-xl shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Pulse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-600"></div>
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest">
            <Coins size={14} className="text-orange-600" />
            <span>Total Saved Assets</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-4xl font-black text-slate-900 dark:text-white">${totalSavedValue.toLocaleString()}</span>
             <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">USD</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full w-fit">
            <TrendingUp size={14} />
            <span>+5.2% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest">
            <Activity size={14} className="text-blue-600" />
            <span>Avg. Per Strategy</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-4xl font-black text-slate-900 dark:text-white">${Math.round(avgContribution).toLocaleString()}</span>
             <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">PER GOAL</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full w-fit">
            <Briefcase size={14} />
            <span>On track for all goals</span>
          </div>
        </div>
      </div>

      {/* Main Grid Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-200 px-2">Your Active Goals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map(goal => {
            const safeTarget = goal.targetAmount || 1;
            const progress = Math.min(100, (goal.currentAmount / safeTarget) * 100);
            
            return (
              <div 
                key={goal.goalId} 
                className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm p-6 space-y-6 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div 
                  className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-[32px] overflow-hidden relative shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
                >
                  {goal.imageUrl && goal.imageUrl.includes('http') ? (
                     <img src={goal.imageUrl} className="w-full h-full object-cover" alt={goal.name} />
                  ) : (
                     <div className="text-slate-300 dark:text-slate-700"><Target size={48} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-5 left-5 flex items-center gap-2">
                    <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl shadow-lg">
                      {goal.category || 'General'}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight group-hover:text-orange-600 transition-colors">
                        {goal.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Continuous'}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 p-2 rounded-2xl">
                       {getCategoryIcon(goal.category)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                          ${goal.currentAmount?.toLocaleString()}
                        </span>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Saved of ${goal.targetAmount?.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-lg font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-2xl">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 relative">
                       <div 
                         className="h-full bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all duration-1000 ease-out" 
                         style={{ width: `${progress}%` }}
                       ></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddFunds(goal.goalId)}
                    className="w-full py-5 bg-slate-50 dark:bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-3xl font-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm hover:shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Invest Now</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Creation Trigger Card */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="rounded-[40px] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-12 gap-8 group cursor-pointer hover:border-orange-200 dark:hover:border-orange-500/30 transition-all bg-slate-50/20 dark:bg-slate-800/20 min-h-[460px] animate-pulse hover:animate-none"
          >
            <div className="size-24 rounded-[32px] bg-white dark:bg-slate-900 text-slate-200 dark:text-slate-700 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <Plus size={48} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Initiate Global Asset</p>
              <p className="text-slate-400 text-sm font-medium max-w-[200px] mx-auto">Establish a new target for capital accumulation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Strategy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-800 relative">
             <div className="flex items-center justify-between p-12 pb-6">
               <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">New Strategy</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-12 pt-6 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Goal Name</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/10 text-lg transition-all"
                    placeholder="e.g. Real Estate Acquisition"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Target ($)</label>
                    <input 
                      type="number" required
                      value={formData.targetAmount}
                      onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Deadline</label>
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-6 py-5 font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Venture Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-5 font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="Lifestyle">Lifestyle / Travel</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Security">Emergency Fund</option>
                    <option value="Property">Real Estate</option>
                    <option value="Investment">Global Investment</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-orange-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-900/30 dark:shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-95 text-xl mt-6 uppercase tracking-widest"
                >
                  Deploy Strategy
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
