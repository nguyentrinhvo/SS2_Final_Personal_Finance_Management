import React from 'react';
import { ShoppingBag, Laptop, Coffee, Info, ArrowRight, TrendingUp, TrendingDown, Calendar, ArrowRightLeft, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionTable({ transactions = [] }) {
  
  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["Name", "Category", "Date", "Account", "Amount", "Type"];
    const csvRows = transactions.map(t => [
      t.note || 'No Description',
      t.category?.name || 'Uncategorized',
      new Date(t.transactionDate).toLocaleDateString(),
      t.account?.accountName || 'Unknown',
      t.amount,
      t.type
    ].join(","));
    
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `FinFlow-Transactions-${new Date().toLocaleDateString()}.csv`);
    a.click();
    toast.success("CSV ready for download");
  };

  return (
    <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-700 hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Activities</h3>
          <span className="bg-slate-50 text-[9px] text-slate-400 font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-100">{transactions.length} ITEMS</span>
        </div>
        <button 
          onClick={handleExport}
          className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <FileSpreadsheet size={14} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="text-left text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
              <th className="py-4 pb-6 px-4">Transaction Details</th>
              <th className="py-4 pb-6 px-4">Category</th>
              <th className="py-4 pb-6 px-4 text-right pr-6">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length > 0 ? transactions.map((t) => (
              <tr key={t.transactionId} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl shadow-sm transition-all duration-500 ${t.type === 'INCOME' ? 'bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white'}`}>
                      {t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-slate-900 text-base tracking-tight group-hover:text-orange-600 transition-colors break-words whitespace-pre-wrap max-w-xs">{t.note || 'No Description'}</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          <Calendar size={10} className="text-slate-300" />
                          {new Date(t.transactionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest transition-colors group-hover:bg-white group-hover:text-orange-600 whitespace-nowrap">{t.category?.name || 'Uncategorized'}</span>
                </td>
                <td className={`py-4 px-4 text-right font-black text-lg tracking-tighter whitespace-nowrap pr-6 ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{t.amount?.toLocaleString()} <span className="text-xs font-bold opacity-30">đ</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4"><ArrowRightLeft size={32} /></div>
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.4em] italic leading-none">No Financial Ghost</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
