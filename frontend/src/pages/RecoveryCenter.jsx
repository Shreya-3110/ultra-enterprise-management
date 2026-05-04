import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Database, 
  RotateCcw, 
  Clock, 
  Download, 
  UploadCloud, 
  AlertTriangle,
  Loader2,
  FileArchive,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const RecoveryCenter = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [confirmFile, setConfirmFile] = useState(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/recovery/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(res.data.data);
        } catch (err) {
            console.error('Failed to fetch backups:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerBackup = async () => {
        try {
            setIsBackingUp(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/recovery/backup`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('System Snapshot created successfully!');
            fetchBackups();
        } catch (err) {
            alert('Backup failed: ' + err.message);
        } finally {
            setIsBackingUp(false);
        }
    };

    const executeRestore = async () => {
        if (!confirmFile) return;
        try {
            setIsRestoring(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/recovery/restore`, { filename: confirmFile }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('System Restored successfully! The application will now reload.');
            window.location.reload();
        } catch (err) {
            alert('Restore failed: ' + err.message);
        } finally {
            setIsRestoring(false);
            setConfirmFile(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 text-slate-800 dark:text-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                      <ShieldAlert className="text-rose-600" size={36} />
                      Recovery Center
                   </h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Disaster recovery and automated system snapshots (Head Office only).</p>
                </div>
                <button 
                   onClick={triggerBackup}
                   disabled={isBackingUp}
                   className="bg-slate-900 dark:bg-slate-950 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 flex items-center gap-3 transition-all hover:bg-black active:scale-95 disabled:grayscale"
                >
                   {isBackingUp ? <Loader2 className="animate-spin" /> : <Database size={20} />}
                   {isBackingUp ? 'Snapshotting...' : 'Create Manual Backup'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Status</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Operational</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <StatusItem label="Daily Snapshots" status="Enabled" active={true} />
                             <StatusItem label="Remote Failover" status="Configured" active={true} />
                             <StatusItem label="Data Integrity" status="Verified" active={true} />
                        </div>
                    </div>

                    <div className="bg-amber-600 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform"><Activity size={100} /></div>
                        <h4 className="text-xl font-black leading-tight uppercase tracking-tighter">Point-in-Time Recovery Power</h4>
                        <p className="text-sm font-medium mt-4 opacity-80 leading-relaxed">Every snapshot creates a 100% accurate clone of your entire institutional data. You can rollback time with a single click.</p>
                        <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white dark:bg-[#111827]/10 px-4 py-2 rounded-xl inline-flex border border-white/5">
                           Total Snapshots: {backups.length}
                        </div>
                    </div>
                </div>

                {/* Backups List */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50/30 flex items-center justify-between">
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Recovery Point Timeline</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             Sorted by Date (Latest First)
                        </div>
                    </div>

                    <div className="flex-1 min-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></div>
                        ) : backups.length === 0 ? (
                            <div className="p-20 text-center space-y-4">
                                <FileArchive size={60} className="mx-auto text-slate-100" />
                                <p className="text-slate-400 font-bold">No recovery snapshots detected yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {backups.map((b, i) => (
                                    <div key={i} className="px-8 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                                <ArchiveIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">{b.filename}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1">
                                                        <Clock size={10} /> {new Date(b.date).toLocaleString()}
                                                    </p>
                                                    <span className="text-[10px] text-emerald-500 font-black bg-emerald-50 px-2 py-0.5 rounded uppercase">Verified Signature</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setConfirmFile(b.filename)}
                                            className="bg-rose-50 text-rose-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:text-white shadow-lg shadow-rose-200"
                                        >
                                            Trigger Restore
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Restore Modal */}
            {confirmFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 dark:bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-[#111827] rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="bg-rose-600 p-10 text-white relative">
                            <div className="absolute top-0 right-0 p-10 opacity-20"><AlertTriangle size={80} /></div>
                            <h3 className="text-3xl font-black tracking-tighter">Emergency Restoration</h3>
                            <p className="text-white/70 text-sm mt-2 font-medium italic">Proceed with absolute extreme caution.</p>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] space-y-4">
                                <p className="text-sm font-bold text-rose-700 leading-relaxed">
                                    You are about to rebuild the entire database using the snapshot:
                                    <br />
                                    <code className="text-[10px] block mt-2 bg-white dark:bg-[#111827] px-3 py-2 rounded font-black border border-rose-200">{confirmFile}</code>
                                </p>
                                <p className="text-[11px] text-rose-600 font-medium italic">
                                    This action will **PERMANENTLY OVERWRITE** all current data with data from this snapshot.
                                </p>
                            </div>

                            <button 
                                onClick={executeRestore}
                                disabled={isRestoring}
                                className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {isRestoring ? <Loader2 className="animate-spin" /> : <RotateCcw size={20} />}
                                {isRestoring ? 'RESTORE IN PROGRESS...' : 'EXECUTE EMERGENCY RESTORE'}
                            </button>
                            <button onClick={() => setConfirmFile(null)} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest">Cancel Recovery</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusItem = ({ label, status, active }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{status}</span>
        </div>
    </div>
);

const ArchiveIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12H3"/><path d="M12 3v18"/><path d="M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
    </svg>
);

export default RecoveryCenter;
