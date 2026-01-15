// resources/js/components/pages/HomePage.jsx - V6 (Final Polish with Glass Effects)
import React, { useEffect, useRef, useState, useCallback, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Scissors, Coffee, ArrowRight, Gem, Feather, Palette, ChevronDown, CheckCircle } from 'lucide-react';
import Footer from '../layouts/Footer';
import { Link } from 'react-router-dom';

import minioBaseUrl from '../../config.js';

// --- Data Store for Homepage Sections ---
const homePageData = {
  services: [
    { name: "Milan-Certified Styling", description: "Receive a free, expert styling consultation from our Milan-certified team to discover the perfect look for you.", icon: <Users size={32} className="text-attire-accent" /> },
    { name: "The Perfect Fit", description: "We offer diverse sizes and provide complimentary in-house alterations to ensure your garments fit impeccably.", icon: <Scissors size={32} className="text-attire-accent" /> },
    { name: "A Premium Experience", description: "Enjoy a relaxing atmosphere and complimentary drinks during your visit, making your styling session a true pleasure.", icon: <Coffee size={32} className="text-attire-accent" /> }
  ]
};

// --- Animation Variants ---
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

// --- Section Components (Memoized for performance) ---

const HeroSection = memo(forwardRef(({ scrollToSection }, ref) => (
  <section className="relative snap-section overflow-hidden min-h-screen h-screen" ref={ref}>
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video autoPlay muted loop playsInline preload="auto" className="absolute w-full h-full object-cover" style={{ objectPosition: 'center 10%' }}><source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" /></video>
      <div className="absolute inset-0 bg-attire-navy/40" />
    </div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative z-10 h-full flex flex-col items-center justify-center">
      <img src={`${minioBaseUrl}/uploads/asset/AL_logo.png`} alt="Attire Lounge" className="h-auto mx-auto filter brightness-0 invert drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-90 max-w-[280px] md:max-w-sm" loading="eager" />
    </motion.div>
    <motion.div
      className="absolute bottom-10 left-[48%] -translate-x-1/2 flex flex-col items-center text-attire-cream opacity-70"
      animate={{ y: ["-10%", "10%", "-10%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="mb-2 text-xs tracking-wide">Scroll Down</span>
      <ChevronDown size={18} />
      <ChevronDown size={18} className="-mt-2" />
      <ChevronDown size={18} className="-mt-2" />
    </motion.div>
  </section>
)));

const PhilosophySection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-dark" ref={ref}>
      {/* Left side - Text Content */}
      <div className="flex flex-col justify-center text-attire-cream p-8 md:p-16 h-full">
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
        >
          <motion.h2 variants={itemVariants} className="font-serif text-sm md:text-base tracking-[0.2em] text-attire-accent uppercase mb-4">Our Philosophy</motion.h2>
          <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="font-serif text-2xl md:text-4xl leading-relaxed mb-8">
            Attire Lounge is Cambodia's first sartorial gentlemen's styling house, offering a variety of ready-to-wear collections and premium styling with our Milan-certified team.
          </motion.p>
          <motion.div variants={itemVariants} transition={{ delay: 0.4 }}>
            <Link to="/contact" className="inline-block bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors">
              Make Appointment
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="relative w-full h-full overflow-hidden hidden md:block">
        <img
          src={`${minioBaseUrl}/uploads/collections/default/as5.jpg`}
          alt="Attire Lounge Interior"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-attire-dark via-transparent to-transparent" />
      </div>
    </section>
)));

const CollectionsSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen" ref={ref}>
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center"
             style={{ backgroundImage: `url('${minioBaseUrl}/uploads/collections/Model/1.jpg')` }}
        />
<div className="absolute inset-0 bg-attire-navy/50" />

        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full max-w-4xl mx-auto px-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.6 }}
                className="w-full"
            >
                <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl text-white mb-4">
                    Our Collections
                </motion.h2>
                <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="text-attire-silver text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
                    From timeless classics to modern statements, our collections are curated to suit every gentleman's style. We offer a diverse range of ready-to-wear pieces, each crafted with precision and an eye for detail.
                </motion.p>
                <motion.div variants={itemVariants} transition={{ delay: 0.4 }}>
                    <Link to="/collections" className="inline-block bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors">
                        Browse Collections
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    </section>
)));

const ExperienceSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-dark" ref={ref}>
    {/* Left side - Image */}
    <div className="relative w-full h-full overflow-hidden hidden md:block">
        <img
            src={`${minioBaseUrl}/uploads/collections/default/both.jpg`}
            alt="Attire Lounge Style"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-attire-dark via-transparent to-transparent" />
    </div>

    {/* Right side - Text Content */}
    <div className="flex flex-col justify-center text-attire-cream p-8 md:p-16 h-full">
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
        >
            <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl text-white mb-8">What sets us apart?</motion.h2>
            <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                <ul className="space-y-5 text-base md:text-lg leading-relaxed">
                    <li className="flex items-start gap-4">
                        <CheckCircle className="w-7 h-7 text-attire-accent mt-1 flex-shrink-0" />
                        <span>Receive free styling consultation upon your appointment</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <CheckCircle className="w-7 h-7 text-attire-accent mt-1 flex-shrink-0" />
                        <span>Styling team certified from Milan, Italy</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <CheckCircle className="w-7 h-7 text-attire-accent mt-1 flex-shrink-0" />
                        <span>Free complimentary drinks</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <CheckCircle className="w-7 h-7 text-attire-accent mt-1 flex-shrink-0" />
                        <span>Diverse sizes suitable for all body types</span>
                    </li>
                </ul>
            </motion.div>
        </motion.div>
    </div>
  </section>
)));



const MembershipSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-dark" ref={ref}>
        {/* Left side - Text Content */}
        <div className="flex flex-col justify-center text-attire-cream p-8 md:p-12 h-full overflow-y-auto">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="w-full max-w-xl"
            >
                <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-4xl text-white mb-2">ATTIRE CLUB</motion.h2>
                <motion.h3 variants={itemVariants} transition={{ delay: 0.1 }} className="text-attire-accent tracking-[0.2em] uppercase text-sm mb-6">Membership Card</motion.h3>
                
                <motion.div variants={itemVariants} transition={{ delay: 0.2 }} className="text-sm md:text-base text-attire-silver space-y-3 leading-relaxed">
                    <p>Entitlement upon a minimum purchase of US$500 per receipt. Requires full name, DOB (month & date), and contact number.</p>

                    <div>
                        <h4 className="font-semibold text-attire-cream mb-1 mt-3">Benefits</h4>
                        <ul className="list-disc list-outside space-y-1 pl-5 text-sm">
                            <li>Up to 15% on regular purchases:
                                <ul className="list-['–'] list-outside pl-5 space-y-px mt-1">
                                    <li>8% off on purchases from US$500 to US$1,000</li>
                                    <li>10% off on purchases from US$1,001 to US$1,500</li>
                                    <li>15% off on all purchases of US$1,501 and above</li>
                                </ul>
                            </li>
                            <li>Extra seasonal benefits including birthday gifts and access to exclusive gentleman's club events.</li>
                            <li>Special offers from our partners:
                                <ul className="list-['–'] list-outside pl-5 space-y-px mt-1">
                                    <li>10% off at CUFFEINE: plant-based coffee</li>
                                    <li>8% off cocktails at Kravat Speakeasy Bar</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-attire-cream mb-1 mt-3">Terms & Conditions</h4>
                        <p className="text-xs text-gray-400">
                            Not responsible for lost, stolen, or damaged cards (reissue fee: US$10). Cannot be used with other offers. Not redeemable for cash. Non-transferable; cardholder must be present. Membership may be terminated for non-compliance. Subject to renewal and may be discontinued at our discretion. Terms are subject to change.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>

        {/* Right side - Image */}
        <div className="relative w-full h-full overflow-hidden hidden md:block">
            <img
                src={`${minioBaseUrl}/uploads/collections/default/vc.jpg`}
                alt="Attire Club Membership"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-attire-navy via-transparent to-transparent" />
        </div>
    </section>
)));

const LookbookSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section bg-attire-dark min-h-screen h-screen" ref={ref}>
    <img src={`${minioBaseUrl}/uploads/collections/Model/5.jpg`} alt="Lookbook" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" decoding="async" />
    <div className="absolute inset-0 bg-attire-navy/50" />
    <div className="relative h-full flex flex-col items-center justify-center text-center text-attire-cream p-8">
      <div className="bg-attire-dark/20 backdrop-blur-md border border-attire-cream/10 rounded-2xl shadow-lg p-8 md:p-12">
        <motion.h2 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} className="font-serif text-4xl md:text-6xl mb-6">The Art of Style</motion.h2>
        <motion.p variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: 0.2}} className="max-w-xl text-attire-silver md:text-lg mb-8">Explore our curated lookbook for inspiration and discover the timeless elegance that defines Attire Lounge.</motion.p>
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: 0.4}}>
          <Link to="/lookbook" className="inline-block bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors">View Lookbook</Link>
        </motion.div>
      </div>
    </div>
  </section>
)));

