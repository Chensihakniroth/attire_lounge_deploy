import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">We're working to fix this issue.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-attire-charcoal text-white px-6 py-2 rounded-full hover:bg-attire-dark transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
