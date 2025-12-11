import React from 'react';
import { Eye, Heart, Check } from 'lucide-react';

const ProductGrid = () => {
    const products = [
        {
            id: 1,
            name: 'Heritage Wool Suit',
            category: 'Suits',
            price: '$1,850',
            imageColor: 'bg-attire-cream',
            tags: ['Bespoke', 'Heritage'],
            featured: true
        },
        {
            id: 2,
            name: 'Cashmere Overcoat',
            category: 'Outerwear',
            price: '$2,450',
            imageColor: 'bg-attire-silver/30',
            tags: ['Limited'],
            featured: false
        },
        {
            id: 3,
            name: 'Italian Silk Tie',
            category: 'Accessories',
            price: '$195',
            imageColor: 'bg-attire-burgundy/10',
            tags: ['Handmade'],
            featured: true
        },
        {
            id: 4,
            name: 'Oxford Cotton Shirt',
            category: 'Shirts',
            price: '$285',
            imageColor: 'bg-attire-cream',
            tags: ['Essential'],
            featured: false
        },
        {
            id: 5,
            name: 'Leather Monk Straps',
            category: 'Footwear',
            price: '$625',
            imageColor: 'bg-attire-charcoal/10',
            tags: ['Craft'],
            featured: false
        },
        {
            id: 6,
            name: 'Cable Knit Sweater',
            category: 'Knitwear',
            price: '$495',
            imageColor: 'bg-attire-navy/10',
            tags: ['Winter'],
            featured: true
        },
    ];

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <div className="heading-sm mb-4">Curated Selection</div>
                <h2 className="heading-lg text-attire-charcoal mb-6">
                    The Collection
                </h2>
                <p className="text-attire-stone/70 max-w-2xl mx-auto">
                    Each piece is selected for its craftsmanship, material quality,
                    and timeless aesthetic. Minimal branding, maximum elegance.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="product-card group">
                        {/* Product Image */}
                        <div className="relative overflow-hidden">
                            <div className={`${product.imageColor} product-image`}></div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Tags */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {product.tags.map((tag, idx) => (
                                    <span key={idx} className="collection-badge">
                                        {tag}
                                    </span>
                                ))}
                                {product.featured && (
                                    <span className="collection-badge bg-attire-gold/10 text-attire-gold border-attire-gold/20">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Quick actions */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                    <Heart className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="text-xs tracking-wider text-attire-stone/60 mb-1">
                                        {product.category}
                                    </div>
                                    <h3 className="font-medium text-attire-charcoal group-hover:text-attire-gold transition-colors">
                                        {product.name}
                                    </h3>
                                </div>
                                <div className="text-lg font-serif font-light text-attire-charcoal">
                                    {product.price}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-attire-silver/30">
                                <button className="text-sm text-attire-stone hover:text-attire-charcoal transition-colors">
                                    View Details
                                </button>
                                <div className="flex items-center gap-1 text-xs text-attire-stone/50">
                                    <Check className="w-3 h-3" />
                                    <span>In Stock</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-16">
                <button className="btn-secondary-slim">
                    View Full Collection
                </button>
            </div>
        </section>
    );
};

export default ProductGrid;
