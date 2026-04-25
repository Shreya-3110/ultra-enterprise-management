import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, Building2, User, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Register = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    adminName: '',
    email: '',
    password: ''
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
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);

      if (response.data.success) {
        // Automatically log the user in dynamically
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
             <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
               <Building2 size={32} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Onboard Institution</h1>
             <p className="text-sm text-slate-400 mt-2 font-medium">Create your multi-tenant Ultra Enterprise workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
               <div className="relative">
                 <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   type="text" 
                   name="schoolName"
                   required
                   value={formData.schoolName}
                   onChange={handleChange}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 focus:bg-white transition-all text-slate-700"
                   placeholder="e.g. Stanford University"
                 />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2 sm:col-span-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="text" 
                     name="adminName"
                     required
                     value={formData.adminName}
                     onChange={handleChange}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 focus:bg-white transition-all text-slate-700"
                     placeholder="John Doe"
                   />
                 </div>
               </div>

               <div className="space-y-2 col-span-2 sm:col-span-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="email" 
                     name="email"
                     required
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 focus:bg-white transition-all text-slate-700"
                     placeholder="admin@school.com"
                   />
                 </div>
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
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 focus:bg-white transition-all text-slate-700"
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
              className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? 'Provisioning Initial Infrastructure...' : 'Deploy Workspace'}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium mt-3 flex items-center justify-center gap-1">
               <ShieldCheck size={12} /> Protected by AES-256 Encryption & Global Load Balancing
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an enterprise deployed? <Link to="/login" className="text-indigo-600 font-bold hover:underline cursor-pointer">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
