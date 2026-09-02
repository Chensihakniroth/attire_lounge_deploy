import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Printer, X, SlidersHorizontal } from 'lucide-react';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';
import { getLabelPrintConfig, setLabelPrintConfig } from './labelPrintConfig';

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

/* ─── Print layout is configurable via localStorage and can be tuned per printer. ─── */
const DEFAULT_LAYOUT = getLabelPrintConfig();

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Split a price string into currency symbol + amount, so we can render the
// currency smaller than the amount (e.g. "$ 49.00").
const splitPrice = (raw) => {
    const s = String(raw ?? '');
    const m = s.match(/^(\$|USD|KHR|៛|€|£|¥)\s*(.+)$/);
    if (m) return { currency: m[1], amount: m[2] };
    // Non-ASCII currency or unknown format: keep whole thing as amount.
    return { currency: '', amount: s };
};

const getNameFontSize = (name, baseMm) => {
    const text = String(name ?? '').trim();
    const base = Number.parseFloat(baseMm) || 3.1;
    const len = text.length;

    if (len <= 18) return `${base}mm`;
    if (len <= 24) return `${Math.max(base - 0.4, 2.3)}mm`;
    if (len <= 30) return `${Math.max(base - 0.8, 2.0)}mm`;
    return `${Math.max(base - 1.3, 1.7)}mm`;
};

const getProductColor = (p) => {
    const parsed = Array.isArray(p?.parsed_attributes) ? p.parsed_attributes : [];
    const colorCandidate = parsed.find((attr) => {
        const key = String(attr?.name || attr?.key || attr?.label || '').toLowerCase();
        return key.includes('color') || key.includes('colour');
    });

    if (colorCandidate) {
        const value = String(colorCandidate.value ?? colorCandidate.name ?? '').trim();
        if (value) return value;
    }

    const direct = p?.color || p?.colour || p?.color_name || p?.colour_name;
    if (direct) {
        return String(direct).trim();
    }

    return '';
};

