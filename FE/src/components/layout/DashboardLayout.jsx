import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/SideBar';
import Navbar from '../common/Navbar';   
import FloatingChatbot from '../chat/FloatingChatbot';

const DashboardLayout = () => {
  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [window.location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Desktop (hidden on mobile) */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] animate-in slide-in-from-left duration-300">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-5 lg:p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
        
        <FloatingChatbot />
      </div>
    </div>
  );
};

export default DashboardLayout;