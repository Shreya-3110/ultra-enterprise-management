import React, { useState } from 'react';
import axios from 'axios';
import { 
  History, 
  Wallet, 
  RotateCcw, 
  Scissors, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Plus,
  Minus
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Adjustments = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [isAdjusting, setIsAdjusting] = useState(false);

    // Form states
    const [walletAmount, setWalletAmount] = useState('');
    const [walletAction, setWalletAction] = useState('ADD');
    const [reason, setReason] = useState('');

    const searchStudent = async () => {
        if (!searchQuery) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/students?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.data.length > 0) {
                const s = res.data.data[0];
                setStudent(s);
                // Fetch student payments
                const pRes = await axios.get(`${API_BASE_URL}/payments?studentId=${s._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(pRes.data.data);
            } else {
                alert('No student found');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleWalletAdjust = async () => {
        if (!walletAmount || !reason || !student) return;
        try {
            setIsAdjusting(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/adjustments/wallet/${student._id}`, {
                amount: walletAmount,
                action: walletAction,
                reason
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setStudent({ ...student, walletBalance: res.data.walletBalance });
            alert('Wallet adjusted successfully');
            setWalletAmount('');
            setReason('');
        } catch (err) {
            alert('Adjustment failed: ' + err.message);
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleRefund = async (paymentId) => {
        if (!window.confirm('Are you sure you want to refund this payment to the student wallet?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/adjustments/refund/${paymentId}`, {
                reason: 'Requested by Admin',
                toWallet: true
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert('Payment refunded to wallet');
            searchStudent(); // Refresh data
        } catch (err) {
            alert('Refund failed: ' + err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                      <Scissors className="text-blue-600" size={36} />
                      Ledger Hardening
                   </h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage refunds, wallet adjustments, and fine waivers.</p>
                </div>
                
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Student by ID or Name..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchStudent()}
                    />
                </div>
            </div>

            {loading && <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" size={48} /></div>}

            {!loading && student && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student Info & Wallet */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={80} /></div>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Active Ledger</p>
                            <h3 className="text-2xl font-bold uppercase tracking-tight">{student.firstName} {student.lastName}</h3>
                            <p className="text-sm text-slate-400 font-medium">{student.admissionNumber} • {student.currentClass}</p>

                            <div className="mt-10 border-t border-white/5 pt-8">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Wallet Balance</p>
                                <p className="text-5xl font-black">₹{student.walletBalance.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Manual Adjustment</h4>
                            <div className="space-y-4">
                                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <button 
                                        onClick={() => setWalletAction('ADD')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-2 transition-all ${walletAction === 'ADD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        <Plus size={14} /> CREDIT
                                    </button>
                                    <button 
                                        onClick={() => setWalletAction('SUBTRACT')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-2 transition-all ${walletAction === 'SUBTRACT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        <Minus size={14} /> DEBIT
                                    </button>
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="Amount (₹)"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                    value={walletAmount}
                                    onChange={e => setWalletAmount(e.target.value)}
                                />
                                <textarea 
                                    placeholder="Reason for adjustment..."
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-medium text-sm min-h-[100px]"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                                <button 
                                    disabled={isAdjusting}
                                    onClick={handleWalletAdjust}
                                    className="w-full py-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                                >
                                    {isAdjusting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Process Adjustment'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Refundable Payments */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50/20 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Refundable Transactions</h3>
                                <RotateCcw size={20} className="text-slate-300" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50 dark:border-slate-800/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-right font-black"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {payments.length === 0 && (
                                            <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">No transactions found for this student.</td></tr>
                                        )}
                                        {payments.map((p) => (
                                            <tr key={p._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-tighter">{p._id.slice(-10)}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium italic">Method: {p.paymentMethod}</p>
                                                </td>
                                                <td className="px-8 py-6 font-black text-slate-900 dark:text-white">₹{p.amountPaid.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'REFUNDED' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {p.status || 'PAID'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {p.status !== 'REFUNDED' && (
                                                        <button 
                                                            onClick={() => handleRefund(p._id)}
                                                            className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                                        >
                                                            Refund to Wallet
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] flex items-center gap-6">
                           <div className="w-16 h-16 bg-white dark:bg-[#111827] text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                               <TrendingDown size={32} />
                           </div>
                           <div>
                               <h4 className="font-bold text-slate-900 dark:text-white">Fine Waiver Engine</h4>
                               <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">To waive a late fine, go to the **Students** profile and use the **Fee Adjustment** tool on individual installments. This ensures legal compliance with the fee contract.</p>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {!student && !loading && (
                <div className="py-40 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                        <Search size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">Search for a student to begin financial adjustment.</p>
                </div>
            )}
        </div>
    );
};

export default Adjustments;
