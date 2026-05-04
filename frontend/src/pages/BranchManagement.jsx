import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  Loader2,
  Globe,
  Settings
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', street: '', city: '', plan: 'BASIC' });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/schools/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(res.data.data);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/schools/branches`, {
                name: newBranch.name,
                address: { street: newBranch.street, city: newBranch.city },
                subscriptionPlan: newBranch.plan
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchBranches();
        } catch (err) {
            alert('Failed to create branch: ' + err.message);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                      <Building2 className="text-blue-600" size={36} />
                      Head Office Console
                   </h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 italic">Global management of all institutional branch locations.</p>
                </div>
                <button 
                   onClick={() => setIsModalOpen(true)}
                   className="bg-slate-900 dark:bg-slate-950 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 flex items-center gap-3 transition-all hover:bg-black active:scale-95"
                >
                   <Plus size={20} />
                   Deploy New Branch
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GlobalStatCard title="Active Campuses" value={branches.length} icon={<Building2 />} color="blue" />
                <GlobalStatCard title="Total Organization Scope" value={`${branches.length * 500}+ Students`} icon={<Users />} color="indigo" />
                <GlobalStatCard title="Annual Forecast" value="₹1.2Cr+" icon={<TrendingUp />} color="emerald" />
            </div>

            {/* Branch List */}
            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Institutional Directory</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Globe size={14} className="text-blue-500" /> Global Sync: <span className="text-emerald-500">Active</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Branch Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Location</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Plan</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-right font-black"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {branches.map((branch) => (
                                <tr key={branch._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {branch.name.charAt(0)}
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white">{branch.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-300" />
                                            {branch.address?.city || 'Not set'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${branch.subscriptionPlan === 'PREMIUM' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            {branch.subscriptionPlan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <Settings size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Branch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 dark:bg-slate-950/60 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreateBranch} className="bg-white dark:bg-[#111827] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="bg-slate-900 dark:bg-slate-950 p-10 text-white relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Building2 size={80} />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">New Branch Deployment</h3>
                            <p className="text-slate-400 text-sm mt-1">Spin up a new campus instance instantly.</p>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campus Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. City Central Academy"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newBranch.name}
                                    onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                        value={newBranch.city}
                                        onChange={e => setNewBranch({...newBranch, city: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Plan Tier</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                        value={newBranch.plan}
                                        onChange={e => setNewBranch({...newBranch, plan: e.target.value})}
                                    >
                                        <option value="BASIC">Basic</option>
                                        <option value="STANDARD">Standard</option>
                                        <option value="PREMIUM">Premium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">Deploy Campus</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const GlobalStatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 shadow-blue-100/50',
        indigo: 'text-indigo-600 bg-indigo-50 shadow-indigo-100/50',
        emerald: 'text-emerald-600 bg-emerald-50 shadow-emerald-100/50'
    };
    return (
        <div className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${colors[color]}`}>
                {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
};

export default BranchManagement;
