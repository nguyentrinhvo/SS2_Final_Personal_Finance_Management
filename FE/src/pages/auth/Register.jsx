import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        fullName: fullname,
        username,
        email,
        password
      });
      localStorage.setItem('isDemoMode', 'false');
      toast.success('Registration successful! Please log in.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-[480px] w-full space-y-6 bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-orange-50 animate-in fade-in zoom-in duration-500 relative z-10">
        <button 
          onClick={() => navigate('/')}
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
            Register
          </h2>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullname" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
              <input
                id="fullname"
                type="text" required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input
                id="username"
                type="text" required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="johndoe123"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Email</label>
              <input
                id="email-address"
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                placeholder="name@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                <input
                  type="password" required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-[#a33900] hover:bg-[#c04a00] text-white text-sm font-black rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-orange-900/10 uppercase tracking-[0.2em]"
            >
              Register
            </button>
          </div>
        </form>

        <div className="text-center flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">
            <Link to="/login" className="text-[#a33900] hover:text-[#c04a00] transition-colors border-b-2 border-orange-100 pb-0.5">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
