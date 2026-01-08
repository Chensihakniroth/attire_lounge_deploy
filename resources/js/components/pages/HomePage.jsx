// resources/js/components/pages/HomePage.jsx - V6 (Final Polish with Glass Effects)
import React, { useEffect, useRef, useState, useCallback, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Scissors, Coffee, ArrowRight, Gem, Feather, Palette } from 'lucide-react';
import Footer from '../layouts/Footer';
import { Link } from 'react-router-dom';

import minioBaseUrl from '../../config.js';

// --- Data Store for Homepage Sections ---
const homePageData = {
  collections: [
    { name: "Sartorial", description: "Classic ready-to-wear style from top-to-toe.", image: `${minioBaseUrl}/uploads/collections/Model/1.jpg`, link: "/collections" },
    { name: "Groom & Groomsmen", description: "Elevate your style on your special day.", image: `${minioBaseUrl}/uploads/collections/Model/2.jpg`, link: "/collections" },
    { name: "Office Wear", description: "Feel your best at work with modern, diverse styles.", image: `${minioBaseUrl}/uploads/collections/Model/3.jpg`, link: "/collections" },
    { name: "Accessories", description: "The little details that make a big difference.", image: `${minioBaseUrl}/uploads/collections/Model/4.jpg`, link: "/collections" }
  ],
  services: [
    { name: "Milan-Certified Styling", description: "Receive a free, expert styling consultation from our Milan-certified team to discover the perfect look for you.", icon: <Users size={32} className="text-attire-accent" /> },
    { name: "The Perfect Fit", description: "We offer diverse sizes and provide complimentary in-house alterations to ensure your garments fit impeccably.", icon: <Scissors size={32} className="text-attire-accent" /> },
    { name: "A Premium Experience", description: "Enjoy a relaxing atmosphere and complimentary drinks during your visit, making your styling session a true pleasure.", icon: <Coffee size={32} className="text-attire-accent" /> }
  ],
  craftsmanship: [
    { name: "Finest Materials", description: "We source exquisite fabrics from renowned mills across the globe, ensuring unparalleled quality and comfort in every piece.", icon: <Gem size={28} className="text-attire-silver" /> },
    { name: "Bespoke Tailoring", description: "Our master tailors blend traditional techniques with modern precision to craft garments that are uniquely yours.", icon: <Feather size={28} className="text-attire-silver" /> },
    { name: "Timeless Design", description: "We create contemporary yet timeless designs that form the foundation of a distinguished wardrobe.", icon: <Palette size={28} className="text-attire-silver" /> }
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative z-10 h-full flex items-center justify-center">
      <img src={`${minioBaseUrl}/uploads/asset/AL_logo.png`} alt="Attire Lounge" className="h-auto mx-auto filter brightness-0 invert drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-90 max-w-[280px] md:max-w-sm" loading="eager" />
    </motion.div>
  </section>
)));

const PhilosophySection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section min-h-screen h-screen flex items-center justify-center p-8 overflow-hidden" ref={ref}>
    {/* Background Image */}
    <div className="absolute inset-0 w-full h-full bg-cover bg-center"
         style={{ backgroundImage: `url('${minioBaseUrl}/uploads/collections/default/phera.jpg')` }}
    />
    {/* Overlay */}
    <div className="absolute inset-0 bg-attire-dark/60" />

    {/* Text Content - Same structure as ExperienceSection */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto text-attire-cream text-center p-4">
            <motion.h2 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="font-serif text-sm md:text-base tracking-[0.2em] text-attire-accent uppercase mb-4">Our Philosophy</motion.h2>
            <motion.p variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.2 }} className="font-serif text-2xl md:text-4xl text-attire-cream leading-relaxed">
              Attire Lounge is Cambodia's first sartorial gentlemen's styling house, offering a variety of ready-to-wear collections and premium styling with our Milan-certified team.
            </motion.p>
        </div>
    </div>
  </section>
)));

