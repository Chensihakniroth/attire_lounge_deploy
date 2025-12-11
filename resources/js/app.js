// resources/js/app.js - SINGLE ENTRY FILE
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Import CSS
import '../css/app.css';

// Inline App component (or import it if you have App.jsx)
function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Your JSX here - copy from App.jsx */}
            <nav className="bg-white shadow-sm">
                {/* ... navigation code ... */}
            </nav>
            {/* ... rest of your App.jsx code ... */}
        </div>
    );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
