import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, ShieldCheck, Heart } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ParentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    schoolId: '' // The parent needs to enter the school code provided by the school
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register-user`, {
        ...formData,
        role: 'PARENT'
      });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Guardian registration failed. Check your School ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
             <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6 border border-pink-100">
               <Heart size={32} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Parent Portal Signup</h1>
             <p className="text-sm text-slate-400 mt-2 font-medium">Link your account to your children's records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guardian Full Name</label>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   type="text" 
                   name="name"
                   required
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                   placeholder="e.g. Manisha Upadhyay"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   type="email" 
                   name="email"
                   required
                   value={formData.email}
                   onChange={handleChange}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                   placeholder="Use the email provided to the school"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institution ID (School Code)</label>
               <div className="relative">
                 <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   type="text" 
                   name="schoolId"
                   required
                   value={formData.schoolId}
                   onChange={handleChange}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                   placeholder="Paste the unique School ID here"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   type="password" 
                   name="password"
                   required
                   value={formData.password}
                   onChange={handleChange}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                   placeholder="Minimum 6 characters"
                   minLength={6}
                 />
               </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 animate-in shake duration-300">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? 'Verifying Institution Link...' : 'Link My Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50 text-center flex flex-col gap-3">
            <p className="text-xs text-slate-400 font-medium">
              Are you a School Administrator? <Link to="/register" className="text-indigo-600 font-bold hover:underline cursor-pointer">Register Institution</Link>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Already have an account? <Link to="/login" className="text-slate-600 dark:text-slate-400 font-bold hover:underline cursor-pointer">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentRegister;
