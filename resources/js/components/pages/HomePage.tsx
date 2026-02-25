// resources/js/components/pages/HomePage.tsx - V6 (Final Polish with Glass Effects)
import React, { useEffect, useRef, useState, useCallback, forwardRef, memo, ReactElement } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Users, Scissors, Coffee, ArrowRight, BookOpen, Camera, Sparkles, Play, Gift, Wine, Crown, CreditCard } from 'lucide-react';
import Footer from '../layouts/Footer.jsx';
import { Link, useLocation } from 'react-router-dom';
import SectionIndicator from './SectionIndicator.jsx';
import FashionShow from '../sections/FashionShow.jsx';
import OptimizedImage from '../common/OptimizedImage.jsx';
import SEO from '../common/SEO';

import minioBaseUrl from '../../config.js';

interface Service {
  name: string;
  description: string;
  icon: ReactElement;
}

interface LookbookFeature {
  title: string;
  description: string;
  icon: ReactElement;
}

interface Tip {
  title: string;
  image: string;
  link: string;
  description: string;
}

interface HomePageData {
  services: Service[];
  lookbookFeatures: LookbookFeature[];
  tipsAndTricks: Tip[];
}

// --- Data Store for Homepage Sections ---
const homePageData: HomePageData = {
  services: [
    { name: "Milan-Certified Styling", description: "Receive a free, expert styling consultation from our Milan-certified team to discover the perfect look for you.", icon: <Users size={32} className="text-[#f5a81c]" /> },
    { name: "The Perfect Fit", description: "We offer diverse sizes and provide complimentary in-house alterations to ensure your garments fit impeccably.", icon: <Scissors size={32} className="text-[#f5a81c]" /> },
    { name: "A Premium Experience", description: "Enjoy a relaxing atmosphere and complimentary drinks during your visit, making your styling session a true pleasure.", icon: <Coffee size={32} className="text-[#f5a81c]" /> }
  ],
  lookbookFeatures: [
    {
      title: "Seasonal Collections",
      description: "Explore our latest seasonal curations, from summer linens to winter wools, all shot in stunning, high-resolution detail.",
      icon: <BookOpen size={40} className="text-[#f5a81c]" />
    },
    {
      title: "Behind The Seams",
      description: "Get an exclusive look at our design process, the craftsmanship involved, and the stories that inspire each collection.",
      icon: <Camera size={40} className="text-[#f5a81c]" />
    },
    {
      title: "Style Guides",
      description: "Not just what to wear, but how to wear it. Our guides help you master the art of dressing for any occasion.",
      icon: <Sparkles size={40} className="text-[#f5a81c]" />
    }
  ],
  tipsAndTricks: [
    {
      title: "3 Ways to Style a Black Jacket",
      image: `${minioBaseUrl}/uploads/asset/vid1.jpg`,
      link: "https://www.instagram.com/p/DAM3OG6yKnL/",
      description: "Three Ways to style a black jacket by Attire Lounge Official. Make an appointment with us today and receive a free consultation on your attire."
    },
    {
      title: "3 Ways to Style a Double-Breasted Jacket",
      image: `${minioBaseUrl}/uploads/asset/vid2.jpg`,
      link: "https://www.instagram.com/p/DByeCz0Sz4Q/",
      description: "Three ways to style a black double-breasted jacket by Attire Lounge Official. Make an appointment with us today and receive a free consultation on your attire."
    },
    {
      title: "3 Ways to Style a Dark Green Jacket",
      image: `${minioBaseUrl}/uploads/asset/vid3.jpg`,
      link: "https://www.instagram.com/p/DAyD5N7Sw7Z/",
      description: "Three ways to style a checked blazer by @attireloungeofficial. Make an appointment with us today and receive a free consultation on your attire."
    },
  ]
};

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

// --- Section Components (Memoized for performance) ---

interface HeroSectionProps {
  scrollToSection: (index: number) => void;
}

