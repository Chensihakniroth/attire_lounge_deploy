import React, { useState, useEffect, useCallback } from 'react';
import { User, Shield, Key, Trash2, Plus, Edit, X, Check, Loader, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../common/Skeleton.jsx';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: []
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const [usersRes, rolesRes] = await Promise.all([
                axios.get('/api/v1/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get('/api/v1/admin/roles-permissions', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.data);
            if (rolesRes.data.success) setRoles(rolesRes.data.data.roles);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles.map(r => r.name)
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roles: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            if (editingUser) {
                await axios.put(`/api/v1/admin/users/${editingUser.id}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/v1/admin/users', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Failed to save user.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            await axios.delete(`/api/v1/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Failed to delete user.');
        }
    };

    return (
        <ErrorBoundary>
            <div className="space-y-10 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Team Access</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">Manage Roles & Permissions</p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl py-3.5 px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-attire-accent dark:hover:bg-attire-accent transition-all shadow-lg"
                    >
                        <Plus size={14} />
                        <span>Add Admin</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        [...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />)
                    ) : (
                        users.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 group hover:border-attire-accent/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20 transition-colors">
                                            <User size={24} className="text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">{user.name}</h3>
                                            <p className="text-xs text-gray-400 dark:text-attire-silver/40 font-mono">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(user)} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-3">Assigned Roles</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map(role => (
                                                <span key={role.id} className="px-3 py-1.5 bg-attire-accent/10 border border-attire-accent/20 text-attire-accent rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                    {role.name}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && <span className="text-[10px] text-gray-400 italic">No roles assigned</span>}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400 dark:text-attire-silver/30">
                                            <Shield size={12} />
                                            <span className="text-[10px] uppercase tracking-widest">{user.permissions.length} Custom Permissions</span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 dark:text-attire-silver/30 font-mono">ID: #{user.id}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* User Modal ✨ */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            />
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[10000]"
                            >
                                <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center">
                                    <h2 className="text-xl font-serif text-gray-900 dark:text-white">{editingUser ? 'Edit Admin' : 'New Admin'}</h2>
                                    <button onClick={() => setShowModal(false)} className="p-3 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                placeholder="admin@attirelounge.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                                            <input 
                                                type="password" 
                                                required={!editingUser}
                                                value={formData.password}
                                                onChange={e => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Roles</label>
                                            <div className="flex flex-wrap gap-3">
                                                {roles.map(role => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newRoles = formData.roles.includes(role.name)
                                                                ? formData.roles.filter(r => r !== role.name)
                                                                : [...formData.roles, role.name];
                                                            setFormData({...formData, roles: newRoles});
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                            formData.roles.includes(role.name)
                                                                ? 'bg-attire-accent text-black border-attire-accent'
                                                                : 'bg-black/5 dark:bg-white/5 text-gray-400 border-black/5 dark:border-white/5 hover:border-attire-accent/30'
                                                        }`}
                                                    >
                                                        {role.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-grow py-4 border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={saving}
                                            className="flex-grow py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {saving ? <Loader className="animate-spin" size={14} /> : <Check size={14} />}
                                            {saving ? 'Saving...' : 'Save Admin'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default UserManager;
