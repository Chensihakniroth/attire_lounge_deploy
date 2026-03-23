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

const RealtimeAdminUpdater: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            console.group('📡 Attire Lounge Real-time Intelligence');
            console.log('%cAdminApp: Initializing Systems... (｡♥‿♥｡)', 'color: #d4af37; font-weight: bold;');
            
            const handleUpdate = (type: string) => {
                console.log(`%c[Real-time] 🚀 Update received: ${type}`, 'color: #00ff00; font-weight: bold;');
                console.log('AdminApp: Invalidating cache to fetch fresh data...');
                queryClient.invalidateQueries();
            };

            const channels = [
                {
                    name: 'admin-notifications',
                    events: [
                        '.appointment.created',
                        '.gift-request.created',
                        '.collection.updated',
                        '.product.updated',
                        '.stock.updated'
                    ]
                },
                {
                    name: 'appointments',
                    events: ['.status.updated']
                }
            ];

            channels.forEach(ch => {
                const echoChannel = window.Echo.channel(ch.name);
                console.log(`%cJoined Channel: ${ch.name}`, 'color: #3498db; font-style: italic;');
                
                ch.events.forEach(event => {
                    const eventName = event.startsWith('.') ? event.substring(1) : event;
                    echoChannel.listen(event, () => handleUpdate(`${ch.name}:${eventName}`));
                    console.log(`  └─ Listening for: ${event}`);
                });
            });

            console.log('%cReal-time Ready! Monitoring for masterpiece updates... (•̀ᴗ•́)و', 'color: #d4af37;');
            console.groupEnd();
            
            return () => {
                console.log('AdminApp: Cleaning up real-time listeners...');
                window.Echo.leaveChannel('admin-notifications');
                window.Echo.leaveChannel('appointments');
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
                <Router>
                    <AdminProvider>
                        <GlobalStyles />
                        <Suspense fallback={<AdminLoadingSpinner />}>
                            <Routes>
                                <Route path="/admin/login" element={<AdminLogin />} />
                                
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
                                <Route path="*" element={<div className="p-8">Admin Page Not Found</div>} />
                            </Routes>
                        </Suspense>
                    </AdminProvider>
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default AdminApp;