// resources/js/components/pages/ContactPage.jsx - OFFICIAL ATTIRING LOUNGE CONTACT PAGE (UPDATED for Consolidated UI)
import React, { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Instagram, Facebook, ChevronDown, Check } from 'lucide-react';

// --- Reusable Components (Moved Outside) ---

// Glassy Card Component for consistency
const GlassCard = ({ children, className = '' }) => (
    <div className={`bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg ${className}`}>
        {children}
    </div>
);

// Reusable component for sidebar info items
const InfoItem = ({ icon, title, details, action }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">{icon}</div>
        <div>
            <h4 className="font-semibold text-attire-cream">{title}</h4>
            {action ? (
                <a href={action} target="_blank" rel="noopener noreferrer" className="text-attire-silver hover:text-white transition-colors">
                    {details.map((line, i) => <p key={i}>{line}</p>)}
                </a>
            ) : (
                 details.map((line, i) => <p key={i} className="text-attire-silver">{line}</p>)
            )}
        </div>
    </div>
);

// Reusable form field components for a cleaner structure
const InputField = ({ name, label, error, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-attire-cream mb-2">{label}</label>
        <input
            name={name}
            {...props}
            className={`w-full px-4 py-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 transition-colors
                ${error ? 'border-red-500' : 'border-white/10'}
                focus:border-white focus:ring-1 focus:ring-white`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const SelectField = ({ name, label, options, value, onChange }) => {
    // Find the full option object based on the current value
    const selectedOption = options.find(o => o.value === value);

    return (
        <div>
            <Listbox
                value={value}
                onChange={(newValue) => {
                    // Adapt to the existing handleChange which expects an event-like object
                    onChange({ target: { name, value: newValue } });
                }}
            >
                <Listbox.Label className="block text-sm font-medium text-attire-cream mb-2">{label}</Listbox.Label>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg border bg-attire-dark/50 py-3 pl-4 pr-10 text-left text-attire-cream transition-colors border-white/10 focus:outline-none focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white">
                        <span className="block truncate">{selectedOption?.label}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-5 w-5 text-attire-silver" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-attire-dark/80 backdrop-blur-lg py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options.map((option, optionIdx) => (
                                <Listbox.Option
                                    key={optionIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-white/10 text-white' : 'text-attire-cream'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
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
        <label className="block text-sm font-medium text-attire-cream mb-2">{label}</label>
        <textarea
            name={name}
            rows={5}
            {...props}
            className={`w-full px-4 py-3 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 transition-colors resize-none
                ${error ? 'border-red-500' : 'border-white/10'}
                focus:border-white focus:ring-1 focus:ring-white`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const SocialLink = ({ href, icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-attire-silver hover:text-white hover:scale-110 transition-all"
    >
        {icon}
    </a>
);

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        appointmentType: 'sartorial',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // Define icon style once
    const iconStyle = "w-6 h-6 text-attire-cream";

    const officialContactInfo = [
        {
            icon: <Phone className={iconStyle} />,
            title: "Phone & Telegram",
            details: ["(+855) 69-25-63-69"],
            action: "tel:+85569256369"
        },
        {
            icon: <Mail className={iconStyle} />,
            title: "Email",
            details: ["attireloungekh@gmail.com"],
            action: "mailto:attireloungekh@gmail.com"
        },
        {
            icon: <MapPin className={iconStyle} />,
            title: "Store Location",
            details: ["10 E0, Street 03", "Sangkat Chey Chumneah", "Khan Daun Penh, Phnom Penh"],
            action: "https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7" // Update with actual maps link
        },
        {
            icon: <Clock className={iconStyle} />,
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Please enter your name';
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.message.trim()) newErrors.message = 'Please include your message';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', phone: '', appointmentType: 'sartorial', message: '' });
        }, 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };
    
    return (
        <div className="min-h-screen bg-attire-navy py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Simplified Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-attire-silver max-w-2xl mx-auto">
                        We're here to help you define your style. Reach out for appointments or inquiries.
                    </p>
                </div>
                
                {/* Form and Connect Section */}
                <GlassCard className="p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-serif text-white mb-1">
                                        Book an Appointment
                                    </h2>
                                    <p className="text-attire-silver">
                                        Free consultation with our Milan-certified team.
                                    </p>
                                </div>
                                {isSubmitted && (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Sent!</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="name" label="Full Name *" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Your Name" />
                                    <InputField name="email" type="email" label="Email Address *" value={formData.email} onChange={handleChange} error={errors.email} placeholder="your.email@example.com" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="phone" type="tel" label="Phone Number" value={formData.phone} onChange={handleChange} placeholder="(+855) XX-XX-XX-XX" />
                                    <SelectField name="appointmentType" label="Appointment Type" value={formData.appointmentType} onChange={handleChange} options={appointmentTypes} />
                                </div>

                                <TextareaField name="message" label="Your Message *" value={formData.message} onChange={handleChange} error={errors.message} placeholder="Tell us about your styling needs..." />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                    {isSubmitting ? 'Sending...' : 'Request Appointment'}
                                </button>
                            </form>
                        </div>

                        {/* Consolidated Sidebar Information */}
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    {officialContactInfo.map(info => (
                                        <InfoItem key={info.title} icon={info.icon} title={info.title} details={info.details} action={info.action} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-6">Connect With Us</h3>
                                <div className="flex items-center gap-4">
                                    <SocialLink href="https://instagram.com/attireloungeofficial" icon={<Instagram className="w-6 h-6" />} />
                                    <SocialLink href="https://facebook.com/attireloungeofficial" icon={<Facebook className="w-6 h-6" />} />
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ContactPage;