const CTASection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section bg-attire-navy min-h-screen h-screen flex items-center justify-center p-8" ref={ref}>
    <div className="bg-attire-cream/20 backdrop-blur-lg border border-attire-cream/30 rounded-2xl shadow-lg p-8 md:p-12 max-w-3xl mx-auto">
      <div className="text-center">
        <motion.h2 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} className="font-serif text-3xl md:text-5xl text-white mb-6">Begin Your Sartorial Journey</motion.h2>
        <motion.p variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: 0.2}} className="text-attire-silver md:text-lg mb-10">Experience the difference of personalized styling. Book a private consultation with our experts today.</motion.p>
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{once: true}} transition={{delay: 0.4}}>
          <Link to="/contact" className="inline-block bg-attire-accent text-white font-semibold px-12 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors">Book a Consultation</Link>
        </motion.div>
      </div>
    </div>
  </section>
)));

const FooterSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section bg-attire-dark min-h-screen h-screen flex flex-col justify-center" ref={ref}>
    <div className="w-full">
      <Footer />
    </div>
  </section>
)));



// --- Main Homepage Component ---

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sectionsRef = useRef([]);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    sectionsRef.current = sectionsRef.current.slice(0, 8); // 8 sections total
    const handleMenuStateChange = (e) => {
      if (e.detail && e.detail.isMenuOpen !== undefined) setIsMenuOpen(e.detail.isMenuOpen);
    };
    window.addEventListener('menuStateChange', handleMenuStateChange);
    return () => window.removeEventListener('menuStateChange', handleMenuStateChange);
  }, []);

  const scrollToSection = useCallback((index) => {
    if (isScrollingRef.current || !sectionsRef.current[index] || isMenuOpen) return;
    isScrollingRef.current = true;
    const targetY = sectionsRef.current[index].offsetTop;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 400;
    let startTime = null;
    const easing = (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startY + distance * easing(progress));
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        setActiveSection(index);
        isScrollingRef.current = false;
      }
    };
    requestAnimationFrame(animation);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMobile || isMenuOpen) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      const deltaY = e.deltaY;
      let newIndex = activeSection;
      if (Math.abs(deltaY) > 5) {
        if (deltaY > 0) newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1);
        else newIndex = Math.max(activeSection - 1, 0);
        if (newIndex !== activeSection) scrollToSection(newIndex);
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMobile, isMenuOpen, activeSection, scrollToSection]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMobile || isMenuOpen || isScrollingRef.current) return;
      let newIndex = activeSection;
      switch (e.key) {
        case 'ArrowDown': case 'PageDown': e.preventDefault(); newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1); break;
        case 'ArrowUp': case 'PageUp': e.preventDefault(); newIndex = Math.max(activeSection - 1, 0); break;
        case 'Home': e.preventDefault(); newIndex = 0; break;
        case 'End': e.preventDefault(); newIndex = sectionsRef.current.length - 1; break;
        default: return;
      }
      if (newIndex !== activeSection) scrollToSection(newIndex);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isMenuOpen, activeSection, scrollToSection]);

  const { services } = homePageData;

  return (
    <div className="snap-scroll-container bg-attire-dark">
      <HeroSection ref={el => sectionsRef.current[0] = el} scrollToSection={scrollToSection} />
      <PhilosophySection ref={el => sectionsRef.current[1] = el} />
      <CollectionsSection ref={el => sectionsRef.current[2] = el} />
      <ExperienceSection ref={el => sectionsRef.current[3] = el} services={services} />
      <MembershipSection ref={el => sectionsRef.current[4] = el} />
      <LookbookSection ref={el => sectionsRef.current[5] = el} />
      <CTASection ref={el => sectionsRef.current[6] = el} />
      <FooterSection ref={el => sectionsRef.current[7] = el} />
    </div>
  );
};

export default HomePage;
