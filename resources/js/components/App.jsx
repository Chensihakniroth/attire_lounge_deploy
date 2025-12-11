import React, { useState } from 'react';
import { Search, Menu, X, ShoppingBag, User } from 'lucide-react';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-attire-light">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-attire-dark rounded"></div>
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-attire-dark mb-4">
                        Elegance Redefined
                    </h1>
                    <p className="text-xl text-gray-600">
                        Discover curated gentlemen's attire
                    </p>
                </div>

                {/* Featured Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Premium Suits', desc: 'Tailored perfection for every occasion' },
                        { title: 'Designer Shirts', desc: 'Crafted with precision and style' },
                        { title: 'Accessories', desc: 'Complete your sophisticated look' }
                    ].map((card, index) => (
                        <div key={index} className="card-hover mirror-finish rounded-lg p-8 text-center">
                            <div className="w-16 h-16 bg-attire-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="w-8 h-8 bg-attire-accent rounded"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                            <p className="text-gray-600 mb-6">{card.desc}</p>
                            <button className="btn-secondary">
                                Explore
                            </button>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <button className="btn-primary px-8 py-4 text-lg">
                        Shop The Collection
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-attire-dark text-white py-8 mt-12">
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
