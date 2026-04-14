import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const CAT_API = 'http://localhost:8080/api/categories';
const TRX_API = 'http://localhost:8080/api/transactions';
const ACC_API = 'http://localhost:8080/api/accounts';

export default function Reports() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [catRes, trxRes, accRes] = await Promise.all([
        axios.get(`${CAT_API}/user/${userId}`),
        axios.get(`${TRX_API}/user/${userId}/all`),
        axios.get(`${ACC_API}/user/${userId}`)
      ]);
      setCategories(catRes.data);
      setTransactions(trxRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      toast.error('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Aggregate data for bar chart (Income vs Expense per Month)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barData = months.map((month, index) => {
    const monthTrxs = transactions.filter(t => new Date(t.transactionDate).getMonth() === index);
    const income = monthTrxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = monthTrxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
    return { name: month, income, expense };
  }).filter(d => d.income > 0 || d.expense > 0);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600 uppercase tracking-widest">Generating Analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-20 printable-area">
      
      <section className="flex justify-end no-print">
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white font-black px-12 py-5 rounded-[24px] shadow-2xl shadow-slate-900/30 flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group shrink-0"
          >
            <FileText size={24} className="group-hover:rotate-12 transition-transform" />
            <span>Generate PDF</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-10">
        {/* Income vs Expenses Bar Chart */}
        <div className="col-span-12 bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-10 group hover:shadow-2xl transition-all duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900">Income vs Expenses</h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-orange-600"></div><span className="text-[10px] font-black text-slate-400 capitalize">Expense</span></div>
               <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-slate-800"></div><span className="text-[10px] font-black text-slate-400 capitalize">Income</span></div>
            </div>
          </div>
          <div className="h-[500px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                   <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                   <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', background: '#221610', color: '#fff'}}
                     formatter={(value) => [`${value?.toLocaleString()} đ`]}
                   />
                   <Bar dataKey="expense" fill="#ea580c" radius={[12, 12, 12, 12]} barSize={32} />
                   <Bar dataKey="income" fill="#1e293b" radius={[12, 12, 12, 12]} barSize={32} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
