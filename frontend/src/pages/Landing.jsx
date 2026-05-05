import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  BarChart3,
  Globe,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
  Mail,
  Smartphone
} from 'lucide-react';
const Landing = () => {
  const { scrollY } = useScroll();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] font-sans selection:bg-blue-200 overflow-x-hidden">
      
      {/* Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <GraduationCap size={24} className="text-white" />
               </div>
               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">SCHOOL <span className="text-blue-600">ADMIN</span></span>
            </motion.div>
            <div className="flex items-center gap-4 sm:gap-8">
               <Link to="/login" className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors hidden md:block">School Portal</Link>
               <Link to="/login" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <button className="relative bg-slate-900 dark:bg-slate-950 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                     Log In
                  </button>
               </Link>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 z-10">
         <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="space-y-8"
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Zap size={14} className="animate-pulse" /> The World's Most Advanced School OS
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                  Smart Schooling. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Simplified.</span>
               </h1>
               <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                  The all-in-one platform to manage students, staff, and finances. Empower your institution with real-time analytics and automated workflows.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <Link to="/login" className="group relative w-full sm:w-auto">
                     <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                     <button className="relative w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">
                        Launch Dashboard <ArrowRight size={20} />
                     </button>
                  </Link>
                  <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all">
                     View All Modules
                  </a>
               </div>
            </motion.div>

            {/* Feature Highlights Instead of Mockup */}
            <div className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/5 text-center"
               >
                  <p className="text-3xl font-black text-white mb-2">100%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Attendance</p>
               </motion.div>
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.1 }}
                 className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/5 text-center"
               >
                  <p className="text-3xl font-black text-white mb-2">₹0.00</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Fees</p>
               </motion.div>
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/5 text-center"
               >
                  <p className="text-3xl font-black text-white mb-2">Live</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parent Communication</p>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Trust Ticker */}
      <div className="relative py-12 bg-slate-900 overflow-hidden border-y border-white/5">
         <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
            <TickerItem icon={<Globe size={18}/>} label="GLOBAL SCHOOL NETWORK" />
            <TickerItem icon={<ShieldCheck size={18}/>} label="ISO 27001 CERTIFIED" value="SECURE" />
            <TickerItem icon={<Users size={18}/>} label="ACTIVE STUDENTS" value="1.2M+" />
            <TickerItem icon={<Cpu size={18}/>} label="AI ADAPTIVE LEARNING" value="V2.0" />
            <TickerItem icon={<Lock size={18}/>} label="ZERO DATA LEAKAGE" value="GUARANTEED" />
            {/* Repeat for seamless loop */}
            <TickerItem icon={<Globe size={18}/>} label="GLOBAL SCHOOL NETWORK" />
            <TickerItem icon={<ShieldCheck size={18}/>} label="ISO 27001 CERTIFIED" value="SECURE" />
            <TickerItem icon={<Users size={18}/>} label="ACTIVE STUDENTS" value="1.2M+" />
            <TickerItem icon={<Cpu size={18}/>} label="AI ADAPTIVE LEARNING" value="V2.0" />
            <TickerItem icon={<Lock size={18}/>} label="ZERO DATA LEAKAGE" value="GUARANTEED" />
         </div>
      </div>

      {/* Core Modules */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-[#0B1121] relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
               <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
               >
                  Integrated Ecosystem
               </motion.div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  Complete Educational <br/> <span className="text-slate-400">Management Suite</span>
               </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
               <FeatureCard 
                  icon={<Users size={32} />} 
                  title="Student Information" 
                  desc="Comprehensive profiles for every student, tracking academic progress, attendance, and behavioral history automatically."
                  color="blue"
               />
               <FeatureCard 
                  icon={<CreditCard size={32} />} 
                  title="Fee Management" 
                  desc="Automate fee collection, generate digital receipts, and send automated WhatsApp reminders for overdue payments."
                  color="indigo"
               />
               <FeatureCard 
                  icon={<BookOpen size={32} />} 
                  title="Academic Planning" 
                  desc="Manage classes, sections, and subjects with an interactive timetable builder and examination management system."
                  color="emerald"
               />
               <FeatureCard 
                  icon={<Smartphone size={32} />} 
                  title="Parent Portal" 
                  desc="Dedicated mobile experience for parents to track their child's progress and pay fees in one click."
                  color="purple"
               />
               <FeatureCard 
                  icon={<Mail size={32} />} 
                  title="Smart Communication" 
                  desc="Broadcast announcements, homework, and urgent alerts via WhatsApp, Email, and In-App notifications."
                  color="rose"
               />
               <FeatureCard 
                  icon={<BarChart3 size={32} />} 
                  title="Insights & Analytics" 
                  desc="Real-time reports on institutional health, student performance trends, and financial auditing."
                  color="slate"
               />
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-slate-900 dark:bg-black py-32 border-t border-white/5 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">Empower Your School Today</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link to="/login" className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-colors shadow-2xl">
                  Log In to Console
               </Link>
               <Link to="/register" className="text-white border border-white/20 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-colors">
                  Contact Support
               </Link>
            </div>
            <p className="mt-16 text-slate-500 text-xs font-medium uppercase tracking-widest">© 2026 School Admin ERP System. All Rights Reserved.</p>
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
       className="p-10 rounded-[3rem] bg-white/5 dark:bg-[#111827]/50 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
    >
       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${colorMap[color]} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          {icon}
       </div>
       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{title}</h3>
       <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          {desc}
       </p>
       <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
          Module Details <ChevronRight size={14} />
       </div>
    </motion.div>
  );
};

export default Landing;
