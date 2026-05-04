import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  Clock, 
  Zap,
  ChevronRight,
  Settings2,
  X,
  Loader2,
  Trash2,
  AlertCircle,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Fees = () => {
  const { token } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    feeHeads: [{ headName: 'Tuition Fee', amount: '' }],
    amount: 0,
    frequency: 'MONTHLY',
    applicableClasses: [],
    installments: [],
    lateFee: 0,
    lateFeeFrequency: 'FIXED'
  });

  const addFeeHead = () => {
    setFormData(prev => ({
      ...prev,
      feeHeads: [...prev.feeHeads, { headName: '', amount: '' }]
    }));
  };

  const removeFeeHead = (index) => {
    setFormData(prev => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, i) => i !== index)
    }));
  };

  const updateFeeHead = (index, field, value) => {
    setFormData(prev => {
      const newHeads = [...prev.feeHeads];
      newHeads[index] = { ...newHeads[index], [field]: value };
      const total = newHeads.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
      return { ...prev, feeHeads: newHeads, amount: total };
    });
  };

  const addInstallment = () => {
    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, { amount: '', dueDate: '', status: 'PENDING' }]
    }));
  };

  const removeInstallment = (index) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index)
    }));
  };

  const updateInstallment = (index, field, value) => {
    setFormData(prev => {
      const newInstallments = [...prev.installments];
      newInstallments[index] = { ...newInstallments[index], [field]: value };
      return { ...prev, installments: newInstallments };
    });
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      if (fees.length === 0) {
        setFees([
          { _id: '1', name: 'Annual Tuition Fee', amount: 45000, frequency: 'YEARLY', applicableClasses: ['Primary', 'Secondary'], category: 'GENERAL' },
          { _id: '2', name: 'Quarterly Lab Fee', amount: 2500, frequency: 'QUARTERLY', applicableClasses: ['Secondary Only'], category: 'PREMIUM' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFees();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData
      };

      const response = await axios.post(`${API_BASE_URL}/fees`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          category: 'GENERAL',
          feeHeads: [{ headName: 'Tuition Fee', amount: '' }],
          amount: 0,
          frequency: 'MONTHLY',
          applicableClasses: [],
          installments: [],
          lateFee: 0,
          lateFeeFrequency: 'FIXED'
        });
        await fetchFees();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name} structure?`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/fees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setFees(prev => prev.filter(f => f._id !== id));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete fee structure');
      }
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fee Engine Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure academic fee structures, heads, and auto-billing rules</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>New Fee Plan</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-sm text-slate-400 font-medium">Loading structures...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fees.map((fee) => (
            <div key={fee._id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 p-6 rounded-[2rem] flex flex-col hover:border-blue-300 transition-all group shadow-sm shadow-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                  <Layers size={20} />
                </div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 uppercase tracking-widest flex items-center gap-1">
                    v{fee.version || 1}
                  </span>
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">{fee.frequency}</span>
                  <button 
                    onClick={() => handleDelete(fee._id, fee.name)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1 leading-tight">{fee.name}</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category:</span>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">
                   {fee.category || 'General'}
                </span>
              </div>
              
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-6">
                {Array.isArray(fee.applicableClasses) ? fee.applicableClasses.join(', ') : fee.applicableClasses}
              </p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Total Plan Value</p>
                  <span className="text-xl font-black text-slate-900 dark:text-white">₹{fee.amount?.toLocaleString()}</span>
                </div>
                <button className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>

              {fee.feeHeads && fee.feeHeads.length > 0 && (
                <div className="mt-4 space-y-1">
                  {fee.feeHeads.map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{h.headName}</span>
                      <span className="font-bold">₹{h.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {fee.installments && fee.installments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Installment Strategy</p>
                  <div className="space-y-2">
                    {fee.installments.map((inst, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${inst.status === 'PAID' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></div>
                          <span className="font-bold text-slate-600 dark:text-slate-400">₹{inst.amount?.toLocaleString()}</span>
                        </div>
                        <span className={`font-black uppercase tracking-tighter ${inst.status === 'PAID' ? 'text-green-600' : 'text-slate-400'}`}>
                          {inst.status === 'PAID' ? 'PAID' : new Date(inst.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#111827] sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Configure Fee Engine</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Define complex pricing rules and installment models</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSave} className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fee Structure Name</label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium"
                      placeholder="e.g. Class 10 - Standard Science"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold appearance-none"
                    >
                      <option value="GENERAL">General/Open</option>
                      <option value="PREMIUM">Premium/Special</option>
                      <option value="RTE">RTE/Reserved</option>
                      <option value="STAFF">Staff Quota</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Frequency</label>
                    <select 
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold appearance-none"
                    >
                      <option value="MONTHLY">Monthly Billing</option>
                      <option value="QUARTERLY">Quarterly Cycle</option>
                      <option value="YEARLY">Yearly Enrollment</option>
                      <option value="ONE_TIME">Final One-time Fee</option>
                    </select>
                  </div>
                </div>

                {/* Multiple Fee Heads Section */}
                <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Multiple Fee Heads</label>
                      <p className="text-[10px] text-slate-400 ml-1">Tuition, Lab, Library, etc.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addFeeHead}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    >
                      <Plus size={12} /> Add Component
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.feeHeads.map((head, idx) => (
                      <div key={idx} className="flex gap-4 items-end animate-in slide-in-from-left-2 duration-300">
                        <div className="flex-[2] space-y-1">
                          <input 
                            placeholder="Head Name (e.g. Lab Fee)"
                            value={head.headName}
                            onChange={(e) => updateFeeHead(idx, 'headName', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <input 
                            type="number"
                            placeholder="Amount (₹)"
                            value={head.amount}
                            onChange={(e) => updateFeeHead(idx, 'amount', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold text-right"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFeeHead(idx)}
                          className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                          disabled={formData.feeHeads.length <= 1}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl flex justify-between items-center shadow-lg shadow-slate-200">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-green-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregated Amount</span>
                    </div>
                    <span className="text-lg font-black text-white">₹{formData.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Academic Classes</label>
                  <div className="flex flex-wrap gap-2">
                    {['Nursery', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            applicableClasses: prev.applicableClasses.includes(c)
                              ? prev.applicableClasses.filter(cls => cls !== c)
                              : [...prev.applicableClasses, c]
                          }))
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          formData.applicableClasses.includes(c)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {formData.applicableClasses.length === 0 && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">Please select at least one target class</p>
                  )}
                </div>

                {/* Late Fee Automation Section */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Late Fee Penalty (₹)</label>
                    <div className="relative">
                      <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                      <input 
                        type="number"
                        name="lateFee"
                        value={formData.lateFee}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-10 pr-5 py-3 text-sm outline-none focus:ring-2 ring-amber-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Late Fee Logic</label>
                    <select 
                      name="lateFeeFrequency"
                      value={formData.lateFeeFrequency}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-amber-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-bold appearance-none"
                    >
                      <option value="FIXED">Single Fixed Fine</option>
                      <option value="DAILY">Daily Cumulative Fine</option>
                    </select>
                  </div>
                </div>

                {/* Installments Section */}
                <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Installment Strategy</label>
                      <p className="text-[10px] text-slate-400 ml-1">Break total into manageable parts</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addInstallment}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    >
                      <Calendar size={12} /> Add Milestone
                    </button>
                  </div>

                  {formData.installments.map((inst, idx) => (
                    <div key={idx} className="flex gap-3 items-end animate-in slide-in-from-left-2 duration-200">
                      <div className="flex-1 space-y-1">
                        <input 
                          type="number"
                          placeholder="Amount"
                          value={inst.amount}
                          onChange={(e) => updateInstallment(idx, 'amount', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input 
                          type="date"
                          value={inst.dueDate}
                          onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 ring-blue-500/10 focus:bg-white dark:bg-[#111827] transition-all text-slate-700 dark:text-slate-300 font-medium"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeInstallment(idx)}
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {formData.installments.length > 0 && (
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                      formData.installments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) === Number(formData.amount)
                        ? 'bg-green-50 border-green-100 text-green-600'
                        : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <AlertCircle size={16} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Reconciliation: ₹{formData.installments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()} / ₹{formData.amount.toLocaleString()}
                        </span>
                        {formData.installments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) !== Number(formData.amount) && (
                          <span className="text-[9px] font-bold opacity-70 italic tracking-tight">Warning: Installment sum must equal the total plan amount.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-10 flex gap-4 bg-white dark:bg-[#111827] sticky bottom-0 z-10 py-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-all border-b-4 active:border-b-0 active:translate-y-1"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting || formData.applicableClasses.length === 0 || (formData.installments.length > 0 && formData.installments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) !== Number(formData.amount))}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {submitting ? 'Deploying Ledger...' : 'Authorize Fee Plan'}
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

export default Fees;
