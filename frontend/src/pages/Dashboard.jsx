import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  Wallet,
  Zap,
  Loader2,
  FileText,
  Download,
  CheckCircle2,
  Search,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import PlanGate from '../components/PlanGate';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { 
  generateDashboardSummary, 
  generateAuditReport 
} from '../utils/reportGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, auditRes, aiRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/audit`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/dashboard/ai-predictions`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (auditRes.data.success) setRecentLogs(auditRes.data.data.slice(0, 5));
        if (aiRes.data.success) setAiData(aiRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  // Cash Flow Forecast Chart Configuration
  const forecastChartData = React.useMemo(() => ({
    labels: aiData?.forecast?.map(f => f.month) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        fill: true,
        label: 'Projected Inbound (₹)',
        data: aiData?.forecast?.map(f => f.projected) || [0,0,0,0,0,0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.4,
        pointRadius: 6,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
      },
    ],
  }), [aiData]);

  const lineOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12 }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  }), []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-sm text-slate-400 font-medium tracking-wide">Calculating Financial Statistics...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            Intelligence Center
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest font-black shadow-lg shadow-blue-500/30"
            >
              AI Enabled
            </motion.span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Institutional health and predictive revenue modeling.</p>
        </div>
        <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => generateDashboardSummary(stats, recentLogs)}
           className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 dark:text-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20"
        >
           Export Strategy Report
        </motion.button>
      </div>

      {/* Performance & Upgrade Banner */}
      {user?.plan === 'BASIC' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Sparkles size={24} className="text-amber-300 animate-pulse" />
              Upgrade to Standard or Premium
            </h2>
            <p className="text-blue-100 font-medium max-w-lg">
              You are currently using the Basic version. Upgrade now to unlock **AI-powered analytics**, 
              **automated WhatsApp alerts**, and **mass data migration** for your institution.
            </p>
          </div>
          <Link 
            to="/subscription" 
            className="relative z-10 bg-white dark:bg-[#111827] text-blue-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg whitespace-nowrap"
          >
            Upgrade My Account
          </Link>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white dark:bg-[#111827]/10 rounded-full blur-3xl group-hover:bg-white dark:bg-[#111827]/20 transition-colors" />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <StatCard delay={0.1} title="Total Students" value={stats?.studentCount?.toLocaleString() || '0'} change="+12" isUp={true} icon={<Users size={20} />} />
        <StatCard delay={0.2} title="Total Collection" value={`₹${stats?.totalCollection?.toLocaleString() || '0'}`} change={`+₹${stats?.lateFeesRecovered?.toLocaleString() || '0'} late fees`} isUp={true} icon={<DollarSign size={20} />} />
        <StatCard delay={0.3} title="Wallet Credits" value={`₹${stats?.walletCredits?.toLocaleString() || '0'}`} change="Surplus" isUp={true} icon={<Wallet size={20} />} />
        <StatCard delay={0.4} title="Outstanding" value={`₹${stats?.outstandingDues?.toLocaleString() || '0'}`} change={`${stats?.collectionRate || 0}% Rate`} isUp={(stats?.collectionRate || 0) > 80} icon={<AlertCircle size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Forecast Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 bg-white/60 dark:bg-[#111827]/60 backdrop-blur-2xl border border-white dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8">
             <Zap size={32} className="text-emerald-500 opacity-20" />
          </div>
          <div className="mb-8">
            <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Financial Forecasting</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Predicted Inbound Cash Flow (Next 6 Months)</p>
          </div>
          <div className="h-[300px]">
            <Line data={forecastChartData} options={lineOptions} />
          </div>
        </motion.div>

        {/* AI Deferral Alerts / Defaulter Risk */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-gradient-to-b from-slate-900 to-[#020617] dark:from-slate-950 dark:to-black rounded-[2.5rem] flex flex-col shadow-2xl shadow-slate-900/40 p-8 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="mb-8">
            <h3 className="font-black text-white text-lg flex items-center gap-2">
              <Zap size={18} className="text-amber-400 fill-amber-400" />
              Risk Analysis
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Critical Defaulter Warnings</p>
          </div>
          <div className="flex-1 space-y-6">
            {aiData?.defaulterAlerts?.length === 0 ? (
              <div className="text-center py-10">
                 <div className="w-12 h-12 bg-white dark:bg-[#111827]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                 </div>
                 <p className="text-xs text-slate-400 font-bold">No high-risk students detected.</p>
              </div>
            ) : (
              aiData?.defaulterAlerts?.map((risk, i) => (
                <div key={i} className="bg-white dark:bg-[#111827]/5 border border-white/10 p-4 rounded-2xl group hover:bg-white dark:bg-[#111827]/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-black text-white uppercase">{risk.name}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">ADM: {risk.admissionNumber} • {risk.class}</p>
                     </div>
                     <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">{risk.riskScore}% RISK</span>
                  </div>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {risk.reasons.slice(0, 2).map((r, ri) => (
                       <span key={ri} className="text-[8px] font-bold text-slate-400 bg-white dark:bg-[#111827]/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                          {r.split(' ')[0]} {r.split(' ')[1]}...
                       </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="mt-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all"
          >
             Full Risk Audit
          </motion.button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <PlanGate requiredPlan="STANDARD" message="Standard plan required for AI analytics">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-2xl border border-white dark:border-slate-800/50 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-none flex flex-col h-full relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-100/50">
                <TrendingUp size={20} />
              </span>
              Defaulter Propensity Analysis
            </h3>
            <div className="space-y-4">
               {aiData?.riskProfiles?.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-400 transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${p.riskScore > 60 ? 'bg-rose-500' : 'bg-blue-500'} animate-pulse`} />
                        <div>
                           <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{p.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold italic">{p.reasons[0] || 'Behavior Stable'}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{p.riskScore}%</p>
                        <p className={`text-[8px] font-black uppercase ${p.riskStatus === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>{p.riskStatus} Profile</p>
                     </div>
                  </div>
               ))}
            </div>
          </motion.div>
        </PlanGate>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-2xl border border-white dark:border-slate-800/50 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-none hover:border-emerald-500/30 transition-colors"
        >
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                 <span className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-emerald-100/50">
                   <Clock size={20} />
                 </span>
                 Live Collection Stream
              </h3>
              <Link to="/reports" className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Global Ledger</Link>
           </div>
           <div className="space-y-6">
              {recentLogs.map((log, i) => (
                <div key={log._id} className="relative pl-6 group">
                   <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50 flex-shrink-0 group-hover:scale-125 transition-transform" />
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase leading-none">{log.action.replace('_', ' ')}</p>
                         <p className="text-[10px] text-slate-400 font-medium mt-1 italic">{log.details}</p>
                      </div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, isUp, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between overflow-hidden relative group"
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
    
    <div className="flex items-start justify-between relative z-10">
      <div className="p-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full border ${
        isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'
      }`}>
        {isUp ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
        {change}
      </div>
    </div>
    <div className="mt-6 relative z-10">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{value}</p>
    </div>
  </motion.div>
);

const InsightItem = ({ text }) => (
  <div className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{text}</p>
  </div>
);

const MinimalRow = ({ name, type, status, amount }) => (
  <tr>
    <td className="px-8 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</span>
      </div>
    </td>
    <td className="px-8 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{type}</td>
    <td className="px-8 py-4">
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
        status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
      }`}>
        {status}
      </span>
    </td>
    <td className="px-8 py-4 text-sm font-bold text-slate-900 dark:text-white">{amount}</td>
  </tr>
);

export default Dashboard;

