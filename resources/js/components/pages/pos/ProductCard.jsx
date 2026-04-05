import React from 'react';
import { motion } from 'framer-motion';
import {
    Tag,
    Package,
    ShoppingCart,
    Zap,
    Info,
    Printer,
    Plus,
} from 'lucide-react';
import { usePOS } from './POSContext';
import PriceTagPrint from './PriceTagPrint';

const ProductCard = ({ product }) => {
    const { addItem, activeTab } = usePOS();
    const isAdded = activeTab.cartItems.some(
        (i) => i.product_id === product.id
    );

    // Dynamic color based on tiers
    const getTierColor = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'designer':
                return 'text-purple-400 border-purple-400/30 bg-purple-400/5';
            case 'premium':
                return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
            default:
                return 'text-attire-accent border-attire-accent/30 bg-attire-accent/5';
        }
    };

    const handlePrint = (e) => {
        e.stopPropagation();
        const printWindow = window.open('', '_blank');
        const printContent = document.getElementById(
            `price-tag-${product.id}`
        ).innerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label - ${product.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&family=Inter:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { margin: 0; padding: 0; }
                        @media print {
                            @page { size: 60mm 40mm; margin: 0; }
                        }
                        .print-container { width: 60mm; height: 40mm; border: 1px solid #eee; padding: 4mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; font-family: 'Inter', sans-serif; color: black; }
                        .barcode { font-family: 'Libre Barcode 128', cursive; font-size: 32pt; margin: 1mm 0; }
                        .sku { font-size: 8pt; font-family: monospace; letter-spacing: 2px; }
                        .name { font-size: 10pt; font-bold: true; text-transform: uppercase; margin-bottom: 1mm; }
                        .price { font-size: 14pt; font-weight: bold; border-top: 1px solid black; width: 100%; padding-top: 1mm; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${printContent}
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const tierStyle = getTierColor(product.tier);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group relative flex flex-col bg-background dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer shadow-none transition-all duration-300"
        >
            {/* Stock Badge */}
            <div
                className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
                    product.stock_qty > 10
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : product.stock_qty > 0
                          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
            >
                {product.stock_qty > 0
                    ? `${product.stock_qty} IN STOCK`
                    : 'OUT OF STOCK'}
            </div>

            {/* Print Button (Hover only) */}
            <button
                onClick={handlePrint}
                className="absolute top-2 right-12 z-20 p-2 rounded-xl bg-background/10 opacity-0 group-hover:opacity-100 backdrop-blur-md text-gray-400 hover:text-attire-accent transition-all hover:bg-background/20"
                title="Print Label"
            >
                <Printer size={14} />
            </button>

            {/* Product Rarity/Tier Badge */}
            <div
                className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${tierStyle}`}
            >
                {product.tier}
            </div>

            {/* Product Item Container */}
            <div
                onClick={() => addItem(product)}
                className="flex-1 flex flex-col"
            >
                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-400">
                                <Tag size={12} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-attire-accent transition-colors">
                                {product.sku || 'NO SKU'}
                            </p>
                        </div>
                        <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-900 dark:text-white line-clamp-2 leading-relaxed group-hover:text-attire-accent transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            {product.category || 'General'}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:scale-105 origin-left transition-transform tracking-tight">
                                ${parseFloat(product.price).toLocaleString()}
                            </span>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                                Unit Price
                            </p>
                        </div>

                        <div
                            className={`p-2.5 rounded-xl border border-black/5 dark:border-white/5 transition-all duration-300 ${isAdded ? 'bg-attire-accent text-black scale-110' : 'bg-black dark:bg-white/10 text-white dark:text-attire-accent opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`}
                        >
                            {isAdded ? (
                                <Zap size={14} fill="currentColor" />
                            ) : (
                                <Plus size={14} strokeWidth={3} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Content for Print Hook */}
            <div id={`price-tag-${product.id}`} className="hidden">
                <div className="name">{product.name}</div>
                <div className="barcode">{product.sku || product.code}</div>
                <div className="sku">{product.sku || product.code}</div>
                <div className="price">
                    ${parseFloat(product.price).toLocaleString()}
                </div>
            </div>

            {/* Visual Highlight Bar */}
            <div
                className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                    product.tier === 'Designer'
                        ? 'bg-purple-400 w-0 group-hover:w-full'
                        : product.tier === 'Premium'
                          ? 'bg-yellow-400 w-0 group-hover:w-full'
                          : 'bg-attire-accent w-0 group-hover:w-full'
                }`}
            />
        </motion.div>
    );
};

export default ProductCard;
