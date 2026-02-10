import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import '../css/app.css';
import MainApp from './components/MainApp.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';

const container = document.getElementById('app');

if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <FavoritesProvider>
                    <MainApp />
                </FavoritesProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}