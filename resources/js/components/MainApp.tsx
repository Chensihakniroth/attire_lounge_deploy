// resources/jsx/components/MainApp.tsx
import React, { Suspense, lazy, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, LazyMotion, domAnimation, m, motion, Variants } from 'framer-motion';
import Lenis from 'lenis';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Initialize QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30 * 60 * 1000,  // Data is fresh for 30 minutes
            gcTime: 60 * 60 * 1000,     // Keep unused data for 1 hour
        },
    },
});

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import Footer from './layouts/Footer.jsx';
import PageTransition from './common/PageTransition.jsx';

// Declare global for Lenis
declare global {
    interface Window {
        lenis: Lenis | null;
        Echo: any;
    }
}

const RealtimeUpdater: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            const channel = window.Echo.channel('admin-notifications');
            
            const handleUpdate = () => {
                console.log('MainApp: Real-time update received! Invalidating queries...');
                queryClient.invalidateQueries();
            };

            channel.listen('.collection.updated', handleUpdate);
            channel.listen('.product.updated', handleUpdate);
            
            return () => {
                window.Echo.leaveChannel('admin-notifications');
            };
        }
    }, []);

    return null;
};

const AppSuspense = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AnimatedRoutes />
        </Suspense>
    );
};
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
import { isSafari } from '../helpers/browserUtils.js';

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


// NOTE: motion.* is replaced with m.* throughout this file to work with LazyMotion

interface LayoutProps {
    children: ReactNode;
    includeHeader?: boolean;
    includeFooter?: boolean;
    includePadding?: boolean;
}

// Layout wrapper component - ALWAYS includes Footer (except for HomePage)
const Layout: React.FC<LayoutProps> = ({ children, includeHeader = true, includeFooter = true, includePadding = true }) => {
    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col">
                {includeHeader && <Navigation />}
                <main className={`flex-grow ${includePadding ? 'pt-24 md:pt-0' : ''}`}>
                    {children}
                </main>
                {includeFooter && <Footer />}
            </div>
        </PageTransition>
    );
};

const LenisScroll: React.FC = () => {
    useEffect(() => {
        // Global Safari detection for CSS targeting
        if (typeof document !== 'undefined') {
            document.body.setAttribute('data-safari', isSafari().toString());
        }

        // Initialize Lenis if it doesn't exist
        if (!window.lenis) {
            const isSafariBrowser = isSafari();

            // Lighter configuration for Safari to prevent choppiness
            const lenis = new Lenis({
                duration: isSafariBrowser ? 1.0 : 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: isSafariBrowser ? 0.8 : 1.0, // Reduced for Safari
                touchMultiplier: 1.5,
                infinite: false,
            });

            window.lenis = lenis;

            // Optimized RAF loop
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
    }, []);

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
                    <PageTransition>
                        <div className="min-h-screen flex flex-col">
                            <Navigation />
                            <main className="flex-grow">
                                <HomePage />
                            </main>
                            {/* Footer is now INSIDE HomePage as section 4 */}
                        </div>
                    </PageTransition>
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

const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `}} />
);

function MainApp() {
    // Invalidate React Query cache on pull-to-refresh instead of hard reload
    usePullToRefresh(() => {
        queryClient.invalidateQueries();
        window.scrollTo(0, 0);
    });

    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <RealtimeUpdater />
                <LazyMotion features={domAnimation}>
                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <GlobalStyles />
                        <LenisScroll />
                        {/* ScrollToTop removed as it conflicts with exit animations, handled in onExitComplete */}
                        <AppSuspense />
                    </Router>
                </LazyMotion>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default MainApp;
