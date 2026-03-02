// resources/js/components/common/AdminLoadingSpinner.jsx
import React from 'react';

const AdminLoadingSpinner = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-dashed border-white rounded-full animate-spin border-attire-accent"></div>
            <p className="mt-4 text-lg font-semibold text-white">Loading Admin Panel...</p>
        </div>
    );
};

export default AdminLoadingSpinner;
