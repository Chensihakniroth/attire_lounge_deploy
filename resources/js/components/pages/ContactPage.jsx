import React from 'react';

const ContactPage = () => {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">Contact Us</h1>
                <p className="text-lg text-gray-600 mb-12">Get in touch for personalized service.</p>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
                    <div className="space-y-4">
                        <button className="bg-attire-charcoal text-white px-8 py-3 rounded-lg hover:bg-attire-dark transition">
                            Contact Form Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
