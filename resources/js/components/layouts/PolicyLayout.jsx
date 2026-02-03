import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PolicyLayout = ({ title, lastUpdated, children }) => {
    return (
        <div className="min-h-screen bg-attire-navy relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-attire-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumbs */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-2 text-xs text-attire-silver/50 uppercase tracking-widest mb-12 font-medium"
                    >
                        <Link to="/" className="hover:text-attire-accent transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-attire-accent">{title}</span>
                    </motion.div>

                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">
                            {title}
                        </h1>
                        {lastUpdated && (
                            <div className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                                <span className="text-sm text-attire-silver/80">Last Updated: <span className="text-attire-accent font-medium">{lastUpdated}</span></span>
                            </div>
                        )}
                    </motion.div>

                    {/* Content Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-b from-attire-accent/20 to-transparent rounded-[2.5rem] blur-sm opacity-50" />
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-16 shadow-2xl overflow-hidden">
                            {/* Decorative Line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-attire-accent to-transparent opacity-50" />
                            
                            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-white prose-p:text-attire-silver prose-li:text-attire-silver prose-strong:text-white prose-a:text-attire-accent hover:prose-a:text-white">
                                {children}
                            </div>

                            {/* Bottom fade for a polished look */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PolicyLayout;
