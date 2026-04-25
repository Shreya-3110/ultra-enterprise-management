import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  BrainCircuit, 
  ShieldCheck, 
  ArrowRight,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
               </div>
               <span className="text-xl font-black text-slate-900 tracking-tight">Ultra Enterprise</span>
            </div>
            <div className="flex items-center gap-6">
               <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">Admin Login</Link>
               <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                  Deploy Workspace
               </Link>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
         <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
               Financial Management <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Engineered for Scale.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
               A comprehensive multi-tenant ecosystem integrating live payment gateways, automated reporting pipelines, and predictive AI analytics into a singular enterprise dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/30">
                  Access Platform <ArrowRight size={20} />
               </Link>
               <a href="#architecture" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl text-base font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                  View Technical Specs
               </a>
            </div>
         </div>
      </section>

      {/* Platform Architecture Highlight */}
      <section id="architecture" className="py-24 bg-white border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Full-Stack Architecture Features</h2>
               <p className="text-slate-500 font-medium mt-3">Built to demonstrate high-level engineering and product competency.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               
               {/* Feature 1 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <BrainCircuit size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Predictive AI Engine</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Real-time algorithmic ledger scanning natively flags user accounts with 'High Risk' profiles via backend aggregation pipelines.
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all group">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <CreditCard size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Stripe Integration</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     End-to-end multi-tenant payment processing mapping Stripe Webhooks directly into automated dynamic ledger reversals.
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Globe size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Tenant Isolation</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Strict architectural guards dynamically map shared database collections across independent organizational portals simultaneously.
                  </p>
               </div>

               {/* Feature 4 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all group">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">RBAC API Protection</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Rigid subscription middleware gates (`enforcePlan`) actively defend endpoint topologies against unauthorized tiered access.
                  </p>
               </div>

               {/* Feature 5 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10 transition-all group">
                  <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <BarChart3 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Dashboard Analytics</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Bespoke automated data visualization and native `jsPDF` reporting utilities running heavily optimized array reduction models.
                  </p>
               </div>

               {/* Feature 6 */}
               <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-500/10 transition-all group">
                  <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Zap size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Vite HMR & Security</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Constructed specifically utilizing modernized React standards, stateless JWT auth pipelines, and modularized Express routers.
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Ready to deploy the enterprise?</h2>
            <p className="text-slate-400 font-medium mb-8">Access the live staging environment now.</p>
            <Link to="/login" className="inline-flex bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-400 transition-colors">
               Launch Application
            </Link>
         </div>
      </footer>

    </div>
  );
};

const SparklesIcon = ({ size }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
   </svg>
);

export default Landing;

