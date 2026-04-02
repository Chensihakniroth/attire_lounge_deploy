import React from 'react';

const PriceTagPrint = ({ product }) => {
    if (!product) return null;

    return (
        <div id="price-tag-print" className="hidden print:block p-4 w-[60mm] h-[40mm] border border-black bg-white text-black font-sans">
            <style>
                {`
                    @media print {
                        @page {
                            size: 60mm 40mm;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #price-tag-print, #price-tag-print * {
                            visibility: visible;
                        }
                        #price-tag-print {
                            position: absolute;
                            left: 0;
                            top: 0;
                        }
                    }
                `}
            </style>
            
            <div className="flex flex-col h-full justify-between items-center text-center">
                <div className="space-y-1">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest">{product.name}</h2>
                    <p className="text-[10px] font-medium text-gray-600">{product.category || 'Apparel'}</p>
                </div>

                {/* Barcode Placeholder / Font-based Barcode */}
                <div className="flex flex-col items-center">
                    <div className="text-[32px] my-1" style={{ fontFamily: "'Libre Barcode 128', cursive" }}>
                        {product.sku || product.code}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest">{product.sku || product.code}</span>
                </div>

                <div className="pt-2 border-t border-black w-full">
                    <span className="text-[18px] font-bold">${parseFloat(product.price).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default PriceTagPrint;
