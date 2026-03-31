import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import SpendingTrendChart from '../../components/dashboard/SpendingTrendChart';
import ActiveGoals from '../../components/dashboard/ActiveGoals';
import TransactionTable from '../../components/dashboard/TransactionTable';

const Home = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      {/* Stats Summary */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          title="Total Balance"
          value="$45,280.00"
          change="2.5"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Monthly Income"
          value="$6,200.00"
          change="1.2"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Expenses"
          value="$3,450.00"
          change="5.4"
          isPositive={false}
          icon={TrendingDown}
        />
      </div>

      {/* Main Charts & Goals Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex">
          <SpendingTrendChart />
        </div>
        <div className="flex">
          <ActiveGoals />
        </div>
      </div>

      {/* Transaction Table Section */}
      <TransactionTable />
    </div>
  );
};

export default Home;