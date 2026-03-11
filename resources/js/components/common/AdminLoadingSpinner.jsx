// resources/js/components/common/AdminLoadingSpinner.jsx
import React from 'react';

const AdminLoadingSpinner = () => {
    return (
        <div className="flex-1 w-full h-full p-6 md:p-10 animate-pulse bg-gray-50 dark:bg-[#050505] flex flex-col gap-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-end pb-6 border-b border-black/5 dark:border-white/10">
                <div className="space-y-4 w-1/3">
                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl w-3/4"></div>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-1/2"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-24 bg-black/5 dark:bg-white/5 rounded-xl"></div>
                    <div className="h-10 w-32 bg-black/5 dark:bg-white/5 rounded-xl"></div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="w-full flex gap-4">
                <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl w-full"></div>
                <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl w-64"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-4">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-[4/3] bg-black/5 dark:bg-white/5 rounded-3xl"
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default AdminLoadingSpinner;
