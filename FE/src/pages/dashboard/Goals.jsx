import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Target, Plus, X, Trash2, Edit2, TrendingUp, Camera, Wallet, Check, RotateCcw } from 'lucide-react';
import { MOCK_DATA } from '../../utils/mockData';

const GOAL_API = 'http://localhost:8080/api/goals';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFundInput, setShowFundInput] = useState(null);
    const [fundAmount, setFundAmount] = useState('');
    const [fundMode, setFundMode] = useState('ADD');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [formData, setFormData] = useState({ 
        name: '', 
        targetAmount: '', 
        currentAmount: '0', 
        category: 'SAVINGS',
        imageUrl: ''
    });
    
    const userId = localStorage.getItem('userId');

    // Helper to format string with dots for UI
    const formatDisplay = (val) => {
        if (!val) return '';
        const num = val.toString().replace(/\D/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Helper to clean dots before saving/calculating
    const cleanNum = (val) => {
        return val.toString().replace(/\./g, '');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        setIsUploading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/files/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, imageUrl: res.data.url });
            toast.success('Image uploaded!');
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const fetchGoals = async () => {
        const isDemo = localStorage.getItem('isDemoMode') === 'true';
        if (isDemo) {
            setGoals(MOCK_DATA.goals);
            setLoading(false);
            return;
        }

        if (!userId) return;
        try {
            const response = await axios.get(`${GOAL_API}/user/${userId}`);
            setGoals(response.data || []);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();

        const handleRefresh = () => {
            fetchGoals();
        };

        window.addEventListener('transactionRefresh', handleRefresh);
        return () => window.removeEventListener('transactionRefresh', handleRefresh);
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                targetAmount: parseFloat(cleanNum(formData.targetAmount)),
                currentAmount: parseFloat(cleanNum(formData.currentAmount))
            };
            if (isEditMode) {
                await axios.put(`${GOAL_API}/${editingGoalId}`, payload);
            } else {
                await axios.post(`${GOAL_API}/user/${userId}`, payload);
            }
            setIsModalOpen(false);
            resetForm();
            fetchGoals();
            window.dispatchEvent(new Event('transactionRefresh'));
            toast.success(isEditMode ? 'Updated' : 'Created');
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', targetAmount: '', currentAmount: '0', category: 'SAVINGS', imageUrl: '' });
        setIsEditMode(false);
        setEditingGoalId(null);
    };

    const handleEditClick = (goal) => {
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount.toString(),
            currentAmount: goal.currentAmount.toString(),
            category: goal.category,
            imageUrl: goal.imageUrl || ''
        });
        setEditingGoalId(goal.goalId);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleFundUpdate = async (goalId, amount, isSubtract = false) => {
        let value = parseFloat(cleanNum(amount) || 0);
        if (isNaN(value) || value <= 0) {
            toast.error('Invalid amount');
            return;
        }
        if (isSubtract) value = -value;

        try {
            await axios.put(`${GOAL_API}/${goalId}/add/${value}`);
            toast.success('Funds updated');
            setShowFundInput(null);
            setFundAmount('');
            fetchGoals();
            window.dispatchEvent(new Event('transactionRefresh'));
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this goal?')) return;
        try {
            await axios.delete(`${GOAL_API}/${id}`);
            toast.success('Removed');
            fetchGoals();
            window.dispatchEvent(new Event('transactionRefresh'));
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleComplete = async (id, name) => {
        try {
            await axios.delete(`${GOAL_API}/${id}`);
            toast.success(`🎉 "${name}" completed! Congratulations!`, { duration: 4000 });
            fetchGoals();
            window.dispatchEvent(new Event('transactionRefresh'));
        } catch (error) {
            toast.error('Failed to complete goal');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-orange-600 animate-pulse uppercase tracking-widest text-xs">Syncing Goals...</p>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
            <div className="flex justify-between items-center gap-4 px-4">
                <div className="space-y-0.5">
                   <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Goals</h2>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Achieve Your Dreams</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all text-xs uppercase tracking-widest"
                >
                    <Plus size={16} />
                    <span>Add Goal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {goals.length > 0 ? goals.map(goal => {
                    const progress = Math.min(100, Math.max(0, (goal.currentAmount / (goal.targetAmount || 1)) * 100));
                    const isComplete = progress >= 100;

                    return (
                        <div key={goal.goalId} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group h-fit relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {goal.imageUrl ? (
                                        <div className="size-11 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                            <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                            <Target size={18} />
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none truncate max-w-[120px]">{goal.name}</h3>
                                            {isComplete && <Check size={14} className="text-green-500" />}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{goal.category}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(goal)} className="p-1.5 text-slate-300 hover:text-orange-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(goal.goalId)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Goal</p>
                                        <p className="text-base font-black text-slate-800 tracking-tight">
                                            {goal.targetAmount?.toLocaleString('vi-VN')} <span className="text-[10px] opacity-30">đ</span>
                                        </p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Total Saved</p>
                                        <p className="text-base font-black text-orange-600 tracking-tight">
                                            {goal.currentAmount?.toLocaleString('vi-VN')} <span className="text-[10px] opacity-30">đ</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-orange-600'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                        <span className={isComplete ? 'text-green-600' : 'text-orange-600'}>{Math.round(progress)}% Achieved</span>
                                        <span className="text-slate-300">{isComplete ? 'Complete' : 'Growing'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50">
                                {isComplete ? (
                                    <button 
                                        onClick={() => handleComplete(goal.goalId, goal.name)}
                                        className="w-full py-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Check size={14} /> Finish Objective
                                    </button>
                                ) : showFundInput === goal.goalId ? (
                                    <div className="space-y-3 pt-1">
                                        <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                                            <button onClick={() => setFundMode('ADD')} className={`flex-1 py-1 font-bold text-[8px] uppercase tracking-widest rounded-md transition-all ${fundMode === 'ADD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Add</button>
                                            <button onClick={() => setFundMode('SUBTRACT')} className={`flex-1 py-1 font-bold text-[8px] uppercase tracking-widest rounded-md transition-all ${fundMode === 'SUBTRACT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Withdraw</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" autoFocus placeholder="0"
                                                value={formatDisplay(fundAmount)} 
                                                onChange={e => setFundAmount(cleanNum(e.target.value))}
                                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-900 text-sm outline-none placeholder:text-slate-200"
                                            />
                                            <button 
                                                onClick={() => handleFundUpdate(goal.goalId, fundAmount, fundMode === 'SUBTRACT')} 
                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest"
                                            >
                                                Save
                                            </button>
                                            <button onClick={() => setShowFundInput(null)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setShowFundInput(goal.goalId); setFundMode('ADD'); }}
                                        className="w-full py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all"
                                    >
                                        Manage Funds
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-16 text-center space-y-3 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <Target size={24} className="mx-auto text-slate-200" />
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Dream it. Plan it. Do it.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[500] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="p-6 pb-4 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">{isEditMode ? 'Update' : 'New'} Dream</h3>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-1 px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" placeholder="e.g. Dream House" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target (đ)</label>
                                    <input 
                                        type="text" required 
                                        value={formatDisplay(formData.targetAmount)} 
                                        onChange={e => setFormData({...formData, targetAmount: cleanNum(e.target.value)})} 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current (đ)</label>
                                    <input 
                                        type="text" required 
                                        value={formatDisplay(formData.currentAmount)} 
                                        onChange={e => setFormData({...formData, currentAmount: cleanNum(e.target.value)})} 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Inspiration</label>
                                <div className="flex gap-4">
                                    <div className="relative w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                                        {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Plus size={20} className="text-slate-300" />}
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <input type="text" placeholder="Or URL..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-xs" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs mt-4">
                                {isEditMode ? 'Update Objective' : 'Commit Objective'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
