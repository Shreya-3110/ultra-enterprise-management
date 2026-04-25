import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Zap, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Subscription = () => {
  const { user, token, logout } = useAuth();
  const [loadingConfig, setLoadingConfig] = useState(null);
  const navigate = useNavigate();

  const handleUpgrade = async (planName) => {
    try {
      setLoadingConfig(planName);
      
      const response = await axios.post(`${API_BASE_URL}/auth/upgrade`, { newPlan: planName }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(response.data.message + "\n\nPlease login again to refresh your session capabilities.");
        logout();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Upgrade operation failed');
    } finally {
      setLoadingConfig(null);
    }
  };

  const plans = [
    {
      name: 'BASIC',
      price: '₹0',
      period: 'forever',
      icon: <Building2 className="text-slate-400" size={32} />,
      description: 'Essential tools to manage a single small institution securely.',
      features: [
         'Up to 500 Active Students',
         'Core Payment Ledgers',
         'Standard Parent Dashboards',
         'Basic Receipt Generation'
      ],
      color: 'slate',
      btnText: user?.plan === 'BASIC' ? 'Current Plan' : 'Downgrade'
    },
    {
      name: 'STANDARD',
      price: '₹2,499',
      period: 'per month',
      popular: true,
      icon: <Zap className="text-blue-500" size={32} />,
      description: 'Unlocks massive data processing for growing multi-campus schools.',
      features: [
         'Up to 2,500 Active Students',
         'Bulk CSV Data Migration',
         'Automated Bulk Notifications',
         'Priority Chat Support'
      ],
      color: 'blue',
      btnText: user?.plan === 'STANDARD' ? 'Current Plan' : 'Select Standard'
    },
    {
      name: 'PREMIUM',
      price: '₹5,999',
      period: 'per month',
      icon: <Sparkles className="text-amber-500" size={32} />,
      description: 'The ultimate enterprise suite with powerful AI analytics.',
      features: [
         'Unlimited Students & Branches',
         'AI Predictive Defaulter Engine',
         'Exec Financial Analytics Dashboard',
         'Ledger Refund Reversal Systems',
         'White-label Native Mobile App'
      ],
      color: 'amber',
      btnText: user?.plan === 'PREMIUM' ? 'Current Plan' : 'Unlock Premium'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center max-w-2xl mx-auto pt-6">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Elevate Your Institution</h1>
         <p className="text-lg text-slate-500 font-medium">
           You are currently on the <strong className="text-blue-600"> {user?.plan || 'BASIC'} </strong> plan. 
           Upgrade your SaaS tier to unlock heavy enterprise analytics and mass data processing capabilities instantly.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
         {plans.map((plan) => {
            const isCurrent = user?.plan === plan.name;
            const isLoading = loadingConfig === plan.name;

            return (
               <div 
                  key={plan.name}
                  className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all relative flex flex-col h-full
                     ${plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/20 md:-mt-4' : 'border-slate-100 hover:border-slate-300 shadow-lg shadow-slate-200/50'}
                  `}
               >
                  {plan.popular && (
                     <div className="absolute -top-4 inset-x-0 flex justify-center">
                        <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-blue-500/30 flex items-center gap-1">
                           <ShieldCheck size={14} /> Most Popular
                        </span>
                     </div>
                  )}

                  <div className="mb-6 flex items-center gap-4">
                     <div className={`w-16 h-16 rounded-2xl bg-${plan.color}-50 flex items-center justify-center`}>
                        {plan.icon}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{plan.description}</p>
                     </div>
                  </div>

                  <div className="mb-8">
                     <p className="text-4xl font-black text-slate-900 flex items-end gap-1">
                        {plan.price}
                        <span className="text-sm font-bold text-slate-400 mb-1">/{plan.period}</span>
                     </p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                     {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                           <CheckCircle2 size={20} className={`text-${plan.popular ? 'blue' : 'green'}-500 shrink-0 mt-0.5`} />
                           <span className="text-sm font-medium text-slate-600">{feat}</span>
                        </div>
                     ))}
                  </div>

                  <button 
                     disabled={isCurrent || isLoading}
                     onClick={() => handleUpgrade(plan.name)}
                     className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                        ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                          plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30' : 
                          'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                        }
                     `}
                  >
                     {isLoading && <Loader2 size={16} className="animate-spin" />}
                     {plan.btnText}
                  </button>

               </div>
            );
         })}
      </div>

    </div>
  );
};

export default Subscription;

