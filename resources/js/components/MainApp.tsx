// resources/jsx/components/MainApp.tsx
import React, { Suspense, lazy, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import Lenis from 'lenis';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Initialize QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Prevent refetching when window gains focus
            retry: 1, // Retry failed requests once
            staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        },
    },
});

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import Footer from './layouts/Footer.jsx';

// Declare global for Lenis
declare global {
    interface Window {
        lenis: Lenis | null;
    }
}

// Pages that you have created
const lazyWithRetry = (componentImport: () => Promise<any>) =>
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
                window.localStorage.setItem('page-has-been-force-refreshed', 'true');
                return window.location.reload();
            }
            throw error;
        }
    });

const HomePage = lazyWithRetry(() => import('./pages/HomePage.tsx'));
const CollectionsPage = lazyWithRetry(() => import('./pages/CollectionsPage.jsx'));
const ProductListPage = lazyWithRetry(() => import('./pages/ProductListPage.tsx'));
const ProductDetailPage = lazyWithRetry(() => import('./pages/ProductDetailPage.tsx'));
const LookbookPage = lazyWithRetry(() => import('./pages/LookbookPage.jsx'));
const FashionShowPage = lazyWithRetry(() => import('./pages/FashionShowPage.jsx'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage.jsx'));
const CustomizeGiftPage = lazyWithRetry(() => import('./pages/CustomizeGiftPage.jsx'));
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage.jsx'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminLogin = lazyWithRetry(() => import('./pages/admin/AdminLogin.jsx'));
const PrivateRoute = lazyWithRetry(() => import('./pages/admin/PrivateRoute.jsx'));
import { AdminProvider } from './pages/admin/AdminContext'; // Import AdminProvider

const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout.jsx'));
const AuditLog = lazyWithRetry(() => import('./pages/admin/AuditLog.jsx'));
const NewsletterManager = lazyWithRetry(() => import('./pages/admin/NewsletterManager.jsx'));
const UserManager = lazyWithRetry(() => import('./pages/admin/UserManager.jsx'));
const AppointmentManager = lazyWithRetry(() => import('./pages/admin/AppointmentManager.jsx'));
const CustomizeGiftManager = lazyWithRetry(() => import('./pages/admin/CustomizeGiftManager.jsx'));
const ProductManager = lazyWithRetry(() => import('./pages/admin/ProductManager.jsx'));
const ProductEditor = lazyWithRetry(() => import('./pages/admin/ProductEditor.jsx'));
import InventoryManager from './pages/admin/InventoryManager.jsx';
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage.jsx'));
const TermsOfServicePage = lazyWithRetry(() => import('./pages/TermsOfServicePage.jsx'));
const ReturnPolicyPage = lazyWithRetry(() => import('./pages/ReturnPolicyPage.jsx'));


// Simple placeholder for non-existent pages
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif mb-4">{title}</h1>
            <p className="text-gray-600">Coming soon</p>
        </div>
    </div>
);

// Animation Variants
const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

interface LayoutProps {
    children: ReactNode;
    includeHeader?: boolean;
    includeFooter?: boolean;
    includePadding?: boolean;
}

// Layout wrapper component - ALWAYS includes Footer (except for HomePage)
const Layout: React.FC<LayoutProps> = ({ children, includeHeader = true, includeFooter = true, includePadding = true }) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            className="min-h-screen flex flex-col"
        >
            {includeHeader && <Navigation />}
            <main className={`flex-grow ${includePadding ? 'pt-24 md:pt-0' : ''}`}>
                {children}
            </main>
            {includeFooter && <Footer />}
        </motion.div>
    );
};

const LenisScroll: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Disable Lenis on Admin routes
        if (location.pathname.startsWith('/admin')) {
            if (window.lenis) {
                window.lenis.destroy();
                window.lenis = null;
            }
            return;
        }

        // Initialize Lenis if it doesn't exist
        if (!window.lenis) {
            const lenis = new Lenis({
                lerp: 0.1, // More organic smoothing than fixed duration
                wheelMultiplier: 1.1, // Increased for better responsiveness
                touchMultiplier: 1.5,
                smoothWheel: true,
                smoothTouch: false,
            });

            window.lenis = lenis;

            let rafId: number;
            function raf(time: number) {
                lenis.raf(time);
                rafId = requestAnimationFrame(raf);
            }

            rafId = requestAnimationFrame(raf);

            return () => {
                cancelAnimationFrame(rafId);
                lenis.destroy();
                window.lenis = null;
            };
        }
    }, [location.pathname]); // Re-run when location changes

    return null;
};

const AnimatedRoutes: React.FC = () => {
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
                <Route path="/product/:productId" element={
                    <Layout includeHeader={false} includeFooter={false} includePadding={false}>
                        <ProductDetailPage />
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
                        <Route path="/admin/products" element={<ProductManager />} />
                        <Route path="/admin/products/new" element={<ProductEditor isNew={true} />} />
                        <Route path="/admin/products/:productId/edit" element={<ProductEditor />} />
                        <Route path="/admin/customize-gift" element={<CustomizeGiftManager />} />
                        <Route path="/admin/inventory" element={<InventoryManager />} />
                        <Route path="/admin/audit-logs" element={<AuditLog />} />
                        <Route path="/admin/newsletter" element={<NewsletterManager />} />
                        <Route path="/admin/users" element={<UserManager />} />
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
    usePullToRefresh(() => {
        window.location.reload();
    });
    
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AdminProvider> {/* <-- AdminProvider goes here */}
                        <LenisScroll />
                        {/* ScrollToTop removed as it conflicts with exit animations, handled in onExitComplete */}
                        <Suspense fallback={<LoadingSpinner />}>
                            <AnimatedRoutes />
                        </Suspense>
                    </AdminProvider>
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default MainApp;