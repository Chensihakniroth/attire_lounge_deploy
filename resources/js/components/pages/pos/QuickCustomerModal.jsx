import React, { useState } from 'react';
import { X, User, Phone, Mail, FileText, Check, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import ModernModal from '../../common/ModernModal';

export default function QuickCustomerModal({ isOpen, onClose, onSuccess }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        is_vip: false,
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.post('/api/v1/admin/customer-profiles', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess(response.data.data);
            onClose();
        } catch (error) {
            console.error('Failed to register customer:', error);
            alert('Error registering customer. Please check details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ModernModal 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-md"
            showCloseButton={false}
        >
            {/* Header */}
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-attire-accent/10 rounded-2xl border border-attire-accent/20">
                        <Sparkles size={20} className="text-attire-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif text-gray-900 dark:text-white">Quick Register</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Client Entry</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <div className="relative group">
                            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                            <input 
                                required
                                autoFocus
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold tracking-wide outline-none focus:border-attire-accent/50 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                                <input 
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-mono tracking-widest outline-none focus:border-attire-accent/50 transition-all"
                                    placeholder="012 345 678"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-mono outline-none focus:border-attire-accent/50 transition-all"
                                    placeholder="client@mail.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Notes / Preferences</label>
                        <div className="relative group">
                            <FileText size={14} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                            <textarea 
                                rows={2}
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs tracking-wide outline-none focus:border-attire-accent/50 transition-all resize-none"
                                placeholder="Important details..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-attire-accent/5 rounded-2xl border border-attire-accent/10">
                        <input 
                            type="checkbox"
                            id="quick_vip"
                            checked={formData.is_vip}
                            onChange={e => setFormData({...formData, is_vip: e.target.checked})}
                            className="w-4 h-4 rounded accent-attire-accent cursor-pointer"
                        />
                        <label htmlFor="quick_vip" className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer select-none">
                            Mark as VIP Member
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-4 border border-black/10 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex-1 py-4 bg-attire-accent text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-none border border-black/5 dark:border-white/5"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {isSaving ? 'Saving...' : 'Confirm Identity'}
                    </button>
                </div>
            </form>
        </ModernModal>
    );
}
