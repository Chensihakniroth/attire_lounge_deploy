import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import '../css/app.css';
import AdminApp from './components/AdminApp.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

const container = document.getElementById('admin-app');

if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <AdminApp />
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    console.error('Admin root element not found');
}