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
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-700 hover:shadow-xl transition-shadow duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Recent Activities</h3>
          <span className="bg-slate-50 text-[9px] text-slate-500 font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-100">{transactions.length} ITEMS</span>
        </div>
        <button 
          onClick={handleExport}
          className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-[1.03] transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto -mx-8 px-8">
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
                <td className="py-6 px-4">
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
                <td className="py-6 px-4">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest transition-colors group-hover:bg-white group-hover:text-orange-600 whitespace-nowrap">{t.category?.name || 'Uncategorized'}</span>
                </td>
                <td className={`py-6 px-4 text-right font-black text-lg tracking-tighter whitespace-nowrap pr-6 ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
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
