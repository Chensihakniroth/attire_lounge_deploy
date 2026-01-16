import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Gift, Package, Pencil } from 'lucide-react';

const CustomizeGiftPage = () => {
    const [step, setStep] = useState(1);
    const [accessories, setAccessories] = useState([]);
    const [box, setBox] = useState('');
    const [note, setNote] = useState('');

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-serif text-white mb-6">Step 1: Choose Accessories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Placeholder for accessories selection */}
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-attire-dark/50 p-4 rounded-lg border border-white/10 text-attire-cream">
                                    <h3 className="font-semibold">Accessory {i}</h3>
                                    <p className="text-sm">Description of accessory {i}</p>
                                    <button
                                        onClick={() => setAccessories([...accessories, `Accessory ${i}`])}
                                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                                    >
                                        Add to Gift
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="mt-10 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Next: Choose Box
                        </button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-serif text-white mb-6">Step 2: Choose Box</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Placeholder for box selection */}
                            {['Classic', 'Premium', 'Luxury'].map((b) => (
                                <div
                                    key={b}
                                    onClick={() => setBox(b)}
                                    className={`bg-attire-dark/50 p-6 rounded-lg border transition-all cursor-pointer
                                        ${box === b ? 'border-attire-accent ring-2 ring-attire-accent' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <h3 className="font-semibold text-attire-cream">{b} Box</h3>
                                    <p className="text-sm text-attire-silver">A beautifully crafted box for your gift.</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-10">
                            <button
                                onClick={() => setStep(1)}
                                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Next: Write Note
                            </button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-serif text-white mb-6">Step 3: Write Your Note</h2>
                        <textarea
                            className="w-full min-h-[150px] p-4 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                            placeholder="Type your personal message for the card here..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <div className="flex justify-between mt-10">
                            <button
                                onClick={() => setStep(2)}
                                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => alert('Gift customized!')} // Placeholder for actual submission
                                className="px-8 py-3 bg-attire-accent text-white rounded-lg font-semibold hover:bg-attire-accent/90 transition-colors"
                            >
                                Finalize Gift
                            </button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy py-24 sm:py-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Customize Gift for Men
                    </h1>
                    <p className="text-lg text-attire-silver max-w-2xl mx-auto">
                        Create a unique and thoughtful gift with our customization options.
                    </p>
                    <Link to="/" className="flex items-center justify-center gap-2 text-sm text-attire-silver hover:text-white transition-colors mt-4">
                        <ChevronLeft size={16} />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-8 md:p-12">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default CustomizeGiftPage;
