import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  UserCheck, 
  Bus, 
  Library, 
  AlertTriangle,
  LayoutDashboard,
  Calendar,
  Clock,
  Search,
  Bell,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, auditRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/audit`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (auditRes.data.success) setRecentLogs(auditRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-sm text-slate-400 font-medium tracking-wide">Syncing Institutional Data...</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Hero Banner Section */}
      <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#020617] p-10 border border-white dark:border-white/5 shadow-2xl">
          <div className="relative z-10 flex items-center justify-between">
            <div>
               <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[11px] uppercase tracking-widest mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  DASHBOARD OVERVIEW
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                  Welcome back, {user?.name || 'DEMO ADMIN'} 👋
               </h1>
               <p className="text-slate-600 dark:text-slate-400 font-bold text-lg opacity-80">
                  Here's what's happening at your school today.
               </p>
               <div className="mt-8 flex items-center gap-4 text-xs font-black text-slate-500">
                  <span className="bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl border border-white dark:border-white/10 shadow-sm">{currentDate} • Admin Panel</span>
               </div>
            </div>

            {/* Today's Earnings Card */}
            <div className="hidden md:block bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl min-w-[240px] text-center">
               <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">₹0</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today's Earnings</p>
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Stats Grid - Exactly matching colors and layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SchoolStatCard 
          title="Total Students" 
          value={stats?.studentCount || 10} 
          icon={<Users size={20} />} 
          color="#3B82F6" 
          change="+12%"
        />
        <SchoolStatCard 
          title="Revenue" 
          value={`₹${stats?.totalCollection?.toLocaleString() || 0}`} 
          icon={<DollarSign size={20} />} 
          color="#22C55E" 
          change="+8%"
        />
        <SchoolStatCard 
          title="Total Classes" 
          value="0" 
          icon={<LayoutDashboard size={20} />} 
          color="#6366F1" 
          change="+2.1%"
        />
        <SchoolStatCard 
          title="Staff Members" 
          value="2" 
          icon={<UserCheck size={20} />} 
          color="#EC4899" 
          change="+3"
        />
        <SchoolStatCard 
          title="New Admissions" 
          value={stats?.studentCount || 10} 
          icon={<GraduationCap size={20} />} 
          color="#F97316" 
          change="+18%"
        />
        <SchoolStatCard 
          title="Transport" 
          value="0" 
          icon={<Bus size={20} />} 
          color="#06B6D4" 
          change="Active"
        />
        <SchoolStatCard 
          title="Library Books" 
          value="2" 
          icon={<Library size={20} />} 
          color="#EAB308" 
          change="+45"
        />
        <SchoolStatCard 
          title="Complaints" 
          value="0" 
          icon={<AlertTriangle size={20} />} 
          color="#64748B" 
          change="-5%"
          isDown={true}
        />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <Link to="/activity" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">View All <ChevronRight size={14}/></Link>
           </div>
           <div className="space-y-4">
              {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={log._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100 dark:border-white/5">
                         {log.action.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{log.action.replace('_', ' ')}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{log.details}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-slate-300 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
              )) : (
                 <div className="text-center py-8">
                    <p className="text-xs text-slate-400 font-bold uppercase">No recent logs</p>
                 </div>
              )}
           </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Upcoming Events</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">View All <ChevronRight size={14}/></button>
           </div>
           <div className="space-y-4">
              <EventItem day="07" month="MAY" title="Annual Wedding" category="Other" />
              <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl mt-4">
                 <p className="text-xs text-slate-400 font-bold uppercase">Add Event</p>
              </div>
           </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Attendance</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">View All <ChevronRight size={14}/></button>
           </div>
           <div className="space-y-3">
              <AttendanceRow name="Student 3" date="1/5/2026, 3:28:52 p.m." present={true} />
              <AttendanceRow name="Student 2" date="1/5/2026, 3:28:52 p.m." present={true} />
              <AttendanceRow name="Student 1" date="1/5/2026, 3:28:52 p.m." present={true} />
           </div>
        </div>

      </div>

    </div>
  );
};

const SchoolStatCard = ({ title, value, icon, color, change, isDown }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{ backgroundColor: color }}
    className="relative p-8 rounded-[2rem] text-white shadow-xl overflow-hidden group"
  >
    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm">
          {icon}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md bg-white/20 border border-white/20">
           {isDown ? <ArrowDownRight size={12} strokeWidth={3} /> : <ArrowUpRight size={12} strokeWidth={3} />}
           {change}
        </div>
      </div>
      <div className="mt-8">
         <p className="text-4xl font-black tracking-tighter mb-1">{value}</p>
         <p className="text-[11px] font-black uppercase tracking-widest opacity-70 leading-none">{title}</p>
      </div>
    </div>
  </motion.div>
);

const EventItem = ({ day, month, title, category }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-2xl group border border-transparent hover:border-slate-100 dark:hover:border-white/5">
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-500/20">
       <span className="text-[10px] font-black opacity-70 uppercase leading-none">{month}</span>
       <span className="text-xl font-black leading-none mt-0.5">{day}</span>
    </div>
    <div>
       <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{title}</p>
       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{category} • OTHER</p>
    </div>
  </div>
);

const AttendanceRow = ({ name, date, present }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
     <div className="flex items-center gap-3">
        <div>
           <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{name}</p>
           <p className="text-[9px] text-slate-400 font-bold mt-0.5">{date}</p>
        </div>
     </div>
     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${present ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${present ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {present ? 'Present' : 'Absent'}
     </span>
  </div>
);

export default Dashboard;
