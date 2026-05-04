import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Heart, 
  Search, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ParentRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    schoolId: '',
    schoolName: '',
    childDetails: {
      firstName: '',
      lastName: '',
      currentClass: '',
      section: 'A'
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Debounced school search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/schools/search?q=${searchTerm}`);
          setSearchResults(res.data.data);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

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
      setError(err.response?.data?.message || 'Onboarding failed. Please check your inputs.');
      setStep(1); // Go back to start on fatal error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name.startsWith('child.')) {
      const field = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        childDetails: { ...formData.childDetails, [field]: e.target.value }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const selectSchool = (school) => {
    setFormData({ ...formData, schoolId: school._id, schoolName: school.name });
    setSearchTerm(school.name);
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 flex">
           <div className={`h-full bg-pink-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>

        <div className="p-10 pt-12">
          <div className="flex flex-col items-center text-center mb-10">
             <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-600 mb-6 border border-pink-100 dark:border-pink-500/20">
               {step === 1 ? <User size={32} /> : step === 2 ? <Building2 size={32} /> : <GraduationCap size={32} />}
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
               {step === 1 ? 'Create Your Account' : step === 2 ? 'Find Your School' : 'Admit Your Child'}
             </h1>
             <p className="text-sm text-slate-400 mt-2 font-medium">
               {step === 1 ? 'Step 1 of 3: Guardian Details' : step === 2 ? 'Step 2 of 3: Institution Link' : 'Step 3 of 3: Student Information'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Guardian Details */}
            {step === 1 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       type="text" 
                       name="name"
                       required
                       value={formData.name}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-100"
                       placeholder="e.g. Rahul Sharma"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       type="email" 
                       name="email"
                       required
                       value={formData.email}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-100"
                       placeholder="you@example.com"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       type="password" 
                       name="password"
                       required
                       value={formData.password}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-100"
                       placeholder="••••••••"
                       minLength={6}
                     />
                   </div>
                </div>
              </div>
            )}

            {/* Step 2: School Selection */}
            {step === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Your School</label>
                   <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       type="text" 
                       autoFocus
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-100"
                       placeholder="Start typing school name..."
                     />
                     {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-pink-500" size={18} />}
                   </div>
                </div>

                {/* Search Results */}
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {searchResults.map(school => (
                    <button
                      key={school._id}
                      type="button"
                      onClick={() => selectSchool(school)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${formData.schoolId === school._id ? 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/30 ring-2 ring-pink-500/20' : 'bg-white dark:bg-[#111827] border-slate-100 dark:border-slate-800 hover:border-pink-200'}`}
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Building2 size={16} />
                         </div>
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{school.name}</span>
                      </div>
                      {formData.schoolId === school._id && <CheckCircle2 size={18} className="text-pink-500" />}
                    </button>
                  ))}
                  {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <p className="text-xs text-slate-400 text-center py-4 italic">No schools found. Try a different name.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Child Admission */}
            {step === 3 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Child's First Name</label>
                     <input 
                       type="text" 
                       name="child.firstName"
                       required
                       value={formData.childDetails.firstName}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-100"
                       placeholder="e.g. Aarav"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                     <input 
                       type="text" 
                       name="child.lastName"
                       required
                       value={formData.childDetails.lastName}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-100"
                       placeholder="e.g. Sharma"
                     />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade / Class</label>
                     <input 
                       type="text" 
                       name="child.currentClass"
                       required
                       value={formData.childDetails.currentClass}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-100"
                       placeholder="e.g. Class 10"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section (Optional)</label>
                     <input 
                       type="text" 
                       name="child.section"
                       value={formData.childDetails.section}
                       onChange={handleChange}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-pink-500/10 focus:bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-100"
                       placeholder="e.g. B"
                     />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic px-2">Note: This will create an initial student record. School admins will verify and activate the account.</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 animate-in shake duration-300">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-20 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                type="submit"
                disabled={loading || (step === 2 && !formData.schoolId)}
                className="flex-1 py-5 bg-pink-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Finalizing Setup...' : step === 3 ? 'Complete Onboarding' : 'Continue'}
                {step < 3 && !loading && <ChevronRight size={18} />}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account? <Link to="/login" className="text-slate-600 dark:text-slate-300 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentRegister;
