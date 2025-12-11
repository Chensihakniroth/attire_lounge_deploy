// resources/js/components/layouts/Footer.jsx - FIXED
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-attire-dark text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="text-2xl font-light mb-4">
                            ATTIRE<span className="font-medium">LOUNGE</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Gentlemen's clothing with timeless elegance and modern sophistication.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Collections</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/suits" className="hover:text-white">Suits</a></li>
                            <li><a href="/shirts" className="hover:text-white">Shirts</a></li>
                            <li><a href="/accessories" className="hover:text-white">Accessories</a></li>
                            <li><a href="/new-arrivals" className="hover:text-white">New Arrivals</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Information</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/about" className="hover:text-white">About Us</a></li>
                            <li><a href="/contact" className="hover:text-white">Contact</a></li>
                            <li><a href="/shipping" className="hover:text-white">Shipping Policy</a></li>
                            <li><a href="/returns" className="hover:text-white">Returns</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe for exclusive updates and offers.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-l text-sm"
                            />
                            <button className="bg-attire-accent px-4 py-2 rounded-r text-sm font-medium">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>© {new Date().getFullYear()} Attire Lounge. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
