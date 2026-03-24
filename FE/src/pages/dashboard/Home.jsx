// src/pages/dashboard/Home.jsx
import StatCard from '../../components/ui/StatCard';

const Home = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Chào buổi sáng, Tú!</h2>
        <p className="text-gray-500">Đây là tình hình tài chính của bạn hôm nay.</p>
      </header>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Tổng số dư" value="45,000,000đ" color="text-blue-600" />
        <StatCard title="Thu nhập (Tháng)" value="+12,500,000đ" color="text-green-600" />
        <StatCard title="Chi tiêu (Tháng)" value="-8,200,000đ" color="text-red-600" />
      </div>

      {/* Khu vực biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex items-center justify-center">
          <p className="text-gray-400 italic">[Biểu đồ thu chi hàng tuần]</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex items-center justify-center">
          <p className="text-gray-400 italic">[Phân bổ chi tiêu theo hạng mục]</p>
        </div>
      </div>
    </div>
  );
};

export default Home;