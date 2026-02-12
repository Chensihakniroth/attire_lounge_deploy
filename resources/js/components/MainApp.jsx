// resources/jsx/components/MainApp.jsx
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import Footer from './layouts/Footer.jsx';

// ScrollToTop is handled via AnimatePresence onExitComplete
// import ScrollToTop from './common/ScrollToTop.jsx';

// Pages that you have created
const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            const component = await componentImport();
            window.localStorage.setItem('page-has-been-force-refreshed', 'false');
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Personal preference: wait a bit before refreshing
                window.localStorage.setItem('page-has-been-force-refreshed', 'true');
                return window.location.reload();
            }

            // The page has already been reloaded and still fails, so let's throw an error
            // to be caught by the ErrorBoundary
            throw error;
        }
    });

const HomePage = lazyWithRetry(() => import('./pages/HomePage.jsx'));
const CollectionsPage = lazyWithRetry(() => import('./pages/CollectionsPage.jsx'));
const ProductListPage = lazyWithRetry(() => import('./pages/ProductListPage.jsx'));
const LookbookPage = lazyWithRetry(() => import('./pages/LookbookPage.jsx'));
const FashionShowPage = lazyWithRetry(() => import('./pages/FashionShowPage.jsx'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage.jsx'));
const CustomizeGiftPage = lazyWithRetry(() => import('./pages/CustomizeGiftPage.jsx'));
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage.jsx'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminLogin = lazyWithRetry(() => import('./pages/admin/AdminLogin.jsx'));
const PrivateRoute = lazyWithRetry(() => import('./pages/admin/PrivateRoute.jsx'));

const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout.jsx'));
const AppointmentManager = lazyWithRetry(() => import('./pages/admin/AppointmentManager.jsx'));
const CustomizeGiftManager = lazyWithRetry(() => import('./pages/admin/CustomizeGiftManager.jsx'));
const InventoryManager = lazyWithRetry(() => import('./pages/admin/InventoryManager.jsx'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage.jsx'));
const TermsOfServicePage = lazyWithRetry(() => import('./pages/TermsOfServicePage.jsx'));
const ReturnPolicyPage = lazyWithRetry(() => import('./pages/ReturnPolicyPage.jsx'));


// Simple placeholder for non-existent pages
const Placeholder = ({ title }) => (
    <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif mb-4">{title}</h1>
            <p className="text-gray-600">Coming soon</p>
        </div>
    </div>
);

// Animation Variants
const pageVariants = {
    initial: {
        opacity: 0,
        y: 10
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

// Layout wrapper component - ALWAYS includes Footer (except for HomePage)
const Layout = ({ children, includeFooter = true, includePadding = true }) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            className="min-h-screen flex flex-col"
        >
            <Navigation />
            <main className={`flex-grow ${includePadding ? 'pt-24 md:pt-0' : ''}`}>
                {children}
            </main>
            {includeFooter && <Footer />}
        </motion.div>
    );
};

const LenisScroll = () => {
    const location = useLocation();

    useEffect(() => {
        // Disable Lenis on Admin routes to allow native scrolling within the fixed layout
        if (location.pathname.startsWith('/admin')) {
            if (window.lenis) {
                window.lenis.destroy();
                window.lenis = null;
            }
            return;
        }

        const lenis = new Lenis({
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 0.8,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        window.lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            window.lenis = null;
        };
    }, [location.pathname]);

    return null;
};

const AnimatedRoutes = () => {
    const location = useLocation();

    const handleExitComplete = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            }
        }
    };

    return (
        <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
            <Routes location={location} key={location.pathname}>
                {/* HomePage route - Footer is integrated INSIDE HomePage as section 4 */}
                <Route path="/" element={
                    <motion.div
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={pageVariants}
                        className="min-h-screen flex flex-col"
                    >
                        <Navigation />
                        <main className="flex-grow">
                            <HomePage />
                        </main>
                        {/* Footer is now INSIDE HomePage as section 4 */}
                    </motion.div>
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
                <Route path="/fashion-show" element={
                    <Layout includePadding={false}>
                        <FashionShowPage />
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
                        <Route path="/admin/appointments" element={<AppointmentManager />} />
                        <Route path="/admin/customize-gift" element={<CustomizeGiftManager />} />
                        <Route path="/admin/inventory" element={<InventoryManager />} />
                    </Route>
                </Route>

                <Route path="/admin/login" element={
                    <Layout includeFooter={false} includePadding={false}>
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
        </AnimatePresence>
    );
};

function MainApp() {
    return (
        <Router>
            <LenisScroll />
            {/* ScrollToTop removed as it conflicts with exit animations, handled in onExitComplete */}
            <Suspense fallback={<LoadingSpinner />}>
                <AnimatedRoutes />
            </Suspense>
        </Router>
    );
}

export default MainApp;