const BarcodePrintModal = ({ products, onClose, formatPrice }) => {
    const labelsRef = useRef(null);
    const [layout, setLayout] = useState(() => getLabelPrintConfig());
    const [showSettings, setShowSettings] = useState(false);

    const LABEL_W = Number(layout.label.widthMm || DEFAULT_LAYOUT.label.widthMm);
    const LABEL_H = Number(layout.label.heightMm || DEFAULT_LAYOUT.label.heightMm);
    const LABEL_UP = Number(layout.label.labelsPerRow || DEFAULT_LAYOUT.label.labelsPerRow);
    const GUTTER = Number(layout.label.gutterMm || DEFAULT_LAYOUT.label.gutterMm);
    const PREVIEW_SCALE = 3.78;
    const SHEET_W = LABEL_W * LABEL_UP + (LABEL_UP - 1) * GUTTER;
    const MM = {
        padX: layout.label.paddingX || DEFAULT_LAYOUT.label.paddingX,
        padY: layout.label.paddingY || DEFAULT_LAYOUT.label.paddingY,
        gap: layout.label.gap || DEFAULT_LAYOUT.label.gap,
        name: layout.label.name || DEFAULT_LAYOUT.label.name,
        variant: layout.label.variant || DEFAULT_LAYOUT.label.variant,
        sku: layout.label.sku || DEFAULT_LAYOUT.label.sku,
        price: layout.label.price || DEFAULT_LAYOUT.label.price,
        priceCurrency: layout.label.priceCurrency || DEFAULT_LAYOUT.label.priceCurrency,
        barcodeH: layout.label.barcodeHeight || DEFAULT_LAYOUT.label.barcodeHeight,
        priceRuleW: layout.label.priceRuleWidth || DEFAULT_LAYOUT.label.priceRuleWidth,
    };
    const baseCardStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '0.4mm',
        textAlign: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: "Arial, Helvetica, 'Liberation Sans', sans-serif",
        color: '#000',
    };

    const handleLayoutFieldChange = (section, key, value) => {
        const normalized = Number.isFinite(Number(value)) ? Number(value) : value;
        setLayout(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: normalized,
            },
        }));
    };

    const saveLayout = () => {
        const next = setLabelPrintConfig(layout);
        setLayout(next);
    };

    // Per-label copy count (QoL): repeat a single label N times without re-clicking print.
    const keyOf = (p, i) => p.id ?? i;
    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const [copies, setCopies] = useState(() =>
        Object.fromEntries(products.map((p, i) => [keyOf(p, i), 1]))
    );
    // Which label is currently shown in the magnified detail overlay (null = none).
    const [enlargedIdx, setEnlargedIdx] = useState(null);
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

    const labelText = (p) => {
        const productName = p.name || '—';
        const productColor = getProductColor(p);
        const colorSuffix = productColor ? ` (${productColor})` : '';

        // Build variantText but skip any attribute whose value duplicates the color
        // already shown on the name line. Otherwise shoes print "(BLACK)" on the name
        // AND "BLACK · 40" on the variant line — same color twice. For a shoe
        // {COLOR:'Black', SIZE:'40'} this leaves variantText = "40" (size only).
        const parsed = Array.isArray(p.parsed_attributes) ? p.parsed_attributes : [];
        const variantText = parsed.length > 0
            ? parsed
                .map(a => a.value)
                .filter(v => {
                    const trimmed = String(v ?? '').trim();
                    if (!trimmed) return false;
                    // Don't repeat the color that the name line already shows.
                    if (productColor && trimmed.toLowerCase() === String(productColor).trim().toLowerCase()) return false;
                    return true;
                })
                .join(' · ')
            : (p.variant || '');

        return {
            name: `${productName}${colorSuffix}`,
            variantText,
            code: p.barcode || p.sku || 'N/A',
            sku: p.sku || '',
            price: formatPrice ? formatPrice(p.price) : p.price,
        };
    };

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
                const nameSize = getNameFontSize(t.name, MM.name);
                cells += `
                    <div class="bc-label">
                        <div class="ln" style="font-size:${nameSize} !important;">${esc(t.name)}</div>
                        ${t.variantText ? `<div class="lv">${esc(t.variantText)}</div>` : ''}
                        <div class="lbc">${svg}</div>
                        <div class="ls">${esc(t.sku)}</div>
                        <div class="lp"><span class="lpa">${esc(t.price)}</span></div>
                    </div>`;
            });
            labelsHtml += `<div class="lg">${cells}</div>`;
        });

        const printHtml = `<html><head><title>Barcode Labels — 35 × 22 mm</title>
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                /* Single font stack for the whole label — narrower than Arial Black so
                   long product names don't overflow. Weight controls emphasis, not font. */
                html,body{width:${SHEET_W}mm;height:${LABEL_H}mm;background:#fff;color:#000;
                    font-family:Arial,Helvetica,'Liberation Sans',sans-serif;font-size:0;
                    margin:0;padding:0;-webkit-font-smoothing:antialiased}
                @media print{@page{size:${SHEET_W}mm ${LABEL_H}mm;margin:0mm}
                    html,body{width:${SHEET_W}mm;height:${LABEL_H}mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}}

                .lg{display:grid !important;grid-template-columns:repeat(${LABEL_UP}, ${LABEL_W}mm) !important;
                    column-gap:${GUTTER}mm !important;row-gap:0 !important;
                    justify-content:flex-start !important;width:${SHEET_W}mm !important;
                    height:${LABEL_H}mm !important;max-height:${LABEL_H}mm !important;
                    overflow:hidden !important;align-items:stretch !important;
                    margin:0 !important;padding:0 !important;page-break-inside:avoid !important}

                .bc-label{width:${LABEL_W}mm !important;height:${LABEL_H}mm !important;
                    max-height:${LABEL_H}mm !important;min-height:${LABEL_H}mm !important;
                    padding:${MM.padY} ${MM.padX} !important;
                    display:flex !important;flex-direction:column !important;
                    align-items:center !important;justify-content:center !important;
                    gap:${MM.gap} !important;text-align:center !important;overflow:hidden !important;
                    box-sizing:border-box !important;border:none !important;background:transparent !important;
                    border-radius:0 !important;page-break-inside:avoid !important;page-break-after:avoid !important}

                .ln{font-size:${MM.name} !important;font-weight:700 !important;
                    text-transform:uppercase !important;letter-spacing:0 !important;
                    line-height:1 !important;color:#000 !important;
                    display:block !important;max-width:100% !important;
                    overflow:hidden !important;word-break:break-word !important;
                    margin:0 !important;padding:0 !important;flex:0 0 auto !important}

                .lv{font-size:${MM.variant} !important;font-weight:600 !important;
                    text-transform:uppercase !important;color:#000 !important;
                    letter-spacing:0 !important;line-height:1 !important;
                    white-space:nowrap !important;overflow:hidden !important;
                    text-overflow:ellipsis !important;max-width:100% !important;
                    margin:0 !important;padding:0 !important;flex:0 0 auto !important}

                .lbc{line-height:0 !important;width:100% !important;text-align:center !important;
                    margin:0 !important;padding:0 !important;flex:0 0 auto !important}
                .lbc svg{max-width:100% !important;height:${MM.barcodeH} !important;
                    max-height:${MM.barcodeH} !important;display:inline-block !important;
                    shape-rendering:crispEdges !important}

                .ls{font-size:${MM.sku} !important;font-weight:400 !important;
                    font-family:'Courier New',monospace !important;letter-spacing:0 !important;
                    color:#555 !important;line-height:1 !important;margin:0 !important;
                    padding:0 !important;flex:0 0 auto !important;
                    white-space:nowrap !important;overflow:hidden !important;
                    text-overflow:ellipsis !important;max-width:100% !important}

                .lp{font-weight:900 !important;line-height:1 !important;margin:0 !important;
                    width:100% !important;display:flex !important;align-items:center !important;
                    justify-content:center !important;flex:0 0 auto !important}
                .lpa{font-size:${MM.price} !important;color:#000 !important;line-height:1 !important}
            </style></head><body>
            ${labelsHtml}
        </body></html>`;

        // Open a popup synchronously inside the click handler so the browser doesn't
        // block it as a popup. Then immediately write into it. We can't reliably
        // use window.onload for `print()` — in many browsers document.write() makes
        // the load event never fire, OR it fires before the document is ready.
        // Instead: write+close the document synchronously, then use a microtask delay
        // (long enough for parser to settle, short enough to feel instant) and call
        // print() directly. If the popup is blocked, fall back to a hidden iframe.
        const triggerPrint = (win) => {
            try {
                win.focus();
                // Two RAFs + small delay — guarantees layout is computed and SVGs have
                // their final size before the print dialog opens.
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    setTimeout(() => {
                        try { win.print(); } catch (e) {
                            console.error('Print failed:', e);
                            alert('Print failed: ' + (e?.message || e));
                        }
                    }, 150);
                }));
            } catch (e) {
                console.error('Print trigger failed:', e);
                alert('Print failed: ' + (e?.message || e));
            }
        };

        let printWindow = null;
        try {
            printWindow = window.open('', '_blank', 'width=900,height=700');
        } catch (e) {
            printWindow = null;
        }
        if (printWindow && printWindow.document) {
            try {
                printWindow.document.open();
                printWindow.document.write(printHtml);
                printWindow.document.close();
                printWindow.onafterprint = () => { try { printWindow.close(); } catch (_) {} };
                triggerPrint(printWindow);
            } catch (e) {
                console.error('Popup write failed, falling back to iframe:', e);
                printWindow = null;
            }
        }
        if (!printWindow) {
            // Fallback: hidden iframe. Doesn't need popup permission, prints within
            // the same tab. User clicks the iframe's print dialog and then we remove it.
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.title = 'barcode-print';
            document.body.appendChild(iframe);
            const iwin = iframe.contentWindow;
            const idoc = iframe.contentDocument || (iwin && iwin.document);
            if (!idoc) {
                alert('Could not open print preview. Please allow popups or disable popup blocker for this site.');
                return;
            }
            idoc.open();
            idoc.write(printHtml);
            idoc.close();
            // Auto-remove iframe shortly after the print dialog closes.
            iwin.onafterprint = () => setTimeout(() => { try { iframe.remove(); } catch (_) {} }, 500);
            // Safety net: remove iframe after 60s if user never prints.
            setTimeout(() => { try { iframe.remove(); } catch (_) {} }, 60000);
            triggerPrint(iwin);
        }
    };

    if (!products || products.length === 0) return null;

    // ESC closes the magnified detail overlay (if open).
    useEffect(() => {
        if (enlargedIdx === null) return;
        const onKey = (e) => { if (e.key === 'Escape') setEnlargedIdx(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [enlargedIdx]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-[94vw] max-w-7xl max-h-[88vh] flex flex-col overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#fdfdfc] dark:bg-[#0d1117] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 flex items-center justify-center">
                            <Printer size={20} className="text-[#0d3542] dark:text-[#58a6ff]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.3em]">Barcode Labels</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{expanded.length} label{expanded.length > 1 ? 's' : ''} · {LABEL_W} × {LABEL_H} mm — {LABEL_UP}-up</p>
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
                        <button
                            type="button"
                            onClick={() => setShowSettings(v => !v)}
                            className="h-11 px-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                            aria-label="Toggle label layout settings"
                            title="Label layout settings"
                        >
                            <SlidersHorizontal size={16} />
                        </button>
                        <Button onClick={handlePrint} className="h-11 px-8 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all">
                            <Printer size={14} className="mr-2" /> Print All
                        </Button>
                        <button onClick={onClose} className="h-11 w-11 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {showSettings && (
                    <div className="border-b border-black/10 dark:border-white/10 bg-[#f5f5f4] dark:bg-[#101418] px-8 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                                Width (mm)
                                <input type="number" min="10" step="1" value={layout.label.widthMm} onChange={(e) => handleLayoutFieldChange('label', 'widthMm', e.target.value)} className="mt-2 w-full h-9 rounded-lg border border-black/10 bg-white dark:bg-[#0d1117] px-2 text-[11px] font-bold text-gray-800 dark:text-white outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]" />
                            </label>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                                Height (mm)
                                <input type="number" min="10" step="1" value={layout.label.heightMm} onChange={(e) => handleLayoutFieldChange('label', 'heightMm', e.target.value)} className="mt-2 w-full h-9 rounded-lg border border-black/10 bg-white dark:bg-[#0d1117] px-2 text-[11px] font-bold text-gray-800 dark:text-white outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]" />
                            </label>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                                Per row
                                <input type="number" min="1" max="4" step="1" value={layout.label.labelsPerRow} onChange={(e) => handleLayoutFieldChange('label', 'labelsPerRow', e.target.value)} className="mt-2 w-full h-9 rounded-lg border border-black/10 bg-white dark:bg-[#0d1117] px-2 text-[11px] font-bold text-gray-800 dark:text-white outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]" />
                            </label>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                                Gutter (mm)
                                <input type="number" min="0" step="1" value={layout.label.gutterMm} onChange={(e) => handleLayoutFieldChange('label', 'gutterMm', e.target.value)} className="mt-2 w-full h-9 rounded-lg border border-black/10 bg-white dark:bg-[#0d1117] px-2 text-[11px] font-bold text-gray-800 dark:text-white outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]" />
                            </label>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Sheet size: {SHEET_W} mm</span>
                            <Button onClick={saveLayout} className="h-9 px-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:opacity-90 transition-all">
                                Save Layout
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-10 bg-gray-50 dark:bg-[#0a0a0a] attire-scrollbar">
                    <div className="mb-4 flex items-center gap-2 px-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Print tip:</span>
                        <span className="text-[9px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest">
                            In the print dialog set <span className="text-[#0d3542] dark:text-[#58a6ff]">Margins: None</span> · <span className="text-[#0d3542] dark:text-[#58a6ff]">Scale: 100%</span> (Actual size) · use <span className="text-[#0d3542] dark:text-[#58a6ff]">- / +</span> on a label for copies.
                        </span>
                    </div>
                    <div
                        ref={labelsRef}
                        className="grid"
                        style={{
                            gridTemplateColumns: `repeat(${LABEL_UP}, ${LABEL_W * PREVIEW_SCALE}px)`,
                            columnGap: `${GUTTER * PREVIEW_SCALE}px`,
                            rowGap: 0,
                            justifyContent: 'flex-start',
                            width: 'fit-content',
                        }}
                    >
                        {products.map((p, idx) => {
                            const t = labelText(p);
                            const k = p.id ?? idx;
                            // Each preview is a true-to-print label rendered at a scaled-up
                            // visual size (scale = px-per-mm ratio at 96 DPI: 1mm = 3.78px).
                            // The preview's INTERNAL CSS matches the print CSS exactly, so
                            // the on-screen card is WYSIWYG against the printed output.
                            const nameSizePx = parseFloat(getNameFontSize(t.name, MM.name)) * PREVIEW_SCALE;
                            return (
                                <div key={k} className="flex flex-col items-center gap-3 group">
                                {/* True-to-print card. WYSIWYG sizing — same internal CSS as the
                                   printed output so what you see is what prints. */}
                                <div data-key={k} className="bc-label bg-white border border-gray-200 rounded-xl shadow-sm relative"
                                    style={{
                                        width: `${LABEL_W * PREVIEW_SCALE}px`,
                                        height: `${LABEL_H * PREVIEW_SCALE}px`,
                                        padding: `${parseFloat(MM.padY) * PREVIEW_SCALE}px ${parseFloat(MM.padX) * PREVIEW_SCALE}px`,
                                        ...baseCardStyle,
                                        justifyContent: 'flex-start',
                                        gap: `${parseFloat(MM.gap) * PREVIEW_SCALE}px`,
                                    }}>
                                    {/* Magnifier button — top-right of the card. Click to open an
                                       enlarged detail view of this single label so the user can
                                       actually inspect the barcode + text before printing. */}
                                    <button
                                        type="button"
                                        aria-label={`Enlarge label ${t.name}`}
                                        onClick={() => setEnlargedIdx(k)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/5 hover:bg-[#0d3542] hover:text-white text-gray-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                        title="Enlarge to inspect"
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                                    </button>
                                    <div className="ln"
                                        style={{
                                            width: '100%',
                                            fontSize: `${nameSizePx}px`,
                                            fontWeight: 700, textTransform: 'uppercase',
                                            lineHeight: 1, color: '#000',
                                            whiteSpace: 'normal', overflow: 'hidden',
                                            wordBreak: 'break-word', maxWidth: '100%',
                                            flex: '0 0 auto', margin: 0, padding: 0,
                                        }}>{t.name}</div>
                                    {t.variantText && (
                                        <div className="lv"
                                            style={{
                                                width: '100%',
                                                fontSize: `${parseFloat(MM.variant) * PREVIEW_SCALE}px`,
                                                fontWeight: 600, color: '#000',
                                                textTransform: 'uppercase', lineHeight: 1,
                                                whiteSpace: 'nowrap', overflow: 'hidden',
                                                textOverflow: 'ellipsis', maxWidth: '100%',
                                                flex: '0 0 auto', margin: 0, padding: 0,
                                            }}>{t.variantText}</div>
                                    )}
                                    <div className="lbc"
                                        style={{
                                            width: '100%', textAlign: 'center', lineHeight: 0,
                                            flex: '0 0 auto', margin: 0, padding: 0,
                                        }}>
                                        <Barcode value={t.code} format="CODE128" width={1.2} height={Math.round(parseFloat(MM.barcodeH) * PREVIEW_SCALE)} displayValue={false} margin={0} background="transparent" />
                                    </div>
                                    <div className="ls"
                                        style={{
                                            fontSize: `${parseFloat(MM.sku) * PREVIEW_SCALE}px`,
                                            fontFamily: "'Courier New', monospace",
                                            fontWeight: 400, color: '#555', lineHeight: 1,
                                            whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', maxWidth: '100%',
                                            flex: '0 0 auto', margin: 0, padding: 0,
                                        }}>{t.sku || t.code}</div>
                                    <div className="lp"
                                        style={{
                                            width: '100%',
                                            fontWeight: 900, lineHeight: 1,
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: '0 0 auto', margin: 0,
                                        }}>
                                        <span className="lpa"
                                            style={{
                                                fontSize: `${parseFloat(MM.price) * PREVIEW_SCALE}px`,
                                                color: '#000',
                                            }}>{t.price}</span>
                                    </div>
                                </div>
                                {/* Copies stepper — OUTSIDE the print card so it has its own row
                                   and never gets clipped by the card's overflow:hidden. */}
                                <div className="w-full flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Copies</span>
                                    <div className="flex items-center gap-1">
                                        <button type="button" aria-label={`Decrease copies for ${t.name}`} onClick={() => bump(k, -1)} className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-[#0d3542] rounded-md hover:bg-white"><Minus size={12} /></button>
                                        <span className="text-[11px] font-black text-gray-700 w-5 text-center tabular-nums">{copies[k] ?? 1}</span>
                                        <button type="button" aria-label={`Increase copies for ${t.name}`} onClick={() => bump(k, 1)} className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-[#0d3542] rounded-md hover:bg-white"><Plus size={12} /></button>
                                    </div>
                                </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Magnified detail overlay — opens when user clicks the magnifier on a preview.
                Renders the SAME label structure at 4× scale (528×332 px) so the user can
                actually inspect barcode + text + price before printing. ESC or backdrop
                click closes. The printed output is unchanged. */}
            <AnimatePresence>
                {enlargedIdx !== null && (() => {
                    const ep = products.find((pp, i) => keyOf(pp, i) === enlargedIdx);
                    if (!ep) return null;
                    const et = labelText(ep);
                    const BIG = PREVIEW_SCALE * 4; // 15.12 px per mm
                    return (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-300 flex items-center justify-center"
                            onClick={() => setEnlargedIdx(null)}
                        >
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-full flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Preview · 4× zoom</div>
                                        <div className="text-base font-black text-gray-900 mt-0.5 truncate max-w-[60vw]">{et.name}</div>
                                    </div>
                                    <button
                                        onClick={() => setEnlargedIdx(null)}
                                        className="h-9 w-9 rounded-lg bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900"
                                        aria-label="Close preview"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                {/* Same .bc-label structure, just scaled. Print output untouched. */}
                                <div className="bc-label bg-white border border-gray-300 rounded-xl shadow-lg"
                                    style={{
                                        width: `${LABEL_W * BIG}px`,
                                        height: `${LABEL_H * BIG}px`,
                                        padding: `${parseFloat(MM.padY) * BIG}px ${parseFloat(MM.padX) * BIG}px`,
                                        ...baseCardStyle,
                                        justifyContent: 'flex-start',
                                        gap: `${parseFloat(MM.gap) * BIG}px`,
                                    }}>
                                    <div style={{
                                        width: '100%',
                                        fontSize: `${parseFloat(getNameFontSize(et.name, MM.name)) * BIG}px`,
                                        fontWeight: 700, textTransform: 'uppercase',
                                        lineHeight: 1, color: '#000',
                                        whiteSpace: 'normal', overflow: 'hidden',
                                        wordBreak: 'break-word', maxWidth: '100%',
                                        flex: '0 0 auto', margin: 0, padding: 0,
                                    }}>{et.name}</div>
                                    {et.variantText && (
                                        <div style={{
                                            width: '100%',
                                            fontSize: `${parseFloat(MM.variant) * BIG}px`,
                                            fontWeight: 600, color: '#000',
                                            textTransform: 'uppercase', lineHeight: 1,
                                            whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', maxWidth: '100%',
                                            flex: '0 0 auto', margin: 0, padding: 0,
                                        }}>{et.variantText}</div>
                                    )}
                                    <div style={{
                                        width: '100%', textAlign: 'center', lineHeight: 0,
                                        flex: '0 0 auto', margin: 0, padding: 0,
                                    }}>
                                        <Barcode value={et.code} format="CODE128" width={1.2} height={Math.round(parseFloat(MM.barcodeH) * BIG)} displayValue={false} margin={0} background="transparent" />
                                    </div>
                                    <div style={{
                                        fontSize: `${parseFloat(MM.sku) * BIG}px`,
                                        fontFamily: "'Courier New', monospace",
                                        fontWeight: 400, color: '#555', lineHeight: 1,
                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis', maxWidth: '100%',
                                        flex: '0 0 auto', margin: 0, padding: 0,
                                    }}>{et.sku || et.code}</div>
                                    <div style={{
                                        width: '100%',
                                        fontWeight: 900, lineHeight: 1,
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: '0 0 auto', margin: 0,
                                    }}>
                                        <span style={{
                                            fontSize: `${parseFloat(MM.price) * BIG}px`,
                                            color: '#000',
                                        }}>{et.price}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    This is the SAME layout that prints — just zoomed for inspection.
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </motion.div>
    );
};

export default BarcodePrintModal;
