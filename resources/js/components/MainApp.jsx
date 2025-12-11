import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Navigation from './layouts/Navigation.jsx';
import Footer from './layouts/Footer.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';

// Pages (use lazy loading for better performance)
const HomePage = React.lazy(() => import('./pages/HomePage.jsx'));
const CollectionsPage = React.lazy(() => import('./pages/CollectionsPage.jsx'));
const LookbookPage = React.lazy(() => import('./pages/LookbookPage.jsx'));
const BespokePage = React.lazy(() => import('./pages/BespokePage.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));

function MainApp() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-grow">
                    <React.Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/collections" element={<CollectionsPage />} />
                            <Route path="/lookbook" element={<LookbookPage />} />
                            <Route path="/bespoke" element={<BespokePage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/product/:slug" element={<div className="py-20 text-center"><h1>Product Detail</h1></div>} />
                        </Routes>
                    </React.Suspense>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default MainApp;
