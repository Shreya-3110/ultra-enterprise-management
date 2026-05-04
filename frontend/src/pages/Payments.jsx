import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Download, 
  Clock, 
  ChevronRight,
  Receipt,
  CheckCircle2,
  X,
  Loader2,
  CreditCard,
  User,
  Undo2,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateTransactionReport } from '../utils/reportGenerator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Payments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    feeStructureId: '',
    amountPaid: '',
    method: 'UPI',
    datePaid: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, studentsRes, feesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/fees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (studentsRes.data.success) setStudents(studentsRes.data.data);
      if (feesRes.data.success) setFees(feesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (payments.length === 0) {
        setPayments([
          { _id: '1', studentId: { firstName: 'Aryan', lastName: 'Sharma' }, amountPaid: 15000, method: 'UPI', datePaid: '2024-03-15T00:00:00Z', status: 'COMPLETED' },
          { _id: '2', studentId: { firstName: 'Sanya', lastName: 'Gupta' }, amountPaid: 5000, method: 'CASH', datePaid: '2024-03-10T00:00:00Z', status: 'COMPLETED' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/payments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsModalOpen(false);
        setFormData({
          studentId: '',
          feeStructureId: '',
          amountPaid: '',
          method: 'UPI',
          datePaid: new Date().toISOString().split('T')[0],
          notes: ''
        });
        await fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (id) => {
    if (window.confirm('Are you sure you want to process a refund for this transaction?')) {
      try {
        const response = await axios.post(`${API_BASE_URL}/payments/${id}/refund`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          await fetchData();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to process refund');
      }
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time payment tracking and financial reconciliation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50/50">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by student or transaction ID..."
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-blue-500/10 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-white dark:bg-[#111827] rounded-xl transition-all">
            <Download size={16} />
            Export Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm text-slate-400 font-medium">Synchronizing transactions...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((payment) => (
                  <tr key={payment._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                          {payment.studentId?.firstName?.[0]}{payment.studentId?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{payment.studentId?.firstName} {payment.studentId?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-tighter">ID: {payment._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`font-black text-sm ${payment.status === 'REFUNDED' ? 'text-red-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                        ₹{payment.amountPaid?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock size={14} />
                        <span className="text-[11px] font-medium">{new Date(payment.datePaid).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {payment.status !== 'REFUNDED' && (
                            <button 
                             onClick={() => handleRefund(payment._id)}
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                             title="Process Refund"
                            >
                               <Undo2 size={18} />
                            </button>
                         )}
                         <button 
                          onClick={() => generateTransactionReport([payment], `${payment.studentId?.firstName} ${payment.studentId?.lastName}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Download Receipt"
                         >
                            <Receipt size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Record Collection</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Link transaction to student ledger</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleRecord} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Student Record</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      required
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium appearance-none"
                    >
                      <option value="">Select a student...</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                      ))}
                    </select>
                  </div>
                  {formData.studentId && (
                    <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Available Wallet Credits</span>
                      <span className="text-xs font-black text-amber-700">₹{(students.find(s => s._id === formData.studentId)?.walletBalance || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Relational Fee Link</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      name="feeStructureId"
                      value={formData.feeStructureId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium appearance-none"
                    >
                      <option value="">Advance / General Collection</option>
                      {fees.map(f => (
                        <option key={f._id} value={f._id}>{f.name} (Total ₹{f.amount?.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.feeStructureId && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee Head Breakdown</p>
                      {fees.find(f => f._id === formData.feeStructureId)?.feeHeads?.map((head, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">{head.headName}</span>
                          <span className="text-slate-900 dark:text-white font-black">₹{head.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                      {fees.find(f => f._id === formData.feeStructureId)?.lateFee > 0 && (
                        <div className="flex justify-between items-center text-xs text-amber-600 font-bold pt-2 border-t border-slate-200 dark:border-slate-700/50/50">
                          <span className="flex items-center gap-1"><Zap size={10} strokeWidth={3} /> Potential Late Penalty fine</span>
                          <span>+ ₹{fees.find(f => f._id === formData.feeStructureId)?.lateFee?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Collection Value (₹)</label>
                    <input 
                      required
                      type="number"
                      name="amountPaid"
                      value={formData.amountPaid}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold"
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <select 
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold appearance-none"
                    >
                      <option value="UPI">UPI Transfer</option>
                      <option value="CASH">Cash Payment</option>
                      <option value="CARD">Debit/Credit Card</option>
                      <option value="CHEQUE">Bank Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes / References</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium resize-none h-20"
                    placeholder="Transaction ID or specific remarks..."
                  />
                </div>

                <div className="pt-4 flex gap-4 bg-white dark:bg-[#111827] sticky bottom-0 py-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-all active:scale-95"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {submitting ? 'Authenticating...' : 'Confirm Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
