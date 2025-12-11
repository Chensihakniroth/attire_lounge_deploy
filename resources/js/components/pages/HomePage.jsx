import React from 'react';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-attire-dark via-attire-navy to-black"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
                        Elegance Redefined
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Discover curated gentlemen's attire with timeless sophistication.
                    </p>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition inline-flex items-center group">
                        Explore Collection
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif text-attire-dark mb-4">Featured Collections</h2>
                    <p className="text-gray-600">Curated pieces for the modern gentleman</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {['Suits', 'Shirts', 'Accessories'].map((category, index) => (
                        <div key={category} className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-attire-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="w-8 h-8 bg-attire-accent rounded"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">{category}</h3>
                            <p className="text-gray-600 mb-6">
                                Premium selection of {category.toLowerCase()} for every occasion
                            </p>
                            <button className="border border-attire-charcoal text-attire-charcoal px-6 py-2 rounded-full hover:bg-attire-charcoal hover:text-white transition">
                                View Collection
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
