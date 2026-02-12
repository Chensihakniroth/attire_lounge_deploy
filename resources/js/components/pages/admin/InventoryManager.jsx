import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import minioBaseUrl from '../../../config.js';

const giftOptions = {
    ties: [
      { id: 'tie-brown69', name: 'Silk Tie', color: 'Brown', image: `${minioBaseUrl}/uploads/collections/accessories/brown69.webp` },
      { id: 'tie-cream49', name: 'Silk Tie', color: 'Cream', image: `${minioBaseUrl}/uploads/collections/accessories/cream49.webp` },
      { id: 'tie-cyan69', name: 'Silk Tie', color: 'Cyan', image: `${minioBaseUrl}/uploads/collections/accessories/cyan69.webp` },
      { id: 'tie-blue69', name: 'Silk Tie', color: 'Blue', image: `${minioBaseUrl}/uploads/collections/accessories/blue69.webp` },
      { id: 'tie-green49', name: 'Silk Tie', color: 'Green', image: `${minioBaseUrl}/uploads/collections/accessories/green49.webp` },
      { id: 'tie-white69', name: 'Silk Tie', color: 'White', image: `${minioBaseUrl}/uploads/collections/accessories/white69.webp` },
      { id: 'tie-red69', name: 'Silk Tie', color: 'Red', image: `${minioBaseUrl}/uploads/collections/accessories/red69.webp` },
    ],
    pocketSquares: [
      { id: 'ps-blue', name: 'Silk Pocket Square', color: 'Blue', image: `${minioBaseUrl}/uploads/collections/accessories/psblue.webp` },
      { id: 'ps-green', name: 'Silk Pocket Square', color: 'Green', image: `${minioBaseUrl}/uploads/collections/accessories/psgreen.webp` },
      { id: 'ps-pink', name: 'Silk Pocket Square', color: 'Pink', image: `${minioBaseUrl}/uploads/collections/accessories/pspink.webp` },
      { id: 'ps-red', name: 'Silk Pocket Square', color: 'Red', image: `${minioBaseUrl}/uploads/collections/accessories/psred.webp` },
      { id: 'ps-yellowgreen', name: 'Silk Pocket Square', color: 'Yellow Green', image: `${minioBaseUrl}/uploads/collections/accessories/psyellowgreen.webp` },
      { id: 'ps-yellow', name: 'Silk Pocket Square', color: 'Yellow', image: `${minioBaseUrl}/uploads/collections/accessories/psyellow.webp` },
    ],
    boxes: [
      { id: 'box-small', name: 'Small Box', image: `${minioBaseUrl}/uploads/collections/accessories/smallbox.webp` },
      { id: 'box-mid', name: 'Mid Box', image: `${minioBaseUrl}/uploads/collections/accessories/midbox.webp` },
      { id: 'box-designer', name: 'Designer Box', image: `${minioBaseUrl}/uploads/collections/accessories/designer_box.jpg` },
    ],
};

const InventoryManager = () => {
    const [outOfStockItems, setOutOfStockItems] = useState(() => {
        const saved = localStorage.getItem('out_of_stock_items');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('out_of_stock_items', JSON.stringify(outOfStockItems));
    }, [outOfStockItems]);

    const toggleStock = (id) => {
        setOutOfStockItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };

    const renderSection = (title, items) => (
        <section className="space-y-4">
            <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                    const isOutOfStock = outOfStockItems.includes(item.id);
                    return (
                        <div 
                            key={item.id}
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                isOutOfStock 
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                                    : 'bg-black/20 border-white/10 hover:border-attire-accent/30'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-sm font-medium text-white truncate group-hover:text-attire-accent transition-colors">{item.name}</h3>
                                    <p className="text-xs text-attire-silver">{item.color || 'Default'}</p>
                                </div>
                                <div
                                    className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                                        isOutOfStock 
                                            ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30' 
                                            : 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
                                    }`}
                                >
                                    {isOutOfStock ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                                    isOutOfStock 
                                        ? 'bg-red-500/20 text-red-400' 
                                        : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-4xl font-serif text-white mb-2">Inventory Management</h1>
                <p className="text-attire-silver text-sm">Toggle product availability for the Custom Gift Box curate page.</p>
            </div>

            <div className="bg-attire-accent/10 border border-attire-accent/20 rounded-2xl p-4 flex items-start gap-4 mb-8">
                <AlertTriangle className="text-attire-accent flex-shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-attire-accent uppercase tracking-wider">Note</h4>
                    <p className="text-xs text-attire-silver leading-relaxed">
                        Changes made here are applied locally and stored in your browser's storage. They will immediately affect the Customize Gift Page.
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {renderSection('Ties', giftOptions.ties)}
                {renderSection('Pocket Squares', giftOptions.pocketSquares)}
                {renderSection('Gift Boxes', giftOptions.boxes)}
            </div>
        </div>
    );
};

export default InventoryManager;