import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Login = () => {
  const [step, setStep] = useState('CREDENTIALS'); // 'CREDENTIALS' or 'OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.requires2FA) {
         setStep('OTP');
         setSuccessMsg('2FA code successfully emailed to your inbox.');
      } else if (response.data.success) {
         // Fallback if 2FA wasn't applied
         login(response.data.user, response.data.token);
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       const response = await axios.post(`${API_BASE_URL}/auth/verify-2fa`, {
          email,
          otpCode
       });

       if (response.data.success) {
          login(response.data.user, response.data.token);
          navigate('/dashboard');
       }
     } catch (err) {
       setError(err.response?.data?.message || 'Invalid or expired 2FA code');
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
               {step === 'OTP' ? 'Security Verification' : 'Ultra Enterprise'}
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
               {step === 'OTP' ? 'Please enter the 6-digit code sent to your email' : 'Please sign in to access your dashboard'}
            </p>
          </div>

          {step === 'CREDENTIALS' ? (
             <form onSubmit={handleCredentialsSubmit} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                     placeholder="admin@school.com"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                     placeholder="••••••••"
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
                 className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {loading && <Loader2 className="animate-spin" size={18} />}
                 {loading ? 'Authenticating...' : 'Sign In'}
               </button>
             </form>
          ) : (
             <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Authentication Code</label>
                 <input 
                   type="text" 
                   required
                   maxLength={6}
                   value={otpCode}
                   onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Numeric only
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300"
                   placeholder="000000"
                 />
               </div>

               {successMsg && !error && (
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 text-center">
                   {successMsg}
                 </div>
               )}

               {error && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 text-center animate-in shake duration-300">
                   {error}
                 </div>
               )}

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-4 bg-slate-900 dark:bg-slate-950 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {loading && <Loader2 className="animate-spin" size={18} />}
                 {loading ? 'Verifying...' : 'Unlock Dashboard'}
               </button>

               <button 
                  type="button"
                  onClick={() => { setStep('CREDENTIALS'); setOtpCode(''); setError(''); }}
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400 transition-colors"
               >
                  ← Back to Login
               </button>
             </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Are you a Parent? <Link to="/register-parent" className="text-pink-600 font-bold hover:underline cursor-pointer">Join Parent Portal</Link>
            </p>
            <p className="text-xs text-slate-400 font-medium mt-2">
              Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline cursor-pointer">Register School</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

