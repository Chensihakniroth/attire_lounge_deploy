// resources/js/components/pages/CustomizeGiftPage.jsx - CLEAN GIFT CUSTOMIZATION
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Check, User, Mail, Phone, ArrowRight, Loader,
    AlertTriangle, Gift, ChevronLeft, ArrowLeft,
    ClipboardCheck, ShoppingBag, Heart,
} from 'lucide-react';
import api from '../../api';
import Skeleton from '../common/Skeleton.jsx';
import giftOptions from '../../data/giftOptions';
import { useQuery } from '@tanstack/react-query';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const StepIndicator = ({ currentStep }) => {
    const steps = ['Selection', 'Details', 'Review'];
    return (
        <div className="flex items-center justify-center gap-8 mb-12">
            {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        currentStep >= i + 1
                            ? 'bg-[#f5a81c] text-black'
                            : 'bg-white/10 text-white/40'
                    }`}>
                        {currentStep > i + 1 ? <Check size={12} strokeWidth={3} /> : i + 1}
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-300 ${
                        currentStep === i + 1 ? 'text-white' : 'text-white/40'
                    }`}>
                        {s}
                    </span>
                    {i < steps.length - 1 && (
                        <div className={`w-8 h-px transition-colors duration-300 ${currentStep > i + 1 ? 'bg-[#f5a81c]' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

const SelectionCard = ({ item, isSelected, onSelect, isOutOfStock }) => {
    return (
        <motion.div
            layout
            onClick={isOutOfStock ? null : onSelect}
            whileHover={!isOutOfStock ? { y: -4 } : {}}
            className={`relative group cursor-pointer ${isOutOfStock ? 'opacity-30 grayscale pointer-events-none' : ''}`}
        >
            <div className={`aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                isSelected ? 'border-[#f5a81c]' : 'border-white/10 hover:border-white/20'
            }`}>
                <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[9px] font-bold text-[#f5a81c] uppercase tracking-[0.2em] mb-0.5">
                        {item.color || 'Signature'}
                    </p>
                    <h4 className="text-sm font-serif text-white leading-tight">{item.name}</h4>
                </div>
            </div>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#f5a81c] text-black rounded-full flex items-center justify-center border-2 border-[#0d3542]"
                >
                    <Check size={10} strokeWidth={3} />
                </motion.div>
            )}
        </motion.div>
    );
};

const CustomInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Icon size={14} />
                </div>
            )}
            <input
                {...props}
                className={`w-full bg-white/[0.02] border ${error ? 'border-red-500/30' : 'border-white/10'} hover:border-white/20 focus:border-[#f5a81c]/50 focus:bg-white/[0.04] rounded-lg py-3 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-white text-sm outline-none transition-all duration-300 [color-scheme:dark]`}
            />
        </div>
        {error && (
            <p className="text-red-400 text-[10px] font-bold">{error}</p>
        )}
    </div>
);

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
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoStatus, setPromoStatus] = useState({ state: 'idle', message: '' });

    const { data: outOfStockItems = [] } = useQuery({
        queryKey: ['outOfStockItems'],
        queryFn: () => api.getOutOfStockItems()
    });

    useEffect(() => {
        if (contentRef.current && step > 1) {
            const scrollToContent = () => {
                const element = document.getElementById('step-indicator-area') || contentRef.current;
                const yOffset = -60;
                const elementTop = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: elementTop + yOffset, behavior: 'smooth' });
            };
            scrollToContent();
            const timer = setTimeout(scrollToContent, 500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const availableBoxes = useMemo(() => {
        if (!selectedTie && !selectedPocketSquare) return [];
        if (selectedTie && !selectedPocketSquare)
            return giftOptions.boxes.filter((box) => box.id !== 'box-designer');
        return giftOptions.boxes;
    }, [selectedTie, selectedPocketSquare]);

    const basePrice =
        (selectedTie?.price || 0) +
        (selectedPocketSquare?.price || 0) +
        (selectedBox?.price || 0);

    const discountAmount = appliedPromo ? (basePrice * appliedPromo.discount_percentage) / 100 : 0;
    const totalPrice = basePrice - discountAmount;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoStatus({ state: 'loading', message: '' });
        try {
            const data = await api.validatePromoCode(promoCode);
            setAppliedPromo({ code: promoCode, discount_percentage: data.discount_percentage });
            setPromoStatus({ state: 'success', message: `${data.discount_percentage}% discount applied` });
        } catch (error) {
            setAppliedPromo(null);
            setPromoStatus({ state: 'error', message: error.response?.data?.message || 'Invalid or expired code' });
        }
    };

    const validateStep1 = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Please enter your name';
        if (!formData.phone.trim()) errors.phone = 'Phone is required';
        if (!formData.recipient_name.trim()) errors.recipient_name = 'Who is receiving this?';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFinalize = async () => {
        setSubmissionStatus({ state: 'loading' });
        try {
            const preferences = `Tie: ${selectedTie.name}\nPocket Square: ${selectedPocketSquare.name}\nBox: ${selectedBox.name}\nNote: ${note}${appliedPromo ? `\nPromo: ${appliedPromo.code} (${appliedPromo.discount_percentage}% OFF)` : ''}`;
            const selectedItems = [
                { type: 'Tie', ...selectedTie },
                { type: 'Pocket Square', ...selectedPocketSquare },
                { type: 'Box', ...selectedBox },
            ];
            await api.submitGiftRequest({ ...formData, preferences, selected_items: selectedItems });
            setSubmissionStatus({ state: 'success' });
            setStep(4);
        } catch (e) {
            setSubmissionStatus({ state: 'error', message: 'Unable to process your request. Please try again.' });
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
        setPromoCode('');
        setAppliedPromo(null);
        setPromoStatus({ state: 'idle', message: '' });
    };

    return (
        <div className="bg-[#0d3542] text-white min-h-screen">
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-24 md:pt-32 pb-24">
                {/* Header */}
                <header className="max-w-3xl mx-auto text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-6xl leading-tight text-white mb-4"
                    >
                        Custom Gift Set
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-sm md:text-base font-light max-w-md mx-auto leading-relaxed"
                    >
                        Tailor a curated gift set for someone special. Select a tie, pocket square, and presentation box.
                    </motion.p>
                </header>

                <div id="step-indicator-area">
                    {step < 4 && <StepIndicator currentStep={step} />}
                </div>

                <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-7 xl:col-span-8" style={{ overflowAnchor: 'none' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Step 1: Selection */}
                                {step === 1 && (
                                    <div className="space-y-10 pb-12">
                                        {/* Neckwear */}
                                        <div>
                                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                                <h3 className="text-lg font-serif text-white">Select Neckwear</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                                    {selectedTie ? 'Selected' : 'Choose one'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {giftOptions.ties.map((t) => (
                                                    <SelectionCard
                                                        key={t.id}
                                                        item={t}
                                                        isSelected={selectedTie?.id === t.id}
                                                        onSelect={() => setSelectedTie(t)}
                                                        isOutOfStock={outOfStockItems.includes(t.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pocket Square */}
                                        <div>
                                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                                <h3 className="text-lg font-serif text-white">Select Pocket Square</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                                    {selectedPocketSquare ? 'Selected' : 'Choose one'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {giftOptions.pocketSquares.map((p) => (
                                                    <SelectionCard
                                                        key={p.id}
                                                        item={p}
                                                        isSelected={selectedPocketSquare?.id === p.id}
                                                        onSelect={() => setSelectedPocketSquare(p)}
                                                        isOutOfStock={outOfStockItems.includes(p.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Box */}
                                        {availableBoxes.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                                    <h3 className="text-lg font-serif text-white">Select Box</h3>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                                        {selectedBox ? 'Selected' : 'Choose one'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {availableBoxes.map((b) => (
                                                        <SelectionCard
                                                            key={b.id}
                                                            item={b}
                                                            isSelected={selectedBox?.id === b.id}
                                                            onSelect={() => setSelectedBox(b)}
                                                            isOutOfStock={outOfStockItems.includes(b.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={!selectedTie || !selectedPocketSquare || !selectedBox}
                                                className="w-full py-4 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 hover:bg-[#f5a81c]"
                                            >
                                                Continue
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Details */}
                                {step === 2 && (
                                    <div className="space-y-8">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-[#f5a81c] transition-colors"
                                        >
                                            <ArrowLeft size={12} />
                                            Back
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <section className="space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-serif text-white/30">01</span>
                                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f5a81c]">Your Details</h3>
                                                </div>
                                                <CustomInput label="Name" icon={User} placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={formErrors.name} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <CustomInput label="Phone" icon={Phone} placeholder="+855..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={formErrors.phone} />
                                                    <CustomInput label="Age" type="number" placeholder="25" value={formData.sender_age} onChange={e => setFormData({...formData, sender_age: e.target.value})} />
                                                </div>
                                            </section>
                                            <section className="space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-serif text-white/30">02</span>
                                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Recipient</h3>
                                                </div>
                                                <CustomInput label="Recipient Name" icon={Heart} placeholder="Their name" value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} error={formErrors.recipient_name} />
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Title</label>
                                                    <div className="flex gap-3">
                                                        {['Mr', 'Mrs', 'Ms'].map((t) => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setFormData({...formData, recipient_title: t})}
                                                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                                                                    formData.recipient_title === t
                                                                        ? 'bg-white text-black border-white'
                                                                        : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                                                                }`}
                                                            >
                                                                {t}.
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <button
                                            onClick={() => validateStep1() && setStep(3)}
                                            className="w-full py-4 rounded-lg bg-[#f5a81c] text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 flex items-center justify-center gap-3"
                                        >
                                            Review Order
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Step 3: Review */}
                                {step === 3 && (
                                    <div className="space-y-8 bg-white/[0.02] border border-white/10 p-6 md:p-10 rounded-xl">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-[#f5a81c] transition-colors"
                                        >
                                            <ArrowLeft size={12} />
                                            Back
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#f5a81c]/10 flex items-center justify-center border border-[#f5a81c]/20">
                                                <ClipboardCheck className="text-[#f5a81c]" size={18} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-serif text-white">Review Your Order</h2>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Confirm your selections</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-white/10 py-8">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5a81c]">Details</p>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between"><span className="text-white/50">From:</span><span>{formData.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/50">For:</span><span>{formData.recipient_title}. {formData.recipient_name}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/50">Phone:</span><span>{formData.phone}</span></div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Selected Items</p>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between"><span className="text-white/50">Tie:</span><span>{selectedTie?.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/50">Pocket Square:</span><span>{selectedPocketSquare?.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/50">Box:</span><span>{selectedBox?.name}</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Promo Code */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Promo Code</label>
                                            <div className="flex gap-3">
                                                <input
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    disabled={appliedPromo || promoStatus.state === 'loading'}
                                                    placeholder="ENTER CODE"
                                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-sm font-mono tracking-widest outline-none focus:border-[#f5a81c]/30 text-white placeholder-white/20 uppercase"
                                                />
                                                {appliedPromo ? (
                                                    <button
                                                        onClick={() => { setAppliedPromo(null); setPromoCode(''); setPromoStatus({ state: 'idle', message: '' }); }}
                                                        className="px-4 py-3 rounded-lg border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleApplyPromo}
                                                        disabled={!promoCode.trim() || promoStatus.state === 'loading'}
                                                        className="px-5 py-3 rounded-lg border border-[#f5a81c]/30 text-[#f5a81c] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#f5a81c]/10 transition-colors disabled:opacity-50"
                                                    >
                                                        {promoStatus.state === 'loading' ? <Loader size={12} className="animate-spin" /> : 'Apply'}
                                                    </button>
                                                )}
                                            </div>
                                            {promoStatus.message && (
                                                <p className={`text-xs ${promoStatus.state === 'success' ? 'text-green-400' : 'text-red-400'}`}>{promoStatus.message}</p>
                                            )}
                                        </div>

                                        {/* Note */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Personal Note (Optional)</label>
                                            <textarea
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Add a message for the recipient..."
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-sm outline-none focus:border-[#f5a81c]/30 transition-all resize-none text-white placeholder-white/20"
                                                rows={3}
                                            />
                                        </div>

                                        {submissionStatus.state === 'error' && (
                                            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                <AlertTriangle size={14} className="text-red-400" />
                                                <p className="text-xs text-red-300">{submissionStatus.message}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleFinalize}
                                            disabled={submissionStatus.state === 'loading'}
                                            className="w-full py-4 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#f5a81c] transition-all duration-300 flex items-center justify-center gap-3"
                                        >
                                            {submissionStatus.state === 'loading' ? (
                                                <Loader className="animate-spin" size={16} />
                                            ) : (
                                                <>Submit Request</>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Step 4: Success */}
                                {step === 4 && (
                                    <div className="text-center space-y-8 py-16">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 bg-[#f5a81c]/10 rounded-full flex items-center justify-center mx-auto border border-[#f5a81c]/20"
                                        >
                                            <Check size={32} className="text-[#f5a81c]" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-serif text-white mb-3">Request Submitted</h2>
                                            <p className="text-white/50 font-light max-w-sm mx-auto">
                                                Thank you, {formData.name}. We will contact you shortly to confirm your gift set.
                                            </p>
                                        </div>
                                        <button
                                            onClick={resetForm}
                                            className="px-8 py-3 rounded-lg border border-white/20 hover:bg-white hover:text-black transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.3em]"
                                        >
                                            New Order
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Preview */}
                    <div className="lg:col-span-5 xl:col-span-4 sticky top-32 space-y-6 hidden lg:block">
                        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f5a81c]">Your Selection</h4>
                                <ShoppingBag size={14} className="text-white/30" />
                            </div>
                            <div className="space-y-4">
                                <PreviewItem label="Tie" item={selectedTie} />
                                <PreviewItem label="Pocket Square" item={selectedPocketSquare} />
                                <PreviewItem label="Box" item={selectedBox} />
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Total</p>
                                    <div className="flex items-center gap-2">
                                        {appliedPromo && (
                                            <span className="text-sm text-white/30 line-through">${basePrice.toFixed(2)}</span>
                                        )}
                                        <span className="text-2xl font-mono text-white tracking-tight">${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                {appliedPromo && (
                                    <span className="text-xs text-green-400 font-medium">-{appliedPromo.discount_percentage}%</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PreviewItem = ({ label, item }) => (
    <div className="flex items-center gap-3">
        <div className={`w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 ${item ? '' : 'opacity-30'}`}>
            {item && <img src={item.image} className="w-full h-full object-cover" alt="" />}
        </div>
        <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</p>
            <p className={`text-sm font-serif transition-colors ${item ? 'text-white' : 'text-white/20 italic'}`}>
                {item ? item.name : 'Not selected'}
            </p>
            {item && <p className="text-[10px] font-mono text-[#f5a81c]">${item.price}</p>}
        </div>
    </div>
);

export default CustomizeGiftPage;
