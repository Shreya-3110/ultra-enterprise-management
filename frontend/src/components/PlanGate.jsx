import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PlanGate = ({ children, requiredPlan, message = "Upgrade to unlock this feature" }) => {
  const { user } = useAuth();
  
  const plans = ['BASIC', 'STANDARD', 'PREMIUM'];
  const userPlan = (user?.plan || 'BASIC').toUpperCase();
  const reqPlan = (requiredPlan || 'BASIC').toUpperCase();
  
  const userPlanIndex = plans.indexOf(userPlan);
  const requiredPlanIndex = plans.indexOf(reqPlan);

  const isLocked = userPlanIndex < requiredPlanIndex || userPlanIndex === -1;

  if (!isLocked) {
    return children;
  }

  return (
    <div className="relative group cursor-not-allowed">
      {/* Locked Overlay */}
      <div className="absolute inset-x-2 inset-y-2 z-10 bg-white/40 backdrop-blur-[1px] rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center border-2 border-blue-200 border-dashed">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mb-2 shadow-sm">
          <Zap size={18} fill="currentColor" />
        </div>
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-tight">
          {message}
        </p>
        <button className="mt-3 text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
          View Plans
        </button>
      </div>

      {/* Blurred Content Illustration */}
      <div className="blur-[2px] pointer-events-none select-none grayscale-[0.3]">
        {children}
      </div>

      {/* Lock Indicator Tag */}
      <div className="absolute top-4 right-4 z-20 bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1.5 shadow-sm">
        <Lock size={10} />
        <span className="text-[9px] font-black uppercase tracking-widest">{requiredPlan}</span>
      </div>
    </div>
  );
};

export default PlanGate;
