import React from 'react';

const CollectionsPage = () => {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">Collections</h1>
                <p className="text-lg text-gray-600 mb-12">Premium collections for the modern gentleman.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {['Spring/Summer 2024', 'Signature Suits', 'Evening Attire', 'Linen & Cotton', 'Leather Goods', 'Italian Footwear'].map((collection, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-2">{collection}</h3>
                            <p className="text-gray-600 mb-4">Curated selection of premium pieces</p>
                            <button className="text-attire-charcoal font-medium hover:text-attire-accent transition">
                                View Collection →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollectionsPage;
