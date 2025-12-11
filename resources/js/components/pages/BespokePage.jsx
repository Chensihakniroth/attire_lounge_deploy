import React from 'react';

const BespokePage = () => {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">Bespoke Tailoring</h1>
                <p className="text-lg text-gray-600 mb-8">Custom-made garments crafted to your exact measurements.</p>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6">Book a Consultation</h2>
                    <div className="space-y-6">
                        <button className="bg-attire-charcoal text-white px-8 py-3 rounded-lg hover:bg-attire-dark transition">
                            Schedule Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BespokePage;
