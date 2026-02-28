// resources/js/components/pages/ContactPage.jsx - ATELIER OVERHAUL (FIXED CONTRAST & INTERACTIVE CARDS)
import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Phone, MapPin, Clock, Send, CheckCircle, 
    Instagram, Facebook, ChevronDown, Check, User, 
    Calendar, Sparkles, ShieldCheck, ArrowRight, ArrowLeft,
    MessageSquare, Heart, Info, Loader
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import axios from 'axios';
import OptimizedImage from '../common/OptimizedImage.jsx';

// --- Premium Animation Constants ---
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

// --- Refined Components ---

const InfoCard = ({ icon: Icon, title, details, action }) => {
    const Component = action ? motion.a : motion.div;
    return (
        <Component 
            href={action}
            target={action?.startsWith('http') ? "_blank" : undefined}
            rel={action?.startsWith('http') ? "noopener noreferrer" : undefined}
            whileHover={{ y: -5 }}
            className="flex items-start gap-6 group p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-attire-accent/30 transition-all duration-500 block w-full text-left"
        >
            <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-2xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center group-hover:bg-attire-accent group-hover:text-black transition-all duration-500">
                <Icon size={20} className="text-attire-accent group-hover:text-black transition-colors" />
            </div>
            <div>
                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-2">{title}</h4>
                <div className="text-sm text-attire-silver group-hover:text-white transition-colors leading-relaxed font-medium">
                    {details.map((line, i) => <p key={i}>{line}</p>)}
                </div>
            </div>
        </Component>
    );
};

const InputField = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        {label && (
            <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-1">
                {label}
            </label>
        )}
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/40 group-focus-within:text-attire-accent transition-colors duration-500">
                    <Icon size={16} />
                </div>
            )}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-14' : 'px-6'} pr-6 py-5 rounded-2xl border bg-white/[0.02] text-white placeholder-white/10 transition-all duration-500 
                ${error 
                    ? 'border-red-500/30 bg-red-500/5 focus:border-red-500' 
                    : 'border-white/10 hover:border-white/20 focus:border-attire-accent/50 focus:bg-white/[0.05]'
                } outline-none text-sm [color-scheme:dark]`}
            />
        </div>
        <AnimatePresence>
            {error && (
                <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, options, value, onChange, name }) => {
    const selected = options.find(o => o.value === value);
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-1">{label}</label>
            <Listbox value={value} onChange={val => onChange({ target: { name, value: val } })}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-2xl border border-white/10 bg-white/[0.02] py-5 pl-6 pr-12 text-left text-white text-sm hover:border-white/20 focus:border-attire-accent/50 transition-all duration-500">
                        <span className="block truncate font-medium">{selected?.label}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                            <ChevronDown className="h-4 w-4 text-white/40" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-[300] mt-3 max-h-80 w-full overflow-auto rounded-[2rem] bg-[#0a0f1a] border border-white/10 py-2 shadow-2xl backdrop-blur-3xl">
                            {options.map((option, idx) => (
                                <Listbox.Option
                                    key={idx}
                                    className={({ active }) => `relative cursor-pointer select-none py-4 px-6 text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-attire-accent text-black' : 'text-attire-silver hover:text-white'}`}
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <div className="flex items-center justify-between">
                                            <span className={selected ? 'font-black' : ''}>{option.label}</span>
                                            {selected && <Check size={14} strokeWidth={4} />}
                                        </div>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

