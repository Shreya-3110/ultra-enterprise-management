import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  MessageSquare,
  RefreshCcw
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = filter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Communication Loop</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit log of all automated parent alerts and reminders.</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={fetchNotifications}
                className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-all shadow-sm"
                title="Refresh Logs"
            >
                <RefreshCcw size={18} />
            </button>
            <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2">
                <Send size={16} />
                <span>Automated Engine: Active</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<Mail className="text-blue-600" />} 
          label="Emails Sent" 
          value={notifications.filter(n => n.type === 'EMAIL').length}
          color="blue"
        />
        <StatCard 
          icon={<MessageSquare className="text-green-600" />} 
          label="WhatsApp Alerts" 
          value={notifications.filter(n => n.type === 'WHATSAPP').length}
          color="green"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-emerald-600" />} 
          label="Delivery Rate" 
          value="99.8%"
          color="emerald"
        />
        <StatCard 
          icon={<Clock className="text-orange-600" />} 
          label="Last Alert" 
          value={notifications.length > 0 ? new Date(notifications[0].sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
          color="orange"
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search recipient or student..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <FilterBtn active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All" />
            <FilterBtn active={filter === 'EMAIL'} onClick={() => setFilter('EMAIL')} label="Email" />
            <FilterBtn active={filter === 'WHATSAPP'} onClick={() => setFilter('WHATSAPP')} label="WhatsApp" />
          </div>
        </div>

        {/* The List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Recipient</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Student</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Message Snippet</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-slate-400 italic">Loading communication logs...</td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-slate-400 italic">No notifications found. Start by recording a payment!</td>
                </tr>
              ) : (
                filteredNotifications.map((note) => (
                  <tr key={note._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(note.sentAt).toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(note.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400`}>
                          {note.type === 'EMAIL' ? <Mail size={16} /> : <MessageSquare size={16} />}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{note.recipient}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {note.studentId ? `${note.studentId.firstName} ${note.studentId.lastName}` : 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            note.category === 'PAYMENT_CONFIRMATION' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {note.category?.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="px-8 py-6 max-w-xs transition-all">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate group-hover:text-clip group-hover:whitespace-normal">
                        {note.message}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -translate-y-8 translate-x-8 transition-transform group-hover:scale-110`} />
    <div className="relative">
      <div className={`p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 shadow-sm w-fit mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  </div>
);

const FilterBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
      ${active 
        ? 'bg-white dark:bg-[#111827] text-blue-600 shadow-sm' 
        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400'
      }`}
  >
    {label}
  </button>
);

export default Notifications;

