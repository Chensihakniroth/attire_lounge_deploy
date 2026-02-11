import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShoppingCart, Check, User, Mail, Phone, ArrowRight, Loader, AlertTriangle, Gift, ChevronLeft } from 'lucide-react';
import api from '../../api';
import minioBaseUrl from '../../config';
import Skeleton from '../common/Skeleton.jsx';

const giftOptions = {
    ties: [
      { id: 'tie-brown69', name: 'Silk Tie', color: 'Brown', image: `${minioBaseUrl}/uploads/collections/accessories/brown69.webp` },
      { id: 'tie-cream49', name: 'Silk Tie', color: 'Cream', image: `${minioBaseUrl}/uploads/collections/accessories/cream49.webp` },
      { id: 'tie-cyan69', name: 'Silk Tie', color: 'Cyan', image: `${minioBaseUrl}/uploads/collections/accessories/cyan69.webp` },
      { id: 'tie-blue69', name: 'Silk Tie', color: 'Blue', image: `${minioBaseUrl}/uploads/collections/accessories/blue69.webp` },
      { id: 'tie-green49', name: 'Silk Tie', color: 'Green', image: `${minioBaseUrl}/uploads/collections/accessories/green49.webp` },
      { id: 'tie-white69', name: 'Silk Tie', color: 'White', image: `${minioBaseUrl}/uploads/collections/accessories/white69.webp` },
      { id: 'tie-red69', name: 'Silk Tie', color: 'Red', image: `${minioBaseUrl}/uploads/collections/accessories/red69.webp` },
    ],
    pocketSquares: [
      { id: 'ps-blue', name: 'Linen Pocket Square', color: 'Blue', image: `${minioBaseUrl}/uploads/collections/accessories/psblue.webp` },
      { id: 'ps-green', name: 'Linen Pocket Square', color: 'Green', image: `${minioBaseUrl}/uploads/collections/accessories/psgreen.webp` },
      { id: 'ps-pink', name: 'Linen Pocket Square', color: 'Pink', image: `${minioBaseUrl}/uploads/collections/accessories/pspink.webp` },
      { id: 'ps-red', name: 'Linen Pocket Square', color: 'Red', image: `${minioBaseUrl}/uploads/collections/accessories/psred.webp` },
      { id: 'ps-yellowgreen', name: 'Linen Pocket Square', color: 'Yellow Green', image: `${minioBaseUrl}/uploads/collections/accessories/psyellowgreen.webp` },
      { id: 'ps-yellow', name: 'Linen Pocket Square', color: 'Yellow', image: `${minioBaseUrl}/uploads/collections/accessories/psyellow.webp` },
    ],
    boxes: [
      { id: 'box-small', name: 'Small Box', image: `${minioBaseUrl}/uploads/collections/accessories/smallbox.webp` },
      { id: 'box-mid', name: 'Mid Box', image: `${minioBaseUrl}/uploads/collections/accessories/midbox.webp` },
      { id: 'box-designer', name: 'Designer Box', image: `${minioBaseUrl}/uploads/collections/accessories/designer_box.jpg` },
    ],
  };

