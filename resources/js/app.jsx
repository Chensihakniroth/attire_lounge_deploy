import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import API from './api';
import '../css/app.css';

// ... (keep all your existing component code)

// In your main App component, replace static data with API calls:
function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [navVisible, setNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [currentPage, setCurrentPage] = useState('home');
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredRes, categoriesRes] = await Promise.all([
                    API.getFeaturedProducts(),
                    API.getCategories()
                ]);

                if (featuredRes.success) setFeaturedProducts(featuredRes.data);
                if (categoriesRes.success) setCategories(categoriesRes.data);

                // Fetch products based on current page
                if (currentPage === 'home') {
                    const productsRes = await API.getProducts({ featured: true, per_page: 6 });
                    if (productsRes.success) setProducts(productsRes.data);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    // Update your page components to use the fetched data:
    const HomePage = () => (
        <>
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 rounded-full">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <span className="text-sm text-white/90 tracking-widest">SPRING COLLECTION 2024</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif text-white mb-8">
                            Timeless Elegance
                        </h1>

                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Curated gentlemen's attire that blends heritage craftsmanship
                            with contemporary design. Ralph Lauren inspired aesthetic.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setCurrentPage('collections')}
                                className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-300"
                            >
                                Explore Collection
                            </button>
                            <button
                                onClick={() => setCurrentPage('lookbook')}
                                className="border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors duration-300"
                            >
                                View Lookbook
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                        Featured Products
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Premium selection for every occasion
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredProducts.map((product, idx) => (
                            <div
                                key={product.id || idx}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {product.images && product.images.length > 0 ? (
                                    <div
                                        className="h-64 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${product.images[0]})` }}
                                    ></div>
                                ) : (
                                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50"></div>
                                )}

                                <div className="p-8">
                                    <h3 className="text-xl font-medium mb-2">{product.name}</h3>
                                    <p className="text-gray-600 mb-4">{product.category}</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-serif text-lg font-medium">${product.price}</span>
                                            {product.compare_price && (
                                                <span className="ml-2 text-sm text-gray-500 line-through">${product.compare_price}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(`product-${product.slug}`)}
                                            className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300"
                                        >
                                            View →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );

    // Update other page components similarly...
    // CollectionsPage, SuitsPage, etc. should fetch data based on category
}
