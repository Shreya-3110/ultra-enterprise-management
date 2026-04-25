import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Calendar,
  Wallet,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Loader2,
  Receipt
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Initialize Stripe outside of the component to avoid recreating the object on every render
const stripePromise = loadStripe('pk_test_51SjvP77ZKSHApLNyw3xRtxV8eG00SlDkXPKm5ZIzZqwmAs1OH6rbjZZ8MKrKjFD1rLgsb2NNJbeNZ4qixDKgzamP00E4FETC8k');

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/v1/students/my-children', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChildren(response.data.data);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 animate-pulse">Loading child records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Parent Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Hello! Welcome back to your child's academic and fee overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            {children.length}
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Children</p>
            <p className="text-sm font-bold text-slate-900">Registered</p>
          </div>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-lg font-bold text-slate-600">No matching child records found.</p>
            <p className="text-slate-400 max-w-xs mx-auto mt-2">If your child was recently admitted, please ensure your email matches the one in school records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {children.map((child) => (
            <ChildCard key={child._id} child={child} />
          ))}
        </div>
      )}
      {/* Mobile Bottom Navigation (Visible only on small screens) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-slate-900 shadow-2xl shadow-slate-900/40 rounded-[2rem] p-3 flex items-center justify-around border border-white/10 backdrop-blur-xl">
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Kids</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Events</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChildCard = ({ child }) => {
  // Stat calculations - FIXED for Multi-Fee support
    const totalFee = child.activeFeeStructures?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const paidFee = child.totalPaid || 0;
    const pendingFee = Math.max(0, totalFee - paidFee);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [loadingIntent, setLoadingIntent] = useState(false);

    const handleOpenPayment = async () => {
      // Don't open if fully paid or no active fee structures
      if (pendingFee <= 0 || !child.activeFeeStructures || child.activeFeeStructures.length === 0) return;

      setLoadingIntent(true);
      setIsPaymentModalOpen(true);

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/v1/stripe/create-intent', {
           amount: pendingFee,
           studentId: child._id
        }, {
           headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
           setClientSecret(res.data.clientSecret);
        }
      } catch (err) {
        console.error('Failed to create payment intent:', err);
        alert('Failed to initialize payment gateway.');
        setIsPaymentModalOpen(false);
      } finally {
        setLoadingIntent(false);
      }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
       try {
           setIsPaymentModalOpen(false);
           const token = localStorage.getItem('token');
           
           // For simplicity in payment recording, we'll use the ID of the first fee structure
           // The backend logic handles allocation automatically
           await axios.post('http://localhost:5000/api/v1/payments', {
               studentId: child._id,
               feeStructureId: child.activeFeeStructures?.[0]?._id, 
               amountPaid: pendingFee,
               method: 'ONLINE',
               transactionId: paymentIntent.id
           }, {
               headers: { Authorization: `Bearer ${token}` }
           });
           
           alert(`Payment of ₹${pendingFee.toLocaleString()} successful! The ledger is updated.`);
           window.location.reload();
       } catch (err) {
           console.error("Failed to update ledger:", err);
           alert("Payment succeeded, but ledger update had an issue.");
        }
    };

    const handleDownloadPDF = () => {
       alert("Generating secure statement... Please wait.");
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col group hover:border-blue-400 transition-all duration-300">
            {/* Child Profile Header - App Style */}
            <div className="bg-slate-900 p-6 md:p-8 text-white relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -translate-y-12 translate-x-12" />
                <div className="relative flex items-center gap-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-xl md:text-2xl font-black">{child.firstName.charAt(0)}{child.lastName.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{child.firstName} {child.lastName}</h2>
                            <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">Active</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10 uppercase">ID: {child.admissionNumber}</span>
                            <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10 uppercase">Class: {child.currentClass}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body - Mobile Card Style */}
            <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-4 md:p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Combined Due</p>
                        <p className="text-lg md:text-xl font-black text-slate-900">₹{totalFee.toLocaleString()}</p>
                    </div>
                    <div className="p-4 md:p-5 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-lg md:text-xl font-black text-blue-700">₹{pendingFee.toLocaleString()}</p>
                    </div>
                </div>

                {/* Tracking Bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-inner shadow-slate-50">
                   <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingDown size={14} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Progress</span>
                        </div>
                        <span className="text-xs font-black text-blue-600">{totalFee > 0 ? Math.round((paidFee / totalFee) * 100) : 0}% Paid</span>
                   </div>
                   <div className="h-4 w-full bg-slate-100/50 rounded-full overflow-hidden p-1">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: `${totalFee > 0 ? Math.min(100, (paidFee / totalFee) * 100) : 0}%` }} />
                   </div>
                   <p className="text-[10px] text-slate-400 mt-3 font-medium text-center">Your payments are protected with 256-bit encryption</p>
                </div>

                {/* Mobile View: Quick Tabs for Installments/Collections */}
                <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar size={18} className="text-blue-500" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Installment Strategy</h4>
                    </div>
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                         {child.installments && child.installments.length > 0 ? child.installments.map((inst, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-transform active:scale-[0.98]">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {inst.status === 'PAID' ? <CheckCircle2 size={16} /> : <div className="text-[10px] font-black font-mono">T{i+1}</div>}
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">₹{inst.amount.toLocaleString()}</span>
                               </div>
                               <div className="text-right">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${inst.status === 'PAID' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                     {inst.status === 'PAID' ? 'PAID' : new Date(inst.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                  </p>
                                  {inst.status !== 'PAID' && <p className="text-[8px] font-bold text-slate-300 mt-0.5">DUE SOON</p>}
                               </div>
                            </div>
                         )) : (
                            <p className="text-[10px] text-slate-400 italic text-center py-4">No active payment plan found.</p>
                         )}
                    </div>
                </div>

                {/* Footer Fast Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                       onClick={handleOpenPayment}
                       disabled={pendingFee <= 0 || !child.activeFeeStructures || child.activeFeeStructures.length === 0}
                       className="col-span-2 py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
                    >
                        <CreditCard size={20} />
                        <span className="uppercase tracking-widest text-sm">{pendingFee > 0 ? `Pay ₹${pendingFee.toLocaleString()} Now` : 'Fully Paid'}</span>
                    </button>
                    <button className="py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Receipt size={14} />
                        Receipts
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Download size={14} />
                        Statement
                    </button>
                </div>
            </div>

            {/* Payment Modal Overlay - App Style */}
            {isPaymentModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-4">
                  <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                     <div className="bg-slate-900 p-8 text-white text-center rounded-b-[2.5rem]">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden"></div>
                        <h3 className="text-2xl font-bold tracking-tight">Secure Payment</h3>
                        <p className="text-slate-400 text-sm mt-1">Direct payment to School Bank</p>
                     </div>
                     <div className="p-8">
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                           <span className="text-3xl font-black text-blue-600">₹{pendingFee.toLocaleString()}</span>
                        </div>
                        
                        {loadingIntent ? (
                           <div className="flex flex-col items-center justify-center py-12">
                              <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing Gateway...</p>
                           </div>
                        ) : clientSecret ? (
                           <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <CheckoutForm 
                                 clientSecret={clientSecret} 
                                 amount={pendingFee} 
                                 onCancel={() => setIsPaymentModalOpen(false)} 
                                 onPaymentSuccess={handlePaymentSuccess} 
                              />
                           </Elements>
                        ) : (
                           <div className="p-5 bg-red-50 text-red-600 rounded-2xl text-center font-bold text-sm border border-red-100">
                              Connection failed. Please check your internet and try again.
                           </div>
                        )}
                        <button 
                           onClick={() => setIsPaymentModalOpen(false)}
                           className="w-full mt-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest"
                        >
                           Cancel Transaction
                        </button>
                     </div>
                  </div>
               </div>
            )}
        </div>
    );
};

export default ParentDashboard;

