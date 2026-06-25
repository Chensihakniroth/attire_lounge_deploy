import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X } from 'lucide-react';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';

/**
 * BarcodePrintModal — Shared barcode label printer modal used by PosProductManager and ShoeManager.
 * Renders a preview grid of barcode labels and opens a print window with 2-up 35×22mm layout.
 *
 * Props:
 *   products — array of { id, name, variant, parsed_attributes, barcode, sku, price }
 *   onClose  — close handler
 *   formatPrice — price formatter function
 */
const BarcodePrintModal = ({ products, onClose, formatPrice }) => {
    const labelsRef = useRef(null);

    const handlePrint = () => {
        if (!labelsRef.current) return;
        const labelEls = labelsRef.current.querySelectorAll('.bc-label');
        let labelsHtml = '';
        for (let i = 0; i < labelEls.length; i += 2) {
            const label1 = labelEls[i].outerHTML;
            const label2 = labelEls[i + 1] ? labelEls[i + 1].outerHTML : '';
            labelsHtml += `<div class="lg">${label1}${label2}</div>`;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Please allow popups for barcode printing.'); return; }
        printWindow.document.write(`<html><head><title>Barcode Labels</title>
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                html,body{width:72mm;background:#fff;color:#000;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:0;margin:0;padding:0}
                @media print{@page{size:72mm 22mm;margin:0}html,body{width:72mm;-webkit-print-color-adjust:exact}}
                .lg{display:grid !important;grid-template-columns:35mm 35mm !important;justify-content:space-between !important;width:72mm !important;height:21.5mm !important;max-height:21.5mm !important;overflow:hidden !important;align-items:center !important;page-break-inside:avoid !important;page-break-after:always !important;break-after:page !important}
                .lg:last-child{page-break-after:avoid !important;break-after:avoid !important}
                .bc-label{width:35mm !important;height:21.5mm !important;max-height:21.5mm !important;min-height:21.5mm !important;padding:0 !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;text-align:center !important;overflow:hidden !important;box-sizing:border-box !important;border:none !important;background:transparent !important;border-radius:0 !important;page-break-inside:avoid !important;page-break-after:avoid !important}
                .bc-label > div { margin: 0 !important; padding: 0 !important; border: none !important; }
                .ln{font-size:9pt !important;font-weight:900 !important;text-transform:uppercase !important;letter-spacing:.2px !important;line-height:1 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;max-width:100% !important;margin:0 0 1px 0 !important;padding:0 !important;color:#000 !important}
                .lv{font-size:6.5pt !important;font-weight:900 !important;color:#000 !important;text-transform:uppercase !important;letter-spacing:.3px !important;line-height:1 !important;margin:1px 0 0 0 !important}
                .lbc{margin:1px 0 !important;line-height:0 !important;width:100% !important;text-align:center !important}.lbc svg{max-width:33mm !important;height:auto !important;max-height:8mm !important;display:inline-block !important;shape-rendering:crispEdges !important}
                .ls{font-size:5.5pt !important;font-weight:900 !important;font-family:'Courier New',monospace !important;letter-spacing:0.5px !important;color:#000 !important;line-height:1 !important;margin:0 0 1px 0 !important}
                .lp{font-size:11pt !important;font-weight:900 !important;line-height:1 !important;margin:1px 0 0 0 !important;padding:0 !important;color:#000 !important;border:none !important}
            </style></head><body>
            ${labelsHtml}
            <script>
                window.onload = function() {
                    setTimeout(function(){ window.print(); window.close(); }, 300);
                }
            </script>
        </body></html>`);
        printWindow.document.close();
    };

    if (!products || products.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-[90vw] max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
            >
                <div className="px-8 py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#fdfdfc] dark:bg-[#0d1117] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 flex items-center justify-center">
                            <Printer size={20} className="text-[#0d3542] dark:text-[#58a6ff]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.3em]">Barcode Labels</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{products.length} label{products.length > 1 ? 's' : ''} · 2-up 35×22mm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={handlePrint} className="h-11 px-8 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all">
                            <Printer size={14} className="mr-2" /> Print All
                        </Button>
                        <button onClick={onClose} className="h-11 w-11 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0a] attire-scrollbar">
                    <div ref={labelsRef} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {products.map((p) => (
                            <div key={p.id} className="bc-label bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-between text-center" style={{ minHeight: '120px' }}>
                                <div className="space-y-0.5 w-full">
                                    <div className="ln text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight line-clamp-1">{p.name}</div>
                                    {(p.variant || (Array.isArray(p.parsed_attributes) && p.parsed_attributes.length > 0)) && (
                                        <div className="lv text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                            {Array.isArray(p.parsed_attributes) ? p.parsed_attributes.map(a => a.value).join(' · ') : p.variant}
                                        </div>
                                    )}
                                </div>
                                <div className="lbc my-0.5">
                                    <Barcode value={p.barcode || p.sku || 'N/A'} format="CODE128" width={1} height={35} displayValue={false} margin={0} background="transparent" />
                                </div>
                                <div className="ls text-[8px] font-mono font-bold text-gray-500 tracking-[0.1em] uppercase">{p.sku}</div>
                                <div className="lp text-[12px] font-black text-gray-900 border-t border-gray-200 w-full pt-1 mt-1">{formatPrice(p.price)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BarcodePrintModal;
