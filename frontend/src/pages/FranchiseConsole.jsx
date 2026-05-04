import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  History,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const FranchiseConsole = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const endpoint = user?.isHeadOffice ? '/franchise/royalties' : '/franchise/my-split';
                const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch franchise data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    if (user?.isHeadOffice) {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                            <ShieldCheck className="text-blue-600" size={32} />
                            Royalty Command Center
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Consolidated revenue split monitoring across all franchises.</p>
                    </div>
                </div>

                {/* Head Office Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <RevenueCard 
                        title="Total Organizational Gross" 
                        value={`₹${data?.summary.totalGross.toLocaleString()}`} 
                        icon={<TrendingUp />} 
                        color="slate" 
                    />
                    <RevenueCard 
                        title="Total Head Office Royalty" 
                        value={`₹${data?.summary.totalRoyalties.toLocaleString()}`} 
                        icon={<DollarSign />} 
                        color="blue" 
                    />
                </div>

                {/* Detailed Branch Ledger */}
                <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50/30">
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Consolidated Franchise Audit</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-slate-800/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Franchise Campus</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Inbound</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Royalty %</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right text-blue-600">Org Share</th>
                                    <th className="px-8 py-5 text-right font-black"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data?.details.map((b) => (
                                    <tr key={b.branchId} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{b.branchName}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right font-bold text-slate-600 dark:text-slate-400">₹{b.grossCollections.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-right text-sm font-medium text-slate-400">{b.royaltyPercentage}%</td>
                                        <td className="px-8 py-6 text-right font-black text-blue-600">₹{b.royaltyAmount.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-[10px] font-bold text-slate-300 hover:text-blue-600 flex items-center gap-1 ml-auto">
                                                Audit Ledger <History size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Franchise Owner Panel
    const ownerData = data?.data;
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Franchise Earnings</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Transparent revenue breakdown and organizational splits.</p>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><BarChart3 size={100} /></div>
                <div className="relative space-y-10">
                    <div className="grid grid-cols-2 gap-10 border-b border-white/5 pb-10">
                        <div>
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Total Collections</p>
                            <p className="text-4xl font-black">₹{ownerData?.gross.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Head Office Share ({ownerData?.royaltyPct}%)</p>
                            <p className="text-4xl font-black text-rose-400">- ₹{ownerData?.royaltyAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">My Net Profit</p>
                        <p className="text-6xl font-black">₹{ownerData?.netProfit.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Agreement Compliance Verified</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your revenue split is calculated according to the FOFO model agreement.</p>
                </div>
            </div>
        </div>
    );
};

const RevenueCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-900 dark:bg-slate-950 text-white shadow-slate-900/30'}`}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
    </div>
);

export default FranchiseConsole;
