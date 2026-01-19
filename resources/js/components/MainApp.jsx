// resources/jsx/components/MainApp.jsx - UPDATED VERSION
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import Footer from './layouts/Footer.jsx';

import ScrollToTop from './common/ScrollToTop.jsx';

// Pages that you have created
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage.jsx'));
const ProductListPage = lazy(() => import('./pages/ProductListPage.jsx'));
const LookbookPage = lazy(() => import('./pages/LookbookPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const CustomizeGiftPage = lazy(() => import('./pages/CustomizeGiftPage.jsx')); // New Page
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const PrivateRoute = lazy(() => import('./pages/admin/PrivateRoute.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const ImageManager = lazy(() => import('./pages/admin/ImageManager.jsx'));
const AppointmentManager = lazy(() => import('./pages/admin/AppointmentManager.jsx'));
const CustomizeGiftManager = lazy(() => import('./pages/admin/CustomizeGiftManager.jsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.jsx'));
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage.jsx'));


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
            <main className="flex-grow pt-24 md:pt-0">
                {children}
            </main>
            {includeFooter && <Footer />}
        </div>
    );
};

function MainApp() {
    return (
        <Router>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* HomePage route - Footer is integrated INSIDE HomePage as section 4 */}
                    <Route path="/" element={
                        <div className="min-h-screen flex flex-col">
                            <Navigation />
                            <main className="flex-grow pt-24 md:pt-0">
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
                     <Route path="/products" element={
                        <Layout>
                            <ProductListPage />
                        </Layout>
                    } />
                     <Route path="/products/:collectionSlug" element={
                        <Layout>
                            <ProductListPage />
                        </Layout>
                    } />
                    <Route path="/lookbook" element={
                        <Layout>
                            <LookbookPage />
                        </Layout>
                    } />
                    <Route path="/contact" element={
                        <Layout>
                            <ContactPage />
                        </Layout>
                    } />
                    <Route path="/customize-gift" element={
                        <Layout>
                            <CustomizeGiftPage />
                        </Layout>
                    } />
                    <Route path="/favorites" element={
                        <Layout>
                            <FavoritesPage />
                        </Layout>
                    } />

                    <Route element={<PrivateRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/image-manager" element={<ImageManager />} />
                            <Route path="/admin/appointments" element={<AppointmentManager />} />
                            <Route path="/admin/customize-gift" element={<CustomizeGiftManager />} />
                        </Route>
                    </Route>

                    <Route path="/admin/login" element={
                        <Layout>
                            <AdminLogin />
                        </Layout>
                    } />

                    {/* Simple placeholders - all with Footer */}
                    <Route path="/styling" element={
                        <Layout>
                            <Placeholder title="Styling" />
                        </Layout>
                    } />
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
                    <Route path="/privacy" element={
                        <Layout>
                            <PrivacyPolicyPage />
                        </Layout>
                    } />
                    <Route path="/terms" element={
                        <Layout>
                            <TermsOfServicePage />
                        </Layout>
                    } />
                    <Route path="/returns" element={
                        <Layout>
                            <ReturnPolicyPage />
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

