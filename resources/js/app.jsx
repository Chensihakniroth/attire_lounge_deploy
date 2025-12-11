import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import '../css/app.css';

// Import the main App component - FROM CORRECT LOCATION
import App from './components/MainApp.jsx';

// IMPORTANT: Use '#app' to match your app.blade.php
const container = document.getElementById('app');

if (container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found. Make sure you have <div id="app"></div> in app.blade.php');
}
