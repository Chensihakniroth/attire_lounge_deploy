import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Keyboard, ChevronRight, Box, DollarSign, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StockMatrixGrid = ({ 
    products, 
    onChange, 
    mode = 'edit', // 'create' | 'edit'
    showConfig = true 
}) => {
    const [config, setConfig] = useState({
        primaryKey: 'COLOR',
        primaryValues: '',
        secondaryKey: 'SIZE', 
        secondaryValues: ''
    });

    const getExistingData = () => {
        if (!products || products.length === 0) return {};
        
        const colors = new Set();
        const sizes = new Set();
        const data = {};
        
        products.forEach(p => {
            const variant = p.variant || '';
            let color = '';
            let size = '';
            
            if (variant.includes('-') && variant.match(/^[^-]+ -[A-Z]/)) {
                color = variant.split(' -')[0].trim().toUpperCase();
                size = variant.split(' -')[1]?.replace(/-/g, '').trim().toUpperCase() || '';
            } else if (variant && !variant.match(/^-[0-9]/)) {
                color = variant.replace(/^-/, '').toUpperCase();
            } else if (variant.match(/^-[0-9XL]+$/i)) {
                size = variant.replace(/-/g, '').toUpperCase();
            }
            
            if (color) colors.add(color);
            if (size) sizes.add(size);
            
            const key = color && size ? `${color}-${size}` : color ? `${color}-` : size ? `-${size}` : `ITEM-${p.id}`;
            data[key] = {
                id: p.id,
                sku: p.sku || '',
                name: p.name || '',
                price: parseFloat(p.price || 0),
                stock_qty: parseInt(p.stock_qty || p.stock || 0),
                status: p.status || 'available',
                color: color,
                size: size
            };
        });
        
        return {
            data,
            colors: Array.from(colors).sort((a, b) => a.localeCompare(b)),
            sizes: Array.from(sizes).sort((a, b) => {
                const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];
                const aIdx = sizeOrder.indexOf(a);
                const bIdx = sizeOrder.indexOf(b);
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
            })
        };
    };

    const existingData = useMemo(() => getExistingData(), [products]);
    const [matrixData, setMatrixData] = useState(existingData.data);

    const pVals = config.primaryValues 
        ? config.primaryValues.split(',').map(v => v.trim()).filter(Boolean)
        : existingData.colors;
    const sVals = config.secondaryValues
        ? config.secondaryValues.split(',').map(v => v.trim()).filter(Boolean)
        : existingData.sizes;

    const updateCell = (p, s, field, value) => {
        const key = `${p}-${s}`;
        setMatrixData(prev => {
            const updated = { ...prev };
            if (!updated[key]) {
                updated[key] = { id: 0, sku: '', price: 0, stock_qty: 0 };
            }
            updated[key] = { ...updated[key], [field]: value };
            onChange?.(Object.values(updated));
            return updated;
        });
    };

    const handleGridKeyDown = (e, rIdx, cIdx) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        
        let nextR = rIdx, nextC = cIdx;
        if (e.key === 'ArrowDown') nextR--;
        else if (e.key === 'ArrowUp') nextR++;
        else if (e.key === 'ArrowRight') nextC++;
        else if (e.key === 'ArrowLeft') nextC--;
        
        const nextEl = document.querySelector(`input[data-pos="${nextR}-${nextC}"]`);
        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
            nextEl.select();
        }
    };

    const presets = {
        sizes: 'S, M, L, XL, XXL',
        numbers: '28, 30, 32, 34, 36, 38',
        colors: 'BLACK, WHITE, NAVY, GREY, BEIGE, RED, BROWN'
    };

    const applyPreset = (key, val) => {
        setConfig(prev => ({ ...prev, [key]: val }));
    };

    const totalStock = useMemo(() => 
        Object.values(matrixData).reduce((acc, p) => acc + (parseInt(p.stock_qty) || 0), 0), 
    [matrixData]);

    const totalValue = useMemo(() => 
        Object.values(matrixData).reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseInt(p.stock_qty) || 0)), 0), 
    [matrixData]);

    return (
        <div className="space-y-8">
            {/* Config (only for create mode or when showConfig=true) */}
            {showConfig && mode === 'create' && (
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Primary (Color)</label>
                            <button onClick={() => applyPreset('primaryValues', presets.colors)} className="text-[10px] font-medium text-[#0d3542] hover:underline">Presets</button>
                        </div>
                        <input 
                            value={config.primaryKey} 
                            onChange={e => setConfig({...config, primaryKey: e.target.value.toUpperCase()})} 
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-3.5 text-sm font-bold uppercase rounded-xl focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Enter values separated by commas..." 
                            value={config.primaryValues} 
                            onChange={e => setConfig({...config, primaryValues: e.target.value})} 
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-3.5 text-sm font-medium uppercase rounded-xl min-h-[100px] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none resize-none" 
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Secondary (Size)</label>
                            <div className="flex gap-2">
                                <button onClick={() => applyPreset('secondaryValues', presets.sizes)} className="text-[10px] font-medium text-[#0d3542] hover:underline">Sizes</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => applyPreset('secondaryValues', presets.numbers)} className="text-[10px] font-medium text-[#0d3542] hover:underline">Numbers</button>
                            </div>
                        </div>
                        <input 
                            value={config.secondaryKey} 
                            onChange={e => setConfig({...config, secondaryKey: e.target.value.toUpperCase()})} 
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-3.5 text-sm font-bold uppercase rounded-xl focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Enter values separated by commas..." 
                            value={config.secondaryValues} 
                            onChange={e => setConfig({...config, secondaryValues: e.target.value})} 
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-3.5 text-sm font-medium uppercase rounded-xl min-h-[100px] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none resize-none" 
                        />
                    </div>
                </div>
            )}

            {/* Summary Banner */}
            <div className="flex items-center justify-between p-4 bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 rounded-2xl border border-[#0d3542]/10 dark:border-[#58a6ff]/20">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                    <div>
                        <h3 className="text-sm font-bold text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-wider">Stock Matrix</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{config.primaryKey} × {config.secondaryKey}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 text-xs font-medium">{pVals.length} Colors</Badge>
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 text-xs font-medium">{sVals.length} Sizes</Badge>
                </div>
            </div>

            {/* The Matrix Grid */}
            {pVals.length > 0 && sVals.length > 0 ? (
                <div className="space-y-4">
                    <div className="overflow-x-auto border-2 border-gray-200 dark:border-[#30363d] rounded-2xl bg-white dark:bg-[#161b22] shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#21262d]">
                                    <th className="p-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-r-2 border-gray-200 dark:border-[#30363d] sticky left-0 z-10 min-w-36 bg-gray-50 dark:bg-[#21262d]">
                                        {config.primaryKey} \{config.secondaryKey}
                                    </th>
                                    {sVals.map(s => (
                                        <th key={s} className="p-3 text-center text-[11px] font-bold text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-wider border-b-2 border-gray-200 dark:border-[#30363d] min-w-24">
                                            {s}
                                        </th>
                                    ))}
                                    <th className="p-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#21262d] min-w-20">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pVals.map((p, rIdx) => {
                                    const rowStock = sVals.reduce((acc, s) => {
                                        const cell = matrixData[`${p}-${s}`];
                                        return acc + (parseInt(cell?.stock_qty) || 0);
                                    }, 0);
                                    
                                    return (
                                        <tr key={p} className="group">
                                            <td className="p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r-2 border-gray-100 dark:border-[#30363d] bg-gray-30 dark:bg-[#21262d]/30 group-hover:bg-gray-50 dark:group-hover:bg-[#21262d]/50 transition-colors sticky left-0 z-10">
                                                {p}
                                            </td>
                                            {sVals.map((s, cIdx) => {
                                                const cell = matrixData[`${p}-${s}`];
                                                const stockVal = cell?.stock_qty ?? '';
                                                const priceVal = cell?.price ?? '';
                                                
                                                return (
                                                    <td key={s} className="p-1.5 border-b border-gray-100 dark:border-[#30363d]/50 group-hover:bg-gray-50 dark:group-hover:bg-[#21262d]/30 transition-colors">
                                                        <div className="space-y-1">
                                                            <div className="relative">
                                                                <Box size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input 
                                                                    type="number"
                                                                    data-pos={`${rIdx}-${cIdx}`}
                                                                    value={stockVal}
                                                                    onChange={e => updateCell(p, s, 'stock_qty', e.target.value)}
                                                                    onKeyDown={e => handleGridKeyDown(e, rIdx, cIdx)}
                                                                    className="w-full h-9 pl-7 pr-2 bg-gray-50 dark:bg-[#0d1117] border border-transparent rounded-lg text-center text-sm font-bold font-mono text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#161b22] outline-none transition-all"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <DollarSign size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input 
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={priceVal}
                                                                    onChange={e => updateCell(p, s, 'price', e.target.value)}
                                                                    className="w-full h-7 pl-6 pr-1 bg-gray-50 dark:bg-[#0d1117] border border-transparent rounded-md text-center text-xs font-mono text-gray-600 dark:text-gray-400 focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#161b22] outline-none transition-all"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3 text-center border-b border-gray-100 dark:border-[#30363d]/50 bg-gray-50 dark:bg-[#21262d]/50">
                                                <span className={`text-sm font-bold font-mono ${rowStock === 0 ? 'text-red-500' : rowStock < 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {rowStock}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Keyboard size={12} className="text-gray-400" />
                                <span className="font-medium">Arrow keys to navigate</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-medium">Total Stock: <span className="text-[#0d3542] dark:text-[#58a6ff] font-bold">{totalStock}</span></span>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium">Value: <span className="text-emerald-600 font-bold">${totalValue.toFixed(2)}</span></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-[#30363d] rounded-2xl bg-gray-50 dark:bg-[#161b22]/50">
                    <Layers size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Enter attributes to unlock the grid</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Set Primary (Colors) and Secondary (Sizes) above</p>
                </div>
            )}
        </div>
    );
};

export default StockMatrixGrid;