import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Building2, 
  CreditCard, 
  BrainCircuit, 
  ShieldCheck, 
  ArrowRight,
  BarChart3,
  Globe,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import dashboardMockup from '../assets/dashboard_mockup.png';

const Landing = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] font-sans selection:bg-blue-200 overflow-x-hidden">
      
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 animate-mesh" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 size={24} className="text-white" />
               </div>
               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">ULTRA <span className="text-blue-600">E.M</span></span>
            </motion.div>
            <div className="flex items-center gap-4 sm:gap-8">
               <Link to="/login" className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors hidden md:block">Admin Console</Link>
               <Link to="/login" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <button className="relative bg-slate-900 dark:bg-slate-950 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                     Deploy Now
                  </button>
               </Link>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 z-10">
         <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="space-y-8"
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Zap size={14} className="animate-pulse" /> The Next-Gen Enterprise Engine
               </div>
               <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                  Institutional Health. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Automated.</span>
               </h1>
               <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                  Consolidated multi-branch oversight with real-time financial transparency, automated risk profiling, and high-velocity reporting pipelines.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <Link to="/login" className="group relative w-full sm:w-auto">
                     <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                     <button className="relative w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">
                        Launch Application <ArrowRight size={20} />
                     </button>
                  </Link>
                  <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all">
                     Explore Modules
                  </a>
               </div>
            </motion.div>

            {/* Floating Mockup Reveal */}
            <motion.div 
               style={{ y: y1 }}
               initial={{ y: 100, opacity: 0, rotateX: 20 }}
               animate={{ y: 0, opacity: 1, rotateX: 0 }}
               transition={{ delay: 0.4, duration: 1 }}
               className="mt-24 relative group"
            >
               <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
               <div className="relative glass-morphism rounded-[2.5rem] p-4 border border-white/20 dark:border-white/10 shadow-2xl animate-float">
                  <div className="overflow-hidden rounded-[2rem] border border-white/10">
                     <img 
                        src={dashboardMockup} 
                        alt="Ultra Enterprise Dashboard" 
                        className="w-full h-auto max-w-4xl opacity-90 group-hover:opacity-100 transition-opacity"
                     />
                  </div>
                  {/* Floating Action Cards over mockup */}
                  <div className="absolute -right-12 top-1/4 hidden lg:block glass-morphism p-6 rounded-3xl border border-white/20 shadow-2xl animate-pulse">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                           <TrendingUp size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Sync</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">₹84.2L <span className="text-xs text-emerald-500">+12%</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Global Stats Ticker */}
      <div className="relative py-12 bg-slate-900 overflow-hidden border-y border-white/5">
         <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
            <TickerItem icon={<Globe size={18}/>} label="GLOBAL SYNC ACTIVE" />
            <TickerItem icon={<ShieldCheck size={18}/>} label="PAYMENTS SECURED" value="₹1.4Cr+" />
            <TickerItem icon={<Building2 size={18}/>} label="ACTIVE CAMPUSES" value="42+" />
            <TickerItem icon={<Cpu size={18}/>} label="AI RISK ANALYTICS" value="100% COVERAGE" />
            <TickerItem icon={<Lock size={18}/>} label="RBAC TOPOLOGY" value="VERIFIED" />
            {/* Repeat for seamless loop */}
            <TickerItem icon={<Globe size={18}/>} label="GLOBAL SYNC ACTIVE" />
            <TickerItem icon={<ShieldCheck size={18}/>} label="PAYMENTS SECURED" value="₹1.4Cr+" />
            <TickerItem icon={<Building2 size={18}/>} label="ACTIVE CAMPUSES" value="42+" />
            <TickerItem icon={<Cpu size={18}/>} label="AI RISK ANALYTICS" value="100% COVERAGE" />
            <TickerItem icon={<Lock size={18}/>} label="RBAC TOPOLOGY" value="VERIFIED" />
         </div>
      </div>

      {/* Architecture Highlights */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-[#0B1121] relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
               <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
               >
                  Built for the Future
               </motion.div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  Enterprise-Grade <br/> <span className="text-slate-400">Architectural Core</span>
               </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
               <FeatureCard 
                  icon={<BrainCircuit size={32} />} 
                  title="Predictive Intelligence" 
                  desc="Native AI aggregation scanners identify liquidity risks and student success metrics before they impact the bottom line."
                  color="blue"
               />
               <FeatureCard 
                  icon={<CreditCard size={32} />} 
                  title="Stripe Payment Core" 
                  desc="Web-scale payment processing with native webhook listeners that automate ledger reconciliation instantly."
                  color="indigo"
               />
               <FeatureCard 
                  icon={<Globe size={32} />} 
                  title="Multi-Tenant Shield" 
                  desc="Strict architectural isolation ensures zero data leakage between branch locations and independent institutions."
                  color="emerald"
               />
               <FeatureCard 
                  icon={<Lock size={32} />} 
                  title="RBAC Topology" 
                  desc="Granular permission-based access control (Head Office, Admin, Staff, Parent) secured via stateless JWT pipelines."
                  color="purple"
               />
               <FeatureCard 
                  icon={<BarChart3 size={32} />} 
                  title="Automated Auditing" 
                  desc="Deep financial analytics with high-velocity jsPDF reporting and real-time transaction tracking."
                  color="rose"
               />
               <FeatureCard 
                  icon={<Cpu size={32} />} 
                  title="Cloud Native Scaling" 
                  desc="Constructed with modern Vite/React/Express architecture designed for horizontal infrastructure growth."
                  color="slate"
               />
            </div>
         </div>
      </section>

      {/* Institutional Trust Section */}
      <section className="py-24 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0B1121]">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Empowering Tier-1 Institutions Globally</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               <TrustLogo name="GLOBAL" icon={<Globe size={24}/>} />
               <TrustLogo name="SYNDICATE" icon={<ShieldCheck size={24}/>} />
               <TrustLogo name="ACADEMY" icon={<Building2 size={24}/>} />
               <TrustLogo name="NEXUS" icon={<Zap size={24}/>} />
               <TrustLogo name="CORE" icon={<Cpu size={24}/>} />
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-slate-900 dark:bg-black py-32 border-t border-white/5 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">Ready to deploy?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link to="/login" className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-colors shadow-2xl">
                  Launch Live Staging
               </Link>
               <Link to="/login" className="text-white border border-white/20 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-colors">
                  Contact Solutions
               </Link>
            </div>
            <p className="mt-16 text-slate-500 text-xs font-medium uppercase tracking-widest">© 2026 Ultra Enterprise Management System. All Rights Reserved.</p>
         </div>
      </footer>

    </div>
  );
};

const TickerItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-blue-500">{icon}</div>
    <span className="text-xs font-black text-white tracking-widest uppercase">{label}</span>
    {value && <span className="text-xs font-bold text-slate-500 ml-1">{value}</span>}
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/5',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/5',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5',
    slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-slate-500/5',
  };

  return (
    <motion.div 
       whileHover={{ y: -10 }}
       className="p-10 rounded-[3rem] glass-morphism border border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden"
    >
       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${colorMap[color]} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          {icon}
       </div>
       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{title}</h3>
       <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          {desc}
       </p>
       <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
          Learn Specification <ChevronRight size={14} />
       </div>
    </motion.div>
  );
};

const TrustLogo = ({ name, icon }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-400">{icon}</div>
    <span className="text-lg font-black text-slate-900 dark:text-white tracking-widest">{name}</span>
  </div>
);

export default Landing;
