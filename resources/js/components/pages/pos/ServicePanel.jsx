import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePOS } from './POSContext';
import { Scissors, Ruler, Loader2, Sparkles, Wand2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ServicePanel = () => {
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

    const serviceIcons = {
        'default': <Sparkles size={16} />,
        'altering': <Scissors size={16} />,
        'measurement': <Ruler size={16} />,
        'custom': <Wand2 size={16} />,
        'express': <Zap size={16} />
    };

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('altering') || n.includes('repair')) return serviceIcons.altering;
        if (n.includes('measure')) return serviceIcons.measurement;
        if (n.includes('custom')) return serviceIcons.custom;
        if (n.includes('express') || n.includes('rush')) return serviceIcons.express;
        return serviceIcons.default;
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-attire-accent" size={24} />
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-attire-accent animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                        Quick Services
                    </h3>
                </div>
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 opacity-30">Quick Add</span>
            </div>
            
            <div className="grid grid-rows-2 grid-flow-col gap-3 overflow-x-auto no-scrollbar pb-1 h-[calc(100%-1.5rem)]">
                {services.map((service) => (
                    <motion.button
                        key={service.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addItem(service)}
                        className="flex-shrink-0 w-36 h-18 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-attire-accent/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all text-center group relative overflow-hidden shadow-sm"
                    >
                        {/* Background Ornament */}
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-attire-accent/5 rounded-full blur-lg group-hover:bg-attire-accent/15 transition-all" />
                        
                        <div className="relative z-10 flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-black border border-black/5 dark:border-white/20 flex items-center justify-center text-gray-400 group-hover:text-attire-accent group-hover:bg-attire-accent/10 group-hover:border-attire-accent/30 transition-all shadow-sm flex-shrink-0">
                                {getIcon(service.name)}
                            </div>
                            
                            <div className="flex flex-col items-start min-w-0 text-left">
                                <p className="text-[9px] font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-1 truncate w-full">
                                    {service.name}
                                </p>
                                <span className="text-[8px] font-bold text-attire-accent bg-attire-accent/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                    ${parseFloat(service.price).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Hover Pulse */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <div className="w-1 h-1 rounded-full bg-attire-accent shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default ServicePanel;