const CollectionsSection = memo(forwardRef(({ collections }, ref) => (
  <section className="relative snap-section bg-attire-dark min-h-screen h-screen flex flex-col justify-center" ref={ref}>
    <div className="w-full text-center pt-12 md:pt-24 px-4">
      <h2 className="font-serif text-3xl md:text-5xl text-white mb-2">Our Collections</h2>
      <p className="text-attire-silver mb-10">Curated styles for the modern gentleman.</p>
    </div>
    <div className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px">
      {collections.map((collection) => (
        <motion.div key={collection.name} className="relative overflow-hidden group" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Link to={collection.link} className="block w-full h-full">
            <img src={collection.image} alt={collection.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-attire-dark/70 via-attire-dark/30 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8 text-attire-cream">
              <h3 className="font-serif text-3xl mb-2">{collection.name}</h3>
              <p className="text-attire-silver mb-4">{collection.description}</p>
              <div className="flex items-center gap-2 text-attire-accent group-hover:gap-3 transition-all"><span>Explore</span><ArrowRight size={16} /></div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
)));

const ExperienceSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section min-h-screen h-screen flex flex-col justify-center overflow-hidden" ref={ref}>
    <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
         style={{ backgroundImage: `url('${minioBaseUrl}/uploads/collections/default/ping.jpg')` }}
    />
    <div className="absolute inset-0 bg-attire-dark/60" />
    <div className="absolute inset-0 flex items-center justify-center"> {/* This is the flex container */}
        <div className="w-full max-w-6xl mx-auto text-attire-cream text-center p-4"> {/* New div to group and center content */}
            <h2 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">Sartorial</h2>
            <p className="max-w-3xl mx-auto text-attire-silver md:text-xl leading-relaxed">
                Classic ready-to-wear sartorial style from top-to-toe including blazers, suits, shirts, high-rise pants, and gentlemen accessories.
            </p>
        </div>
    </div>
  </section>
)));

const CraftsmanshipSection = memo(forwardRef((props, ref) => (
    <section className="relative snap-section min-h-screen h-screen flex items-center justify-center p-8 overflow-hidden" ref={ref}>
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center"
             style={{ backgroundImage: `url('${minioBaseUrl}/uploads/collections/Model/1.jpg')` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Foreground Images */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-7xl mx-auto px-4">
            {/* Image 2 */}
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="relative group overflow-hidden aspect-w-3 aspect-h-4 shadow-lg rounded-lg">
                <img src={`${minioBaseUrl}/uploads/collections/Model/2.jpg`} alt="Sartorial Fit 2"
                     className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"/>
            </motion.div>
            {/* Image 3 */}
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.2 }}
                        className="relative group overflow-hidden aspect-w-3 aspect-h-4 shadow-lg rounded-lg">
                <img src={`${minioBaseUrl}/uploads/collections/Model/3.jpg`} alt="Sartorial Fit 3"
                     className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"/>
            </motion.div>
            {/* Image 4 */}
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.4 }}
                        className="relative group overflow-hidden aspect-w-3 aspect-h-4 shadow-lg rounded-lg">
                <img src={`${minioBaseUrl}/uploads/collections/Model/4.jpg`} alt="Sartorial Fit 4"
                     className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"/>
            </motion.div>
        </div>
    </section>
)));

const LookbookSection = memo(forwardRef((props, ref) => (
  <section className="relative snap-section bg-attire-dark min-h-screen h-screen" ref={ref}>
    <img src={`${minioBaseUrl}/uploads/collections/Model/5.jpg`} alt="Lookbook" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" decoding="async" />
    <div className="absolute inset-0 bg-attire-dark/50" />
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

  const { collections, services, craftsmanship } = homePageData;

  return (
    <div className="snap-scroll-container bg-black">
      <HeroSection ref={el => sectionsRef.current[0] = el} scrollToSection={scrollToSection} />
      <PhilosophySection ref={el => sectionsRef.current[1] = el} />
      <CollectionsSection ref={el => sectionsRef.current[2] = el} collections={collections} />
      <ExperienceSection ref={el => sectionsRef.current[3] = el} services={services} />
      <CraftsmanshipSection ref={el => sectionsRef.current[4] = el} craftsmanship={craftsmanship} />
      <LookbookSection ref={el => sectionsRef.current[5] = el} />
      <CTASection ref={el => sectionsRef.current[6] = el} />
      <FooterSection ref={el => sectionsRef.current[7] = el} />
    </div>
  );
};

export default HomePage;
