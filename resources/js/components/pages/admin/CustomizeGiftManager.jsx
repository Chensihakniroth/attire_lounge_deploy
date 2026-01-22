import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Gift, AlertTriangle, Loader, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../../api';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const GiftRequestCard = ({ request, onUpdate, onDelete }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (status) => {
        setIsUpdating(true);
        await onUpdate(request.id, status);
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this request?')) {
            setIsUpdating(true);
            await onDelete(request.id);
        }
    };
    
    const statusStyles = {
        Pending: 'border-yellow-500',
        Reviewed: 'border-blue-500',
        Completed: 'border-green-500',
        Cancelled: 'border-red-500',
    };
    
    const statusBadgeStyles = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Reviewed: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    }

    return (
        <motion.div 
            layout
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className={`bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 ${statusStyles[request.status]}`}
        >
            <div className="flex justify-between items-start pb-3 mb-3 border-b border-gray-700">
                <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${statusBadgeStyles[request.status]}`}>
                    {request.status}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center text-gray-400">
                    <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                    <a href={`mailto:${request.email}`} className="hover:text-blue-500 truncate text-sm">{request.email}</a>
                </div>
                <div className="flex items-center text-gray-400">
                    <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">{request.phone}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="font-semibold text-white text-sm mb-1">Preferences</p>
                <div className="flex items-start text-gray-400 text-sm">
                    <Gift className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                    <pre className="whitespace-pre-wrap font-sans italic">{request.preferences}</pre>
                </div>
            </div>
            {request.status === 'Pending' && (
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-end gap-2">
                    <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md flex items-center gap-1 disabled:bg-gray-400">
                        <CheckCircle size={14} /> Mark Done
                    </button>
                    <button onClick={() => handleUpdate('Cancelled')} disabled={isUpdating} className="px-3 py-1 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-1 disabled:bg-gray-400">
                        <XCircle size={14} /> Cancel
                    </button>
                </div>
            )}
            {(request.status === 'Completed' || request.status === 'Cancelled') && (
                 <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-end">
                    <button onClick={handleDelete} disabled={isUpdating} className="px-3 py-1 text-sm font-semibold text-gray-400 hover:bg-gray-600 rounded-md flex items-center gap-1 disabled:opacity-50">
                        <Trash2 size={14} /> Delete
                    </button>
                 </div>
            )}
        </motion.div>
    );
};

const CustomizeGiftManager = () => {
    const [giftRequests, setGiftRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGiftRequests = useCallback(async () => {
        try {
            const data = await api.getGiftRequests();
            setGiftRequests(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch gift requests. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchGiftRequests();
    }, [fetchGiftRequests]);

    const handleUpdate = useCallback(async (id, status) => {
        try {
            const updatedRequest = await api.updateGiftRequestStatus(id, status);
            setGiftRequests(prevRequests => 
                prevRequests.map(req => req.id === id ? updatedRequest : req)
            );
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await api.deleteGiftRequest(id);
            setGiftRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        } catch (err) {
            console.error('Failed to delete request:', err);
        }
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-purple-500" size={48} />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 text-red-200 rounded-lg">
                    <AlertTriangle size={48} className="mb-4" />
                    <p>{error}</p>
                </div>
            );
        }

        if (giftRequests.length === 0) {
            return <p className="text-center text-gray-400">No gift requests found.</p>;
        }

        const containerVariants = {
            hidden: { opacity: 1 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
        };

        return (
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {giftRequests.map(request => (
                        <GiftRequestCard 
                            key={request.id} 
                            request={request} 
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Customize Gift Requests</h1>
                <p className="mt-1 text-gray-400">Review and manage customized gift inquiries from customers.</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default CustomizeGiftManager;
