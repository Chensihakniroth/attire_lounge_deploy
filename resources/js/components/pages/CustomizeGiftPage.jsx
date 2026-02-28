import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, User, Mail, Phone, ArrowRight, Loader, AlertTriangle, Gift, ChevronLeft, ArrowLeft } from 'lucide-react';
import api from '../../api';
import Skeleton from '../common/Skeleton.jsx';
import giftOptions from '../../data/giftOptions';

const SectionHeader = ({ number, title, subtitle }) => (
    <div className="text-center mb-12">
        <div className="inline-block relative">
            <p className="text-8xl font-black font-serif text-white/5">{number}</p>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-3xl font-serif text-white">{title}</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-attire-silver/50 mt-1">{subtitle}</p>
            </div>
        </div>
    </div>
);

const ProgressTracker = ({ currentStep }) => {
    const steps = ["Contact Info", "Select Items", "Summary"];
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-20">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${currentStep > index + 1 ? 'bg-green-500/20 border-2 border-green-500/50' : currentStep === index + 1 ? 'bg-attire-accent/20 border-2 border-attire-accent' : 'bg-white/5 border-2 border-white/10'}`}>
                            {currentStep > index + 1 ? <Check size={16} className="text-green-400" /> : <span className={`text-sm font-bold ${currentStep === index + 1 ? 'text-attire-accent' : 'text-white/30'}`}>{index + 1}</span>}
                        </div>
                        <p className={`text-xs uppercase tracking-widest font-semibold transition-colors ${currentStep >= index + 1 ? 'text-white' : 'text-white/40'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
                </React.Fragment>
            ))}
        </div>
    );
};


const SelectionCard = ({ item, isSelected, onSelect, isOutOfStock }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    return (
        <motion.div
            onClick={isOutOfStock ? null : onSelect}
            className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                isOutOfStock 
                    ? 'opacity-60 cursor-not-allowed border-white/5 grayscale-[0.5]' 
                    : 'cursor-pointer'
            } ${
                isSelected
                    ? 'border-attire-accent shadow-[0_0_20px_rgba(212,168,76,0.25)]'
                    : !isOutOfStock ? 'border-white/5 hover:border-white/20' : ''
            }`}
            whileHover={isOutOfStock ? {} : { y: -5 }}
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
                    } ${isSelected ? 'scale-105' : !isOutOfStock ? 'group-hover:scale-105' : ''}`}
                    onLoad={() => setIsLoaded(true)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="bg-black/60 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Sold Out</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 p-4 z-20 w-full flex justify-between items-end">
                <div>
                    <h4 className="font-serif text-white text-lg leading-tight mb-1">{item.name}</h4>
                    {item.color && <p className="text-xs text-attire-silver uppercase tracking-wider">{item.color}</p>}
                </div>
                <div className="text-attire-accent font-mono text-sm bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                    ${item.price}
                </div>
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

const InputField = ({ icon, label, error, ...props }) => (
    <div>
        {label && <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">{label}</label>}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-attire-silver group-focus-within:text-attire-accent transition-colors">
                {icon}
            </div>
            <input
                {...props}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-black/40 text-white placeholder-white/20 transition-all border-white/10 focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 focus:outline-none ${error ? 'border-red-500/50' : ''}`}
            />
        </div>
        {error && <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>}
    </div>
);

const CustomizeGiftPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', 
        sender_age: '',
        email: '', 
        phone: '', 
        recipient_name: '',
        recipient_title: 'Mr',
        recipient_phone: '',
        recipient_email: '',
    });
    const [selectedTie, setSelectedTie] = useState(null);
    const [selectedPocketSquare, setSelectedPocketSquare] = useState(null);
    const [selectedBox, setSelectedBox] = useState(null);
    const [note, setNote] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState({ state: 'idle' });
    const [formErrors, setFormErrors] = useState({});
    const [availableBoxes, setAvailableBoxes] = useState([]);
    const [outOfStockItems, setOutOfStockItems] = useState([]);

    useEffect(() => {
        const fetchOutOfStock = async () => {
            try {
                const items = await api.getOutOfStockItems();
                setOutOfStockItems(items);
            } catch (error) {
                console.error('Failed to fetch out of stock items:', error);
            }
        };
        fetchOutOfStock();
    }, []);

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

    const isItemsComplete = selectedTie && selectedPocketSquare && selectedBox;
    const totalPrice = (selectedTie?.price || 0) + (selectedPocketSquare?.price || 0) + (selectedBox?.price || 0);

    const validateStep1 = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Sender name is required.';
        if (!formData.phone.trim()) errors.phone = 'Sender phone is required.';
        if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Sender email is invalid.';
        }
        if (!formData.recipient_name.trim()) errors.recipient_name = 'Recipient name is required.';
         if (formData.recipient_email.trim() && !/^\S+@\S+\.\S+$/.test(formData.recipient_email)) {
            errors.recipient_email = 'Recipient email is invalid.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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
            setStep(4); // Success step
        } catch (error) {
            setSubmissionStatus({ state: 'error', message: 'Something went wrong. Please try again.' });
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            name: '', sender_age: '', email: '', phone: '',
            recipient_name: '', recipient_title: 'Mr', recipient_phone: '', recipient_email: '',
        });
        setSelectedTie(null);
        setSelectedPocketSquare(null);
        setSelectedBox(null);
        setNote('');
        setSubmissionStatus({ state: 'idle' });
        setFormErrors({});
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1ContactInfo formData={formData} setFormData={setFormData} formErrors={formErrors} setStep={setStep} validate={validateStep1} />;
            case 2:
                return <Step2ItemSelection {...{selectedTie, setSelectedTie, selectedPocketSquare, setSelectedPocketSquare, selectedBox, setSelectedBox, note, setNote, outOfStockItems, availableBoxes}} />;
            case 3:
                return <Step3Summary {...{formData, selectedTie, selectedPocketSquare, selectedBox, totalPrice, handleFinalize, submissionStatus}} />;
            case 4:
                return <Step4Success {...{formData, selectedTie, selectedPocketSquare, selectedBox, totalPrice, resetForm}} />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-x-clip">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
                <div className="text-center mb-16">
                     <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">Curate</span>
                     <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">The perfect gift for gentlemen</h1>
                     <p className="text-lg text-attire-silver max-w-2xl mx-auto font-light leading-relaxed">Craft a curated gift box with our finest accessories. <br/>A gesture of timeless elegance.</p>
                </div>
                
                {step < 4 && <ProgressTracker currentStep={step} />}
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
                
                {step > 1 && step < 4 && (
                    <div className={`mt-12 flex ${step === 3 ? 'justify-between' : 'justify-start'}`}>
                        <button onClick={() => setStep(s => s - 1)} className="group flex items-center gap-2 text-sm text-attire-silver hover:text-white transition-colors">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                        {step === 2 && (
                            <button onClick={() => setStep(3)} className="group ml-auto flex items-center gap-2 text-sm text-attire-accent hover:text-white transition-colors">
                                Proceed to Summary
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Step1ContactInfo = ({ formData, setFormData, formErrors, setStep, validate }) => (
    <div className="bg-[#0a0f1a] rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl max-w-4xl mx-auto">
        <SectionHeader number="01" title="Contact Information" subtitle="Who is sending and receiving this gift?" />
        <form onSubmit={(e) => { e.preventDefault(); if(validate()) setStep(2); }} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-attire-accent border-b border-attire-accent/20 pb-2">Sender Details</h3>
                <InputField label="Full Name (Required)" icon={<User size={18} />} type="text" placeholder="Enter sender's name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} />
                <InputField label="Age (Optional)" icon={<User size={18} />} type="number" placeholder="Enter sender's age" value={formData.sender_age} onChange={(e) => setFormData({ ...formData, sender_age: e.target.value })} />
                <InputField label="Email Address (Optional)" icon={<Mail size={18} />} type="email" placeholder="Enter sender's email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={formErrors.email} />
                <InputField label="Phone Number (Required)" icon={<Phone size={18} />} type="tel" placeholder="Enter sender's phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} error={formErrors.phone} />
            </div>
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-attire-accent border-b border-attire-accent/20 pb-2">Recipient Details</h3>
                <div>
                    <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">Title</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, recipient_title: 'Mr'})} className={`py-3 px-6 rounded-xl transition-all ${formData.recipient_title === 'Mr' ? 'bg-attire-accent text-black font-bold' : 'bg-black/40 text-white border border-white/10'}`}>Mr.</button>
                        <button type="button" onClick={() => setFormData({...formData, recipient_title: 'Mrs'})} className={`py-3 px-6 rounded-xl transition-all ${formData.recipient_title === 'Mrs' ? 'bg-attire-accent text-black font-bold' : 'bg-black/40 text-white border border-white/10'}`}>Mrs.</button>
                    </div>
                </div>
                <InputField label="Full Name (Required)" icon={<User size={18} />} type="text" placeholder="Enter recipient's name" value={formData.recipient_name} onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })} error={formErrors.recipient_name} />
                <InputField label="Email Address (Optional)" icon={<Mail size={18} />} type="email" placeholder="Enter recipient's email" value={formData.recipient_email} onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })} error={formErrors.recipient_email} />
                <InputField label="Phone Number (Optional)" icon={<Phone size={18} />} type="tel" placeholder="Enter recipient's phone" value={formData.recipient_phone} onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
                <button type="submit" className="w-full mt-6 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-white text-black hover:bg-attire-accent hover:text-black group">
                    Select Items
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </form>
    </div>
);

