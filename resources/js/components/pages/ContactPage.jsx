// resources/js/components/pages/ContactPage.jsx - OFFICIAL ATTIRING LOUNGE CONTACT PAGE (UPDATED for Consolidated UI)
import React, { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Instagram, Facebook, ChevronDown, Check } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { products } from '../../data/products';
import axios from 'axios';

// --- Reusable Components (Moved Outside) ---

// Glassy Card Component for consistency
const GlassCard = ({ children, className = '' }) => (
    <div className={`bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl ${className}`}>
        {children}
    </div>
);

// Reusable component for sidebar info items
const InfoItem = ({ icon, title, details, action }) => (
    <div className="flex items-start gap-5 group">
        <div className="mt-1 flex-shrink-0 p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-attire-accent/10 group-hover:border-attire-accent/20 transition-all duration-300">
            {React.cloneElement(icon, { size: 20, className: "text-attire-silver group-hover:text-attire-accent transition-colors" })}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">{title}</h4>
            {action ? (
                <a href={action} target="_blank" rel="noopener noreferrer" className="text-attire-silver hover:text-white transition-colors leading-relaxed">
                    {details.map((line, i) => <p key={i}>{line}</p>)}
                </a>
            ) : (
                 details.map((line, i) => <p key={i} className="text-attire-silver leading-relaxed">{line}</p>)
            )}
        </div>
    </div>
);

