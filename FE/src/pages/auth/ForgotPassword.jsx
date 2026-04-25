import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', {
        email,
        newPassword
      });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-[440px] w-full space-y-6 bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-orange-50 animate-in fade-in zoom-in duration-500 relative z-10">
        <button 
          onClick={() => navigate('/login')}
          className="absolute left-8 top-8 flex items-center gap-2 text-slate-400 hover:text-[#a33900] font-bold text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center pt-4">
          <div className="inline-flex p-4 bg-orange-50 rounded-2xl text-[#a33900] mb-4">
            <span className="text-2xl font-black">FinFlow</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Reset Password
          </h2>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Recovery Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" name="new-password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" name="confirm-password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 bg-[#a33900] hover:bg-[#c04a00] text-white text-sm font-black rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-orange-900/10 uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
