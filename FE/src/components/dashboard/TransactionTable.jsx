import React from 'react';
import { ShoppingBag, Laptop, Coffee } from 'lucide-react';

const mockTransactions = [
  { id: 1, name: 'Apple Store', category: 'Electronics', date: 'Jun 12, 2024', account: 'Chase Visa ...4221', amount: -1299.00, icon: Laptop, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { id: 2, name: 'Company Payroll', category: 'Salary', date: 'Jun 10, 2024', account: 'WF Checking ...8812', amount: 5400.00, iconBg: 'bg-green-50', iconColor: 'text-green-500' },
  { id: 3, name: 'The Green Bistro', category: 'Dining Out', date: 'Jun 09, 2024', account: 'Chase Visa ...4221', amount: -64.50, icon: Coffee, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
];

export default function TransactionTable() {
  return (
    <div className="bg-white p-10 rounded-[32px] border border-slate-50 shadow-sm overflow-hidden animate-in fade-in duration-700 delay-200">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Recent Transactions</h3>
        <button className="bg-[#FFF4ED] text-orange-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-orange-100 transition-all shadow-sm shadow-orange-500/5">
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left bg-slate-50/70">
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="py-4 px-6 rounded-l-2xl">Transaction</th>
              <th className="py-4 px-2">Category</th>
              <th className="py-4 px-2">Date</th>
              <th className="py-4 px-2">Account</th>
              <th className="py-4 px-6 text-right rounded-r-2xl">Amount</th>
            </tr>
          </thead>
          <tbody className="">
            {mockTransactions.map((tx) => {
              const Icon = tx.icon || ShoppingBag;
              return (
                <tr key={tx.id} className="group hover:bg-slate-50/30 transition-all cursor-pointer border-b border-slate-50/50 last:border-0">
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-5">
                      <div className={`${tx.iconBg} ${tx.iconColor} p-3 rounded-2xl shadow-sm`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-extrabold text-slate-700 text-[15px] group-hover:text-orange-600 transition-colors">{tx.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-2 text-sm font-bold text-slate-400">{tx.category}</td>
                  <td className="py-6 px-2 text-sm font-bold text-slate-400">{tx.date}</td>
                  <td className="py-6 px-2 text-sm font-bold text-slate-400">{tx.account}</td>
                  <td className={`py-6 px-6 text-right font-black text-[15px] ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
