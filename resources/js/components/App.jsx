// resources/js/App.jsx - MAIN REACT COMPONENT
import React, { useState } from 'react';
import { ArrowRight, Menu, X, ShoppingBag, User } from 'lucide-react';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-900 rounded"></div>
                            <span className="text-xl font-light">
                                ATTIRE<span className="font-medium">LOUNGE</span>
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {['Home', 'Collections', 'Suits', 'Shirts'].map(item => (
                                <a key={item} href="#" className="text-gray-700 hover:text-gray-900">
                                    {item}
                                </a>
                            ))}
                        </div>

                        {/* Icons */}
                        <div className="flex items-center space-x-4">
                            <button className="p-2">
                                <User className="w-5 h-5" />
                            </button>
                            <button className="p-2">
                                <ShoppingBag className="w-5 h-5" />
                            </button>
                            <button
                                className="md:hidden p-2"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">
                        Timeless Elegance
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover curated gentlemen's attire with the timeless sophistication of Ralph Lauren.
                    </p>
                    <button className="btn-primary inline-flex items-center group">
                        Explore Collection
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif text-gray-900 mb-4">Featured Collections</h2>
                    <p className="text-gray-600">Curated pieces for the modern gentleman</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Premium Suits',
                            desc: 'Tailored perfection for every occasion',
                            color: 'bg-blue-50'
                        },
                        {
                            title: 'Designer Shirts',
                            desc: 'Crafted with precision and style',
                            color: 'bg-gray-50'
                        },
                        {
                            title: 'Accessories',
                            desc: 'Complete your sophisticated look',
                            color: 'bg-amber-50'
                        }
                    ].map((card, index) => (
                        <div key={index} className="card-hover bg-white rounded-xl p-8 text-center shadow-md">
                            <div className={`w-16 h-16 ${card.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <div className="w-8 h-8 bg-gray-900 rounded"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                            <p className="text-gray-600 mb-6">{card.desc}</p>
                            <button className="btn-secondary">
                                Explore
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2024 Attire Lounge. Crafted with elegance.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
