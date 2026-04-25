import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download,
  AlertCircle,
  Loader2,
  Filter,
  FileSpreadsheet,
  FileText,
  Calendar,
  ChevronDown,
  Search
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    class: '',
    category: ''
  });

  useEffect(() => {
    fetchReports();
    fetchLedger();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.get(`${API_URL}/dashboard/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data.charts);
    } catch (err) {
      if (err.response?.status === 403) {
         setError('Unlock Premium to access Advanced Financial Analytics.');
      } else {
         setError('Unable to load analytics.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
     try {
       setLedgerLoading(true);
       const token = localStorage.getItem('token');
       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
       
       // Build query params
       const params = new URLSearchParams();
       if (filters.startDate) params.append('startDate', filters.startDate);
       if (filters.endDate) params.append('endDate', filters.endDate);
       if (filters.class) params.append('class', filters.class);
       if (filters.category) params.append('category', filters.category);

       const response = await axios.get(`${API_URL}/dashboard/ledger?${params.toString()}`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setLedger(response.data.data);
     } catch (err) {
       console.error('Ledger error:', err);
     } finally {
       setLedgerLoading(false);
     }
  };

  const handleExportExcel = () => {
    if (ledger.length === 0) return;
    
    const exportData = ledger.map(item => ({
        'Date': new Date(item.datePaid).toLocaleDateString(),
        'Admission No': item.studentId?.admissionNumber,
        'Student Name': `${item.studentId?.firstName} ${item.studentId?.lastName}`,
        'Class': item.studentId?.currentClass,
        'Fee Plan': item.feeStructureId?.name,
        'Method': item.method,
        'Amount Paid': item.amountPaid,
        'Late Fee': item.lateFeePaid || 0,
        'Transaction ID': item.transactionId
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Collection_Ledger_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
     if (ledger.length === 0) return;
     const doc = new jsPDF('l', 'mm', 'a4');
     doc.setFontSize(22);
     doc.text('Financial Collection Ledger', 14, 20);
     doc.setFontSize(10);
     doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

     const body = ledger.map(item => [
        new Date(item.datePaid).toLocaleDateString(),
        item.studentId?.admissionNumber,
        `${item.studentId?.firstName} ${item.studentId?.lastName}`,
        item.studentId?.currentClass,
        item.amountPaid.toLocaleString(),
        item.method,
        item.transactionId
     ]);

     autoTable(doc, {
         startY: 35,
         head: [['Date', 'Adm No', 'Student', 'Class', 'Amount', 'Method', 'Ref ID']],
         body: body,
         theme: 'striped',
         headStyles: { fillColor: [15, 23, 42] }
     });

     doc.save('Financial_Ledger.pdf');
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="bg-slate-50 border border-amber-200 p-10 rounded-[3rem] text-center shadow-2xl shadow-amber-500/10 max-w-md">
          <AlertCircle size={64} className="text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Premium Analytics</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">Upgrade Plan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Reports Console</h1>
          <p className="text-slate-500 font-medium text-lg mt-2 italic">Institutional revenue & branch-wise collection intelligence.</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all hover:bg-emerald-100 active:scale-95">
              <FileSpreadsheet size={16} /> Excel Export
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all hover:bg-black shadow-xl shadow-slate-900/20 active:scale-95">
              <FileText size={16} /> PDF Ledger
            </button>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Calendar size={12} /> Date Range
             </label>
             <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
                <span className="text-slate-300">→</span>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch/Class</label>
             <select 
               value={filters.class}
               onChange={(e) => setFilters({...filters, class: e.target.value})}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
             >
                <option value="">All Branches</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 10">Class 10</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
             <select 
               value={filters.category}
               onChange={(e) => setFilters({...filters, category: e.target.value})}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
             >
                <option value="">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
             </select>
          </div>
          <div className="flex items-end">
             <button 
               onClick={fetchLedger}
               disabled={ledgerLoading}
               className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:grayscale"
             >
                {ledgerLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                Search Data
             </button>
          </div>
      </div>

      {/* Analytics Visualization Group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden h-[400px]">
             <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart3 size={18}/></div>
                Collection Velocity
             </h3>
             <Bar 
               data={{
                  labels: reportData?.revenue.labels || [],
                  datasets: [{ 
                    label: 'Revenue (₹)', 
                    data: reportData?.revenue.data || [], 
                    backgroundColor: 'rgba(37, 99, 235, 1)',
                    borderRadius: 12,
                    barThickness: 32
                  }]
               }} 
               options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
             />
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden h-[400px]">
             <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><PieChartIcon size={18}/></div>
                Ledger Health Split
             </h3>
             <Doughnut 
               data={{
                  labels: ['Paid', 'Pending', 'Overdue'],
                  datasets: [{ 
                    data: reportData?.collectionStatus.data || [], 
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    weight: 0.1
                  }]
               }} 
               options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '75%' }} 
             />
         </div>
      </div>

      {/* The Master Ledger Table */}
      <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5">
             <div>
                <h3 className="text-xl font-black text-white">Live Collection Ledger</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global Transaction Audit Trail</p>
             </div>
             <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Inbound</p>
                <p className="text-lg font-black text-blue-400">₹{ledger.reduce((s,i) => s + i.amountPaid, 0).toLocaleString()}</p>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-white/2">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student / Admission</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee Plan</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount (₹)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {ledger.length > 0 ? ledger.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-all text-sm group">
                         <td className="px-8 py-5 text-slate-400 font-medium">
                            {new Date(item.datePaid).toLocaleDateString()}
                         </td>
                         <td className="px-8 py-5">
                            <p className="font-bold text-white uppercase tracking-tight">{item.studentId?.firstName} {item.studentId?.lastName}</p>
                            <p className="text-[10px] text-slate-500 font-black">{item.studentId?.admissionNumber} • {item.studentId?.currentClass}</p>
                         </td>
                         <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-slate-300">
                               {item.feeStructureId?.name}
                            </span>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-xs font-black text-blue-400 uppercase">{item.method}</p>
                            <p className="text-[8px] text-slate-600 font-mono italic">{item.transactionId}</p>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <p className="text-lg font-black text-emerald-400">₹{item.amountPaid.toLocaleString()}</p>
                            {item.lateFeePaid > 0 && <p className="text-[9px] font-bold text-amber-500">+ ₹{item.lateFeePaid} late fee</p>}
                         </td>
                      </tr>
                   )) : (
                      <tr>
                         <td colSpan="5" className="px-8 py-20 text-center">
                            {ledgerLoading ? <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" /> : (
                               <p className="text-slate-600 font-bold">No transactions found for the selected filters.</p>
                            )}
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};

export default Reports;

