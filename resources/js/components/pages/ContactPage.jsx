// resources/js/components/pages/ContactPage.jsx - CLEAN EDITORIAL REVAMP
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Phone, MapPin, Clock, Send, CheckCircle,
    Instagram, Facebook, ChevronDown, Check, User,
    Calendar, ArrowRight, MessageSquare, Heart, Loader
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import API from '../../api';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { isSafari } from '../../helpers/browserUtils.js';
import { useProducts } from '../../hooks/useProducts';
import DatePicker from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/time-picker';
import { format, parse } from 'date-fns';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const InfoCard = ({ icon: Icon, title, details, action }) => {
    const Component = action ? motion.a : motion.div;
    return (
        <Component
            href={action}
            target={action?.startsWith('http') ? "_blank" : undefined}
            rel={action?.startsWith('http') ? "noopener noreferrer" : undefined}
            whileHover={{ y: -4 }}
            className="flex items-start gap-4 group p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#f5a81c]/30 transition-all duration-300 w-full text-left"
        >
            <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-lg bg-[#f5a81c]/10 border border-[#f5a81c]/20 flex items-center justify-center group-hover:bg-[#f5a81c] group-hover:text-black transition-all duration-300">
                <Icon size={16} className="text-[#f5a81c] group-hover:text-black transition-colors" />
            </div>
            <div>
                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">{title}</h4>
                <div className="text-sm text-white/50 group-hover:text-white/80 transition-colors leading-relaxed">
                    {details.map((line, i) => <p key={i}>{line}</p>)}
                </div>
            </div>
        </Component>
    );
};

const InputField = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        {label && (
            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">
                {label}
            </label>
        )}
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#f5a81c] transition-colors duration-300">
                    <Icon size={14} />
                </div>
            )}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3.5 rounded-lg border bg-white/[0.02] text-white placeholder-white/20 transition-all duration-300
                ${error
                    ? 'border-red-500/30 focus:border-red-500'
                    : 'border-white/10 hover:border-white/20 focus:border-[#f5a81c]/50 focus:bg-white/[0.04]'
                } outline-none text-sm [color-scheme:dark]`}
            />
        </div>
        <AnimatePresence>
            {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, options, value, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.value === value);

    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-lg border border-white/10 bg-white/[0.02] py-3.5 pl-4 pr-10 text-left text-white text-sm hover:border-white/20 focus:border-[#f5a81c]/50 transition-all duration-300"
                >
                    <span className="block truncate">{selected?.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className={`h-4 w-4 text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                </button>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 mt-2 w-full rounded-lg bg-[#1a1a1a] border border-white/10 overflow-hidden"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange({ target: { name, value: opt.value } }); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                    value === opt.value
                                        ? 'text-[#f5a81c] bg-white/5'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const FavoritesSelector = ({ favoriteProducts, selectedFavorites, onSelectionChange }) => {
    if (favoriteProducts.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
                <Heart size={12} className="text-[#f5a81c]" />
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Include Favorite Items</label>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.01]">
                {favoriteProducts.map(product => (
                    <motion.div
                        key={product.id}
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            selectedFavorites.includes(product.id) ? 'border-[#f5a81c]' : 'border-white/10 hover:border-white/30'
                        }`}
                        onClick={() => {
                            onSelectionChange(selectedFavorites.includes(product.id)
                                ? selectedFavorites.filter(id => id !== product.id)
                                : [...selectedFavorites, product.id]);
                        }}
                    >
                        <OptimizedImage
                            src={product.images?.[0] || ''}
                            alt={product.name}
                            containerClassName="w-full aspect-[3/4]"
                            className="w-full h-full object-cover"
                        />
                        {selectedFavorites.includes(product.id) && (
                            <div className="absolute top-1.5 right-1.5 bg-[#f5a81c] text-black rounded-full p-0.5 z-20">
                                <Check size={8} strokeWidth={4} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-1.5">
                            <p className="text-[8px] text-white text-center truncate font-medium">{product.name}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ContactPage = () => {
    const contentRef = React.useRef(null);
    const { favorites } = useFavorites();
    const { data: productsData, isLoading: loadingProducts } = useProducts({ per_page: 1000, include_hidden: true });
    const allProducts = productsData?.data || [];
    const [selectedFavorites, setSelectedFavorites] = useState([]);
    const [isSafariBrowser, setIsSafariBrowser] = useState(false);

    useEffect(() => {
        setIsSafariBrowser(isSafari());
    }, []);

    const favoriteProducts = allProducts.filter(p =>
        favorites.some(fav => String(fav) === String(p.slug) || String(fav) === String(p.id))
    );

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', service: 'sartorial',
        date: '', time: '11:00', message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [generatedMessage, setGeneratedMessage] = useState('');

    useEffect(() => {
        if (generatedMessage && contentRef.current) {
            const yOffset = -120;
            const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [generatedMessage]);

    const appointmentTypes = [
        { value: 'sartorial', label: 'Sartorial Consultation' },
        { value: 'groom', label: 'Groom Consultation' },
        { value: 'office', label: 'Office Consultation' },
        { value: 'accessories', label: 'Accessories' }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.message.trim()) newErrors.message = 'Please provide details';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            let favoriteItems = selectedFavorites.map(favId => {
                const product = allProducts.find(p => p.id === favId);
                return product ? { image: product.images[0] || null, name: product.name } : null;
            }).filter(item => item && item.image);

            const submissionData = {
                ...formData,
                preferred_date: formData.date,
                preferred_time: formData.time,
                favorite_item_image_url: favoriteItems,
            };
            await API.bookAppointment(submissionData);
            setGeneratedMessage('success');
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0d3542] relative min-h-screen">
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-24 md:pt-32 pb-24 md:pb-32">
                {/* Header */}
                <header className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-white mb-4">
                            Book an Appointment
                        </h1>
                        <p className="text-white/50 text-sm md:text-base font-light max-w-md mx-auto leading-relaxed">
                            Visit our styling house in Phnom Penh. Book a free consultation with our expert team.
                        </p>
                    </motion.div>
                </header>

                <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold text-[#f5a81c] uppercase tracking-[0.3em] ml-1">Visit Us</h3>
                            <div className="space-y-3">
                                <InfoCard icon={Phone} title="Phone" details={["(+855) 69 25 63 69"]} action="tel:+85569256369" />
                                <InfoCard icon={Mail} title="Email" details={["attireloungekh@gmail.com"]} action="mailto:attireloungekh@gmail.com" />
                                <InfoCard icon={MapPin} title="Address" details={["10 E0, Street 03, Phnom Penh"]} action="https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7" />
                                <InfoCard icon={Clock} title="Hours" details={["Monday — Sunday", "10:00 AM — 07:00 PM"]} />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] ml-1">Follow</h3>
                            <div className="flex gap-3">
                                {[
                                    { icon: <Instagram />, href: "https://instagram.com/attireloungeofficial" },
                                    { icon: <Facebook />, href: "https://facebook.com/attireloungeofficial" },
                                    { icon: <Send />, href: "https://t.me/attireloungeofficial" }
                                ].map((s, i) => (
                                    <motion.a key={i} href={s.href} target="_blank" whileHover={{ y: -3 }} className="w-11 h-11 bg-white/[0.02] rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-[#f5a81c] transition-colors duration-300">
                                        {React.cloneElement(s.icon, { size: 16 })}
                                    </motion.a>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <AnimatePresence mode="wait">
                            {generatedMessage ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.02] border border-white/10 p-12 md:p-16 rounded-xl text-center">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                        <CheckCircle size={40} className="text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-serif text-white mb-4">Request Confirmed</h2>
                                    <p className="text-white/60 mb-10 font-light leading-relaxed">Your appointment request has been submitted. We will contact you shortly.</p>
                                    <button onClick={() => setGeneratedMessage('')} className="px-10 py-4 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#f5a81c] transition-all duration-300">
                                        New Request
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/10 p-6 md:p-12 rounded-xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-11 h-11 rounded-lg bg-[#f5a81c]/10 flex items-center justify-center border border-[#f5a81c]/20">
                                            <Calendar className="text-[#f5a81c]" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-serif text-white">Styling Inquiry</h2>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-0.5">Book your session</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField name="name" label="Name" icon={User} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} placeholder="Your name" />
                                            <InputField name="phone" label="Phone" icon={Phone} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={errors.phone} placeholder="+855..." />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SelectField name="service" label="Service" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} options={appointmentTypes} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Date</label>
                                                    <DatePicker
                                                        name="date"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                        error={errors.date}
                                                        minDate={new Date().toISOString().split('T')[0]}
                                                        inputClassName="py-3.5 rounded-lg border-white/10 bg-white/[0.02] text-sm text-white pl-11 h-[50px]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Time</label>
                                                    <TimePicker
                                                        use12HourFormat={true}
                                                        value={formData.time ? parse(formData.time, 'HH:mm', new Date()) : new Date()}
                                                        onChange={(date) => setFormData({...formData, time: format(date, 'HH:mm')})}
                                                        className="py-3.5 rounded-lg border-white/10 bg-white/[0.02] text-sm text-white pl-11"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <FavoritesSelector favoriteProducts={favoriteProducts} selectedFavorites={selectedFavorites} onSelectionChange={setSelectedFavorites} />

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <MessageSquare size={12} className="text-white/40" />
                                                <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Notes</label>
                                            </div>
                                            <textarea
                                                name="message"
                                                rows={4}
                                                value={formData.message}
                                                onChange={e => setFormData({...formData, message: e.target.value})}
                                                placeholder="Styling needs, event details, or preferences..."
                                                className={`w-full p-5 rounded-lg border border-white/10 bg-white/[0.02] text-white placeholder-white/20 transition-all duration-300 ${errors.message ? 'border-red-500/30' : 'border-white/10 focus:border-[#f5a81c]/30'} outline-none text-sm resize-none leading-relaxed`}
                                            />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 hover:bg-[#f5a81c]"
                                        >
                                            {isSubmitting ? <Loader className="animate-spin" size={16} /> : (
                                                <>
                                                    Submit Request
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
