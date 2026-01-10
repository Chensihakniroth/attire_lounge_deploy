import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import '../css/app.css';
import MainApp from './components/MainApp.jsx';

const container = document.getElementById('app');

if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <MainApp />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}