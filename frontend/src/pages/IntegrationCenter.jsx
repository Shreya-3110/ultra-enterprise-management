import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Terminal, 
  Key, 
  ShieldCheck, 
  Webhook, 
  Code, 
  Copy, 
  Loader2, 
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const IntegrationCenter = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKey, setNewKey] = useState(null);
    const [keyName, setKeyName] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // We get the keys from the school settings
            // For now, let's assume we have a simplified way to list them
            setKeys([]); // Placeholder for actual list fetch if needed
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateKey = async (e) => {
        e.preventDefault();
        try {
            setGenerating(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/integration/keys`, 
                { name: keyName || 'External API Access' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewKey(res.data.key);
            setKeyName('');
        } catch (err) {
            alert('Failed to generate key: ' + err.message);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-500 pb-10 sm:pb-20 px-2 sm:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                <div>
                   <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                      <Terminal className="text-blue-600" size={32} />
                      Integrations
                   </h1>
                   <p className="text-slate-500 text-sm sm:text-base font-medium mt-1 sm:mt-2">Connect Ultra Enterprise to your ecosystem via Webhooks & REST.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* API Key Management */}
                <div className="xl:col-span-1 bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 sm:space-y-8 flex flex-col">
                    <div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <Key size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Generate API Secret</h3>
                        <p className="text-sm text-slate-400 font-medium">Issue unique tokens for external developers or automated scripts.</p>
                    </div>

                    <form onSubmit={generateKey} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Key Name (e.g. Accounting Sync)"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                            value={keyName}
                            onChange={e => setKeyName(e.target.value)}
                        />
                        <button 
                            disabled={generating}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            {generating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            Generate Key
                        </button>
                    </form>

                    {newKey && (
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in zoom-in duration-300">
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Your Secret Key (Save it!)</p>
                             <div className="flex items-center gap-2 bg-white p-3 border border-emerald-200 rounded-xl">
                                <code className="text-xs font-mono font-black text-emerald-700 truncate flex-1">{newKey}</code>
                                <button onClick={() => copyToClipboard(newKey)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                                    <Copy size={16} />
                                </button>
                             </div>
                             <p className="text-[9px] text-emerald-500 font-bold mt-3">* This key gives full read-access to your organizational ledger.</p>
                        </div>
                    )}
                </div>

                {/* Integration Dashboard */}
                <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                    <div className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 hidden sm:block"><Webhook size={100} /></div>
                        <div className="relative">
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 sm:mb-2">Webhook Status</h3>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-10">Real-time payment gateway synchronization status.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatusCard label="Stripe Global" status="Operational" lastActive="2 mins ago" />
                                <StatusCard label="Razorpay Local" status="Configuration Needed" lastActive="N/A" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-3">
                            <Code className="text-blue-600" size={24} />
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Developer Documentation</h3>
                        </div>
                        
                        <div className="space-y-6">
                             <div>
                                <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">1. Authenticate Request</p>
                                <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 font-mono text-[10px] sm:text-xs text-blue-300 leading-relaxed overflow-x-auto whitespace-nowrap sm:whitespace-normal">
                                    <p>curl -H "X-API-KEY: YOUR_KEY" \</p>
                                    <p>     https://api.ultraenterprise.app/v1/integration/reports/ledger</p>
                                </div>
                             </div>

                             <div>
                                <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">2. Webhook Callback URL</p>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <code className="text-[10px] sm:text-xs font-black text-slate-600 uppercase break-all">/api/v1/integration/webhooks/stripe</code>
                                    <button onClick={() => copyToClipboard('https://api.ultraenterprise.app/v1/integration/webhooks/stripe')} className="text-blue-600 font-bold text-xs flex items-center gap-1 shrink-0">
                                        <Copy size={14} /> Copy URL
                                    </button>
                                </div>
                             </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center gap-4 text-sm text-slate-500 font-medium italic">
                            <Info size={16} className="text-blue-500" />
                            Use these endpoints to sync your data with customized mobile apps or parent-facing portals.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ label, status, lastActive }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-start">
        <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">{label}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Last Active: {lastActive}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status === 'Operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {status}
        </span>
    </div>
);

export default IntegrationCenter;
