// resources/jsx/components/MainApp.jsx - UPDATED VERSION
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import Footer from './layouts/Footer.jsx';

// Pages that you have created
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage.jsx'));
const LookbookPage = lazy(() => import('./pages/LookbookPage.jsx'));
const StylingPage = lazy(() => import('./pages/StylingPage.jsx'));
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

// Layout wrapper component - ALWAYS includes Footer (except for HomePage)
const Layout = ({ children, includeFooter = true }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
                {children}
            </main>
            {includeFooter && <Footer />}
        </div>
    );
};

function MainApp() {
    return (
        <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* HomePage route - Footer is integrated INSIDE HomePage as section 4 */}
                    <Route path="/" element={
                        <div className="min-h-screen flex flex-col">
                            <Navigation />
                            <main className="flex-grow">
                                <HomePage />
                            </main>
                            {/* Footer is now INSIDE HomePage as section 4 */}
                        </div>
                    } />

                    {/* All other routes use Layout with Footer */}
                    <Route path="/collections" element={
                        <Layout>
                            <CollectionsPage />
                        </Layout>
                    } />
                    <Route path="/lookbook" element={
                        <Layout>
                            <LookbookPage />
                        </Layout>
                    } />
                    <Route path="/styling" element={
                        <Layout>
                            <StylingPage />
                        </Layout>
                    } />
                    <Route path="/contact" element={
                        <Layout>
                            <ContactPage />
                        </Layout>
                    } />

                    {/* Simple placeholders - all with Footer */}
                    <Route path="/journal" element={
                        <Layout>
                            <Placeholder title="Journal" />
                        </Layout>
                    } />
                    <Route path="/about" element={
                        <Layout>
                            <Placeholder title="About" />
                        </Layout>
                    } />
                    <Route path="/shipping" element={
                        <Layout>
                            <Placeholder title="Shipping" />
                        </Layout>
                    } />
                    <Route path="/returns" element={
                        <Layout>
                            <Placeholder title="Returns" />
                        </Layout>
                    } />
                    <Route path="/privacy" element={
                        <Layout>
                            <Placeholder title="Privacy" />
                        </Layout>
                    } />
                    <Route path="/terms" element={
                        <Layout>
                            <Placeholder title="Terms" />
                        </Layout>
                    } />
                    <Route path="/appointment" element={
                        <Layout>
                            <Placeholder title="Appointment" />
                        </Layout>
                    } />
                    <Route path="/membership" element={
                        <Layout>
                            <Placeholder title="Membership" />
                        </Layout>
                    } />
                    <Route path="/faq" element={
                        <Layout>
                            <Placeholder title="FAQ" />
                        </Layout>
                    } />

                    {/* Collection sub-routes */}
                    <Route path="/collections/sartorial" element={
                        <Layout>
                            <Placeholder title="Sartorial Collection" />
                        </Layout>
                    } />
                    <Route path="/collections/groom" element={
                        <Layout>
                            <Placeholder title="Groom Collection" />
                        </Layout>
                    } />
                    <Route path="/collections/office" element={
                        <Layout>
                            <Placeholder title="Office Collection" />
                        </Layout>
                    } />
                    <Route path="/collections/accessories" element={
                        <Layout>
                            <Placeholder title="Accessories" />
                        </Layout>
                    } />
                    <Route path="/collections/new-arrivals" element={
                        <Layout>
                            <Placeholder title="New Arrivals" />
                        </Layout>
                    } />

                    {/* 404 */}
                    <Route path="*" element={
                        <Layout>
                            <Placeholder title="Page Not Found" />
                        </Layout>
                    } />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default MainApp;
