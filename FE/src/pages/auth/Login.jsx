import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('fullName', response.data.fullName);
      localStorage.setItem('email', email);
      localStorage.setItem('avatarUrl', response.data.avatarUrl || '');
      localStorage.setItem('isDemoMode', 'false');
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-[440px] w-full space-y-6 bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-orange-50 animate-in fade-in zoom-in duration-500 relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-8 top-8 flex items-center gap-2 text-slate-400 hover:text-[#a33900] font-bold text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center pt-4">
          <div className="inline-flex p-4 bg-orange-50 rounded-2xl text-[#a33900] mb-4">
            <span className="text-2xl font-black">F.</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">
            Secure Protocol Access
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-address" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" name="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-[#a33900] hover:bg-[#c04a00] text-white text-sm font-black rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-orange-900/10 uppercase tracking-[0.2em]"
            >
              Initialize Login
            </button>
          </div>
        </form>

        <div className="text-center flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Verification</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">
            New here?{' '}
            <Link to="/register" className="text-[#a33900] hover:text-[#c04a00] transition-colors border-b-2 border-orange-100 pb-0.5">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
