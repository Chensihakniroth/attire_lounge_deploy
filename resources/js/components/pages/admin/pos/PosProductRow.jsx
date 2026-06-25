import React from 'react';
import { Check, Box } from 'lucide-react';
import QuickEditCell from './QuickEditCell';

const PosProductRow = React.memo(({ 
    product, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onDelete, onQuickEdit, onUpdateField,
    formatPrice, performanceMode, getCategoryStyle, getCategoryIcon
}) => {
    const p = product;
    const CatIcon = getCategoryIcon ? getCategoryIcon(p.category) : null;
    const colorScheme = getCategoryStyle ? getCategoryStyle(p.category) : null;
    
    const categoryBadge = colorScheme ? (
        <span className={`inline-block max-w-[100px] truncate px-2 py-0.5 ${colorScheme.bg} text-[9px] font-black ${colorScheme.text} rounded-md uppercase tracking-[0.2em] border ${colorScheme.border} whitespace-nowrap`} title={p.category}>
            {p.category}
        </span>
    ) : (
        <span className="px-2 py-0.5 bg-black/5 dark:bg-[#161b22] text-[9px] font-black text-gray-400 dark:text-[#8b949e] rounded-md uppercase tracking-[0.2em] border border-black/15 dark:border-[#30363d]">{p.category}</span>
    );

    // Stock display: ShoeManager supports is_service (∞), PosProductManager does not
    const stockDisplay = (p.is_service !== undefined && p.is_service) ? (
        <div className="flex items-center justify-end gap-1">
            <span className="drop-shadow-sm">∞</span>
            <Box size={14} className="opacity-60" />
        </div>
    ) : (
        <div className="flex items-center justify-end gap-1">
            <span className="drop-shadow-sm">{p.stock_qty}</span>
            <Box size={14} className="opacity-60" />
        </div>
    );

    // Status indicator: ShoeManager checks is_active, PosProductManager doesn't
    const statusColor = p.is_active !== undefined 
        ? (!p.is_active ? 'bg-gray-500 ring-gray-500/30' : (p.stock_qty > 0 || p.is_service) ? 'bg-emerald-500 ring-emerald-500/30' : 'bg-red-500 ring-red-500/30')
        : ((p.stock_qty || 0) > 0 ? 'bg-emerald-500 ring-emerald-500/30' : 'bg-red-500 ring-red-500/30');

    return (
        <React.Fragment>
            <tr 
                key={p.id} id={`row-${p.id}`}
                onClick={(e) => { e.stopPropagation(); onFocus(isFocused ? null : p.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); onEdit(p); }}
                className={`group cursor-pointer border-b border-black/15 dark:border-[#30363d] ${isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.03] dark:bg-white/[0.04]' : ''}`}
            >
                <td className="px-4 py-3 text-center relative">
                    {isFocused && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0d3542] dark:bg-[#58a6ff]" />}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(p.id); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d] group-hover:border-[#0d3542]/40 dark:group-hover:border-[#58a6ff]/40'}`}
                    >
                        {isSelected && <Check size={12} className="text-white dark:text-black" />}
                    </button>
                </td>
                <td className="px-4 py-3 text-center border-l-2 border-black/15 dark:border-[#30363d]">
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ring-2 ${statusColor}`} />
                    </div>
                </td>
                <td className="px-5 py-3 font-mono font-black tracking-tighter text-[#0d3542] dark:text-[#58a6ff] uppercase text-[12px] border-l-2 border-black/15 dark:border-[#30363d] text-center">{p.sku || '—'}</td>
                <td className="px-6 py-3 border-l-2 border-black/15 dark:border-[#30363d] overflow-hidden">
                    <div className="flex items-center gap-2 leading-tight truncate">
                        <span className="font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors text-[14px] truncate">{p.name}</span>
                        {Array.isArray(p.parsed_attributes) && p.parsed_attributes.length > 0 ? (
                            p.parsed_attributes.map((attr, idx) => {
                                const isSize = attr.key?.toUpperCase() === 'SIZE';
                                return (
                                    <span 
                                        key={idx}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isSize ? 'bg-red-500/10 text-red-500 border border-red-500/20' : attr.color ? '' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}
                                        style={attr.color ? { backgroundColor: attr.color + '20', borderColor: attr.color, color: attr.color } : {}}
                                    >
                                        {attr.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: attr.color }} />}
                                        {attr.value}
                                    </span>
                                );
                            })
                        ) : p.variant ? (
                            <span className="inline-flex items-center px-2 py-0.5 bg-black/5 dark:bg-white/5 text-gray-400 dark:text-[#8b949e]/40 text-[9px] font-black uppercase tracking-widest rounded border border-black/5 dark:border-white/5">
                                {p.variant}
                            </span>
                        ) : null}
                    </div>
                </td>
                <td className="px-5 py-3 border-l-2 border-black/15 dark:border-[#30363d] text-center">
                    {categoryBadge}
                </td>
                <td className={`px-6 py-3 text-right font-mono font-black relative text-[20px] border-l-2 border-black/15 dark:border-[#30363d] ${p.stock_qty <= (p.min_stock || 5) ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isFocused && quickEditField === 'stock' ? (
                        <QuickEditCell value={p.stock_qty} onSave={(val) => onUpdateField(p.id, { stock_qty: val })} onClose={() => onQuickEdit(null)} />
                    ) : stockDisplay}
                </td>
                <td className="px-8 py-3 text-center font-mono font-black text-gray-900 dark:text-[#c9d1d9] text-[16px] relative border-l-2 border-black/15 dark:border-[#30363d]">
                    {isFocused && quickEditField === 'price' ? (
                        <QuickEditCell value={p.price} prefix="$" onSave={(val) => onUpdateField(p.id, { price: val })} onClose={() => onQuickEdit(null)} />
                    ) : formatPrice(p.price)}
                </td>
            </tr>
        </React.Fragment>
    );
});

export default PosProductRow;