const SelectionCard = ({ item, isSelected, onSelect }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    return (
        <motion.div
            onClick={onSelect}
            className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                    ? 'border-attire-accent shadow-[0_0_20px_rgba(212,168,76,0.25)]'
                    : 'border-white/5 hover:border-white/20'
            }`}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="aspect-[4/5] w-full relative">
                {!isLoaded && (
                    <div className="absolute inset-0 z-10">
                        <Skeleton className="w-full h-full rounded-none" />
                    </div>
                )}

                <motion.img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    } ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                    onLoad={() => setIsLoaded(true)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
            </div>

            <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                <h4 className="font-serif text-white text-lg leading-tight mb-1">{item.name}</h4>
                {item.color && <p className="text-xs text-attire-silver uppercase tracking-wider">{item.color}</p>}
            </div>

            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-3 right-3 bg-attire-accent text-black rounded-full p-1.5 shadow-lg z-20"
                    >
                        <Check size={16} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const InputField = ({ icon, label, ...props }) => (
    <div>
        {label && <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">{label}</label>}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-attire-silver group-focus-within:text-attire-accent transition-colors">
                {icon}
            </div>
            <input
                {...props}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-black/40 text-white placeholder-white/20 transition-all border-white/10 focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 focus:outline-none"
            />
        </div>
    </div>
);

const CustomizeGiftPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [selectedTie, setSelectedTie] = useState(null);
    const [selectedPocketSquare, setSelectedPocketSquare] = useState(null);
    const [selectedBox, setSelectedBox] = useState(null);
    const [note, setNote] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState({ state: 'idle' });
    const [formErrors, setFormErrors] = useState({});
    const [availableBoxes, setAvailableBoxes] = useState([]);

    useEffect(() => {
        let newAvailableBoxes = [];
        if (selectedTie && selectedPocketSquare) {
            newAvailableBoxes = giftOptions.boxes;
        } else if (selectedTie && !selectedPocketSquare) {
            newAvailableBoxes = giftOptions.boxes.filter(box => box.id !== 'box-designer');
        } else {
            newAvailableBoxes = [];
        }
        setAvailableBoxes(newAvailableBoxes);

        if (selectedBox && !newAvailableBoxes.some(box => box.id === selectedBox.id)) {
            setSelectedBox(null);
        }
    }, [selectedTie, selectedPocketSquare]);

    useEffect(() => {
        if (submissionStatus.state === 'success') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submissionStatus.state]);

    const isItemsComplete = selectedTie && selectedPocketSquare && selectedBox;

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required.';
        if (!formData.email.trim()) errors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid.';
        if (!formData.phone.trim()) errors.phone = 'Phone is required.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinalize = async () => {
        if (!isItemsComplete) return;

        const preferences = `
Tie: ${selectedTie.name} (${selectedTie.color})
Pocket Square: ${selectedPocketSquare.name} (${selectedPocketSquare.color})
Box: ${selectedBox.name}
${note ? `Note: "${note}"` : ''}
        `.trim();

        const selectedItems = [
            { type: 'Tie', ...selectedTie },
            { type: 'Pocket Square', ...selectedPocketSquare },
            { type: 'Box', ...selectedBox }
        ];

        const dataToSend = { ...formData, preferences, selected_items: selectedItems };

        setSubmissionStatus({ state: 'loading' });
        try {
            await api.submitGiftRequest(dataToSend);
            setSubmissionStatus({ state: 'success' });
        } catch (error) {
            setSubmissionStatus({ state: 'error', message: 'Something went wrong. Please try again.' });
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({ name: '', email: '', phone: '' });
        setSelectedTie(null);
        setSelectedPocketSquare(null);
        setSelectedBox(null);
        setNote('');
        setSubmissionStatus({ state: 'idle' });
        setFormErrors({});
    }

    if (submissionStatus.state === 'success') {
        return (
            <div className="min-h-screen bg-attire-navy relative overflow-hidden flex items-center justify-center">
                {/* Background Decorations */}
                <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-md w-full mx-auto px-4">
                    <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-10 text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <Check size={40} className="text-green-400" />
                        </div>
                        <h1 className="text-4xl font-serif text-white mb-4">Request Sent!</h1>
                        <p className="text-attire-silver mb-8 leading-relaxed">
                            Thank you, {formData.name}. We have received your custom gift request and will contact you shortly to finalize the details.
                        </p>
                        <button onClick={resetForm} className="w-full py-4 rounded-full font-semibold transition-all duration-300 bg-attire-accent text-black hover:bg-white">
                            Create Another Gift
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-x-clip">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">Curate</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                            The perfect gift for gentlemen
                        </h1>
                        <p className="text-lg text-attire-silver max-w-2xl mx-auto font-light leading-relaxed">
                            Craft a bespoke gift box with our finest accessories. <br/>A gesture of timeless elegance.
                        </p>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-xl mx-auto"
                        >
                            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-serif text-white">Your Details</h2>
                                    <span className="text-attire-silver/50 text-sm font-mono">01 / 02</span>
                                </div>

                                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                                    <div>
                                        <InputField
                                            label="Full Name"
                                            icon={<User size={18} />}
                                            type="text"
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {formErrors.name && <p className="text-red-400 text-xs mt-2 ml-1">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <InputField
                                            label="Email Address"
                                            icon={<Mail size={18} />}
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        {formErrors.email && <p className="text-red-400 text-xs mt-2 ml-1">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <InputField
                                            label="Phone Number"
                                            icon={<Phone size={18} />}
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        {formErrors.phone && <p className="text-red-400 text-xs mt-2 ml-1">{formErrors.phone}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full mt-6 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-white text-black hover:bg-attire-accent hover:text-black group"
                                    >
                                        Start Customizing
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            <div className="lg:col-span-8 space-y-16">
                                {/* Ties Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-px flex-grow bg-white/10"></div>
                                        <h3 className="text-xl font-serif text-white uppercase tracking-widest">Select a Tie</h3>
                                        <div className="h-px flex-grow bg-white/10"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {giftOptions.ties.map(tie => (
                                            <SelectionCard
                                                key={tie.id}
                                                item={tie}
                                                isSelected={selectedTie?.id === tie.id}
                                                onSelect={() => setSelectedTie(prev => prev?.id === tie.id ? null : tie)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Pocket Squares Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-px flex-grow bg-white/10"></div>
                                        <h3 className="text-xl font-serif text-white uppercase tracking-widest">Select a Pocket Square</h3>
                                        <div className="h-px flex-grow bg-white/10"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {giftOptions.pocketSquares.map(ps => (
                                            <SelectionCard
                                                key={ps.id}
                                                item={ps}
                                                isSelected={selectedPocketSquare?.id === ps.id}
                                                onSelect={() => setSelectedPocketSquare(prev => prev?.id === ps.id ? null : ps)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Boxes Section */}
                                <AnimatePresence>
                                    {availableBoxes.length > 0 && (
                                        <motion.section
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <div className="flex items-center gap-4 mb-8 mt-12">
                                                <div className="h-px flex-grow bg-white/10"></div>
                                                <h3 className="text-xl font-serif text-white uppercase tracking-widest">Select a Box</h3>
                                                <div className="h-px flex-grow bg-white/10"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                {availableBoxes.map(box => (
                                                    <SelectionCard
                                                        key={box.id}
                                                        item={box}
                                                        isSelected={selectedBox?.id === box.id}
                                                        onSelect={() => setSelectedBox(prev => prev?.id === box.id ? null : box)}
                                                    />
                                                ))}
                                            </div>
                                        </motion.section>
                                    )}
                                </AnimatePresence>

                                {/* Note Section */}
                                <section className="pt-8">
                                    <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-4 ml-1">Personal Note (Optional)</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add a special message for the recipient..."
                                        className="w-full p-5 rounded-2xl border bg-black/20 text-white placeholder-white/20 focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 transition-all border-white/10 resize-none"
                                        rows="4"
                                    ></textarea>
                                </section>
                            </div>

                            {/* Sticky Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-28 space-y-6">
                                    <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-serif text-white">Summary</h3>
                                            <button onClick={() => setStep(1)} className="text-xs text-attire-silver hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white transition-all">
                                                Edit Details
                                            </button>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-start pb-4 border-b border-white/5">
                                                <span className="text-sm text-attire-silver">For</span>
                                                <span className="text-sm text-white font-medium text-right">{formData.name}</span>
                                            </div>

                                            <SummaryItem label="Tie" item={selectedTie} />
                                            <SummaryItem label="Pocket Square" item={selectedPocketSquare} />
                                            <SummaryItem label="Gift Box" item={selectedBox} />
                                        </div>

                                        {submissionStatus.state === 'error' && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-3">
                                                <AlertTriangle size={16} className="text-red-400" />
                                                <p className="text-xs text-red-300">{submissionStatus.message}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleFinalize}
                                            disabled={!isItemsComplete || submissionStatus.state === 'loading'}
                                            className="w-full py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-black disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed hover:bg-white"
                                        >
                                            {submissionStatus.state === 'loading' ? <Loader className="animate-spin" size={20} /> : <><Gift size={20} /> Request Gift Box</>}
                                        </button>

                                        {!isItemsComplete && (
                                            <p className="text-center text-xs text-attire-silver/50 mt-4">
                                                Please select all items to proceed.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SummaryItem = ({ label, item }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-attire-silver">{label}</span>
        {item ? (
            <div className="text-right">
                <p className="text-sm text-white font-medium">{item.name}</p>
                {item.color && <p className="text-xs text-attire-silver/70">{item.color}</p>}
            </div>
        ) : (
            <span className="text-sm text-white/20 italic">Select item</span>
        )}
    </div>
);

export default CustomizeGiftPage;
