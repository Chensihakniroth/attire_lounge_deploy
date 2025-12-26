// resources/js/components/pages/ContactPage.jsx - OFFICIAL ATTIRING LOUNGE CONTACT PAGE (UPDATED)
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Instagram, Facebook } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        appointmentType: 'styling',
        message: '',
        preferredContact: 'telegram'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // OFFICIAL CONTACT INFORMATION FROM WEBSITE
    const officialContactInfo = [
        {
            icon: <Phone className="w-5 h-5 text-attire-charcoal" />,
            title: "Phone & Telegram",
            details: ["(+855) 69-25-63-69"],
            subtitle: "For appointments & inquiries",
            action: "tel:+85569256369"
        },
        {
            icon: <Mail className="w-5 h-5 text-attire-charcoal" />,
            title: "Email",
            details: ["attireloungekh@gmail.com"],
            subtitle: "General inquiries",
            action: "mailto:attireloungekh@gmail.com"
        },
        {
            icon: <MapPin className="w-5 h-5 text-attire-charcoal" />,
            title: "Store Location",
            details: ["10 E0, Street 03", "Sangkat Chey Chumneah", "Khan Daun Penh, Phnom Penh"],
            subtitle: "Cambodia's first sartorial styling house",
            action: "https://maps.google.com"
        },
        {
            icon: <Clock className="w-5 h-5 text-attire-charcoal" />,
            title: "Opening Hours",
            details: ["Monday to Sunday", "10:00 AM - 7:00 PM"],
            subtitle: "By appointment recommended",
            action: null
        }
    ];

    // OFFICIAL APPOINTMENT TYPES FROM WEBSITE SERVICES
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
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

        // Simulate sending to official email
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset form after success
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                appointmentType: 'styling',
                message: '',
                preferredContact: 'telegram'
            });
        }, 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-attire-cream/30 to-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Header with Brand Identity */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-attire-charcoal mb-4">
                        Contact Attire Lounge
                    </h1>
                    <p className="text-lg md:text-xl text-attire-stone max-w-3xl mx-auto mb-6">
                        Cambodia's first sartorial gentlemen's styling house. Experience premium styling
                        with our Milan-certified team.
                    </p>
                    <div className="inline-flex items-center gap-2 text-attire-gold bg-attire-gold/10 px-4 py-2 rounded-full">
                        <span className="text-sm font-medium">Opening Hours: 10AM - 7PM</span>
                        <span className="text-attire-silver">•</span>
                        <span className="text-sm">Mon - Sun</span>
                    </div>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {officialContactInfo.map((info, index) => (
                        <a
                            key={index}
                            href={info.action || '#'}
                            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-attire-silver/20 hover:border-attire-gold/30 block ${
                                !info.action && 'cursor-default'
                            }`}
                            target={info.action ? "_blank" : "_self"}
                            rel={info.action ? "noopener noreferrer" : ""}
                        >
                            <div className="mb-4">
                                {info.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-attire-charcoal mb-2">
                                {info.title}
                            </h3>
                            <div className="space-y-1 mb-3">
                                {info.details.map((detail, idx) => (
                                    <p key={idx} className="text-attire-stone">
                                        {detail}
                                    </p>
                                ))}
                            </div>
                            <p className="text-sm text-attire-silver">
                                {info.subtitle}
                            </p>
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-attire-silver/20">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif text-attire-charcoal mb-2">
                                        Book Your Appointment
                                    </h2>
                                    <p className="text-attire-stone">
                                        Receive free styling consultation upon appointment with our Milan-certified team.
                                    </p>
                                </div>
                                {isSubmitted && (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Message Sent!</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-attire-charcoal mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.name ? 'border-red-300' : 'border-attire-silver'
                                            } focus:border-attire-gold focus:ring-2 focus:ring-attire-gold/20 transition-colors`}
                                            placeholder="Your name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-attire-charcoal mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.email ? 'border-red-300' : 'border-attire-silver'
                                            } focus:border-attire-gold focus:ring-2 focus:ring-attire-gold/20 transition-colors`}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-attire-charcoal mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-attire-silver focus:border-attire-gold focus:ring-2 focus:ring-attire-gold/20 transition-colors"
                                            placeholder="(+855) XX-XX-XX-XX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-attire-charcoal mb-2">
                                            Appointment Type
                                        </label>
                                        <select
                                            name="appointmentType"
                                            value={formData.appointmentType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-attire-silver focus:border-attire-gold focus:ring-2 focus:ring-attire-gold/20 transition-colors appearance-none bg-white"
                                        >
                                            {appointmentTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-attire-charcoal mb-2">
                                        Your Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.message ? 'border-red-300' : 'border-attire-silver'
                                        } focus:border-attire-gold focus:ring-2 focus:ring-attire-gold/20 transition-colors resize-none`}
                                        placeholder="Tell us about your styling needs, preferred styles, or any specific requirements..."
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-attire-charcoal mb-3">
                                            Preferred Contact Method
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { value: 'telegram', label: 'Telegram' },
                                                { value: 'phone', label: 'Phone Call' },
                                                { value: 'email', label: 'Email' }
                                            ].map(method => (
                                                <label key={method.value} className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="preferredContact"
                                                        value={method.value}
                                                        checked={formData.preferredContact === method.value}
                                                        onChange={handleChange}
                                                        className="w-4 h-4 text-attire-gold focus:ring-attire-gold border-attire-silver"
                                                    />
                                                    <span className="ml-2 text-attire-stone">
                                                        {method.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="newsletter"
                                            className="w-4 h-4 mt-1 text-attire-gold focus:ring-attire-gold border-attire-silver rounded"
                                            defaultChecked
                                        />
                                        <label htmlFor="newsletter" className="ml-2 text-sm text-attire-stone">
                                            Subscribe for updates on new collections, events, and exclusive offers
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full md:w-auto px-8 py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                                        isSubmitting
                                            ? 'bg-attire-silver cursor-not-allowed'
                                            : 'bg-attire-charcoal hover:bg-attire-dark hover:scale-105 active:scale-95'
                                    } text-white`}
                                >
                                    <Send className="w-5 h-5" />
                                    {isSubmitting ? 'Sending...' : 'Send Appointment Request'}
                                </button>

                                <p className="text-sm text-attire-silver text-center mt-4">
                                    Or contact us directly via Telegram: (+855) 69-25-63-69
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Information */}
                    <div className="space-y-8">
                        {/* Connect With Us Box */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-attire-silver/20">
                            <h3 className="text-xl font-serif text-attire-charcoal mb-4">Connect With Us</h3>
                            <div className="space-y-3">
                                <a
                                    href="https://instagram.com/attireloungeofficial"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 px-4 py-3 rounded-lg transition-colors"
                                >
                                    <Instagram className="w-5 h-5" />
                                    <span className="font-medium">@attireloungeofficial</span>
                                </a>
                                <a
                                    href="https://facebook.com/attireloungeofficial"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 px-4 py-3 rounded-lg transition-colors"
                                >
                                    <Facebook className="w-5 h-5" />
                                    <span className="font-medium">/attireloungeofficial</span>
                                </a>
                            </div>
                        </div>

                        {/* Prefer Direct Contact Box - Moved to sidebar */}
                        <div className="bg-gradient-to-r from-attire-gold/5 via-attire-cream/10 to-attire-navy/5 rounded-2xl p-6 border border-attire-silver/20">
                            <h3 className="text-xl font-serif text-attire-charcoal mb-3">
                                Prefer Direct Contact?
                            </h3>
                            <p className="text-attire-stone mb-6 text-sm">
                                For immediate assistance or to schedule a same-day appointment, contact us directly.
                            </p>
                            <div className="space-y-3">
                                <a
                                    href="tel:+85569256369"
                                    className="flex items-center justify-center gap-3 bg-attire-charcoal text-white px-4 py-3 rounded-lg font-medium hover:bg-attire-dark transition-all duration-300"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call Now: (+855) 69-25-63-69
                                </a>
                                <a
                                    href="https://t.me/attirelounge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 border border-attire-charcoal text-attire-charcoal px-4 py-3 rounded-lg font-medium hover:bg-attire-charcoal hover:text-white transition-all duration-300"
                                >
                                    <span className="font-semibold">📱</span>
                                    Message on Telegram
                                </a>
                            </div>
                            <p className="mt-4 text-xs text-attire-silver text-center">
                                10 E0, Street 03, Sangkat Chey Chumneah, Khan Daun Penh, Phnom Penh, Cambodia
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
