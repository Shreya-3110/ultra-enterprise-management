import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  Save, 
  Smartphone, 
  BellRing,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    schoolName: 'Ultra Enterprise Mgmt',
    email: 'admin@basic.com',
    phone: '+91 98765 43210',
    address: '123 Academic Block, Bangalore, KA',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata',
    whatsappEnabled: true,
    emailAlertsEnabled: true,
    autoLateFees: true
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('School configuration successfully updated!');
    }, 1200);
  };

  const handleToggle = (field) => {
     setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your institution's core preferences and automation rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Sidebar Navigation (Mock) */}
         <div className="lg:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-blue-50 text-blue-700 rounded-2xl font-bold shadow-sm border border-blue-100">
               <Building2 size={20} />
               General Profile
            </button>
            <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-semibold transition-colors">
               <BellRing size={20} />
               Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-semibold transition-colors">
               <CreditCard size={20} />
               Billing & Formatting
            </button>
            <button className="w-full flex items-center gap-3 px-5 py-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-semibold transition-colors mt-4">
               <ShieldCheck size={20} />
               Security Auth
            </button>
         </div>

         {/* Main Forms */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* General Settings */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-slate-400" /> Institution Profile
               </h3>
               
               <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                     <input 
                        value={formData.schoolName}
                        onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Mail size={12}/> Support Email</label>
                        <input 
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Smartphone size={12}/> Contact Node</label>
                        <input 
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MapPin size={12}/> Physical Address</label>
                     <input 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                     />
                  </div>

                  <hr className="border-slate-100 my-6" />

                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <Globe size={20} className="text-slate-400" /> Localization & Toggles
                  </h3>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                           <p className="font-bold text-slate-800 text-sm">WhatsApp Notifications</p>
                           <p className="text-xs text-slate-500">Automatically ping parents on payments.</p>
                        </div>
                        <button type="button" onClick={() => handleToggle('whatsappEnabled')} className={`w-12 h-6 rounded-full transition-colors relative ${formData.whatsappEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                           <span className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${formData.whatsappEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                           <p className="font-bold text-slate-800 text-sm">Automated Defaulter Tagging</p>
                           <p className="text-xs text-slate-500">Let AI apply High-Risk badges to delayed ledgers.</p>
                        </div>
                        <button type="button" onClick={() => handleToggle('autoLateFees')} className={`w-12 h-6 rounded-full transition-colors relative ${formData.autoLateFees ? 'bg-blue-500' : 'bg-slate-300'}`}>
                           <span className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${formData.autoLateFees ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                     <button type="submit" disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                        {saving ? <span className="animate-spin text-xl">◌</span> : <Save size={18} />}
                        Save Configuration
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;

