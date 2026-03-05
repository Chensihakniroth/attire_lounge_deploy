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
            refetchOnWindowFocus: false, 
            retry: 1, 
            staleTime: 5 * 60 * 1000, 
        },
    },
});

// Components
import Navigation from './layouts/Navigation.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import AdminLoadingSpinner from './common/AdminLoadingSpinner.jsx'; 
import Footer from './layouts/Footer.jsx';

// Declare global for Lenis
declare global {
    interface Window {
        lenis: Lenis | null;
    }
}
const AppSuspense = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <Suspense fallback={isAdminRoute ? <AdminLoadingSpinner /> : <LoadingSpinner />}>
            <AnimatedRoutes />
        </Suspense>
    );
};

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
import { AdminProvider } from './pages/admin/AdminContext'; 


const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout.jsx'));
const AuditLog = lazyWithRetry(() => import('./pages/admin/AuditLog.jsx'));
const NewsletterManager = lazyWithRetry(() => import('./pages/admin/NewsletterManager.jsx'));
const UserManager = lazyWithRetry(() => import('./pages/admin/UserManager.jsx'));
const ProfileEditor = lazyWithRetry(() => import('./pages/admin/ProfileEditor.jsx'));
const CustomerProfileManager = lazyWithRetry(() => import('./pages/admin/CustomerProfileManager.jsx'));
const CustomerProfileDetail = lazyWithRetry(() => import('./pages/admin/CustomerProfileDetail.jsx'));
const AppointmentManager = lazyWithRetry(() => import('./pages/admin/AppointmentManager.jsx'));
const CustomizeGiftManager = lazyWithRetry(() => import('./pages/admin/CustomizeGiftManager.jsx'));
const ProductManager = lazyWithRetry(() => import('./pages/admin/ProductManager.jsx'));
const CollectionManager = lazyWithRetry(() => import('./pages/admin/CollectionManager.jsx'));
const ProductEditor = lazyWithRetry(() => import('./pages/admin/ProductEditor.jsx'));
const BulkProductEditor = lazyWithRetry(() => import('./pages/admin/BulkProductEditor.jsx'));
import InventoryManager from './pages/admin/InventoryManager.jsx';
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage.jsx'));
const TermsOfServicePage = lazyWithRetry(() => import('./pages/TermsOfServicePage.jsx'));
const ReturnPolicyPage = lazyWithRetry(() => import('./pages/ReturnPolicyPage.jsx'));


const Placeholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif mb-4">{title}</h1>
            <p className="text-gray-600">Coming soon</p>
        </div>
    </div>
);

const pageVariants: Variants = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

interface LayoutProps {
    children: ReactNode;
    includeHeader?: boolean;
    includeFooter?: boolean;
    includePadding?: boolean;
}

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
        if (location.pathname.startsWith('/admin')) {
            if (window.lenis) {
                window.lenis.destroy();
                window.lenis = null;
            }
            return;
        }

        if (!window.lenis) {
            const lenis = new Lenis({
                lerp: 0.08, // Optimized for Mac Inertial Scroll ✨
                wheelMultiplier: 1.0, // Prevent overshooting on Magic Mouse
                touchMultiplier: 1.2,
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
    }, [location.pathname]);

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
                    </motion.div>
                } />

                <Route path="/collections" element={<Layout><CollectionsPage /></Layout>} />
                <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
                <Route path="/products/:collectionSlug" element={<Layout><ProductListPage /></Layout>} />
                <Route path="/product/:productId" element={<Layout includeHeader={false} includeFooter={false} includePadding={false}><ProductDetailPage /></Layout>} />
                <Route path="/lookbook" element={<Layout><LookbookPage /></Layout>} />
                <Route path="/fashion-show" element={<Layout includePadding={false}><FashionShowPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                <Route path="/customize-gift" element={<Layout><CustomizeGiftPage /></Layout>} />
                <Route path="/favorites" element={<Layout><FavoritesPage /></Layout>} />

                <Route element={<PrivateRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/appointments" element={<AppointmentManager />} />
                        <Route path="/admin/products" element={<ProductManager />} />
                        <Route path="/admin/collections" element={<CollectionManager />} />
                        <Route path="/admin/products/bulk" element={<BulkProductEditor />} />
                        <Route path="/admin/products/new" element={<ProductEditor isNew={true} />} />
                        <Route path="/admin/products/:productId/edit" element={<ProductEditor />} />
                        <Route path="/admin/customize-gift" element={<CustomizeGiftManager />} />
                        <Route path="/admin/inventory" element={<InventoryManager />} />
                        <Route path="/admin/audit-logs" element={<AuditLog />} />
                        <Route path="/admin/users" element={<UserManager />} />
                        <Route path="/admin/profile" element={<ProfileEditor />} />
                        <Route path="/admin/customer-profiles" element={<CustomerProfileManager />} />
                        <Route path="/admin/customer-profiles/:id" element={<CustomerProfileDetail />} />
                    </Route>
                </Route>

                <Route path="/admin/login" element={<Layout includeFooter={false} includePadding={false}><AdminLogin /></Layout>} />

                <Route path="/styling" element={<Layout><Placeholder title="Styling" /></Layout>} />
                <Route path="/journal" element={<Layout><Placeholder title="Journal" /></Layout>} />
                <Route path="/about" element={<Layout><Placeholder title="About" /></Layout>} />
                <Route path="/shipping" element={<Layout><Placeholder title="Shipping" /></Layout>} />
                <Route path="/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />
                <Route path="/terms" element={<Layout><TermsOfServicePage /></Layout>} />
                <Route path="/returns" element={<Layout><ReturnPolicyPage /></Layout>} />
                <Route path="/appointment" element={<Layout><Placeholder title="Appointment" /></Layout>} />
                <Route path="/membership" element={<Layout><Placeholder title="Membership" /></Layout>} />
                <Route path="/faq" element={<Layout><Placeholder title="FAQ" /></Layout>} />

                <Route path="*" element={<Layout><Placeholder title="Page Not Found" /></Layout>} />
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
    usePullToRefresh(() => {
        window.location.reload();
    });

    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AdminProvider>
                        <GlobalStyles />
                        <LenisScroll />
                        <AppSuspense />
                    </AdminProvider>
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default MainApp;
