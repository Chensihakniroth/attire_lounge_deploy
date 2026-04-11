import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, ChevronLeft, Save, Layers, DollarSign, Box } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StockMatrixGrid from './StockMatrixGrid';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const BulkGroupEditor = ({ selectedProducts, onClose }) => {
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [matrixData, setMatrixData] = useState({});

    const groupInfo = useMemo(() => {
        if (!selectedProducts || selectedProducts.length === 0) return null;
        const baseName = selectedProducts[0].name || '';
        const category = selectedProducts[0].category || '';
        return { baseName, category, count: selectedProducts.length };
    }, [selectedProducts]);

    const handleMatrixChange = (data) => {
        setMatrixData(data);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        
        try {
            const updates = Object.values(matrixData)
                .filter(p => p.id > 0)
                .map(p => ({
                    id: p.id,
                    sku: p.sku,
                    price: parseFloat(p.price) || 0,
                    stock_qty: parseInt(p.stock_qty) || 0,
                    status: p.status || 'available'
                }));

            if (updates.length === 0) {
                setError('No products to update');
                setIsSaving(false);
                return;
            }

            await axios.post('/api/v1/admin/pos/products/bulk-update', { products: updates });
            
            setSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            
            setTimeout(() => onClose(), 1000);
        } catch (err) {
            console.error('Failed to save:', err);
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const totalStock = useMemo(() => 
        Object.values(matrixData).reduce((acc, p) => acc + (parseInt(p.stock_qty) || 0), 0), 
    [matrixData]);

    const totalValue = useMemo(() => 
        Object.values(matrixData).reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseInt(p.stock_qty) || 0)), 0), 
    [matrixData]);

    const handleCancel = () => onClose();

    if (!groupInfo) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-[#161b22] rounded-2xl p-8">
                    <p className="text-red-500">No products selected</p>
                    <Button onClick={onClose} className="mt-4">Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-50 dark:bg-[#0d1117] overflow-hidden">
            {/* Header */}
            <div className="h-20 shrink-0 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between px-8 bg-white dark:bg-[#161b22]">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleCancel}
                        className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-[#21262d] flex items-center justify-center text-gray-500 hover:text-[#0d3542] hover:bg-gray-200 dark:hover:bg-[#30363d] transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#0d3542] dark:bg-[#58a6ff] rounded-xl">
                            <Layers size={20} className="text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">Stock Matrix</h2>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{groupInfo.baseName} · {groupInfo.count} variants</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
                        <Box size={16} className="text-emerald-600" />
                        <div className="text-right">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase">Stock</p>
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{totalStock.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-800/30" />
                        <DollarSign size={16} className="text-emerald-600" />
                        <div className="text-right">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase">Value</p>
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">${totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleCancel} className="h-11 px-6 text-xs font-semibold uppercase tracking-wider border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262d] rounded-xl">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving} className="h-11 px-8 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-lg">
                        {isSaving ? <LumaSpin size="sm" className="mr-2" /> : <Save size={14} className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-8 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-center gap-2.5 text-red-600 dark:text-red-400 text-sm"
                    >
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-8 mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-sm"
                    >
                        <Check size={16} />
                        <span className="text-sm">Changes saved successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stock Matrix Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto">
                    <StockMatrixGrid 
                        products={selectedProducts} 
                        onChange={handleMatrixChange}
                        mode="edit"
                        showConfig={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default BulkGroupEditor;