// Reusable form field components for a cleaner structure
const InputField = ({ name, label, error, className = '', ...props }) => (
    <div>
        <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">{label}</label>
        <input
            name={name}
            {...props}
            className={`w-full px-4 py-3.5 rounded-2xl border bg-black/40 text-white placeholder-white/20 transition-all
                ${error ? 'border-red-500/50' : 'border-white/10'}
                focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 focus:outline-none 
                [color-scheme:dark] ${className}`} // Forces native date/time pickers to use dark mode
        />
        <AnimatePresence>
            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-1.5 text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ name, label, options, value, onChange }) => {
    const selectedOption = options.find(o => o.value === value);

    return (
        <div>
            <Listbox
                value={value}
                onChange={(newValue) => {
                    onChange({ target: { name, value: newValue } });
                }}
            >
                <Listbox.Label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">{label}</Listbox.Label>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-2xl border bg-black/40 py-3.5 pl-4 pr-10 text-left text-white transition-all border-white/10 focus:outline-none focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30">
                        <span className="block truncate">{selectedOption?.label}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="h-5 w-5 text-attire-silver" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 py-1 text-base shadow-2xl focus:outline-none sm:text-sm">
                            {options.map((option, optionIdx) => (
                                <Listbox.Option
                                    key={optionIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${ 
                                            active ? 'bg-attire-accent/20 text-attire-accent font-medium' : 'text-attire-silver hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-semibold text-white' : 'font-normal'}`}>
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-attire-accent">
                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
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

const TextareaField = ({ name, label, error, ...props }) => (
    <div>
        <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-2 ml-1">{label}</label>
        <textarea
            name={name}
            rows={4}
            {...props}
            className={`w-full px-4 py-3.5 rounded-2xl border bg-black/40 text-white placeholder-white/20 transition-all resize-none
                ${error ? 'border-red-500/50' : 'border-white/10'}
                focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 focus:outline-none`}
        />
        <AnimatePresence>
            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-1.5 text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const FavoritesSelector = ({ favoriteProducts, selectedFavorites, onSelectionChange }) => {
    if (favoriteProducts.length === 0) return null;

    const handleCheckboxChange = (productId) => {
        if (selectedFavorites.includes(productId)) {
            onSelectionChange(selectedFavorites.filter(id => id !== productId));
        } else {
            onSelectionChange([...selectedFavorites, productId]);
        }
    };

    return (
        <div className="mt-2">
            <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest mb-3 ml-1">Include Favorited Items</label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 rounded-2xl border bg-black/20 border-white/5">
                {favoriteProducts.map(product => (
                    <div 
                        key={product.id} 
                        className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                            selectedFavorites.includes(product.id) ? 'border-attire-accent shadow-[0_0_15px_rgba(212,168,76,0.2)]' : 'border-white/5 hover:border-white/20'
                        }`}
                        onClick={() => handleCheckboxChange(product.id)}
                    >
                        <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className={`w-full aspect-[4/5] object-cover transition-all duration-500 group-hover:scale-110 ${
                                selectedFavorites.includes(product.id) ? 'opacity-100 brightness-110' : 'opacity-80 group-hover:opacity-100'
                            }`}
                        />
                        
                        {selectedFavorites.includes(product.id) && (
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute top-2 right-2 bg-attire-accent text-black rounded-full p-1 shadow-lg z-20"
                            >
                                <Check size={14} strokeWidth={4} />
                            </motion.div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-4">
                            <p className="text-[10px] text-white text-center truncate font-semibold tracking-wide uppercase">{product.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ContactPage = () => {
    const { favorites } = useFavorites();
    const favoriteProducts = products.filter(p => favorites.includes(p.id));
    const [selectedFavorites, setSelectedFavorites] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: 'sartorial',
        date: '',
        time: '11:00',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [generatedMessage, setGeneratedMessage] = useState('');

    const officialContactInfo = [
        {
            icon: <Phone />,
            title: "Phone",
            details: ["(+855) 69-25-63-69"],
            action: "tel:+85569256369"
        },
        {
            icon: <Mail />,
            title: "Email",
            details: ["attireloungekh@gmail.com"],
            action: "mailto:attireloungekh@gmail.com"
        },
        {
            icon: <MapPin />,
            title: "Store Location",
            details: ["10 E0, Street 03, Phnom Penh"],
            action: "https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7"
        },
        {
            icon: <Clock />,
            title: "Opening Hours",
            details: ["Mon - Sun: 10AM - 7PM"],
            action: null
        }
    ];

    const appointmentTypes = [
        { value: 'sartorial', label: 'Sartorial Consultation' },
        { value: 'groom', label: 'Groom & Groomsmen Styling' },
        { value: 'office', label: 'Office Wear Consultation' },
        { value: 'accessories', label: 'Accessories Styling' },
        { value: 'membership', label: 'Attire Club Membership' },
        { value: 'general', label: 'General Inquiry' }
    ];

    const timeSlots = [
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '01:00 PM' },
        { value: '14:00', label: '02:00 PM' },
        { value: '15:00', label: '03:00 PM' },
        { value: '16:00', label: '04:00 PM' },
        { value: '17:00', label: '05:00 PM' },
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Please enter your name';
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Please enter your phone number';
        if (!formData.date) newErrors.date = 'Required';
        if (!formData.time) newErrors.time = 'Required';
        if (!formData.message.trim()) newErrors.message = 'Please include your message';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const messageBody = formData.message;

            try {
                let favoriteItems = selectedFavorites.map(favId => {
                    const product = products.find(p => p.id === favId);
                    return product ? { 
                        image: product.images[0] || null, 
                        name: product.name 
                    } : null;
                }).filter(item => item !== null && item.image !== null);

                const submissionData = {
                    ...formData,
                    message: messageBody,
                    preferred_date: formData.date,
                    preferred_time: formData.time,
                    favorite_item_image_url: favoriteItems,
                };
                await axios.post('/api/v1/appointments', submissionData);
            } catch (dbError) {
                console.error("Could not save appointment to database:", dbError);
            }

            const telegramMessage = `
New Appointment Request:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Service: ${appointmentTypes.find(type => type.value === formData.service)?.label || formData.service}
Date: ${formData.date}
Time: ${timeSlots.find(slot => slot.value === formData.time)?.label || formData.time}
Message: ${messageBody}
            `.trim();

            const telegramUrl = `https://t.me/attireloungeofficial?text=${encodeURIComponent(telegramMessage)}`;
            window.open(telegramUrl, '_blank');
            setGeneratedMessage(`Your request has been prepared. Please send the pre-filled message in Telegram to finalize.\n\nMessage preview:\n\n${telegramMessage}`);

        } catch (error) {
            console.error("Error:", error);
            alert('Failed to process. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    return (
        <div className="min-h-screen bg-attire-navy relative">
            {/* Background Orbs - Softened */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">Contact</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-attire-silver max-w-2xl mx-auto font-light leading-relaxed">
                            Ready to redefine your style? Reach out to schedule a Milan-certified styling consultation or visit our store in Phnom Penh.
                        </p>
                    </motion.div>
                </div>

                <GlassCard className="p-1 md:p-2 lg:p-3 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                        
                        {/* Form Section */}
                        <div className="lg:col-span-8 p-8 md:p-12">
                            {generatedMessage ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col justify-center"
                                >
                                    <div className="w-16 h-16 bg-attire-accent/20 rounded-full flex items-center justify-center mb-8 border border-attire-accent/30">
                                        <Check size={32} className="text-attire-accent" />
                                    </div>
                                    <h2 className="text-3xl font-serif text-white mb-4">Request Ready</h2>
                                    <p className="text-attire-silver mb-8 leading-relaxed">
                                        We've prepared your appointment request. If the Telegram app didn't open automatically, please use the text below.
                                    </p>
                                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
                                        <pre className="text-attire-silver whitespace-pre-wrap text-sm leading-relaxed italic">{generatedMessage}</pre>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setGeneratedMessage('');
                                            setFormData({ name: '', email: '', phone: '', service: 'sartorial', date: '', time: '', message: '' });
                                            setSelectedFavorites([]);
                                        }}
                                        className="w-fit px-10 py-4 rounded-full font-semibold transition-all duration-300 bg-attire-accent text-black hover:bg-white"
                                    >
                                        Start New Request
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField name="name" label="Full Name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Christian Bale" />
                                        <InputField name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} error={errors.email} placeholder="bruce@wayne.com" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField name="phone" type="tel" label="Phone Number" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="(+855) 69-25-63-69" />
                                        <SelectField name="service" label="Service Type" value={formData.service} onChange={handleChange} options={appointmentTypes} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField name="date" type="date" label="Preferred Date" value={formData.date} onChange={handleChange} error={errors.date} />
                                        <SelectField name="time" label="Preferred Time" value={formData.time} onChange={handleChange} options={timeSlots} />
                                    </div>

                                    <FavoritesSelector
                                        favoriteProducts={favoriteProducts}
                                        selectedFavorites={selectedFavorites}
                                        onSelectionChange={setSelectedFavorites}
                                    />

                                    <TextareaField name="message" label="Message & Requirements" value={formData.message} onChange={handleChange} error={errors.message} placeholder="Specific styling needs, event type, or fitting preferences..." />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group relative inline-flex items-center gap-3 bg-attire-accent text-black font-bold px-10 py-4 rounded-full overflow-hidden transition-all hover:bg-white hover:pr-12 disabled:bg-attire-silver/30 disabled:cursor-not-allowed"
                                    >
                                        <span>{isSubmitting ? 'Processing...' : 'Send to Telegram'}</span>
                                        {!isSubmitting && <Send className="w-5 h-5 absolute right-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300" />}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 p-8 md:p-12 lg:border-l border-white/10 flex flex-col justify-between space-y-16">
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <h3 className="text-xs font-bold text-attire-accent uppercase tracking-[0.3em]">Information</h3>
                                    <div className="space-y-8">
                                        {officialContactInfo.map(info => (
                                            <InfoItem key={info.title} icon={info.icon} title={info.title} details={info.details} action={info.action} />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-xs font-bold text-attire-accent uppercase tracking-[0.3em]">Connect</h3>
                                    <div className="flex items-center gap-4">
                                        {[
                                            { icon: <Instagram />, href: "https://instagram.com/attireloungeofficial", color: "hover:text-pink-400" },
                                            { icon: <Facebook />, href: "https://facebook.com/attireloungeofficial", color: "hover:text-blue-400" },
                                            { icon: <Send />, href: "https://t.me/attireloungeofficial", color: "hover:text-blue-300" }
                                        ].map((social, i) => (
                                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-4 bg-white/5 rounded-2xl border border-white/5 text-attire-silver transition-all duration-300 ${social.color} hover:bg-white/10 hover:scale-110`}>
                                                {React.cloneElement(social.icon, { size: 24 })}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-white/5">
                                <p className="text-[10px] text-attire-silver/40 uppercase tracking-[0.2em] leading-relaxed">
                                    Attire Lounge Official<br/>
                                    Sartorial Excellence Cambodia
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ContactPage;