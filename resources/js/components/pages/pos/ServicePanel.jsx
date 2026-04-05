import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePOS } from './POSContext';
import { Zap, Loader2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const ServicePanel = ({ onClose }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = usePOS();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('/api/v1/admin/pos/products/services');
                setServices(response.data);
            } catch (err) {
                console.error('Failed to fetch services');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.01] rounded-2xl animate-pulse">
            <Loader2 className="animate-spin text-attire-accent opacity-30" size={32} />
        </div>
    );

    return (
        <div className="h-full flex flex-col font-sans select-none overflow-hidden">
            {/* Functional Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-attire-accent text-white">
                        <Zap size={14} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none mb-0.5">
                            Tactical Services
                        </h3>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Quick-add to current invoice</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/5 border border-black/15 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all group"
                >
                    Close Deck <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
            </div>

            {/* Left-Aligned Flex Deck */}
            <div className="flex-1 flex flex-wrap gap-3 justify-start content-start overflow-y-auto attire-scrollbar pb-2">
                {services.map((service) => (
                    <motion.button
                        key={service.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            addItem(service);
                        }}
                        className="flex flex-col items-start justify-center text-left p-4 w-[160px] min-h-[90px] rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-attire-accent/60 hover:bg-background dark:hover:bg-white/[0.06] transition-all group shadow-none"
                    >
                        <p className="text-[12px] font-black uppercase tracking-[0.05em] text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-attire-accent transition-colors line-clamp-2 w-full">
                            {service.name}
                        </p>
                        <span className="text-[13px] font-mono font-black text-attire-accent">
                            ${parseFloat(service.price).toLocaleString()}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};


export default ServicePanel;
