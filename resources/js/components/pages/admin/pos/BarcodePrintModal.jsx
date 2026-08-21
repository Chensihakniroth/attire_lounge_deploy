import React, { useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Printer, X } from 'lucide-react';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';

/**
 * BarcodePrintModal — Shared barcode label printer modal used by PosProductManager and ShoeManager.
 *
 * Fixed label size: 35×22mm, 2 labels per row (sheet = 72mm wide). Renders a preview grid
 * of labels and opens a print window whose markup is generated from the product data, so the
 * preview's Tailwind/inline styles can never leak into the printed output.
 *
 * Props:
 *   products — array of { id, name, variant, parsed_attributes, barcode, sku, price }
 *   onClose  — close handler
 *   formatPrice — price formatter function
 */

/* ─── Fixed Label Geometry (35×22mm, 2-up) ─── */
const LABEL_W = 35;        // mm
const LABEL_H = 22;        // mm
const LABEL_UP = 2;        // labels per row
const GUTTER = 2;          // mm between labels
const SHEET_W = LABEL_W * LABEL_UP + (LABEL_UP - 1) * GUTTER; // 72mm

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');

const BarcodePrintModal = ({ products, onClose, formatPrice }) => {
    const labelsRef = useRef(null);

    // Per-label copy count (QoL): repeat a single label N times without re-clicking print.
    const keyOf = (p, i) => p.id ?? i;
    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const [copies, setCopies] = useState(() =>
        Object.fromEntries(products.map((p, i) => [keyOf(p, i), 1]))
    );
    const bump = (k, d) => setCopies(c => ({ ...c, [k]: clamp((c[k] ?? 1) + d, 1, 99) }));
    const setAll = (n) => setCopies(Object.fromEntries(products.map((p, i) => [keyOf(p, i), clamp(n, 1, 99)])));
    const expanded = useMemo(
        () => products.flatMap((p, i) => {
            const k = keyOf(p, i);
            const n = clamp(copies[k] ?? 1, 1, 99);
            return Array.from({ length: n }, () => ({ p, k }));
        }),
        [products, copies]
    );

    const labelText = (p) => ({
        name: p.name || '—',
        variantText: (Array.isArray(p.parsed_attributes) && p.parsed_attributes.length > 0)
            ? p.parsed_attributes.map(a => a.value).join(' · ')
            : (p.variant || ''),
        code: p.barcode || p.sku || 'N/A',
        sku: p.sku || '',
        price: formatPrice ? formatPrice(p.price) : p.price,
    });

    const handlePrint = () => {
        if (!labelsRef.current || products.length === 0) return;

        // Barcode SVGs come from the rendered preview (react-barcode needs React);
        // everything else is generated cleanly from data so no preview styles leak.
        const cards = labelsRef.current.querySelectorAll('.bc-label');
        const svgByKey = {};
        cards.forEach(card => { const k = card.getAttribute('data-key'); if (k) svgByKey[k] = card.querySelector('.lbc svg')?.outerHTML || ''; });

        const rows = [];
        for (let i = 0; i < expanded.length; i += LABEL_UP) {
            rows.push(expanded.slice(i, i + LABEL_UP));
        }

        let labelsHtml = '';
        rows.forEach((row) => {
            let cells = '';
            row.forEach(({ p, k }) => {
                const svg = svgByKey[k] || '';
                const t = labelText(p);
                cells += `
                    <div class="bc-label">
                        <div class="ln">${esc(t.name)}</div>
                        ${t.variantText ? `<div class="lv">${esc(t.variantText)}</div>` : ''}
                        <div class="lbc">${svg}</div>
                        <div class="ls">${esc(t.sku)}</div>
                        <div class="lp">${esc(t.price)}</div>
                    </div>`;
            });
            labelsHtml += `<div class="lg">${cells}</div>`;
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Please allow popups for barcode printing.'); return; }

        printWindow.document.write(`<html><head><title>Barcode Labels — 35 × 22 mm</title>
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                html,body{width:${SHEET_W}mm;background:#fff;color:#000;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:0;margin:0;padding:0}
                @media print{@page{size:${SHEET_W}mm ${LABEL_H}mm;margin:0}html,body{width:${SHEET_W}mm;-webkit-print-color-adjust:exact}}
                .lg{display:grid !important;grid-template-columns:repeat(${LABEL_UP}, ${LABEL_W}mm) !important;justify-content:space-between !important;width:${SHEET_W}mm !important;height:${LABEL_H}mm !important;max-height:${LABEL_H}mm !important;overflow:hidden !important;align-items:center !important;page-break-inside:avoid !important;page-break-after:always !important;break-after:page !important}
                .lg:last-child{page-break-after:avoid !important;break-after:avoid !important}
                .bc-label{width:${LABEL_W}mm !important;height:${LABEL_H}mm !important;max-height:${LABEL_H}mm !important;min-height:${LABEL_H}mm !important;padding:1.2mm 1.5mm !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:.4mm !important;text-align:center !important;overflow:hidden !important;box-sizing:border-box !important;border:none !important;background:transparent !important;border-radius:0 !important;page-break-inside:avoid !important;page-break-after:avoid !important}
                .bc-label > div { margin: 0 !important; padding: 0 !important; border: none !important; }
                .ln{font-size:8pt !important;font-weight:900 !important;text-transform:uppercase !important;letter-spacing:.15px !important;line-height:1.05 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;max-width:100% !important;margin:0 !important;padding:0 !important;color:#000 !important}
                .lv{font-size:6pt !important;font-weight:900 !important;color:#000 !important;text-transform:uppercase !important;letter-spacing:.25px !important;line-height:1 !important;margin:0 !important;max-width:100% !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important}
                .lbc{margin:.6mm 0 !important;line-height:0 !important;width:100% !important;text-align:center !important}.lbc svg{max-width:100% !important;height:auto !important;max-height:8.5mm !important;display:inline-block !important;shape-rendering:crispEdges !important}
                .ls{font-size:5.2pt !important;font-weight:900 !important;font-family:'Courier New',monospace !important;letter-spacing:.4px !important;color:#000 !important;line-height:1 !important;margin:0 !important}
                .lp{font-size:10pt !important;font-weight:900 !important;line-height:1 !important;margin:.5mm 0 0 0 !important;padding:.5mm 0 0 0 !important;color:#000 !important;border-top:.2mm solid #000 !important;width:100% !important}
            </style></head><body>
            ${labelsHtml}
            <script>
                window.onload = function() {
                    setTimeout(function(){ window.focus(); window.print(); window.close(); }, 300);
                }
            <\/script>
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
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{expanded.length} label{expanded.length > 1 ? 's' : ''} · 35 × 22 mm — 2-up</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 mr-1 bg-black/5 dark:bg-white/5 rounded-xl px-2 py-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">All &times;</span>
                            <input
                                type="number" min={1} max={99} defaultValue={1}
                                onChange={(e) => setAll(parseInt(e.target.value || '1', 10) || 1)}
                                className="w-10 h-7 text-center bg-white dark:bg-[#0d1117] rounded-md text-[11px] font-black text-[#0d3542] dark:text-[#58a6ff] outline-none border border-black/10 dark:border-white/10"
                            />
                        </div>
                        <Button onClick={handlePrint} className="h-11 px-8 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all">
                            <Printer size={14} className="mr-2" /> Print All
                        </Button>
                        <button onClick={onClose} className="h-11 w-11 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0a] attire-scrollbar">
                    <div className="mb-4 flex items-center gap-2 px-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Print tip:</span>
                        <span className="text-[9px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest">
                            In the print dialog set <span className="text-[#0d3542] dark:text-[#58a6ff]">Margins: None</span> · <span className="text-[#0d3542] dark:text-[#58a6ff]">Scale: 100%</span> (Actual size) · use <span className="text-[#0d3542] dark:text-[#58a6ff]">- / +</span> on a label for copies.
                        </span>
                    </div>
                    <div ref={labelsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {products.map((p, idx) => {
                            const t = labelText(p);
                            const k = p.id ?? idx;
                            return (
                                <div key={k} data-key={k} className="bc-label relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center gap-2 shadow-sm" style={{ minHeight: '180px' }}>
                                    <div className="space-y-1 w-full min-w-0">
                                        <div className="ln text-[11px] font-black text-gray-900 uppercase tracking-wide leading-tight truncate">{t.name}</div>
                                        {t.variantText && (
                                            <div className="lv text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">{t.variantText}</div>
                                        )}
                                    </div>
                                    <div className="lbc w-full py-1">
                                        <Barcode value={t.code} format="CODE128" width={1.2} height={42} displayValue={false} margin={0} background="transparent" />
                                    </div>
                                    <div className="ls text-[8px] font-mono font-bold text-gray-500 tracking-[0.1em] uppercase truncate max-w-full">{t.sku || t.code}</div>
                                    <div className="lp text-[13px] font-black text-gray-900 border-t border-gray-200 w-full pt-1 mt-auto">{t.price}</div>
                                    <div className="w-full pt-2 mt-1 border-t border-dashed border-gray-200 flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Copies</span>
                                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 px-1 py-0.5">
                                            <button type="button" aria-label={`Decrease copies for ${t.name}`} onClick={() => bump(k, -1)} className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-[#0d3542] text-[13px] font-black leading-none rounded-md hover:bg-white"><Minus size={12} /></button>
                                            <span className="text-[11px] font-black text-gray-700 w-5 text-center tabular-nums">{copies[k] ?? 1}</span>
                                            <button type="button" aria-label={`Increase copies for ${t.name}`} onClick={() => bump(k, 1)} className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-[#0d3542] text-[13px] font-black leading-none rounded-md hover:bg-white"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BarcodePrintModal;