const FavoritesSelector = ({ favoriteProducts, selectedFavorites, onSelectionChange }) => {
    if (favoriteProducts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
                <Heart size={14} className="text-attire-accent" />
                <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Include Favorite Items</label>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-6 rounded-3xl border border-white/10 bg-white/[0.01]">
                {favoriteProducts.map(product => (
                    <motion.div 
                        key={product.id} 
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-500 ${
                            selectedFavorites.includes(product.id) ? 'border-attire-accent shadow-[0_0_20px_rgba(212,168,76,0.15)]' : 'border-white/10 hover:border-white/30'
                        }`}
                        onClick={() => {
                            onSelectionChange(selectedFavorites.includes(product.id) 
                                ? selectedFavorites.filter(id => id !== product.id)
                                : [...selectedFavorites, product.id]);
                        }}
                    >
                        <OptimizedImage 
                            src={product.images[0]} 
                            alt={product.name} 
                            containerClassName="w-full aspect-[3/4]"
                            className={`w-full h-full transition-all duration-1000 ${selectedFavorites.includes(product.id) ? 'scale-110 opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                        />
                        {selectedFavorites.includes(product.id) && (
                            <div className="absolute top-2 right-2 bg-attire-accent text-black rounded-full p-1 shadow-xl z-20">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-2">
                            <p className="text-[8px] text-white text-center truncate font-black tracking-widest uppercase">{product.name}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const ContactPage = () => {
    const contentRef = React.useRef(null);
    const { favorites } = useFavorites();
    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedFavorites, setSelectedFavorites] = useState([]);
    
    const favoriteProducts = allProducts.filter(p => 
        favorites.some(fav => String(fav) === String(p.slug) || String(fav) === String(p.id))
    );

    useEffect(() => {
        axios.get('/api/v1/products', { params: { per_page: 1000, include_hidden: true } })
            .then(res => res.data.success && setAllProducts(res.data.data))
            .catch(console.error)
            .finally(() => setLoadingProducts(false));
    }, []);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', service: 'sartorial',
        date: '', time: '11:00', message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [generatedMessage, setGeneratedMessage] = useState('');

    // Scroll to the content box when manifest is ready 💖
    useEffect(() => {
        if (generatedMessage && contentRef.current) {
            const yOffset = -120;
            const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [generatedMessage]);

    const appointmentTypes = [
        { value: 'sartorial', label: 'Sartorial Consultation' },
        { value: 'groom', label: 'Wedding Styling' },
        { value: 'office', label: 'Executive Wardrobe' },
        { value: 'accessories', label: 'Bespoke Accessories' },
        { value: 'membership', label: 'Attire Club Membership' },
        { value: 'general', label: 'Private Inquiry' }
    ];

    const timeSlots = [
        { value: '11:00', label: '11:00 AM' }, { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '01:00 PM' }, { value: '14:00', label: '02:00 PM' },
        { value: '15:00', label: '03:00 PM' }, { value: '16:00', label: '04:00 PM' },
        { value: '17:00', label: '05:00 PM' },
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
            await axios.post('/api/v1/appointments', submissionData);

            const telegramMessage = `New Request:\n\nName: ${formData.name}\nService: ${appointmentTypes.find(t => t.value === formData.service)?.label}\nDate: ${formData.date} at ${formData.time}\nMessage: ${formData.message}`.trim();
            window.open(`https://t.me/attireloungeofficial?text=${encodeURIComponent(telegramMessage)}`, '_blank');
            setGeneratedMessage(telegramMessage);
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-attire-accent/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-28 sm:py-40">
                {/* Atelier Header */}
                <header className="max-w-3xl mx-auto text-center mb-24">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-8">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/[0.02]">
                            <Sparkles size={14} className="text-attire-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Bespoke Consultations</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif font-light text-white leading-tight">
                            Studio <br/> Appointment
                        </h1>
                        <p className="text-white/80 font-light tracking-wide text-lg max-w-xl mx-auto">
                            Step into our private styling house in Phnom Penh. Let our Milan-certified specialists refine your signature silhouette.
                        </p>
                    </motion.div>
                </header>

                <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start min-h-[1000px] pb-32">
                    
                    {/* Information Sidebar */}
                    <div className="lg:col-span-4 space-y-12 order-2 lg:order-1">
                        <section className="space-y-10">
                            <h3 className="text-[11px] font-black text-attire-accent uppercase tracking-[0.4em] ml-1">The Studio</h3>
                            <div className="space-y-6">
                                <InfoCard icon={Phone} title="Direct Line" details={["(+855) 69-25-63-69"]} action="tel:+85569256369" />
                                <InfoCard icon={Mail} title="Correspondence" details={["attireloungekh@gmail.com"]} action="mailto:attireloungekh@gmail.com" />
                                <InfoCard icon={MapPin} title="Location" details={["10 E0, Street 03, Phnom Penh"]} action="https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7" />
                                <InfoCard icon={Clock} title="Availability" details={["Monday — Sunday", "10:00 AM — 07:00 PM"]} />
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h3 className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em] ml-1">Connect</h3>
                            <div className="flex gap-4">
                                {[
                                    { icon: <Instagram />, href: "https://instagram.com/attireloungeofficial" },
                                    { icon: <Facebook />, href: "https://facebook.com/attireloungeofficial" },
                                    { icon: <Send />, href: "https://t.me/attireloungeofficial" }
                                ].map((s, i) => (
                                    <motion.a key={i} href={s.href} target="_blank" whileHover={{ y: -5, scale: 1.05 }} className="w-14 h-14 bg-white/[0.02] rounded-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-attire-accent transition-colors duration-500">
                                        {React.cloneElement(s.icon, { size: 20 })}
                                    </motion.a>
                                ))}
                            </div>
                        </section>

                        <div className="pt-12 border-t border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] leading-loose">
                                Attire Lounge Official<br/>
                                Sartorial Excellence Cambodia
                            </p>
                        </div>
                    </div>

                    {/* Interaction Main Area */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <AnimatePresence mode="wait">
                            {generatedMessage ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.02] border border-white/10 p-12 md:p-20 rounded-[3rem] text-center backdrop-blur-3xl">
                                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20">
                                        <CheckCircle size={48} className="text-green-400" />
                                    </div>
                                    <h2 className="text-4xl font-serif text-white mb-6">Manifest Prepared</h2>
                                    <p className="text-white/80 mb-12 font-light leading-relaxed">Your request is staged. Please confirm the message in Telegram to finalize your private consultation.</p>
                                    <button onClick={() => setGeneratedMessage('')} className="px-12 py-5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-attire-accent transition-all duration-700 shadow-2xl">
                                        New Request
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/10 p-8 md:p-16 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-attire-accent/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                    
                                    <div className="flex items-center gap-6 mb-16">
                                        <div className="w-14 h-14 rounded-2xl bg-attire-accent/10 flex items-center justify-center border border-attire-accent/20">
                                            <Calendar className="text-attire-accent" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-serif text-white">Styling Inquiry</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mt-1">Book your private session</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <InputField name="name" label="Guest Name" icon={User} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} placeholder="Christian Bale" />
                                            <InputField name="phone" label="Contact Number" icon={Phone} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={errors.phone} placeholder="+855..." />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <SelectField name="service" label="Service Type" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} options={appointmentTypes} />
                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField name="date" type="date" label="Preferred Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} error={errors.date} />
                                                <SelectField name="time" label="Time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} options={timeSlots} />
                                            </div>
                                        </div>

                                        <FavoritesSelector favoriteProducts={favoriteProducts} selectedFavorites={selectedFavorites} onSelectionChange={setSelectedFavorites} />

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 ml-1">
                                                <MessageSquare size={14} className="text-white/60" />
                                                <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Requirements & Notes</label>
                                            </div>
                                            <textarea
                                                name="message"
                                                rows={4}
                                                value={formData.message}
                                                onChange={e => setFormData({...formData, message: e.target.value})}
                                                placeholder="Specific styling needs, event details, or fitting preferences..."
                                                className={`w-full p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] text-white placeholder-white/20 transition-all duration-700 ${errors.message ? 'border-red-500/30' : 'border-white/10 focus:border-attire-accent/30'} outline-none text-sm resize-none italic font-light leading-relaxed`}
                                            />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] transition-all duration-700 flex items-center justify-center gap-4 hover:bg-attire-accent group shadow-2xl"
                                        >
                                            {isSubmitting ? <Loader className="animate-spin" size={20} /> : (
                                                <>
                                                    Dispatch Manifest
                                                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
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
