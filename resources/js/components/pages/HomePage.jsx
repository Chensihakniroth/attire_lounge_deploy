// resources/js/components/pages/HomePage.jsx - V6 (Final Polish with Glass Effects)
import React, { useEffect, useRef, useState, useCallback, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Scissors, Coffee, ArrowRight, Gem, Feather, Palette, ChevronDown, CheckCircle, BookOpen, Camera, Sparkles } from 'lucide-react';
import Footer from '../layouts/Footer.jsx';
import { Link } from 'react-router-dom';
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
      <video autoPlay muted loop playsInline preload="auto" className="absolute w-full h-full object-cover" style={{ objectPosition: 'center 10%' }}><source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" /></video>
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
        <div className="absolute inset-0 bg-gradient-to-r from-attire-navy via-transparent to-transparent" />
      </div>
    </section>
)));

const CollectionsSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen" ref={ref}>
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center"
             style={{ backgroundImage: `url('${minioBaseUrl}/uploads/collections/default/g1.jpg')` }}
        />
<div className="absolute inset-0 bg-black/50" />

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
  <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy" ref={ref}>
    {/* Mobile Background */}
    <div className="md:hidden absolute inset-0">
      <img src={`${minioBaseUrl}/uploads/collections/default/both.jpg`} alt="Background" className="w-full h-full object-cover"/>
      <div className="absolute inset-0 bg-black/60"/>
    </div>

    {/* Left side - Image (Desktop) */}
    <div className="relative w-full h-full overflow-hidden hidden md:block">
        <img
            src={`${minioBaseUrl}/uploads/collections/default/both.jpg`}
            alt="Attire Lounge Style"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-attire-navy via-transparent to-transparent" />
    </div>

    {/* Right side - Text Content */}
    <div className="relative flex flex-col justify-center text-attire-cream p-8 md:p-16 h-full">
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
                        <span>Diverse sizes suitable for all body types</span>
                    </li>
                </ul>
            </motion.div>
        </motion.div>
    </div>
  </section>
)));



const MembershipSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-attire-navy" ref={ref}>
        {/* Mobile Background */}
        <div className="md:hidden absolute inset-0">
          <img src={`${minioBaseUrl}/uploads/collections/default/vc.jpg`} alt="Background" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/60"/>
        </div>

        {/* Left side - Text Content */}
        <div className="relative flex flex-col justify-center text-attire-cream p-8 md:p-12 h-full overflow-y-auto">
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

        {/* Right side - Image (Desktop) */}
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
    <section className="relative snap-section bg-attire-navy pt-8 pb-16" ref={ref}>
      <div className="relative z-10 w-full max-w-7xl mx-auto text-center text-attire-cream px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-10"
        >
          <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl mb-4">Tips & Tricks</motion.h2>
          <motion.p variants={itemVariants} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-attire-silver text-base md:text-lg">
            Master the art of sophisticated dressing with our expert guidance.
          </motion.p>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          {tipsAndTricks.map((tip, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              transition={{ delay: 0.4 + i * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <a
                href={tip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-auto rounded-lg overflow-hidden group"
              >
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  loading="lazy"
                />
              </a>
              <div>
                <h3 className="font-serif text-lg md:text-xl text-white mb-1 break-words">{tip.title}</h3>
                <p className="text-attire-silver text-sm break-words">{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile Grid */}
        <div className="md:hidden flex flex-wrap justify-center gap-4">
          {tipsAndTricks.map((tip, i) => (
            <div key={i} className="w-[calc(50%-0.5rem)] flex flex-col items-center text-center">
                <a
                  href={tip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full aspect-video rounded-lg overflow-hidden group shadow-lg"
                >
                  <img
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                    loading="lazy"
                  />
                </a>
                <div className="mt-2">
                  <h3 className="font-serif text-base text-white mb-1">{tip.title}</h3>
                  <p className="text-attire-silver text-xs leading-snug">{tip.description}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}));


const FooterSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section bg-black" ref={ref}>
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
    setActiveSection(index); // Update state immediately
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

  const { services, lookbookFeatures, tipsAndTricks } = homePageData;

  const sectionNames = ['Home', 'Philosophy', 'Collections', 'Experience', 'Membership', 'Lookbook', 'Tips & Tricks', 'Contact'];

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
