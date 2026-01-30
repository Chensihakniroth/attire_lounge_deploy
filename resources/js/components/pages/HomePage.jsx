// resources/js/components/pages/HomePage.jsx - V6 (Final Polish with Glass Effects)
import React, { useEffect, useRef, useState, useCallback, forwardRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Scissors, Coffee, ArrowRight, Gem, Feather, Palette, ChevronDown, CheckCircle, BookOpen, Camera, Sparkles, Play, Gift, Wine, Crown, CreditCard } from 'lucide-react';
import Footer from '../layouts/Footer.jsx';
import { Link, useLocation } from 'react-router-dom';
import SectionIndicator from './SectionIndicator.jsx';

import minioBaseUrl from '../../config.js';

// --- Data Store for Homepage Sections ---
const homePageData = {
  services: [
    { name: "Milan-Certified Styling", description: "Receive a free, expert styling consultation from our Milan-certified team to discover the perfect look for you.", icon: <Users size={32} className="text-attire-accent" /> },
    { name: "The Perfect Fit", description: "We offer diverse sizes and provide complimentary in-house alterations to ensure your garments fit impeccably.", icon: <Scissors size={32} className="text-attire-accent" /> },
    { name: "A Premium Experience", description: "Enjoy a relaxing atmosphere and complimentary drinks during your visit, making your styling session a true pleasure.", icon: <Coffee size={32} className="text-attire-accent" /> }
  ],
  lookbookFeatures: [
    {
      title: "Seasonal Collections",
      description: "Explore our latest seasonal curations, from summer linens to winter wools, all shot in stunning, high-resolution detail.",
      icon: <BookOpen size={40} className="text-attire-accent" />
    },
    {
      title: "Behind The Seams",
      description: "Get an exclusive look at our design process, the craftsmanship involved, and the stories that inspire each collection.",
      icon: <Camera size={40} className="text-attire-accent" />
    },
    {
      title: "Style Guides",
      description: "Not just what to wear, but how to wear it. Our guides help you master the art of dressing for any occasion.",
      icon: <Sparkles size={40} className="text-attire-accent" />
    }
  ],
  tipsAndTricks: [
    {
      title: "Mastering the Tie Knot",
      image: `${minioBaseUrl}/uploads/asset/vid1.jpg`,
      link: "https://www.instagram.com/p/placeholder1/", // Placeholder link
      description: "Learn essential tie knots for every occasion."
    },
    {
      title: "Cufflink Elegance",
      image: `${minioBaseUrl}/uploads/asset/vid2.jpg`,
      link: "https://www.tiktok.com/@placeholder2/", // Placeholder link
      description: "Elevate your look with the perfect cufflinks."
    },
    {
      title: "Pocket Square Folds",
      image: `${minioBaseUrl}/uploads/asset/vid3.jpg`,
      link: "https://www.youtube.com/watch?v=placeholder3", // Placeholder link
      description: "Add a touch of class with stylish pocket square folds."
    },
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
      <video autoPlay muted loop playsInline preload="metadata" className="absolute w-full h-full object-cover" style={{ objectPosition: 'center 10%' }}><source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" /></video>
      <div className="absolute inset-0 bg-attire-dark/40" />
    </div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative z-10 h-full flex flex-col items-center justify-center">
      <img src={`${minioBaseUrl}/uploads/asset/AL_logo.png`} alt="Attire Lounge" className="h-auto mx-auto filter brightness-0 invert drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-90 max-w-[280px] md:max-w-sm" loading="eager" />
      <motion.div
        className="flex flex-col items-center text-attire-cream opacity-70 mt-16" // Added mt-16 for spacing, removed absolute positioning
        animate={{ y: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="mb-2 text-xs tracking-wide">Scroll Down</span>
        <ChevronDown size={18} />
        <ChevronDown size={18} className="-mt-2" />
        <ChevronDown size={18} className="-mt-2" />
      </motion.div>
    </motion.div>
  </section>
)));

const PhilosophySection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy" ref={ref}>
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
            Attire Lounge Official is Cambodia's first sartorial gentlemen's styling house, offering a variety of ready-to-wear collections and style consultation with our certified stylists.
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
        <div className="absolute inset-0 bg-gradient-to-r from-attire-navy via-transparent to-transparent" />
      </div>
    </section>
)));

