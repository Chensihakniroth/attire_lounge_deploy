// resources/js/app.jsx - MAIN ENTRY POINT
import React from 'react';
import { createRoot } from 'react-dom/client';
import './bootstrap';
import '../css/app.css';

// Import components with correct paths
import Navigation from './components/layouts/Navigation';
import Hero from './components/sections/Hero';
import ProductGrid from './components/sections/ProductGrid';
import Footer from './components/layouts/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen">
            <Navigation />
            <main>
                <Hero />
                <ProductGrid />
                {/* Add other sections here */}
            </main>
            <Footer />
        </div>
    );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
