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
  Loader2
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
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Hero Banner */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-10 border border-white dark:border-white/5 shadow-xl shadow-blue-900/5">
        <div className="absolute top-0 right-0 p-8 flex items-center gap-4 opacity-50 dark:opacity-20 pointer-events-none">
           <div className="text-right">
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹0</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Earnings</p>
           </div>
        </div>
        <div className="relative z-10">
           <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              DASHBOARD OVERVIEW
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
              Welcome back, {user?.name || 'DEMO ADMIN'} 👋
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              Here's what's happening at your school today.
           </p>
           <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">{currentDate}</span>
              <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 Admin Panel
              </span>
           </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid - 4x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SchoolStatCard 
          title="Total Students" 
          value={stats?.studentCount || 10} 
          icon={<Users size={24} />} 
          color="blue" 
          change="+12%"
        />
        <SchoolStatCard 
          title="Revenue" 
          value={`₹${stats?.totalCollection?.toLocaleString() || 0}`} 
          icon={<DollarSign size={24} />} 
          color="green" 
          change="+8%"
        />
        <SchoolStatCard 
          title="Total Classes" 
          value="0" 
          icon={<LayoutDashboard size={24} />} 
          color="purple" 
          change="+2.1%"
        />
        <SchoolStatCard 
          title="Staff Members" 
          value="2" 
          icon={<UserCheck size={24} />} 
          color="pink" 
          change="+3"
        />
        <SchoolStatCard 
          title="New Admissions" 
          value={stats?.studentCount || 10} 
          icon={<GraduationCap size={24} />} 
          color="orange" 
          change="+18%"
        />
        <SchoolStatCard 
          title="Transport" 
          value="0" 
          icon={<Bus size={24} />} 
          color="teal" 
          change="Active"
        />
        <SchoolStatCard 
          title="Library Books" 
          value="2" 
          icon={<Library size={24} />} 
          color="yellow" 
          change="+45"
        />
        <SchoolStatCard 
          title="Complaints" 
          value="0" 
          icon={<AlertTriangle size={24} />} 
          color="red" 
          change="-5%"
          isDown={true}
        />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <Link to="/activity" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">View All <ChevronRight size={14}/></Link>
           </div>
           <div className="space-y-4">
              {recentLogs.map((log, i) => (
                <div key={log._id} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100 dark:border-white/5 shadow-sm uppercase">
                         {log.action.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{log.action.replace('_', ' ')}</p>
                         <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.details}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded uppercase">{log.role || 'ADMIN'}</span>
                      <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                 <div className="text-center py-10">
                    <p className="text-xs text-slate-400 font-medium">No recent logs recorded.</p>
                 </div>
              )}
           </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Upcoming Events</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">View All <ChevronRight size={14}/></button>
           </div>
           <div className="space-y-4">
              <EventItem day="07" month="MAY" title="Annual Sports Meet" category="Sports" />
              <EventItem day="12" month="MAY" title="Parent-Teacher Meeting" category="Academic" />
              <EventItem day="15" month="MAY" title="Summer Vacation Starts" category="Holiday" />
              <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl mt-4">
                 <p className="text-xs text-slate-400 font-bold">Add new event to calendar</p>
              </div>
           </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Attendance</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">View All <ChevronRight size={14}/></button>
           </div>
           <div className="space-y-3">
              <AttendanceRow name="Student 1" date="1/5/2026, 3:28:52 p.m." present={true} />
              <AttendanceRow name="Student 2" date="1/5/2026, 3:28:52 p.m." present={true} />
              <AttendanceRow name="Student 3" date="1/5/2026, 3:28:52 p.m." present={true} />
              <AttendanceRow name="Student 4" date="1/5/2026, 3:28:52 p.m." present={false} />
              <AttendanceRow name="Student 5" date="1/5/2026, 3:28:52 p.m." present={true} />
           </div>
           <div className="mt-10 p-6 bg-slate-900 rounded-3xl flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Rate</p>
                 <p className="text-xl font-black text-white">94.2%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin duration-[3s]" />
           </div>
        </div>

      </div>

    </div>
  );
};

const SchoolStatCard = ({ title, value, icon, color, change, isDown }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 text-white shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20',
    purple: 'from-violet-500 to-violet-600 text-white shadow-violet-500/20',
    pink: 'from-rose-500 to-rose-600 text-white shadow-rose-500/20',
    orange: 'from-orange-500 to-orange-600 text-white shadow-orange-500/20',
    teal: 'from-teal-500 to-teal-600 text-white shadow-teal-500/20',
    yellow: 'from-amber-500 to-amber-600 text-white shadow-amber-500/20',
    red: 'from-slate-700 to-slate-900 text-white shadow-slate-900/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative p-8 rounded-[2rem] bg-gradient-to-br ${colorMap[color]} shadow-2xl overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md bg-white/20 border border-white/20`}>
             {isDown ? <ArrowDownRight size={12} strokeWidth={3} /> : <ArrowUpRight size={12} strokeWidth={3} />}
             {change}
          </div>
        </div>
        <div className="mt-8">
           <p className="text-4xl font-black tracking-tighter mb-1">{value}</p>
           <p className="text-[11px] font-black uppercase tracking-widest opacity-80">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const EventItem = ({ day, month, title, category }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-2xl group">
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
       <span className="text-[10px] font-black opacity-50 uppercase leading-none">{month}</span>
       <span className="text-xl font-black leading-none mt-0.5">{day}</span>
    </div>
    <div>
       <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{title}</p>
       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{category} • Other</p>
    </div>
  </div>
);

const AttendanceRow = ({ name, date, present }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
     <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${present ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div>
           <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{name}</p>
           <p className="text-[9px] text-slate-400 font-bold mt-0.5">{date}</p>
        </div>
     </div>
     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${present ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
        {present ? 'Present' : 'Absent'}
     </span>
  </div>
);

const GraduationCap = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
  </svg>
);

export default Dashboard;