const CollectionsSection = memo(forwardRef((props, ref) => {
    const showcaseImages = [
        `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`,
        `${minioBaseUrl}/uploads/collections/default/mm1.jpg`,
        `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`,
        `${minioBaseUrl}/uploads/collections/default/of1.jpg`
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative snap-section min-h-screen h-screen flex items-center" ref={ref}>
            {/* Background Image - Static Darkened */}
            <img
                src={`${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`}
                alt="Collections Background"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40 blur-sm"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-attire-navy/90 to-attire-dark/80" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                
                {/* Left Side: Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                    className="flex flex-col justify-center text-left"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
                        <span className="h-px w-12 bg-attire-accent"></span>
                        <span className="text-attire-accent text-xs tracking-[0.3em] uppercase">Est. 2024</span>
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
                        Curated <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-attire-cream to-attire-silver">Elegance</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="text-attire-silver text-lg leading-relaxed max-w-xl mb-8">
                        From the vibrant energy of Havana to the sharp silhouettes of our Office line.
                        Discover ready-to-wear masterpieces tailored for the modern gentleman.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-10">
                        {['Havana Collection', 'Mocha Mousse', 'Groom & Formal', 'Office Wear'].map((tag, i) => (
                            <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-attire-cream/80 backdrop-blur-sm">
                                {tag}
                            </span>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} transition={{ delay: 0.4 }}>
                        <Link to="/collections" className="group relative inline-flex items-center gap-3 bg-attire-accent text-white font-semibold px-8 py-4 rounded-full overflow-hidden transition-all hover:bg-attire-accent/90 hover:pr-12 w-fit">
                            <span>Browse Collections</span>
                            <ArrowRight className="w-5 h-5 absolute right-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300" />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Right Side: Dynamic Image Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden lg:block relative h-[620px] aspect-[3/4] ml-auto mr-8"
                >
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 transform rotate-3 scale-95 z-0" />
                    
                    <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl z-10 border border-white/10 bg-attire-dark">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <img
                                    src={showcaseImages[currentImageIndex]}
                                    alt="Collection Showcase"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <p className="text-attire-accent text-xs tracking-widest uppercase mb-1">Featured</p>
                                    <h3 className="text-2xl font-serif text-white">
                                        {['Havana', 'Mocha Mousse', 'Groom', 'Office'][currentImageIndex]}
                                    </h3>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Static Indicators */}
                        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                            {showcaseImages.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'w-8 bg-attire-accent' : 'w-2 bg-white/30'}`} 
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}));

const ExperienceSection = memo(forwardRef(({ services }, ref) => (
  <section className="relative snap-section min-h-screen h-screen flex items-center bg-attire-navy overflow-hidden" ref={ref}>
    {/* Minimal Ambient Background - Toned down */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-attire-accent/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-50" />

    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Visual Side (Left on Desktop, Hidden/BG on Mobile) */}
        <div className="relative h-full w-full order-2 lg:order-1">
            {/* Mobile BG (Absolute) */}
            <div className="absolute inset-0 lg:hidden z-0">
                <img src={`${minioBaseUrl}/uploads/collections/default/both.jpg`} alt="Background" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-attire-navy/95 backdrop-blur-sm"/>
            </div>

            {/* Desktop Image */}
            <div className="hidden lg:block absolute inset-0">
                <div className="w-full h-full">
                    <img
                        src={`${minioBaseUrl}/uploads/collections/default/both.jpg`}
                        alt="Attire Lounge Experience"
                        className="w-full h-full object-cover"
                    />
                </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-attire-navy/10 to-attire-navy" />
            </div>
        </div>

        {/* Content Side */}
        <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 h-full order-1 lg:order-2">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 w-full"
            >
                {/* Header - Minimal */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                    <span className="h-px w-6 bg-attire-accent/50"></span>
                    <span className="text-attire-accent/80 tracking-[0.2em] uppercase text-[10px] font-medium">Why Choose Us</span>
                </motion.div>

                <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl text-white mb-12 leading-tight">
                    The Art of <br/> <span className="text-attire-silver/50 italic font-light">Refinement</span>
                </motion.h2>

                <div className="space-y-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group flex gap-6 items-start pl-2"
                        >
                            <div className="shrink-0 mt-1">
                                {/* Minimal Icon: Simple circle, subtle interaction */}
                                <div className="p-3 rounded-full bg-white/5 text-attire-accent group-hover:bg-attire-accent group-hover:text-white transition-all duration-500 ease-out">
                                    {React.cloneElement(service.icon, { size: 20, className: "current-color" })}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-serif text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">{service.name}</h3>
                                <p className="text-sm text-attire-silver/50 leading-relaxed font-light max-w-sm group-hover:text-attire-silver/80 transition-colors duration-300">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    </div>
  </section>
)));



const MembershipSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 lg:grid-cols-12 items-center bg-attire-navy overflow-hidden" ref={ref}>
        {/* Ambient Lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-attire-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Background (Dimmed) */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img src={`${minioBaseUrl}/uploads/collections/default/vc.jpg`} alt="Background" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-attire-navy/90 backdrop-blur-sm"/>
        </div>

        {/* Content Side (Left) */}
        <div className="relative z-10 col-span-1 lg:col-span-5 flex flex-col justify-center h-full px-6 md:px-12 lg:pl-20 lg:pr-4 py-8 overflow-y-auto lg:overflow-visible">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="w-full max-w-lg mx-auto lg:mx-0"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                    <Crown className="text-attire-accent w-6 h-6" />
                    <span className="text-attire-accent tracking-[0.3em] uppercase text-xs font-semibold">Exclusive Access</span>
                </motion.div>
                
                <motion.h2 variants={itemVariants} className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
                    The Attire <br/><span className="italic text-attire-silver">Club</span>
                </motion.h2>

                <motion.p variants={itemVariants} className="text-attire-silver/80 text-sm mb-8 font-light leading-relaxed border-l-2 border-attire-accent/50 pl-4">
                    Join an elite circle of gentlemen. Unlock privileged pricing, seasonal rewards, and curated experiences.
                    <span className="block mt-2 text-xs opacity-60">*Minimum spend of US$500 to qualify.</span>
                </motion.p>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {/* Tier 1: Shopping Perks */}
                    <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-attire-accent/20 rounded-lg text-attire-accent"><CreditCard size={18} /></div>
                            <h4 className="text-white font-serif text-lg">Privileged Pricing</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm text-attire-silver">
                                <span>$500 - $1,000</span>
                                <span className="font-semibold text-white">8% Off</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-attire-accent h-full w-[53%]" />
                            </div>
                            <div className="flex justify-between items-center text-sm text-attire-silver">
                                <span>$1,001 - $1,500</span>
                                <span className="font-semibold text-white">10% Off</span>
                            </div>
                             <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-attire-accent h-full w-[66%]" />
                            </div>
                             <div className="flex justify-between items-center text-sm text-attire-silver">
                                <span>$1,500+</span>
                                <span className="font-semibold text-white">15% Off</span>
                            </div>
                             <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-attire-accent h-full w-full" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Tier 2: Lifestyle */}
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Wine size={16} className="text-attire-accent" />
                                <h4 className="text-white font-serif text-base">Partners</h4>
                            </div>
                            <ul className="text-xs text-attire-silver space-y-1">
                                <li>• 10% @ CUFFEINE</li>
                                <li>• 8% @ Kravat Bar</li>
                            </ul>
                        </motion.div>

                        {/* Tier 3: Seasonal */}
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Gift size={16} className="text-attire-accent" />
                                <h4 className="text-white font-serif text-base">Rewards</h4>
                            </div>
                            <ul className="text-xs text-attire-silver space-y-1">
                                <li>• Birthday Gifts</li>
                                <li>• Event Access</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>

                 {/* Terms - Collapsible-ish look */}
                <motion.div variants={itemVariants} className="text-[10px] text-white/30 leading-snug max-w-md">
                     <p>Terms apply. Card must be presented. Non-transferable. Lost card fee $10. Subject to change.</p>
                </motion.div>
            </motion.div>
        </div>

        {/* Visual Side (Right) */}
        <div className="relative h-full hidden lg:block col-span-7 overflow-hidden">
            {/* Main Image with Scale Effect */}
            <motion.div 
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
            >
                <img
                    src={`${minioBaseUrl}/uploads/collections/default/vc.jpg`}
                    alt="Attire Club Membership"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="lazy"
                />
            </motion.div>
            
            {/* Gradient Overlay for Text Readability blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-attire-navy via-attire-navy/40 to-transparent w-2/3" />
        </div>
    </section>
)));

const LookbookSection = memo(forwardRef(({ lookbookFeatures }, ref) => (
  <section className="relative snap-section bg-attire-dark py-8 md:py-16" ref={ref}>
    <img src={`${minioBaseUrl}/uploads/collections/default/of3.jpg`} alt="Lookbook Background" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" decoding="async" />
    <div className="absolute inset-0 bg-gradient-to-b from-attire-dark/80 to-attire-dark/40" />

    <div className="relative h-full flex flex-col items-center justify-center text-center text-attire-cream p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full max-w-6xl mx-auto"
      >
        <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl mb-4">The Art of Style</motion.h2>
        <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-attire-silver text-base md:text-lg mb-6 md:mb-10">
          Explore our curated lookbook for inspiration and discover the timeless elegance that defines Attire Lounge.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10">
          {lookbookFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ delay: 0.4 + index * 0.2 }}
              className="bg-attire-dark/30 backdrop-blur-md border border-attire-cream/10 rounded-2xl shadow-lg p-6 flex flex-col items-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mb-2"
              >
                {feature.icon}
              </motion.div>
              <h3 className="font-serif text-base md:text-xl text-white mb-1">{feature.title}</h3>
              <p className="text-attire-silver text-xs leading-snug">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} transition={{ delay: 1 }}>
          <Link to="/lookbook" className="inline-block bg-attire-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-attire-accent/90 transition-colors text-sm md:text-base">View Lookbook</Link>
        </motion.div>
      </motion.div>
    </div>
  </section>
)));

const TipsAndTricksSection = memo(forwardRef(({ tipsAndTricks }, ref) => {
  return (
    <section className="relative snap-section bg-attire-navy min-h-screen h-screen overflow-hidden flex flex-col justify-center" ref={ref}>
       {/* Ambient Background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-attire-accent/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
       </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto text-center text-attire-cream px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl mb-3">Tips & Tricks</motion.h2>
          <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-attire-silver text-sm md:text-lg font-light">
            Master the art of sophisticated dressing with our expert guidance.
          </motion.p>
        </motion.div>

        {/* Responsive Grid - Optimized for h-screen */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0 max-w-5xl mx-auto">
          {tipsAndTricks.map((tip, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`group relative flex flex-col ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <a
                href={tip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-attire-dark/50"
              >
                {/* Image */}
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-attire-accent/80 group-hover:border-attire-accent transition-colors duration-300">
                        <Play className="w-5 h-5 md:w-8 md:h-8 text-white fill-current ml-1" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                     <div className="h-0.5 w-0 bg-attire-accent mb-2 group-hover:w-10 transition-all duration-500 ease-out" />
                     <h3 className="font-serif text-lg md:text-2xl text-white mb-1 leading-tight drop-shadow-lg">{tip.title}</h3>
                     <p className="text-attire-silver text-[10px] md:text-sm line-clamp-1 md:line-clamp-2 opacity-80 group-hover:opacity-100 group-hover:text-white transition-all duration-300 font-light">
                        {tip.description}
                     </p>
                </div>
              </a>
            </motion.div>
          ))}
          {/* Mobile visible third card - using different grid layout for mobile if needed */}
          <motion.div
             variants={itemVariants}
             transition={{ delay: 0.4 }}
             className="md:hidden col-span-2 hidden" // Keep hidden if we want to stick to 2 on mobile for h-screen
          />
        </div>
      </div>
    </section>
  );
}));


const FooterSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section !h-auto !min-h-screen !overflow-visible bg-black" ref={ref}>
    <div className="w-full">
      <Footer />
    </div>
  </section>
)));



// --- Main Homepage Component ---

const HomePage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const sectionsRef = useRef([]);

  useEffect(() => {
    sectionsRef.current = sectionsRef.current.slice(0, 8); // 8 sections total (including footer)
    const handleMenuStateChange = (e) => {
      if (e.detail && e.detail.isMenuOpen !== undefined) setIsMenuOpen(e.detail.isMenuOpen);
    };
    window.addEventListener('menuStateChange', handleMenuStateChange);
    return () => window.removeEventListener('menuStateChange', handleMenuStateChange);
  }, []);

  const scrollToSection = useCallback((index) => {
    if (sectionsRef.current[index]) {
       if (window.lenis) {
           window.lenis.scrollTo(sectionsRef.current[index], { duration: 1.5 });
       } else {
           sectionsRef.current[index].scrollIntoView({ behavior: 'smooth' });
       }
    }
  }, []);

  // --- Smooth JS Snap Logic (Replaces CSS Snap) ---
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Disable snapping on mobile (width < 768) or if menu is open or lenis isn't ready
            if (!window.lenis || isMenuOpen || window.innerWidth < 768) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            let closestIndex = -1;
            let minDistance = Infinity;

            // Find closest section top
            sectionsRef.current.forEach((section, index) => {
                if (!section) return;
                const distance = Math.abs(section.offsetTop - scrollY);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== -1) {
                const targetSection = sectionsRef.current[closestIndex];
                const dist = Math.abs(targetSection.offsetTop - scrollY);
                const isTallSection = targetSection.offsetHeight > viewportHeight + 50;

                // If we are very close (already snapped), do nothing to avoid jitter
                if (dist < 5) return;

                // Logic:
                // 1. If it's a standard section (100vh), ALWAYS snap to it if we are closer to it than another.
                // 2. If it's a TALL section:
                //    - Only snap to top if we are near the top (e.g. < 30% into it).
                //    - If we are deep inside, allow free scroll.

                if (!isTallSection) {
                    window.lenis.scrollTo(targetSection, { duration: 0.8 });
                } else {
                    // Tall section logic
                    const snapThreshold = viewportHeight * 0.3;
                    if (dist < snapThreshold) {
                         window.lenis.scrollTo(targetSection, { duration: 0.8 });
                    }
                }
            }
        }, 50); // 50ms debounce: Snappier start after scrolling stops
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: null,
        // Trigger when the section center is near the viewport center
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.hash === '#membership') {
      setTimeout(() => {
        scrollToSection(4);
      }, 100); // Slight delay to ensure render
    }
  }, [location.hash, scrollToSection]);

  const { services, lookbookFeatures, tipsAndTricks } = homePageData;

  const sectionNames = ['Home', 'Philosophy', 'Collections', 'Experience', 'Membership', 'Lookbook', 'Tips & Tricks', 'Appointment and Contact'];

  return (
    <div className="snap-scroll-container bg-attire-dark">
      <SectionIndicator
        sections={sectionNames}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isMenuOpen={isMenuOpen}
      />
      <HeroSection ref={el => sectionsRef.current[0] = el} scrollToSection={scrollToSection} />
      <PhilosophySection ref={el => sectionsRef.current[1] = el} />
      <CollectionsSection ref={el => sectionsRef.current[2] = el} />
      <ExperienceSection ref={el => sectionsRef.current[3] = el} services={services} />
      <MembershipSection ref={el => sectionsRef.current[4] = el} />
      <LookbookSection ref={el => sectionsRef.current[5] = el} lookbookFeatures={lookbookFeatures} />
      <TipsAndTricksSection ref={el => sectionsRef.current[6] = el} tipsAndTricks={tipsAndTricks} />
      <FooterSection ref={el => sectionsRef.current[7] = el} />
    </div>
  );
};

export default HomePage;
