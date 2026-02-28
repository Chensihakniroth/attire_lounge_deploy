// resources/js/components/pages/CustomizeGiftPage.jsx - ATELIER OVERHAUL (SMOOTH ANCHORED SCROLL)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
    Send, Check, User, Mail, Phone, ArrowRight, Loader, 
    AlertTriangle, Gift, ChevronLeft, ArrowLeft, Sparkles,
    ShieldCheck, Package, ClipboardCheck, MousePointer2,
    ShoppingBag, Info, Heart
} from 'lucide-react';
import api from '../../api';
import Skeleton from '../common/Skeleton.jsx';
import giftOptions from '../../data/giftOptions';

// --- Premium Animation Constants ---
const springConfig = { damping: 25, stiffness: 120 };
const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

// --- Refined Components ---

const StepIndicator = ({ currentStep }) => {
    const steps = ["Details", "Selection", "Review"];
    return (
        <div className="flex flex-col items-center mb-16">
            <div className="flex items-center gap-12 relative">
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center z-10">
                        <motion.div 
                            className={`w-2 h-2 rounded-full mb-3 transition-all duration-700 ${
                                currentStep >= i + 1 ? 'bg-attire-accent scale-150 shadow-[0_0_10px_rgba(212,168,76,0.5)]' : 'bg-white/30'
                            }`}
                        />
                        <span className={`text-[9px] uppercase tracking-[0.3em] font-black transition-colors duration-500 ${
                            currentStep === i + 1 ? 'text-white' : 'text-white/40'
                        }`}>
                            {s}
                        </span>
                    </div>
                ))}
                {/* Connector Line */}
                <div className="absolute top-1 left-4 right-4 h-px bg-white/10 -z-10">
                    <motion.div 
                        className="h-full bg-attire-accent/40"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const SelectionCard = ({ item, isSelected, onSelect, isOutOfStock }) => {
    return (
        <motion.div
            layout
            onClick={isOutOfStock ? null : onSelect}
            whileHover={!isOutOfStock ? { y: -10 } : {}}
            className={`relative group cursor-pointer ${isOutOfStock ? 'opacity-30 grayscale' : ''}`}
        >
            <div className={`aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 border-2 ${
                isSelected ? 'border-attire-accent' : 'border-transparent'
            }`}>
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                        isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {/* Selection Glow */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-attire-accent/5 backdrop-blur-[2px]"
                        />
                    )}
                </AnimatePresence>

                <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-bold text-attire-accent uppercase tracking-widest mb-1">{item.color || 'Signature'}</p>
                    <h4 className="text-lg font-serif text-white leading-tight">{item.name}</h4>
                </div>
            </div>

            {isSelected && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-attire-accent text-black rounded-full flex items-center justify-center shadow-2xl border-4 border-attire-navy"
                >
                    <Check size={14} strokeWidth={4} />
                </motion.div>
            )}
        </motion.div>
    );
};

const CustomInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/40 group-focus-within:text-attire-accent transition-colors">
                <Icon size={16} />
            </div>
            <input 
                {...props}
                className={`w-full bg-white/[0.02] border ${error ? 'border-red-500/30' : 'border-white/10'} hover:border-white/20 focus:border-attire-accent/50 focus:bg-white/[0.05] rounded-2xl py-5 pl-14 pr-6 text-white text-sm outline-none transition-all duration-500`}
            />
        </div>
    </div>
);

// --- Main Atelier View ---

