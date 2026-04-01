// resources/js/components/AdminApp.tsx
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import AdminLoadingSpinner from './common/AdminLoadingSpinner.jsx';
import { AdminProvider } from './pages/admin/AdminContext';
import { ThemeProvider } from './pages/admin/ThemeContext';

const RealtimeAdminUpdater: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            console.log('%c📡 [AdminApp] Real-time ready', 'color: #d4af37; font-weight: bold;');
            
            const handleUpdate = (type: string) => {
                console.log(`%c[RT] ${type}`, 'color: #00cc88;');
                queryClient.invalidateQueries();
            };

            const channels = [
                {
                    name: 'admin-notifications',
                    events: [
                        '.appointment.created',
                        '.appointment.status-updated',
                        '.gift-request.created',
                        '.collection.updated',
                        '.product.updated',
                        '.stock.updated'
                    ]
                }
            ];

            channels.forEach(ch => {
                const echoChannel = window.Echo.channel(ch.name);
                ch.events.forEach(event => {
                    const eventName = event.startsWith('.') ? event.substring(1) : event;
                    echoChannel.listen(event, () => handleUpdate(`${ch.name}:${eventName}`));
                });
            });

            return () => {
                window.Echo.leave('admin-notifications');
            };
        }
    }, []);

    return null;
};

const lazyWithRetry = (componentImport: () => Promise<any>) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.localStorage.getItem('admin-page-has-been-force-refreshed') || 'false'
        );
        try {
            const component = await componentImport();
            window.localStorage.setItem('admin-page-has-been-force-refreshed', 'false');
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                window.localStorage.setItem('admin-page-has-been-force-refreshed', 'true');
                return window.location.reload();
            }
            throw error;
        }
    });

const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminLogin = lazyWithRetry(() => import('./pages/admin/AdminLogin.jsx'));
const PrivateRoute = lazyWithRetry(() => import('./pages/admin/PrivateRoute.jsx'));
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
const InventoryManager = lazyWithRetry(() => import('./pages/admin/InventoryManager.jsx'));
const SEOManager = lazyWithRetry(() => import('./pages/admin/SEOManager.jsx'));
const AlteringManager = lazyWithRetry(() => import('./pages/admin/AlteringManager.jsx'));
const PromocodeManager = lazyWithRetry(() => import('./pages/admin/PromocodeManager.jsx'));

const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `}} />
);

function AdminApp() {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <RealtimeAdminUpdater />
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ThemeProvider>
                        <AdminProvider>
                            <GlobalStyles />
                            <Suspense fallback={<AdminLoadingSpinner />}>
                                <Routes>
                                    <Route path="/admin/login" element={<AdminLogin />} />
                                    
                                    <Route element={<PrivateRoute />}>
                                        <Route element={<AdminLayout />}>
                                            <Route path="/admin" element={<AdminDashboard />} />
                                            <Route path="/admin/appointments" element={<AppointmentManager />} />
                                            <Route path="/admin/alterings" element={<AlteringManager />} />
                                            <Route path="/admin/promocodes" element={<PromocodeManager />} />
                                            <Route path="/admin/products" element={<ProductManager />} />
                                            <Route path="/admin/collections" element={<CollectionManager />} />
                                            <Route path="/admin/products/bulk" element={<BulkProductEditor />} />
                                            <Route path="/admin/products/new" element={<ProductEditor isNew={true} />} />
                                            <Route path="/admin/products/:productId/edit" element={<ProductEditor />} />
                                            <Route path="/admin/customize-gift" element={<CustomizeGiftManager />} />
                                            <Route path="/admin/inventory" element={<InventoryManager />} />
                                            <Route path="/admin/seo" element={<SEOManager />} />
                                            <Route path="/admin/newsletter" element={<NewsletterManager />} />
                                            <Route path="/admin/audit-logs" element={<AuditLog />} />
                                            <Route path="/admin/users" element={<UserManager />} />
                                            <Route path="/admin/profile" element={<ProfileEditor />} />
                                            <Route path="/admin/customer-profiles" element={<CustomerProfileManager />} />
                                            <Route path="/admin/customer-profiles/:id" element={<CustomerProfileDetail />} />
                                        </Route>
                                    </Route>
                                    
                                    {/* Fallback for admin routes */}
                                    <Route path="*" element={<div className="p-8 text-foreground bg-background">Admin Page Not Found</div>} />
                                </Routes>
                            </Suspense>
                        </AdminProvider>
                    </ThemeProvider>
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default AdminApp;