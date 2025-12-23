// resources/js/components/pages/HomePage.jsx - SMOOTH DELAYED SCROLL
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Footer from '../layouts/Footer';

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs
  const sectionsRef = useRef([]);
  const touchStartX = useRef(0);
  const isAnimatingRef = useRef(false);
  const wheelTimeoutRef = useRef(null);
  const scrollCooldownRef = useRef(false);
  const lastScrollDirection = useRef('down');
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(0);
  const canScrollRef = useRef(true);

  // Hero images
  const heroImages = [
    { src: '/uploads/collections/Model/1.jpg', title: 'Modern Elegance', subtitle: 'Spring/Summer Collection' },
    { src: '/uploads/collections/Model/2.jpg', title: 'Urban Sophistication', subtitle: 'Evening Wear Collection' },
    { src: '/uploads/collections/Model/3.jpg', title: 'Timeless Luxury', subtitle: 'Limited Edition' }
  ];

  // ========== MOBILE DETECTION ==========
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ========== DISABLE NATIVE SNAP ON DESKTOP ==========
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.scrollSnapType = 'none';
      document.documentElement.style.scrollBehavior = 'auto';
    } else {
      document.documentElement.style.scrollSnapType = 'y mandatory';
    }

    return () => {
      document.documentElement.style.scrollSnapType = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [isMobile]);

  // ========== SMOOTH SCROLL TO SECTION ==========
  const scrollToSection = useCallback((index) => {
    if (isAnimatingRef.current || !sectionsRef.current[index] || isMenuOpen || !canScrollRef.current) return;

    isAnimatingRef.current = true;
    canScrollRef.current = false; // Prevent new scrolls during animation

    const section = sectionsRef.current[index];
    const startY = window.scrollY;
    const targetY = section.offsetTop;
    const distance = targetY - startY;

    // Slightly longer duration for smoother feel
    const duration = Math.max(600, Math.min(1000, Math.abs(distance) * 0.5));

    const startTime = performance.now();

    // Smooth easing with slight anticipation
    const easeInOutExpo = (t) => {
      return t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutExpo(progress);

      window.scrollTo({ top: startY + distance * easedProgress, behavior: 'auto' });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Final exact position
        window.scrollTo({ top: targetY, behavior: 'auto' });
        setActiveSection(index);
        isAnimatingRef.current = false;

        // Add cooldown period before allowing next scroll
        setTimeout(() => {
          canScrollRef.current = true;
        }, 150); // 150ms cooldown after animation ends
      }
    };

    requestAnimationFrame(animate);
  }, [isMenuOpen]);

  // ========== OPTIMIZED MOUSE WHEEL WITH SMOOTH DELAY ==========
  useEffect(() => {
    if (isMobile) return;

    const SCROLL_THRESHOLD = 60; // Higher threshold for more deliberate scrolling
    const SCROLL_COOLDOWN = 300; // 300ms cooldown between scroll triggers
    const MIN_TIME_BETWEEN_SCROLLS = 100; // Minimum 100ms between scroll detections

    const handleWheel = (e) => {
      e.preventDefault();

      const now = Date.now();
      const deltaY = e.deltaY || e.detail || e.wheelDelta * -1;
      const direction = deltaY > 0 ? 'down' : 'up';

      // Ignore if we're in cooldown or already animating
      if (!canScrollRef.current || isAnimatingRef.current || scrollCooldownRef.current) return;

      // Ignore if too soon since last scroll detection
      if (now - lastScrollTime.current < MIN_TIME_BETWEEN_SCROLLS) return;

      // Update accumulator and timing
      scrollAccumulator.current += Math.abs(deltaY);
      lastScrollDirection.current = direction;
      lastScrollTime.current = now;

      // Only trigger if enough wheel movement accumulated
      if (scrollAccumulator.current > SCROLL_THRESHOLD) {
        let newIndex = activeSection;

        if (direction === 'down') {
          newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1);
        } else {
          newIndex = Math.max(activeSection - 1, 0);
        }

        if (newIndex !== activeSection) {
          // Set cooldown
          scrollCooldownRef.current = true;

          // Trigger scroll
          scrollToSection(newIndex);

          // Reset cooldown after delay
          setTimeout(() => {
            scrollCooldownRef.current = false;
          }, SCROLL_COOLDOWN);
        }

        // Reset accumulator
        scrollAccumulator.current = 0;
      }

      // Clear any existing timeout
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);

      // Gradually reset accumulator if user stops scrolling
      wheelTimeoutRef.current = setTimeout(() => {
        scrollAccumulator.current = 0;
      }, 250);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [isMobile, activeSection, scrollToSection]);

  // ========== KEYBOARD NAVIGATION WITH DELAY ==========
  useEffect(() => {
    let keyCooldown = false;

    const handleKeyDown = (e) => {
      if (isAnimatingRef.current || isMenuOpen || keyCooldown) return;

      let newIndex = activeSection;

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          newIndex = Math.min(activeSection + 1, sectionsRef.current.length - 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          newIndex = Math.max(activeSection - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = sectionsRef.current.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== activeSection) {
        // Set cooldown for keys too
        keyCooldown = true;
        scrollToSection(newIndex);

        // Reset cooldown after delay
        setTimeout(() => {
          keyCooldown = false;
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, scrollToSection, isMenuOpen]);

  // ========== MOBILE GALLERY SWIPE ==========
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
  }, [isMobile]);

  const handleTouchEnd = useCallback((e) => {
    if (!isMobile || !touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        setCurrentImageIndex(prev => prev === 0 ? heroImages.length - 1 : prev - 1);
      } else {
        setCurrentImageIndex(prev => prev === heroImages.length - 1 ? 0 : prev + 1);
      }
    }

    touchStartX.current = 0;
  }, [isMobile, heroImages.length]);

  // ========== INITIALIZE SECTIONS ==========
  useEffect(() => {
    const updateSections = () => {
      const sections = document.querySelectorAll('.snap-section');
      sectionsRef.current = Array.from(sections);
    };

    // Delay initialization slightly to ensure DOM is ready
    setTimeout(updateSections, 100);

    // Listen for menu state
    const handleMenuStateChange = (e) => {
      if (e.detail && e.detail.isMenuOpen !== undefined) {
        setIsMenuOpen(e.detail.isMenuOpen);
      }
    };

    window.addEventListener('menuStateChange', handleMenuStateChange);
    return () => window.removeEventListener('menuStateChange', handleMenuStateChange);
  }, []);

  // Calculate image indices
  const goToImage = useCallback((index) => {
    if (!isMobile || index === currentImageIndex) return;
    setCurrentImageIndex(index);
  }, [isMobile, currentImageIndex]);

  return (
    <div className="snap-scroll-container">
      {/* Section 1 - Hero */}
      <section
        className="relative snap-section overflow-hidden min-h-screen h-screen"
        ref={el => {
          if (el && !sectionsRef.current[0]) sectionsRef.current[0] = el;
        }}
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute w-full h-full object-cover"
            style={{ objectPosition: 'center 10%' }}
          >
            <source src="/videos/hero-background1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 h-full flex items-center justify-center"
        >
          <div className="text-center px-4">
            <img
              src="/uploads/asset/AL_logo.png"
              alt="Attire Lounge"
              className="hero-logo h-auto mx-auto filter brightness-0 invert drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-90 max-w-[280px] md:max-w-none"
              loading="eager"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => scrollToSection(1)}
        >
          <div className="text-white/70 text-sm mb-2">Scroll</div>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Section 2 - Gallery */}
      <section
        className="relative snap-section bg-black min-h-screen h-screen"
        ref={el => {
          if (el && !sectionsRef.current[1]) sectionsRef.current[1] = el;
        }}
      >
        {/* Desktop layout */}
        <div className="hidden md:flex h-full w-full bg-white">
          <div className="w-2/3 h-full flex flex-col">
            <div className="relative h-1/2 w-full overflow-hidden group">
              <img
                src="/uploads/collections/Model/1.jpg"
                alt="Modern Elegance"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white z-10">
                <h3 className="font-playfair text-3xl md:text-4xl font-light mb-2">Modern Elegance</h3>
                <p className="text-sm opacity-90 tracking-wider">Spring/Summer Collection</p>
              </div>
            </div>

            <div className="relative h-1/2 w-full overflow-hidden group">
              <img
                src="/uploads/collections/Model/2.jpg"
                alt="Urban Sophistication"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white z-10">
                <h3 className="font-playfair text-3xl md:text-4xl font-light mb-2">Urban Sophistication</h3>
                <p className="text-sm opacity-90 tracking-wider">Evening Wear Collection</p>
              </div>
            </div>
          </div>

          <div className="w-1/3 h-full relative overflow-hidden group">
            <img
              src="/uploads/collections/Model/3.jpg"
              alt="Timeless Luxury"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white z-10">
              <h3 className="font-playfair text-3xl md:text-4xl font-light mb-2">Timeless Luxury</h3>
              <p className="text-sm opacity-90 tracking-wider">Limited Edition</p>
            </div>
          </div>
        </div>

        {/* Mobile swipe gallery */}
        <div
          className="md:hidden h-full w-full relative overflow-hidden bg-black"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 w-full h-full">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex].src}
              alt={heroImages[currentImageIndex].title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-24 left-0 right-0 text-center text-white px-4">
              <h3 className="font-playfair text-3xl font-light mb-2">
                {heroImages[currentImageIndex].title}
              </h3>
              <p className="text-sm opacity-90 tracking-wider">
                {heroImages[currentImageIndex].subtitle}
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'w-8 h-2 bg-white rounded-full'
                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Content */}
      <section
        className="relative snap-section bg-gradient-to-br from-attire-cream to-attire-cream/50 min-h-screen h-screen"
        ref={el => {
          if (el && !sectionsRef.current[2]) sectionsRef.current[2] = el;
        }}
      >
        <div className="h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-2xl"
          >
            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-attire-charcoal mb-6">
              Experience Luxury
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-attire-stone mb-8">
              Discover premium styling and bespoke services tailored for the modern gentleman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection(0)}
                className="px-8 py-3 bg-attire-charcoal text-white rounded-full font-medium hover:bg-attire-dark transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Back to Top
              </button>
              <button
                onClick={() => scrollToSection(3)}
                className="px-8 py-3 border-2 border-attire-charcoal text-attire-charcoal rounded-full font-medium hover:bg-attire-charcoal hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Continue to Footer
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4 - Footer */}
      <section
        className="relative snap-section bg-black"
        ref={el => {
          if (el && !sectionsRef.current[3]) sectionsRef.current[3] = el;
        }}
        style={{
          minHeight: '100vh',
          height: 'auto',
          overflowY: 'visible'
        }}
      >
        <div className="h-full w-full">
          <Footer />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
