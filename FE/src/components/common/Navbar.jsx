import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      {/* Search Bar - Phía bên trái */}
      <div className="relative w-96 hidden md:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Tìm kiếm giao dịch, báo cáo..." 
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
        />
      </div>

      {/* Profile & Notifications - Phía bên phải */}
      <div className="flex items-center gap-5">
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-gray-100 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Minh Tú</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Gói Premium</p>
          </div>
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Minh+Tu&background=2563eb&color=fff" 
              className="w-9 h-9 rounded-xl object-cover shadow-sm" 
              alt="avatar" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}