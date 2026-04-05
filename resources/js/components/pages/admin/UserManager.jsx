import React, { useState, useCallback, useEffect } from 'react';
import {
    User,
    Shield,
    ShieldCheck,
    Trash2,
    Plus,
    X,
    Check,
    ChevronDown,
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import ModernModal from '../../common/ModernModal.jsx';

// Only two roles in the system
const ROLES = [
    {
        name: 'admin',
        label: 'Admin',
        description:
            'Manage products, collections, appointments, and customers.',
        Icon: Shield,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
        activeBg: 'bg-blue-400',
        activeText: 'text-black',
    },
    {
        name: 'super-admin',
        label: 'Super Admin',
        description:
            'Full access including team management, audit logs, and system settings.',
        Icon: ShieldCheck,
        color: 'text-[#58a6ff]',
        bg: 'bg-[#58a6ff]/10',
        border: 'border-[#58a6ff]/20',
        activeBg: 'bg-[#58a6ff]',
        activeText: 'text-black',
    },
];

const getAuthHeader = () => {
    const token =
        localStorage.getItem('admin_token') ||
        sessionStorage.getItem('admin_token');
    return { Authorization: `Bearer ${token}` };
};

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/users', {
                headers: getAuthHeader(),
            });
            if (res.data.success) setUsers(res.data.data);
        } catch (e) {
            console.error('Error fetching users:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openModal = (user = null) => {
        setError('');
        if (user) {
            setEditingUser(user);
            const topRole = user.roles.find((r) => r.name === 'super-admin')
                ? 'super-admin'
                : 'admin';
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: topRole,
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'admin' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            name: formData.name,
            email: formData.email,
            roles: [formData.role],
        };
        if (formData.password) payload.password = formData.password;

        try {
            if (editingUser) {
                await axios.put(
                    `/api/v1/admin/users/${editingUser.id}`,
                    payload,
                    { headers: getAuthHeader() }
                );
            } else {
                await axios.post('/api/v1/admin/users', payload, {
                    headers: getAuthHeader(),
                });
            }
            setShowModal(false);
            fetchUsers();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save user.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Remove ${user.name} from the team?`)) return;
        try {
            await axios.delete(`/api/v1/admin/users/${user.id}`, {
                headers: getAuthHeader(),
            });
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to delete user.');
        }
    };

    const getUserRole = (user) => {
        const isSuperAdmin = user.roles?.some((r) => r.name === 'super-admin');
        return ROLES.find(
            (r) => r.name === (isSuperAdmin ? 'super-admin' : 'admin')
        );
    };

    return (
        <ErrorBoundary>
            <div className="space-y-8 pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-1">
                            Team Access
                        </h1>
                        <p className="text-gray-400 dark:text-attire-silver/50 text-xs uppercase tracking-widest">
                            {users.length}{' '}
                            {users.length === 1 ? 'member' : 'members'} across{' '}
                            {ROLES.length} roles
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white dark:hover:text-black transition-all"
                    >
                        <Plus size={14} /> Invite Member
                    </motion.button>
                </div>

                {/* Role Reference Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ROLES.map((role) => (
                        <div
                            key={role.name}
                            className={`flex items-start gap-4 p-5 rounded-2xl border ${role.bg} ${role.border}`}
                        >
                            <div
                                className={`p-2.5 rounded-xl ${role.bg} flex-shrink-0`}
                            >
                                <role.Icon size={18} className={role.color} />
                            </div>
                            <div>
                                <p
                                    className={`text-xs font-black uppercase tracking-widest mb-1 ${role.color}`}
                                >
                                    {role.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-attire-silver/50">
                                    {role.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-white/5 dark:bg-black/10 rounded-[2rem] border border-black/5 dark:border-white/5">
                            <LumaSpin size="xl" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Verifying Credentials...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 dark:text-attire-silver/30 text-sm">
                            No team members yet. Invite someone to get started.
                        </div>
                    ) : (
                        <AnimatePresence>
                            {users.map((user, index) => {
                                const role = getUserRole(user);
                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.04 }}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/10 rounded-2xl hover:border-[#0d3542]/20 transition-all group"
                                    >
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <User
                                                size={18}
                                                className="text-gray-400 dark:text-attire-silver/40"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-attire-silver/40 font-mono truncate">
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Role Badge */}
                                        {role && (
                                            <span
                                                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${role.bg} ${role.border} border ${role.color} flex-shrink-0`}
                                            >
                                                <role.Icon size={10} />
                                                {role.label}
                                            </span>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white dark:hover:text-black transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(user)
                                                }
                                                className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Modal */}
                <ModernModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingUser ? 'Edit Member' : 'Invite Member'}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 px-2 pb-2"
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-5 text-gray-900 dark:text-white text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all"
                                placeholder="Jane Doe"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-5 text-gray-900 dark:text-white text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all font-mono"
                                placeholder="jane@attirelounge.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                Password{' '}
                                {editingUser && (
                                    <span className="normal-case font-normal italic opacity-60">
                                        (leave blank to keep current)
                                    </span>
                                )}
                            </label>
                            <input
                                type="password"
                                required={!editingUser}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-5 text-gray-900 dark:text-white text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Role Picker */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                Access Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.name}
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                role: role.name,
                                            })
                                        }
                                        className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all ${
                                            formData.role === role.name
                                                ? `${role.activeBg} ${role.activeText} border-transparent shadow-none`
                                                : `bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-[#0d3542]/20 dark:hover:border-[#58a6ff]/20`
                                        }`}
                                    >
                                        <role.Icon
                                            size={20}
                                            className={
                                                formData.role === role.name
                                                    ? ''
                                                    : role.color
                                            }
                                        />
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {role.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-grow py-4 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-attire-charcoal dark:hover:text-white transition-all underline decoration-dotted"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-grow py-4 bg-attire-charcoal dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-none"
                            >
                                {saving ? (
                                    <LumaSpin
                                        size="sm"
                                    />
                                ) : (
                                    <Check size={14} />
                                )}
                                {saving
                                    ? 'Saving...'
                                    : editingUser
                                      ? 'Save Changes'
                                      : 'Invite Member'}
                            </button>
                        </div>
                    </form>
                </ModernModal>
            </div>
        </ErrorBoundary>
    );
};

export default UserManager;
