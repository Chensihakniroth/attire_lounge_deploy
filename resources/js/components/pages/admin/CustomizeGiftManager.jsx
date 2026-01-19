import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Package, Edit, AlertTriangle, Loader } from 'lucide-react';

const mockGiftRequests = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        budget: '$500',
        preferences: 'He likes classic watches and leather goods. Interested in a personalized wallet.',
        status: 'Pending'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '098-765-4321',
        budget: '$1000',
        preferences: 'Looking for a complete outfit for a wedding. Prefers blue and grey tones. Size M.',
        status: 'Reviewed'
    },
    {
        id: 3,
        name: 'Peter Jones',
        email: 'peter.jones@example.com',
        phone: '555-123-4567',
        budget: '$250',
        preferences: 'Small gift for a friend. Something elegant and simple.',
        status: 'Pending'
    },
];

const GiftRequestCard = ({ request }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
        <div className="flex justify-between items-center pb-3 mb-3 border-b">
            <div className="flex items-center">
                <User className="w-5 h-5 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
            </div>
            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {request.status}
            </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <a href={`mailto:${request.email}`} className="hover:text-blue-600 truncate text-sm">{request.email}</a>
            </div>
            <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm">{request.phone}</span>
            </div>
            <div className="flex items-center text-gray-600 pt-2 border-t mt-2">
                <Package className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">Budget: {request.budget}</span>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t">
            <p className="font-semibold text-gray-700 text-sm mb-1">Preferences</p>
            <div className="flex items-start text-gray-600 text-sm">
                <Edit className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                <p className="italic">{request.preferences}</p>
            </div>
        </div>
    </div>
);

const CustomizeGiftManager = () => {
    const [giftRequests, setGiftRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulate API call
        const fetchGiftRequests = () => {
            setLoading(true);
            setTimeout(() => {
                setGiftRequests(mockGiftRequests);
                setLoading(false);
            }, 1000); // Simulate 1 second network delay
        };

        fetchGiftRequests();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-purple-500" size={48} />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg">
                    <AlertTriangle size={48} className="mb-4" />
                    <p>{error}</p>
                </div>
            );
        }

        if (giftRequests.length === 0) {
            return <p className="text-center text-gray-500">No gift requests found.</p>;
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {giftRequests.map(request => (
                    <GiftRequestCard key={request.id} request={request} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Customize Gift Requests</h1>
                <p className="mt-1 text-gray-600">Review and manage customized gift inquiries from customers.</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default CustomizeGiftManager;
