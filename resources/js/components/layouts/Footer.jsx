import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock,
  Instagram, Facebook, MessageSquare, Send,
  ArrowRight, Check, AlertTriangle, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import minioBaseUrl from '../../config.js'; // Ensure correct import path

const Footer = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
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
    if (!phoneNumber) return;

    setSubscribeStatus('loading');
    setErrorMessage('');

    try {
      await api.subscribeNewsletter({ phone_number: phoneNumber });
      setSubscribeStatus('success');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setPhoneNumber('');
      }, 3000);
      } catch (error) {
      setSubscribeStatus('error');
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
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
    <footer className="bg-black text-white border-t border-white/5 relative overflow-hidden font-light">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-attire-navy/20 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-attire-accent/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Company Brand & Contact - Spans 4 columns */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <Link to="/" className="inline-block group">
                 <h2 className="text-2xl md:text-3xl font-serif tracking-[0.2em] text-white hover:text-attire-accent transition-colors duration-300 uppercase">
                  Attire Lounge Official
                </h2>
                <div className="h-0.5 w-12 bg-attire-accent mt-2 group-hover:w-full transition-all duration-500 ease-out" />
              </Link>
              <p className="text-attire-silver/80 text-sm leading-relaxed max-w-md font-light">
                Cambodia's first gentlemen's styling house. We don't just sell clothes; we craft identities through premium sartorial collections and expert styling.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-5">
               <a 
                 href="https://maps.app.goo.gl/vZbPnCNMmmiKcR9g7" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="flex items-start gap-4 group"
               >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-attire-accent/20 transition-colors">
                    <MapPin className="w-4 h-4 text-attire-accent" />
                </div>
                <p className="text-sm text-attire-silver leading-relaxed group-hover:text-white transition-colors">
                  10 E0, Street 03, Sangkat Chey Chumneah,<br />
                  Khan Daun Penh, Phnom Penh
                </p>
              </a>
               <div className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-attire-accent/20 transition-colors">
                    <Phone className="w-4 h-4 text-attire-accent" />
                </div>
                <a href="tel:+85569256369" className="text-sm text-attire-silver hover:text-white transition-colors">
                  (+855) 69-25-63-69
                </a>
              </div>
               <div className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-attire-accent/20 transition-colors">
                    <Mail className="w-4 h-4 text-attire-accent" />
                </div>
                <a href="mailto:attireloungekh@gmail.com" className="text-sm text-attire-silver hover:text-white transition-colors">
                  attireloungekh@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Links Section - Spans 4 columns (2+2 internal grid) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 lg:px-8">
            {/* Collections */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">Collections</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Havana', path: '/products?collection=havana-collection' },
                  { name: 'Mocha Mousse', path: '/products?collection=mocha-mousse-25' },
                  { name: 'Groom', path: '/products?collection=groom-collection' },
                  { name: 'Office', path: '/products?collection=office-collection' },
                  { name: 'Accessories', path: '/products?collection=accessories' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="group flex items-center text-attire-silver hover:text-white transition-all text-sm">
                      <ChevronRight className="w-3 h-3 text-attire-accent opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                      <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discover */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">Discover</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Attire Club', path: '/#membership' },
                  { name: 'Lookbook', path: '/lookbook' },
                  { name: 'Tips & Tricks', path: '/#tips-tricks' }, // Assuming anchor exists or will exist
                  { name: 'Contact Us', path: '/contact' },
                  { name: 'Book Appointment', path: '/contact' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="group flex items-center text-attire-silver hover:text-white transition-all text-sm">
                       <ChevronRight className="w-3 h-3 text-attire-accent opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                      <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter - Spans 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-serif text-white mb-2">The Gentleman's Digest</h3>
              <p className="text-attire-silver/70 text-xs mb-6 leading-relaxed">
                Join our exclusive Telegram VIP group for early access to new drops, styling guides, and member-only privileges.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative group">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-attire-accent transition-colors" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Telegram Phone Number"
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-attire-accent/50 focus:bg-black/60 transition-all"
                    required
                    disabled={subscribeStatus === 'loading'}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className={`w-full py-3 rounded-lg font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                    subscribeStatus === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    subscribeStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-attire-navy hover:bg-attire-navy/90 text-white shadow-lg shadow-attire-navy/20'
                  }`}
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                >
                  {subscribeStatus === 'idle' && 'Subscribe'}
                  {subscribeStatus === 'loading' && <span className="animate-pulse">Processing...</span>}
                  {subscribeStatus === 'success' && <><Check className="w-4 h-4" /> Joined</>}
                  {subscribeStatus === 'error' && <><AlertTriangle className="w-4 h-4" /> Failed</>}
                </motion.button>
              </form>
               {errorMessage && <p className="text-red-400/80 text-[10px] mt-2 text-center">{errorMessage}</p>}
            </div>

             {/* Socials */}
             <div className="flex items-center gap-4 pt-2">
                {[
                  { icon: Instagram, url: 'https://instagram.com/attireloungeofficial' },
                  { icon: Facebook, url: 'https://facebook.com/attireloungeofficial' },
                  { icon: Send, url: 'https://t.me/attireloungeofficial' }, // Changed to Send (Telegram)
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-attire-accent hover:border-attire-accent text-white/70 hover:text-white transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-attire-silver/50">
           <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
               <span className="cursor-pointer hover:text-attire-silver transition-colors" onClick={handleAdminClick}>
                   &copy; {currentYear} Attire Lounge Official.
               </span>
               <span className="hidden md:inline w-px h-3 bg-white/10" />
               <span>First Gentlemen's Styling House in Cambodia.</span>
           </div>

           <div className="flex items-center gap-6">
               <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
               <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
               <Link to="/returns" className="hover:text-white transition-colors">Returns</Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
