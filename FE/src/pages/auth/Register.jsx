import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [fullname, setFullname] = useState('');
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
        email,
        password
      });
      toast.success('Registration successful! Please log in.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E293B] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[480px] w-full space-y-6 bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-slate-800 tracking-tight">
            Register
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Start your financial management journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">Full Name</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-400 text-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">Email Address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-400 text-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white sm:text-sm"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" name="password" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-400 text-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" name="confirm-password" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-400 text-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-sm text-slate-400 font-medium">Or</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <p className="text-sm text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Log in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
