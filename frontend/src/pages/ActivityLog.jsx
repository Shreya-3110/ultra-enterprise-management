import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  User, 
  Clock, 
  ArrowLeft,
  Search,
  Filter,
  CreditCard,
  UserPlus,
  RefreshCw,
  Trash2,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAuditReport } from '../utils/reportGenerator';
import { Download } from 'lucide-react';



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ActivityLog = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);


  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setLogs(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'PAYMENT_RECORDED': return <CreditCard className="text-green-500" size={16} />;
      case 'STUDENT_CREATED': return <UserPlus className="text-blue-500" size={16} />;
      case 'STUDENT_BULK_IMPORT': return <RefreshCw className="text-purple-500" size={16} />;
      case 'STUDENT_DELETED': return <Trash2 className="text-red-500" size={16} />;
      case 'REMINDER_SENT': return <Mail className="text-amber-500" size={16} />;
      default: return <FileText className="text-slate-400" size={16} />;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs</h2>
            <p className="text-sm text-slate-500 mt-1">A transparent trail of all administrative actions</p>
          </div>
        </div>
          <button 
            onClick={() => generateAuditReport(logs)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={14} />
            Export PDF
          </button>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by description or admin name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm appearance-none cursor-pointer">
            <option>All Actions</option>
            <option>Payments</option>
            <option>Students</option>
            <option>Reminders</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 animate-pulse">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold">
                          {log.user.name[0]}
                        </div>
                        <span className="font-semibold text-slate-700">{log.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1.5 font-bold tracking-tight px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {getActionIcon(log.action)}
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 leading-relaxed">
                      {log.details}
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

export default ActivityLog;

