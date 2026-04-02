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
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Quick Services
                </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 overflow-y-auto no-scrollbar pb-2">
                {services.map((service) => (
                    <motion.button
                        key={service.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addItem(service)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-attire-accent/50 hover:bg-attire-accent/10 transition-all text-center group relative overflow-hidden shadow-sm"
                    >
                        <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-gray-400 group-hover:text-attire-accent group-hover:scale-110 transition-all">
                            {getIcon(service.name)}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-700 dark:text-white line-clamp-1">
                                {service.name}
                            </p>
                            <p className="text-[8px] text-attire-accent font-bold">
                                ${parseFloat(service.price).toLocaleString()}
                            </p>
                        </div>

                        {/* Hover Highlight */}
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 rounded-full bg-attire-accent animate-pulse" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default ServicePanel;
