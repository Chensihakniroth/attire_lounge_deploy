import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock,
  Instagram, Facebook, MessageSquare, Send,
  ArrowRight, Check, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [adminClickCount, setAdminClickCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (adminClickCount > 0) {
      const timer = setTimeout(() => setAdminClickCount(0), 1000); // Reset after 1 second
      return () => clearTimeout(timer);
    }
  }, [adminClickCount]);

  const handleAdminClick = () => {
    const newClickCount = adminClickCount + 1;
    setAdminClickCount(newClickCount);
    if (newClickCount >= 5) {
      navigate('/admin/login');
      setAdminClickCount(0);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscribeStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/newsletter-subscriptions', { email });
      setSubscribeStatus('success');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setEmail('');
      }, 3000);
    } catch (error) {
      setSubscribeStatus('error');
      if (error.response && error.response.status === 422) {
        setErrorMessage(error.response.data.message || 'This email is already subscribed.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
      setTimeout(() => {
        setSubscribeStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black backdrop-blur-md text-white border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Company Information - Left Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-light tracking-widest mb-3">
                ATTIRE<span className="font-medium">LOUNGE</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                First Gentlemen's Styling House in Cambodia.
                Premium sartorial collections and personal styling services.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-white/60 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  10 E0, Street 03, Sangkat Chey Chumneah,<br />
                  Khan Daun Penh, Phnom Penh
                </p>
              </div>
               <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                <a
                  href="tel:+85569256369"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  (+855) 69-25-63-69
                </a>
              </div>
               <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                <a
                  href="mailto:attireloungekh@gmail.com"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  attireloungekh@gmail.com
                </a>
              </div>
               <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/60 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  10:00 AM - 7:00 PM, Daily
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links - Middle Columns */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest mb-6 text-white/90">
                Collections
              </h3>
              <ul className="space-y-4">
                {[
                  { name: 'Sartorial', path: '/collections/sartorial' },
                  { name: 'Groom', path: '/collections/groom' },
                  { name: 'Office', path: '/collections/office' },
                  { name: 'Accessories', path: '/collections/accessories' },
                  { name: 'New Arrivals', path: '/collections/new-arrivals' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="group flex items-center text-white/70 hover:text-white transition-colors text-sm"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest mb-6 text-white/90">
                Information
              </h3>
              <ul className="space-y-4">
                {[
                  { name: 'About Us', path: '/about' },
                  { name: 'Appointments', path: '/appointment' },
                  { name: 'Attire Club', path: '/membership' },
                  { name: 'Lookbook', path: '/lookbook' },
                  { name: 'Contact', path: '/contact' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="group flex items-center text-white/70 hover:text-white transition-colors text-sm"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter & Social Media - Right Column */}
          <div className="space-y-8">
            {/* Newsletter Signup */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest mb-6 text-white/90">
                Stay Updated
              </h3>
              <p className="text-white/70 text-sm mb-6">
                Subscribe for exclusive collections, styling tips, and members-only offers.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    required
                    disabled={subscribeStatus === 'loading'}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full text-black py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    subscribeStatus === 'success' ? 'bg-green-400' :
                    subscribeStatus === 'error' ? 'bg-red-500' :
                    'bg-white hover:bg-gray-100'
                  }`}
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                >
                  {subscribeStatus === 'idle' && <><Send className="w-4 h-4" /> Subscribe</>}
                  {subscribeStatus === 'loading' && 'Subscribing...'}
                  {subscribeStatus === 'success' && <><Check className="w-4 h-4" /> Subscribed!</>}
                  {subscribeStatus === 'error' && <><AlertTriangle className="w-4 h-4" /> Error</>}
                </motion.button>
              </form>
              {errorMessage && <p className="text-red-400 text-xs mt-2">{errorMessage}</p>}
            </div>

            {/* Social Media */}
            <div>
               <h3 className="text-sm font-medium uppercase tracking-widest mb-6 text-white/90">
                Connect With Us
              </h3>
               <div className="flex items-center gap-4">
                {[
                  {
                    icon: Instagram,
                    label: 'Instagram',
                    url: 'https://instagram.com/attireloungeofficial',
                    color: 'hover:bg-pink-500/20 hover:border-pink-500/30'
                  },
                  {
                    icon: Facebook,
                    label: 'Facebook',
                    url: 'https://facebook.com/attireloungeofficial',
                    color: 'hover:bg-blue-500/20 hover:border-blue-500/30'
                  },
                  {
                    icon: MessageSquare,
                    label: 'Telegram',
                    url: 'https://t.me/attireloungeofficial',
                    color: 'hover:bg-blue-400/20 hover:border-blue-400/30'
                  },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className={`p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all ${social.color}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-white/80" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Copyright & Legal Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left cursor-pointer" onClick={handleAdminClick}>
              <p className="text-white/60 text-sm">
                © {currentYear} Attire Lounge Official. All rights reserved.
              </p>
              <p className="text-white/40 text-xs mt-1">
                First Gentlemen's Styling House in Cambodia
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Return Policy', path: '/returns' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Membership Note */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-xs">
              Attire Club Membership available with minimum purchase of US$500.
              <Link to="/membership" className="ml-1 text-white/60 hover:text-white transition-colors">
                Learn more →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
