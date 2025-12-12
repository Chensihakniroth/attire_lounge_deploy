import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './layouts/Navigation.jsx';
import Footer from './layouts/Footer.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';

// ONLY pages that you have created
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage.jsx'));
const LookbookPage = lazy(() => import('./pages/LookbookPage.jsx'));
const BespokePage = lazy(() => import('./pages/BespokePage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));

// Simple placeholder for non-existent pages
const Placeholder = ({ title }) => (
    <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif mb-4">{title}</h1>
            <p className="text-gray-600">Coming soon</p>
        </div>
    </div>
);

function MainApp() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-grow">
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/collections" element={<CollectionsPage />} />
                            <Route path="/lookbook" element={<LookbookPage />} />
                            <Route path="/bespoke" element={<BespokePage />} />
                            <Route path="/contact" element={<ContactPage />} />

                            {/* Simple placeholders */}
                            <Route path="/journal" element={<Placeholder title="Journal" />} />
                            <Route path="/about" element={<Placeholder title="About" />} />
                            <Route path="/shipping" element={<Placeholder title="Shipping" />} />
                            <Route path="/returns" element={<Placeholder title="Returns" />} />
                            <Route path="/privacy" element={<Placeholder title="Privacy" />} />
                            <Route path="/terms" element={<Placeholder title="Terms" />} />

                            {/* 404 */}
                            <Route path="*" element={<Placeholder title="Page Not Found" />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default MainApp;
