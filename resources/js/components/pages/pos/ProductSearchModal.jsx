import React from 'react';
import { X } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import ModernModal from '../../common/ModernModal';

const ProductSearchModal = ({ isOpen, onClose }) => {
    return (
        <ModernModal 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-[95vw]" 
            showCloseButton={false}
        >
            <div className="h-[90vh] relative flex flex-col">
                {/* Compact Modal Header with Close Button */}
                <div className="absolute top-6 right-8 z-[60]">
                    <button 
                        onClick={onClose}
                        className="group p-3 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-gray-400 transition-all border border-black/5 dark:border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Integrated Catalog Dashboard */}
                <div className="flex-1 overflow-hidden">
                    <ProductCatalog />
                </div>

                {/* Minimal Footer for status or shortcut hints */}
                <div className="px-8 py-3 bg-[#f8f8f6] dark:bg-[#1a1a1a] border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">ESC</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">to exit search hub</span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-40">
                        Neural Sync: Active
                    </div>
                </div>
            </div>
        </ModernModal>
    );
};

export default ProductSearchModal;