const HeroSection = memo(forwardRef<HTMLElement, HeroSectionProps>(({ scrollToSection }, ref) => (
  <section className="relative snap-section overflow-hidden min-h-screen h-screen" ref={ref}>
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        preload="metadata" 
        className="absolute w-full h-full object-cover" 
        style={{ objectPosition: 'center 20%' }}
      >
        <source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" />
      </video>
      {/* Cleaner Gradient Overlay: Clearer center, darkened edges for focus */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 1.2, ease: "easeOut" }} 
      className="relative z-10 h-full flex flex-col items-center justify-center px-4"
    >
      {/* Logo */}
      <OptimizedImage 
        src={`${minioBaseUrl}/uploads/asset/AL_logo.png`} 
        alt="Attire Lounge" 
        containerClassName="h-auto w-full max-w-[240px] md:max-w-md"
        className="drop-shadow-2xl mb-6" 
        bgClassName="bg-transparent"
        priority={true}
        loading="eager" 
        objectFit="contain"
      />
      
      {/* Minimal Tagline */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-[#E5E7EB]/80 text-[10px] md:text-xs tracking-[0.4em] uppercase font-light text-center mb-12"
      >
        Phnom Penh
      </motion.p>

      {/* Simplified Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-4 cursor-pointer group mix-blend-screen"
        onClick={() => scrollToSection(1)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase group-hover:text-white transition-colors duration-500">Discover</span>
        <div className="w-[1px] h-16 bg-white/10 overflow-hidden rounded-full">
          <motion.div 
            className="w-full h-1/2 bg-gradient-to-b from-transparent to-[#f5a81c]"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </motion.div>
  </section>
)));

const PhilosophySection = memo(forwardRef<HTMLElement>((_props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 lg:grid-cols-2 items-center bg-[#0d3542] overflow-hidden" ref={ref}>
      {/* Ambient Light */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#f5a81c]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Left side - Text Content */}
      <div className="relative z-10 flex flex-col justify-center text-[#FAF8F3] p-8 md:p-16 lg:p-24 h-full order-2 lg:order-1">
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-xl"
        >
          {/* Section Indicator */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
              <span className="text-[#f5a81c] font-serif text-lg italic">02</span>
              <div className="h-px w-8 bg-[#f5a81c]/50" />
              <h2 className="text-[#f5a81c] tracking-[0.3em] uppercase text-[10px] md:text-xs font-bold">Our Philosophy</h2>
          </motion.div>

          <motion.h3 variants={itemVariants} className="font-serif text-4xl md:text-6xl leading-tight text-white mb-8">
            Ready-to-wear pieces crafted for <span className="text-[#E5E7EB] italic font-light">timeless confidence</span>
          </motion.h3>

          <motion.p variants={itemVariants} className="text-[#E5E7EB]/80 text-sm md:text-lg leading-relaxed mb-12 font-light border-l border-[#f5a81c]/30 pl-8">
            Attire Lounge Official is Cambodia’s premier destination for refined ready-to-wear menswear. We curate timeless pieces and contemporary designs that embody elegance, empowering the modern gentleman to dress with confidence and distinction.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-8 items-center">
            <Link to="/contact" className="group relative overflow-hidden bg-[#f5a81c] text-white px-10 py-4 rounded-full transition-all duration-300 hover:pr-14 shadow-lg shadow-[#f5a81c]/10">
              <span className="relative z-10 font-semibold text-sm">Make Appointment</span>
              <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300" />
            </Link>
            
            <Link to="/lookbook" className="text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 hover:border-white/20 pb-1">
                Explore Lookbook
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="relative w-full h-full overflow-hidden order-1 lg:order-2 hidden md:block">
        <motion.div 
            initial={{ scale: 1.3 }}
            whileInView={{ scale: 1.25 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full w-full"
        >
            <OptimizedImage
              src={`${minioBaseUrl}/uploads/collections/default/key.jpg?v=new`}
              alt="Attire Lounge Interior"
              containerClassName="absolute inset-0 w-full h-full"
              className="w-full h-full"
              style={{ objectPosition: 'center 60%' }}
              loading="lazy"
            />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3542] via-[#0d3542]/10 to-transparent" />
      </div>
    </section>
)));

const CollectionsSection = memo(forwardRef<HTMLElement>((_props, ref) => {
    const showcaseImages = [
        `${minioBaseUrl}/uploads/collections/default/hvn1.jpg?v=new`,
        `${minioBaseUrl}/uploads/collections/default/mm1.jpg?v=new`,
        `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`,
        `${minioBaseUrl}/uploads/collections/default/of1.jpg?v=new`
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [showcaseImages.length]);

    return (
        <section className="relative snap-section min-h-screen h-screen flex items-center bg-[#0d3542] overflow-hidden" ref={ref}>
            <div className="relative z-10 w-full max-w-[1800px] mx-auto px-6 lg:px-20 flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-0 items-center justify-center h-full py-20 lg:py-0">
                
                {/* Visual - Left on Desktop, Top on Mobile (Columns 1-6) */}
                <div className="w-full lg:col-span-6 relative h-[45vh] md:h-[55vh] lg:h-[80vh] flex items-center justify-center z-10 order-1">
                    <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative w-full h-full max-w-[320px] md:max-w-md lg:max-w-lg aspect-[3/4]"
                    >
                        {/* Main Image Container */}
                        <div className="relative w-full h-full border border-white/5 overflow-hidden rounded-sm shadow-2xl">
                            <AnimatePresence>
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <OptimizedImage
                                        src={showcaseImages[currentImageIndex]}
                                        alt="Collection Dispatch"
                                        containerClassName="w-full h-full"
                                        className="w-full h-full"
                                    />
                                    {/* News Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    
                                        <div className="overflow-hidden">
                                            <motion.h3 
                                                initial={{ y: "100%" }}
                                                animate={{ y: 0 }}
                                                className="text-lg md:text-xl lg:text-2xl font-serif text-white uppercase tracking-[0.2em]"
                                            >
                                                {['Havana Dispatch', 'Mocha Mousse', 'The Groom Edit', 'Office Journal'][currentImageIndex]}
                                            </motion.h3>
                                        </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Editorial Story - Right on Desktop, Bottom on Mobile (Columns 8-12) */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    className="w-full lg:col-start-8 lg:col-span-5 flex flex-col justify-center z-20 order-2 text-center lg:text-left"
                >
                    <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-6 mb-8 lg:mb-12">
                        <div className="flex flex-col">
                            <span className="text-[#f5a81c] text-[8px] md:text-[10px] tracking-[0.5em] uppercase font-bold mb-1">The Portfolio</span>
                            <span className="text-white/30 text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-medium">Our Collections</span>
                        </div>
                        <div className="h-px w-12 md:w-20 bg-white/10" />
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 lg:mb-10 leading-[0.8] tracking-tighter">
                        CURATED <br/> 
                        <span className="text-[#f5a81c] italic">ELEGANCE</span>
                    </motion.h2>

                    <motion.div variants={itemVariants} className="max-w-md mx-auto lg:mx-0 mb-8 lg:mb-12">
                        <p className="text-[#E5E7EB] text-xs md:text-sm lg:text-base leading-relaxed font-light mb-6">
                            From the sharp precision of our Office line to the timeless allure of our Groom collections. 
                            Discover a versatile range of ready-to-wear pieces crafted for every chapter of the modern gentleman's life.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
                        <Link to="/collections" className="group flex items-center gap-6 lg:gap-8 py-3 lg:py-4 px-6 lg:px-8 border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all duration-500 rounded-sm">
                            <span className="tracking-[0.3em] lg:tracking-[0.4em] text-[8px] md:text-[10px] font-bold uppercase whitespace-nowrap">Explore All Collections</span>
                            <div className="w-px h-4 bg-current opacity-30" />
                            <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={14} />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}));

interface ExperienceSectionProps {
  services: Service[];
}

const ExperienceSection = memo(forwardRef<HTMLElement, ExperienceSectionProps>(({ services }, ref) => (
  <section className="relative snap-section min-h-screen h-screen flex items-center bg-[#0d3542] overflow-hidden" ref={ref}>
    {/* Mobile Background Image (Absolute) */}
    <div className="absolute inset-0 z-0 lg:hidden">
        <OptimizedImage 
            src={`${minioBaseUrl}/uploads/collections/default/both.jpg?v=new`} 
            alt="Experience Background Mobile" 
            containerClassName="w-full h-full"
            className="w-full h-full grayscale-[20%]"
            style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/70" />
    </div>

    {/* Desktop 2-Column Layout */}
    <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Image (Desktop only) */}
        <div className="hidden lg:block relative h-full w-full overflow-hidden">
            <OptimizedImage 
                src={`${minioBaseUrl}/uploads/collections/default/both.jpg?v=new`} 
                alt="Attire Lounge Experience" 
                containerClassName="absolute inset-0 w-full h-full"
                className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0d3542]/10 to-[#0d3542]" />
        </div>

        {/* Right Side: Content */}
        <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 h-full">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 w-full"
            >
                {/* Header - Minimal */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                    <span className="h-px w-6 bg-[#f5a81c]/50"></span>
                    <span className="text-[#f5a81c]/80 tracking-[0.2em] uppercase text-[10px] font-medium">Why Choose Us</span>
                </motion.div>

                <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl text-white mb-12 leading-tight">
                    The Art of <br/> <span className="text-[#E5E7EB]/50 italic font-light">Refinement</span>
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
                                <div className="p-3 rounded-full bg-white/5 text-[#f5a81c] group-hover:bg-[#f5a81c] group-hover:text-white transition-all duration-500 ease-out">
                                    {React.cloneElement(service.icon, { size: 20, className: "current-color" } as any)}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-serif text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">{service.name}</h3>
                                <p className="text-sm text-[#E5E7EB]/50 leading-relaxed font-light max-w-sm group-hover:text-[#E5E7EB]/80 transition-colors duration-300">
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



const MembershipSection = memo(forwardRef<HTMLElement>((_props, ref) => (
    <section className="relative snap-section min-h-screen h-screen flex items-center bg-[#0d3542] overflow-hidden" ref={ref}>
        {/* Mobile Background Image (Absolute) */}
        <div className="absolute inset-0 z-0 lg:hidden">
            <OptimizedImage 
                src={`${minioBaseUrl}/uploads/collections/default/vc.jpg?v=new`} 
                alt="Membership Background Mobile" 
                containerClassName="w-full h-full"
                className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Content Side (Left) */}
            <div className="relative z-10 col-span-1 lg:col-span-5 flex flex-col justify-center h-full px-6 md:px-12 lg:pl-20 lg:pr-4 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="w-full max-w-lg mx-auto lg:mx-0"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                        <Crown className="text-[#f5a81c] w-6 h-6" />
                        <span className="text-[#f5a81c] tracking-[0.3em] uppercase text-xs font-semibold">Exclusive Access</span>
                    </motion.div>
                    
                    <motion.h2 variants={itemVariants} className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
                        The Attire <br/><span className="italic text-[#E5E7EB]">Club</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-[#E5E7EB]/80 text-sm mb-8 font-light leading-relaxed border-l-2 border-[#f5a81c]/50 pl-4">
                        Join an elite circle of gentlemen. Unlock privileged pricing, seasonal rewards, and curated experiences.
                        <span className="block mt-2 text-xs opacity-60">*Minimum spend of US$500 to qualify.</span>
                    </motion.p>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {/* Tier 1: Shopping Perks */}
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#f5a81c]/20 rounded-lg text-[#f5a81c]"><CreditCard size={18} /></div>
                                <h4 className="text-white font-serif text-lg">Privileged Pricing</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm text-[#E5E7EB]">
                                    <span>$500 - $1,000</span>
                                    <span className="font-semibold text-white">8% Off</span>
                                </div>
                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-[#f5a81c] h-full w-[53%]" />
                                </div>
                                <div className="flex justify-between items-center text-sm text-[#E5E7EB]">
                                    <span>$1,001 - $1,500</span>
                                    <span className="font-semibold text-white">10% Off</span>
                                </div>
                                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-[#f5a81c] h-full w-[66%]" />
                                </div>
                                 <div className="flex justify-between items-center text-sm text-[#E5E7EB]">
                                    <span>$1,500+</span>
                                    <span className="font-semibold text-white">15% Off</span>
                                </div>
                                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-[#f5a81c] h-full w-full" />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                             {/* Tier 2: Lifestyle */}
                            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wine size={16} className="text-[#f5a81c]" />
                                    <h4 className="text-white font-serif text-base">Partners</h4>
                                </div>
                                <ul className="text-xs text-[#E5E7EB] space-y-1">
                                    <li>• 10% @ CUFFEINE</li>
                                    <li>• 8% @ Kravat Bar</li>
                                </ul>
                            </motion.div>

                            {/* Tier 3: Seasonal */}
                            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gift size={16} className="text-[#f5a81c]" />
                                    <h4 className="text-white font-serif text-base">Rewards</h4>
                                </div>
                                <ul className="text-xs text-[#E5E7EB] space-y-1">
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
                
                            {/* Visual Side (Right - Desktop only) */}
                            <div className="hidden lg:block relative col-span-7 h-full overflow-hidden">
                                <OptimizedImage
                                    src={`${minioBaseUrl}/uploads/collections/default/vc.jpg?v=new`}
                                    alt="Attire Club Membership"
                                    containerClassName="absolute inset-0 w-full h-full"
                                    className="w-full h-full"
                                    style={{ objectPosition: 'center' }}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0d3542] via-[#0d3542]/40 to-transparent w-2/3" />
                            </div>
                        </div>
                    </section>
                )));

const LookbookSection = memo(forwardRef<HTMLElement>((_props, ref) => (
  <section className="relative snap-section min-h-screen h-screen w-full overflow-hidden flex items-center justify-center" ref={ref}>
      {/* Single Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
          <motion.div
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="w-full h-full will-change-transform"
          >
              <OptimizedImage 
                  src={`${minioBaseUrl}/uploads/collections/default/as2.jpg?v=new`} 
                  alt="Lookbook Background" 
                  containerClassName="w-full h-full"
                  className="w-full h-full"
              />
          </motion.div>
          {/* Overlays for Stylist Depth - Removed backdrop-blur for performance */}
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Centered Minimalist Content */}
      <div className="relative z-10 text-center px-6">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
          >
              <span className="text-[#f5a81c] text-[10px] tracking-[0.6em] uppercase font-bold mb-6 block">The Visuals</span>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white uppercase tracking-tighter mb-12">
                  Lookbook <br/>
                  <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#FAF8F3] to-white opacity-80">Archives</span>
              </h2>
              
              <Link to="/lookbook" className="group relative inline-flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                      <ArrowRight className="text-white group-hover:text-black transition-colors duration-300" size={28} />
                  </div>
                  <span className="text-[10px] tracking-[0.4em] text-white/50 uppercase font-bold group-hover:text-white transition-colors">Explore All Works</span>
              </Link>
          </motion.div>
      </div>
  </section>
)));

interface TipsAndTricksSectionProps {
  tipsAndTricks: Tip[];
}

const TipsAndTricksSection = memo(forwardRef<HTMLElement, TipsAndTricksSectionProps>(({ tipsAndTricks }, ref) => {
  const [hoveredIndex, setHoveredIndex] = useState(1); // Center card active by default

  return (
    <section className="relative snap-section bg-[#0d3542] min-h-screen h-screen overflow-hidden flex flex-col justify-center" ref={ref}>
      <div className="relative z-10 w-full h-full flex flex-col px-6 md:px-16 lg:px-24 py-16 md:py-20 lg:py-24">
        {/* Header Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 shrink-0"
        >
            <div>
                 <div className="flex items-center gap-3 mb-3">
                     <span className="text-[#f5a81c] font-serif italic text-xl">04</span>
                     <div className="h-px w-12 bg-[#f5a81c]/50" />
                 </div>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
                    3 Ways to <br/><span className="italic text-[#E5E7EB]">Style the Jacket</span>
                </h2>
            </div>
            <p className="text-[#E5E7EB]/60 text-sm md:text-base font-light max-w-sm text-left md:text-right hidden md:block">
                Master the art of jacket styling with our expert guide, featuring versatile looks for the modern gentleman.
            </p>
        </motion.div>

        {/* Accordion Gallery */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-full min-h-0 w-full">
          {tipsAndTricks.map((tip, i) => {
            const isHovered = hoveredIndex === i;
            return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => setHoveredIndex(i)} // For mobile tap
                  className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered ? 'flex-[3] md:flex-[4]' : 'flex-[1]'} group`}
                >
                    {/* Background Image */}
                    <OptimizedImage
                        src={tip.image}
                        alt={tip.title}
                        containerClassName="absolute inset-0 w-full h-full"
                        className={`w-full h-full transition-transform duration-1000 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                        style={{ objectPosition: 'center 20%' }}
                        loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-20'}`} />

                    {/* Content Container */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                        
                        <div className="relative z-10 flex justify-between items-end">
                            {/* Main Content */}
                            <div className={`transition-all duration-500 ${isHovered ? 'w-full md:w-3/4 translate-y-0 opacity-100' : 'translate-y-4 opacity-100 md:opacity-0'}`}>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className={`font-serif text-3xl md:text-5xl transition-colors duration-300 ${isHovered ? 'text-[#f5a81c]' : 'text-white/40'}`}>
                                        0{i + 1}
                                    </span>
                                </div>
                                
                                <h3 className={`font-serif text-xl md:text-3xl text-white mb-3 leading-tight`}>
                                    {tip.title}
                                </h3>

                                <div className={`overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-[#E5E7EB]/80 text-sm md:text-base font-light mb-6 line-clamp-2 md:line-clamp-none">
                                        {tip.description}
                                    </p>
                                    
                                    <a href={tip.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-white uppercase tracking-widest text-[10px] md:text-xs font-semibold group/btn hover:text-[#f5a81c] transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover/btn:bg-[#f5a81c] group-hover/btn:border-[#f5a81c] group-hover/btn:text-white transition-all">
                                            <Play size={14} fill="currentColor" className="ml-0.5" />
                                        </div>
                                        <span>Watch Tutorial</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}));


const FooterSection = memo(forwardRef<HTMLElement>((_props, ref) => (
  <section className="relative snap-section !h-auto !min-h-screen !overflow-visible bg-black" ref={ref}>
    <div className="w-full">
      <Footer />
    </div>
  </section>
)));



// --- Main Homepage Component ---

const HomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    sectionsRef.current = sectionsRef.current.slice(0, 9); // 9 sections total (including footer)
    const handleMenuStateChange = (e: any) => {
      if (e.detail && e.detail.isMenuOpen !== undefined) setIsMenuOpen(e.detail.isMenuOpen);
    };
    window.addEventListener('menuStateChange', handleMenuStateChange);
    return () => window.removeEventListener('menuStateChange', handleMenuStateChange);
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const target = sectionsRef.current[index];
    if (target) {
       if (window.lenis) {
           window.lenis.scrollTo(target, { duration: 1.0 });
       } else {
           target.scrollIntoView({ behavior: 'smooth' });
       }
    }
  }, []);

  // --- Smooth JS Snap Logic (Replaces CSS Snap) ---
  useEffect(() => {
    let scrollTimeout: number;
    const handleScroll = () => {
        window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
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
                if (!targetSection) return;
                
                const dist = Math.abs(targetSection.offsetTop - scrollY);
                const isTallSection = targetSection.offsetHeight > viewportHeight + 50;

                // If we are very close (already snapped), do nothing to avoid jitter
                if (dist < 5) return;

                if (!isTallSection) {
                    window.lenis.scrollTo(targetSection, { duration: 0.6 });
                } else {
                    // Tall section logic
                    const snapThreshold = viewportHeight * 0.3;
                    if (dist < snapThreshold) {
                         window.lenis.scrollTo(targetSection, { duration: 0.6 });
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
            const index = sectionsRef.current.indexOf(entry.target as HTMLElement);
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
        scrollToSection(5);
      }, 100); // Slight delay to ensure render
    }
  }, [location.hash, scrollToSection]);

  const { services, lookbookFeatures, tipsAndTricks } = homePageData;

  const sectionNames = ['Home', 'Philosophy', 'Collections', 'Fashion Show', 'Experience', 'Membership', 'Lookbook', 'Tips & Tricks', 'Appointment and Contact'];

  return (
    <div className="snap-scroll-container bg-[#111111]">
      <SEO 
        title="Attire Lounge | Elite Bespoke Tailoring & Ready-to-Wear"
        description="Discover the art of refined menswear in Phnom Penh. From Milan-certified styling to timeless bespoke collections, Attire Lounge is your destination for excellence."
      />
      <SectionIndicator
        sections={sectionNames}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isMenuOpen={isMenuOpen}
      />
      <HeroSection ref={el => sectionsRef.current[0] = el} scrollToSection={scrollToSection} />
      <PhilosophySection ref={el => sectionsRef.current[1] = el} />
      <CollectionsSection ref={el => sectionsRef.current[2] = el} />
      <FashionShow ref={el => sectionsRef.current[3] = el} />
      <ExperienceSection ref={el => sectionsRef.current[4] = el} services={services} />
      <MembershipSection ref={el => sectionsRef.current[5] = el} />
      <LookbookSection ref={el => sectionsRef.current[6] = el} lookbookFeatures={lookbookFeatures} />
      <TipsAndTricksSection ref={el => sectionsRef.current[7] = el} tipsAndTricks={tipsAndTricks} />
      <FooterSection ref={el => sectionsRef.current[8] = el} />
    </div>
  );
};

export default HomePage;
