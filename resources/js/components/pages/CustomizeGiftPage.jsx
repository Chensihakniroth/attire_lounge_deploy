import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ShoppingCart, Check, User, Mail, Phone, ArrowRight, Loader, AlertTriangle, Gift } from 'lucide-react';
import api from '../../api';
import minioBaseUrl from '../../config';

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
      { id: 'box-designer', name: 'Designer Box', image: `${minioBaseUrl}/uploads/collections/accessories/designer_box.webp` },
    ],
  };

const SelectionCard = ({ item, isSelected, onSelect }) => (
    <motion.div
        onClick={onSelect}
        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-attire-accent' : 'border-transparent'}`}
        whileHover={{ scale: 1.05 }}
    >
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 p-3 z-20">
            <h4 className="font-semibold text-white">{item.name}</h4>
            {item.color && <p className="text-sm text-white/80">{item.color}</p>}
        </div>
        {isSelected && (
            <motion.div
                layoutId={`selected-check-${item.id}`}
                className="absolute top-2 right-2 bg-attire-accent text-attire-dark rounded-full w-6 h-6 flex items-center justify-center z-20"
            >
                <Check size={16} />
            </motion.div>
        )}
    </motion.div>
);

const InputField = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
        </div>
        <input
            {...props}
            className="w-full pl-10 p-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors"
        />
    </div>
);

const CustomizeGiftPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [selectedTie, setSelectedTie] = useState(null);
    const [selectedPocketSquare, setSelectedPocketSquare] = useState(null);
    const [selectedBox, setSelectedBox] = useState(null);
    const [note, setNote] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState({ state: 'idle' }); // idle, loading, success, error
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
            window.scrollTo(0, 0); // Scroll to top on successful submission
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
    };

    const handleFinalize = async () => {
        if (!isItemsComplete) return;

        const preferences = `
Tie: ${selectedTie.name} (${selectedTie.color})
Pocket Square: ${selectedPocketSquare.name} (${selectedPocketSquare.color})
Box: ${selectedBox.name}
${note ? `Note: "${note}"` : ''}
        `.trim();

        const dataToSend = { ...formData, preferences };

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
            <div className="min-h-screen bg-attire-navy py-12 md:py-24 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto px-4">
                    <div className="bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-8 text-center">
                        <Check size={48} className="mx-auto text-green-400 mb-4" />
                        <h1 className="text-3xl font-serif text-white mb-4">Request Sent!</h1>
                        <p className="text-attire-silver mb-8">
                            Thank you, {formData.name}. We have received your custom gift request and will contact you shortly.
                        </p>
                        <button onClick={resetForm} className="text-attire-accent hover:text-white transition-colors font-semibold">
                            Create Another Gift
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-attire-navy py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Customize a Gift Box
                    </h1>
                    <p className="text-lg text-attire-silver max-w-2xl mx-auto">
                        Follow the steps to create a unique and thoughtful gift.
                    </p>
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
                        <div className="bg-attire-dark/20 backdrop-blur-sm rounded-xl p-8">
                            <h2 className="text-2xl font-serif text-white mb-6">Step 1: Your Details</h2>
                            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                                <InputField
                                    icon={<User size={16} className="text-gray-400" />}
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {formErrors.name && <p className="text-red-400 text-sm">{formErrors.name}</p>}
                                <InputField
                                    icon={<Mail size={16} className="text-gray-400" />}
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {formErrors.email && <p className="text-red-400 text-sm">{formErrors.email}</p>}
                                <InputField
                                    icon={<Phone size={16} className="text-gray-400" />}
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                {formErrors.phone && <p className="text-red-400 text-sm">{formErrors.phone}</p>}
                                <button type="submit" className="w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark hover:opacity-90">
                                    Next Step <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-12">
                                <section>
                                    <h2 className="text-2xl font-serif text-white mb-6">Step 2: Choose Items</h2>
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white/90 mb-4">Ties</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {giftOptions.ties.map(tie => <SelectionCard key={tie.id} item={tie} isSelected={selectedTie?.id === tie.id} onSelect={() => setSelectedTie(prev => prev?.id === tie.id ? null : tie)} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white/90 mb-4">Pocket Squares</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {giftOptions.pocketSquares.map(ps => <SelectionCard key={ps.id} item={ps} isSelected={selectedPocketSquare?.id === ps.id} onSelect={() => setSelectedPocketSquare(prev => prev?.id === ps.id ? null : ps)} />)}
                                            </div>
                                        </div>
                                        {availableBoxes.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-semibold text-white/90 mb-4">Boxes</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {availableBoxes.map(box => <SelectionCard key={box.id} item={box} isSelected={selectedBox?.id === box.id} onSelect={() => setSelectedBox(prev => prev?.id === box.id ? null : box)} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                                <section>
                                    <h2 className="text-2xl font-serif text-white mb-6">Step 3: Personal Note (Optional)</h2>
                                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Happy Birthday, John!" className="w-full p-4 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none" rows="4"></textarea>
                                </section>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-6">
                                    <h3 className="text-xl font-serif text-white mb-4">Summary</h3>
                                    <div className="space-y-3 text-sm">
                                        <p><strong className="font-semibold text-white/90">Name:</strong> {formData.name}</p>
                                        <p><strong className="font-semibold text-white/90">Email:</strong> {formData.email}</p>
                                        <p><strong className="font-semibold text-white/90">Tie:</strong> {selectedTie ? `${selectedTie.name} (${selectedTie.color})` : 'Not selected'}</p>
                                        <p><strong className="font-semibold text-white/90">Pocket Square:</strong> {selectedPocketSquare ? `${selectedPocketSquare.name} (${selectedPocketSquare.color})` : 'Not selected'}</p>
                                        <p><strong className="font-semibold text-white/90">Box:</strong> {selectedBox ? selectedBox.name : 'Not selected'}</p>
                                        <p><strong className="font-semibold text-white/90">Note:</strong> {note || 'None'}</p>
                                    </div>
                                    <div className="border-t border-white/10 my-6"></div>
                                    {submissionStatus.state === 'error' && <p className="text-red-400 text-center mb-4">{submissionStatus.message}</p>}
                                    <button onClick={handleFinalize} disabled={!isItemsComplete || submissionStatus.state === 'loading'} className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark disabled:bg-gray-500 disabled:cursor-not-allowed hover:opacity-90">
                                        {submissionStatus.state === 'loading' ? <Loader className="animate-spin" size={20} /> : <><Gift size={20} /> Submit Request</>}
                                    </button>
                                    <button onClick={() => setStep(1)} className="w-full text-center mt-4 text-attire-silver hover:text-white text-sm">Back to details</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CustomizeGiftPage;