const Step2ItemSelection = ({ selectedTie, setSelectedTie, selectedPocketSquare, setSelectedPocketSquare, selectedBox, setSelectedBox, note, setNote, outOfStockItems, availableBoxes }) => (
    <div>
        <SectionHeader number="02" title="Curate the Box" subtitle="Select the perfect combination of accessories" />
        <div className="space-y-16">
            <section>
                <h3 className="text-xl font-serif text-white uppercase tracking-widest text-center mb-8">Select a Tie</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {giftOptions.ties.map(tie => <SelectionCard key={tie.id} item={tie} isSelected={selectedTie?.id === tie.id} onSelect={() => setSelectedTie(prev => prev?.id === tie.id ? null : tie)} isOutOfStock={outOfStockItems.includes(tie.id)} />)}
                </div>
            </section>
            <section>
                <h3 className="text-xl font-serif text-white uppercase tracking-widest text-center mb-8">Select a Pocket Square</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {giftOptions.pocketSquares.map(ps => <SelectionCard key={ps.id} item={ps} isSelected={selectedPocketSquare?.id === ps.id} onSelect={() => setSelectedPocketSquare(prev => prev?.id === ps.id ? null : ps)} isOutOfStock={outOfStockItems.includes(ps.id)} />)}
                </div>
            </section>
            <AnimatePresence>
                {availableBoxes.length > 0 && (
                    <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <h3 className="text-xl font-serif text-white uppercase tracking-widest text-center my-8">Select a Box</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {availableBoxes.map(box => <SelectionCard key={box.id} item={box} isSelected={selectedBox?.id === box.id} onSelect={() => setSelectedBox(prev => prev?.id === box.id ? null : box)} isOutOfStock={outOfStockItems.includes(box.id)} />)}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
            <section className="pt-8 max-w-4xl mx-auto">
                <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-4 ml-1">Personal Note (Optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a special message for the recipient..." className="w-full p-5 rounded-2xl border bg-black/20 text-white placeholder-white/20 focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 transition-all border-white/10 resize-none" rows="4"></textarea>
            </section>
        </div>
    </div>
);

const Step3Summary = ({ formData, selectedTie, selectedPocketSquare, selectedBox, totalPrice, handleFinalize, submissionStatus }) => (
    <div className="bg-[#0a0f1a] rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl max-w-2xl mx-auto">
        <SectionHeader number="03" title="Final Summary" subtitle="Review your curated gift box" />
        <div className="space-y-4 mb-8">
            <div className="flex justify-between items-start pb-4 border-b border-white/5"><span className="text-sm text-attire-silver">From</span><span className="text-sm text-white font-medium text-right">{formData.name}</span></div>
            <div className="flex justify-between items-start pb-4 border-b border-white/5"><span className="text-sm text-attire-silver">To</span><span className="text-sm text-white font-medium text-right">{formData.recipient_title}. {formData.recipient_name}</span></div>
            <SummaryItem label="Tie" item={selectedTie} />
            <SummaryItem label="Pocket Square" item={selectedPocketSquare} />
            <SummaryItem label="Gift Box" item={selectedBox} />
            <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center"><span className="text-base font-serif text-white">Total Estimate</span><span className="text-lg font-mono text-attire-accent">${totalPrice.toFixed(2)}</span></div>
        </div>
        {submissionStatus.state === 'error' && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-3"><AlertTriangle size={16} className="text-red-400" /><p className="text-xs text-red-300">{submissionStatus.message}</p></div>}
        <button onClick={handleFinalize} disabled={!selectedTie || !selectedPocketSquare || !selectedBox || submissionStatus.state === 'loading'} className="w-full py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-black disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed hover:bg-white">
            {submissionStatus.state === 'loading' ? <Loader className="animate-spin" size={20} /> : <><Gift size={20} /> Request Gift Box</>}
        </button>
        {(!selectedTie || !selectedPocketSquare || !selectedBox) && <p className="text-center text-xs text-attire-silver/50 mt-4">Please select all items to proceed.</p>}
    </div>
);

const Step4Success = ({ formData, selectedTie, selectedPocketSquare, selectedBox, totalPrice, resetForm }) => (
    <div className="min-h-screen bg-attire-navy relative overflow-hidden flex items-center justify-center -m-36">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-lg w-full mx-auto px-4">
            <div className="bg-[#0a0f1a] rounded-3xl border border-white/10 shadow-2xl p-8 md:p-10 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20"><Check size={40} className="text-green-400" /></div>
                <h1 className="text-4xl font-serif text-white mb-4">Request Sent!</h1>
                <p className="text-attire-silver mb-8 leading-relaxed">Thank you, {formData.name}. We have received your custom gift request for {formData.recipient_title}. {formData.recipient_name} and will contact you shortly to finalize the details.</p>
                <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left space-y-4">
                    <h3 className="text-sm font-semibold text-attire-silver uppercase tracking-widest border-b border-white/10 pb-2">Your Selection</h3>
                    <div className="space-y-3">
                        <SummaryItem label="Tie" item={selectedTie} />
                        <SummaryItem label="Pocket Square" item={selectedPocketSquare} />
                        <SummaryItem label="Gift Box" item={selectedBox} />
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center"><span className="text-base font-serif text-white">Total Estimate</span><span className="text-lg font-mono text-attire-accent">${totalPrice.toFixed(2)}</span></div>
                    </div>
                </div>
                <button onClick={resetForm} className="w-full py-4 rounded-full font-semibold transition-all duration-300 bg-attire-accent text-black hover:bg-white">Create Another Gift</button>
            </div>
        </motion.div>
    </div>
);

const SummaryItem = ({ label, item }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-attire-silver">{label}</span>
        {item ? (
            <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <p className="text-sm text-white font-medium">{item.name}</p>
                    <span className="text-xs text-attire-accent font-mono">${item.price}</span>
                </div>
                {item.color && <p className="text-xs text-attire-silver/70">{item.color}</p>}
            </div>
        ) : (
            <span className="text-sm text-white/20 italic">- Not selected -</span>
        )}
    </div>
);

export default CustomizeGiftPage;