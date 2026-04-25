import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet, 
  ArrowRight,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Papa from 'papaparse';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const MigrationCenter = () => {
    const [fileData, setFileData] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, simulated, committed

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setFileData(results.data);
                setStatus('idle');
                setReport(null);
            }
        });
    };

    const runSimulation = async () => {
        if (fileData.length === 0) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/migration/simulate`, 
                { data: fileData },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReport(res.data.report);
            setStatus('simulated');
        } catch (err) {
            alert('Simulation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const executeCommit = async () => {
        if (!report || report.readyToImport.length === 0) return;
        try {
            setCommitting(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/migration/commit`, 
                { data: report.readyToImport },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setStatus('committed');
        } catch (err) {
            alert('Migration failed: ' + err.message);
        } finally {
            setCommitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                      <Database className="text-blue-600" size={36} />
                      Migration Engine
                   </h1>
                   <p className="text-slate-500 font-medium mt-2">Enterprise-grade data migration with Sandbox simulation.</p>
                </div>
                {status === 'simulated' && report && (
                    <button 
                       onClick={executeCommit}
                       disabled={committing || report.valid === 0}
                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-all active:scale-95 disabled:grayscale"
                    >
                       {committing ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                       Commit {report.valid} Records
                    </button>
                )}
            </div>

            {/* Stage 1: Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between h-full">
                    <div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <Upload size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">1. Upload Source</h3>
                        <p className="text-sm text-slate-400 font-medium mb-8">Drop your student CSV or Excel export here. We support multiple headers.</p>
                        
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileSpreadsheet className="text-slate-300 group-hover:text-blue-500 mb-3 transition-colors" size={32} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Select File</p>
                            </div>
                            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {fileData.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                             <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-black text-slate-900 uppercase">Input Rows</span>
                                <span className="text-xl font-black text-blue-600">{fileData.length}</span>
                             </div>
                             <button 
                                onClick={runSimulation}
                                disabled={loading || status === 'committed'}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
                             >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="text-amber-400 fill-amber-400" />}
                                Start Simulation
                             </button>
                        </div>
                    )}
                </div>

                {/* Stage 2: Sandbox Report */}
                <div className="md:col-span-2 bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-20 translate-x-20"></div>
                    
                    <div className="relative h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tight">Sandbox Report</h3>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status === 'simulated' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                {status === 'idle' ? 'Awaiting Input' : status === 'simulated' ? 'Ready to Review' : 'Imported'}
                            </div>
                        </div>

                        {!report ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Database className="text-slate-700" size={32} />
                                </div>
                                <p className="text-slate-500 max-w-xs font-medium">Please upload a source file and start simulation to see the sandbox results.</p>
                            </div>
                        ) : (
                            <div className="space-y-10 flex-1">
                                <div className="grid grid-cols-3 gap-4">
                                    <ReportStat label="Valid" value={report.valid} color="emerald" />
                                    <ReportStat label="Duplicates" value={report.duplicates} color="amber" />
                                    <ReportStat label="Errors" value={report.invalid} color="rose" />
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-[2rem] flex-1 min-h-[300px] overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-white/5 bg-white/2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Error Log & Conflict Audit</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[350px]">
                                        {report.errors.length === 0 && (
                                            <div className="py-20 text-center">
                                                <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={32} />
                                                <p className="text-slate-400 font-bold">Zero errors detected. Ready for high-speed import!</p>
                                            </div>
                                        )}
                                        {report.errors.map((err, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl group hover:bg-white/5 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 text-xs font-black">
                                                    #{err.rowNum}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-300">{err.message}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                       <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded uppercase font-black tracking-tighter">Skipped</span>
                                                       <span className="text-[9px] text-slate-600 font-bold italic">Validation check failed</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportStat = ({ label, value, color }) => {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };
    return (
        <div className={`p-6 rounded-[1.5rem] border ${colors[color]} text-center`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{label}</p>
            <p className="text-3xl font-black leading-none">{value}</p>
        </div>
    );
};

export default MigrationCenter;