const CustomizeGiftPage = () => {
    const contentRef = useRef(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', sender_age: '', email: '', phone: '',
        recipient_name: '', recipient_title: 'Mr', recipient_phone: '', recipient_email: '',
    });
    const [selectedTie, setSelectedTie] = useState(null);
    const [selectedPocketSquare, setSelectedPocketSquare] = useState(null);
    const [selectedBox, setSelectedBox] = useState(null);
    const [note, setNote] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState({ state: 'idle' });
    const [formErrors, setFormErrors] = useState({});
    const [outOfStockItems, setOutOfStockItems] = useState([]);

    // Smooth anchored scroll logic 💖
    useEffect(() => {
        if (contentRef.current && step > 1) {
            const timer = setTimeout(() => {
                const yOffset = -120; // Breathing room for the header
                const elementTop = contentRef.current.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementTop + yOffset, behavior: 'smooth' });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [step]);

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

    const availableBoxes = useMemo(() => {
        if (!selectedTie && !selectedPocketSquare) return [];
        if (selectedTie && !selectedPocketSquare) return giftOptions.boxes.filter(box => box.id !== 'box-designer');
        return giftOptions.boxes;
    }, [selectedTie, selectedPocketSquare]);

    const totalPrice = (selectedTie?.price || 0) + (selectedPocketSquare?.price || 0) + (selectedBox?.price || 0);

    const validateStep1 = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Please provide your name';
        if (!formData.phone.trim()) errors.phone = 'Contact number is required';
        if (!formData.recipient_name.trim()) errors.recipient_name = 'Who is receiving this?';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFinalize = async () => {
        setSubmissionStatus({ state: 'loading' });
        try {
            const preferences = `Tie: ${selectedTie.name}\nPocket Square: ${selectedPocketSquare.name}\nBox: ${selectedBox.name}\nNote: ${note}`;
            const selectedItems = [
                { type: 'Tie', ...selectedTie },
                { type: 'Pocket Square', ...selectedPocketSquare },
                { type: 'Box', ...selectedBox }
            ];
            await api.submitGiftRequest({ ...formData, preferences, selected_items: selectedItems });
            setSubmissionStatus({ state: 'success' });
            setStep(4);
        } catch (e) {
            setSubmissionStatus({ state: 'error', message: 'Unable to process your request at this time.' });
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

    return (
        <div className="min-h-screen bg-attire-navy text-white selection:bg-attire-accent selection:text-black">
            {/* Immersive Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-attire-accent/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-28 sm:py-40">
                {/* Header Section */}
                <header className="max-w-3xl mx-auto text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/[0.02] mb-10"
                    >
                        <Sparkles size={14} className="text-attire-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Exclusive Atelier Service</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif font-light text-white mb-8 leading-none"
                    >
                        The Art <br/> of Gifting
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 font-light tracking-wide text-lg"
                    >
                        Tailor a masterpiece for those who appreciate the finer things.
                    </motion.p>
                </header>

                {step < 4 && <StepIndicator currentStep={step} />}

                {/* Main Content Layout with stable height & scroll ref 💖 */}
                <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start min-h-[120vh] pb-32">

                    {/* Interaction Area */}                    <div className="lg:col-span-7 xl:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {step === 1 && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <section className="space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-3xl font-serif text-white/30">01</span>
                                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-attire-accent">The Sender</h3>
                                                </div>
                                                <div className="space-y-6">
                                                    <CustomInput label="Full Name" icon={User} placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={formErrors.name} />
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <CustomInput label="Phone" icon={Phone} placeholder="+1..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={formErrors.phone} />
                                                        <CustomInput label="Age" icon={Sparkles} type="number" placeholder="25" value={formData.sender_age} onChange={e => setFormData({...formData, sender_age: e.target.value})} />
                                                    </div>
                                                </div>
                                            </section>
                                            <section className="space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-3xl font-serif text-white/30">02</span>
                                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/60">The Recipient</h3>
                                                </div>
                                                <div className="space-y-6">
                                                    <CustomInput label="Recipient Name" icon={Heart} placeholder="Their name" value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} error={formErrors.recipient_name} />
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-1">Title</label>
                                                        <div className="flex gap-4">
                                                            {['Mr', 'Mrs', 'Ms'].map(t => (
                                                                <button 
                                                                    key={t}
                                                                    onClick={() => setFormData({...formData, recipient_title: t})}
                                                                    className={`flex-grow py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-500 ${formData.recipient_title === t ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`}
                                                                >
                                                                    {t}.
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <button 
                                            onClick={() => validateStep1() && setStep(2)}
                                            className="w-full py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.5em] hover:bg-attire-accent transition-all duration-700 shadow-2xl group flex items-center justify-center gap-4"
                                        >
                                            Enter the Gallery
                                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-24 pb-20">
                                        <div className="space-y-12">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                                                <h3 className="text-2xl font-serif">I. Select Neckwear</h3>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{selectedTie ? 'Selected' : 'Awaiting Choice'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {giftOptions.ties.map(t => <SelectionCard key={t.id} item={t} isSelected={selectedTie?.id === t.id} onSelect={() => setSelectedTie(t)} isOutOfStock={outOfStockItems.includes(t.id)} />)}
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                                                <h3 className="text-2xl font-serif">II. Select Pocket Square</h3>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{selectedPocketSquare ? 'Selected' : 'Awaiting Choice'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {giftOptions.pocketSquares.map(p => <SelectionCard key={p.id} item={p} isSelected={selectedPocketSquare?.id === p.id} onSelect={() => setSelectedPocketSquare(p)} isOutOfStock={outOfStockItems.includes(p.id)} />)}
                                            </div>
                                        </div>

                                        {availableBoxes.length > 0 && (
                                            <div className="space-y-12">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                                                    <h3 className="text-2xl font-serif">III. Select Presentation</h3>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{selectedBox ? 'Selected' : 'Awaiting Choice'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                                    {availableBoxes.map(b => <SelectionCard key={b.id} item={b} isSelected={selectedBox?.id === b.id} onSelect={() => setSelectedBox(b)} isOutOfStock={outOfStockItems.includes(b.id)} />)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="pt-12">
                                            <button 
                                                onClick={() => setStep(3)}
                                                disabled={!selectedTie || !selectedPocketSquare || !selectedBox}
                                                className="w-full py-6 rounded-2xl bg-attire-accent text-black font-black text-[11px] uppercase tracking-[0.5em] disabled:opacity-20 disabled:grayscale transition-all duration-700 shadow-2xl"
                                            >
                                                Finalize Curation
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-12 bg-white/[0.02] border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-attire-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                        
                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="w-16 h-16 rounded-2xl bg-attire-accent/10 flex items-center justify-center border border-attire-accent/20">
                                                <ClipboardCheck className="text-attire-accent" size={32} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-serif text-white">Confirm Manifest</h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mt-1">Review your private request</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-white/10 py-12">
                                            <div className="space-y-6">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-attire-accent">Logistics</p>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">From:</span><span className="text-sm font-medium">{formData.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">For:</span><span className="text-sm font-medium">{formData.recipient_title}. {formData.recipient_name}</span></div>
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">Contact:</span><span className="text-sm font-medium">{formData.phone}</span></div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Selected Pieces</p>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">Neckwear:</span><span className="text-sm font-medium">{selectedTie?.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">Accent:</span><span className="text-sm font-medium">{selectedPocketSquare?.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-xs text-white/60">Vessel:</span><span className="text-sm font-medium">{selectedBox?.name}</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Personal Note (Optional)</label>
                                            <textarea 
                                                value={note}
                                                onChange={e => setNote(e.target.value)}
                                                placeholder="Write a message of elegance..."
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm italic outline-none focus:border-attire-accent/30 transition-all resize-none text-white placeholder-white/20"
                                                rows={4}
                                            />
                                        </div>

                                        {submissionStatus.state === 'error' && (
                                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                                <AlertTriangle size={18} className="text-red-400" />
                                                <p className="text-xs text-red-300">{submissionStatus.message}</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleFinalize}
                                            disabled={submissionStatus.state === 'loading'}
                                            className="w-full py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] hover:bg-attire-accent transition-all duration-700 shadow-2xl flex items-center justify-center gap-4"
                                        >
                                            {submissionStatus.state === 'loading' ? <Loader className="animate-spin" size={20} /> : 'Dispatch Request'}
                                        </button>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="text-center space-y-12 py-20">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-32 h-32 bg-attire-accent/10 rounded-full flex items-center justify-center mx-auto border border-attire-accent/20"
                                        >
                                            <Check size={48} className="text-attire-accent" />
                                        </motion.div>
                                        <div className="space-y-4">
                                            <h2 className="text-5xl font-serif text-white">Manifest Staged</h2>
                                            <p className="text-white/80 font-light max-w-md mx-auto">Thank you, {formData.name}. Our concierge will review your curation and contact you shortly.</p>
                                        </div>
                                        <button 
                                            onClick={resetForm}
                                            className="px-12 py-5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-700 text-[10px] font-black uppercase tracking-[0.4em]"
                                        >
                                            New Curation
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Live Preview Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4 sticky top-40 space-y-8 hidden lg:block">
                        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl space-y-10">
                            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-attire-accent">Your Curation</h4>
                                <ShoppingBag size={16} className="text-white/40" />
                            </div>

                            <div className="space-y-10">
                                <PreviewItem label="The Tie" item={selectedTie} />
                                <PreviewItem label="The Accent" item={selectedPocketSquare} />
                                <PreviewItem label="The Presentation" item={selectedBox} />
                            </div>

                            <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Total Estimate</p>
                                    <span className="text-4xl font-mono text-white tracking-tighter">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-attire-accent">Concierge Fee</p>
                                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest italic">Complimentary</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-white/[0.01] rounded-3xl border border-white/10 border-dashed opacity-60">
                            <Info size={16} className="text-attire-accent shrink-0" />
                            <p className="text-[9px] font-medium uppercase tracking-widest leading-loose text-white/80">Items are curated specifically for your request. Final availability confirmed upon contact.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const PreviewItem = ({ label, item }) => (
    <div className="flex items-center gap-6 group">
        <div className={`w-16 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-700 ${item ? 'scale-100' : 'scale-90 opacity-20'}`}>
            {item && <img src={item.image} className="w-full h-full object-cover" />}
        </div>
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{label}</p>
            <p className={`text-sm font-serif transition-colors duration-500 ${item ? 'text-white' : 'text-white/20 italic'}`}>
                {item ? item.name : 'Awaiting Selection...'}
            </p>
            {item && <p className="text-[10px] font-mono text-attire-accent font-bold">${item.price}</p>}
        </div>
    </div>
);

export default CustomizeGiftPage;
