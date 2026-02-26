import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, MapPin, Calendar, Users, Star } from 'lucide-react';
import minioBaseUrl from '../../config.js';
import Skeleton from '../common/Skeleton.jsx';
import OptimizedImage from '../common/OptimizedImage.jsx';
import GrainOverlay from '../common/GrainOverlay.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } }
};

const fallback = "https://images.unsplash.com/photo-1594932224030-940af6602380?q=80&w=2000";

const ActGallery = memo(({ act, title, description, images, isRight = false }) => {
  const containerRef = useRef(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateConstraints = () => {
        const scrollWidth = containerRef.current.scrollWidth;
        const offsetWidth = containerRef.current.offsetWidth;
        setConstraints({ left: -(scrollWidth - offsetWidth), right: 0 });
      };
      
      const timer = setTimeout(updateConstraints, 800);
      window.addEventListener('resize', updateConstraints);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateConstraints);
      };
    }
  }, [images]);

  return (
    <section className="py-24 lg:py-40 container mx-auto px-8 lg:px-32 overflow-hidden">
      <div className={`flex flex-col lg:flex-row gap-16 lg:gap-24 items-end mb-20 ${isRight ? 'lg:flex-row-reverse' : ''}`}>
        <motion.div 
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className={`lg:w-1/2 ${isRight ? 'text-left lg:text-right' : 'text-left'}`}
        >
          <div className={`flex items-center gap-4 mb-8 ${isRight ? 'lg:flex-row-reverse' : ''}`}>
            <span className="font-serif italic text-xl text-attire-accent opacity-50">{act.split(' ')[1]}</span>
            <div className={`h-px flex-1 bg-gradient-to-r ${isRight ? 'lg:from-transparent lg:to-attire-accent/20 from-attire-accent/20 to-transparent' : 'from-attire-accent/20 to-transparent'}`} />
          </div>
          <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-10 tracking-tighter leading-[0.9] italic" dangerouslySetInnerHTML={{ __html: title }} />
          <div className={`flex gap-8 items-start ${isRight ? 'lg:flex-row-reverse' : ''}`}>
            <div className="w-10 h-px bg-attire-accent mt-3 shrink-0" />
            <p className="text-white/40 font-light text-sm md:text-base leading-relaxed max-w-sm">
              {description}
            </p>
          </div>
        </motion.div>
        
        <div className={`lg:w-1/2 flex flex-col gap-3 ${isRight ? 'lg:items-start' : 'lg:items-end'}`}>
          <span className="text-[9px] uppercase tracking-[0.6em] text-white/20 font-bold">Showcase Portfolio</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => <Star key={i} size={7} className="text-attire-accent opacity-20" />)}
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div 
          ref={containerRef}
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.1}
          dragTransition={{ 
            power: 0.1, 
            timeConstant: 400 
          }}
          whileDrag={{ scale: 0.998 }}
          className="flex gap-6 pb-12 will-change-transform"
          style={{ touchAction: 'none' }}
        >
          {images.map((src, i) => (
            <div 
              key={i} 
              className="flex-none w-[220px] md:w-[280px] lg:w-[340px] aspect-[3/4.2] rounded-[1px] shadow-xl border border-white/5 select-none overflow-hidden"
            >
              <OptimizedImage src={src} alt={`${act} - Walk ${i + 1}`} fallback={fallback} />
            </div>
          ))}
          <div className="flex-none w-px md:w-32" />
        </motion.div>
        
        <div className="flex items-center justify-center gap-4 opacity-20">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-bold">Slide to Reveal</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
        </div>
      </div>
    </section>
  );
});

ActGallery.displayName = 'ActGallery';

// Prestige Logo Component for reliability
const PrestigeLogo = () => (
  <div className="flex items-baseline gap-1 select-none">
    <span className="font-serif text-xl tracking-[0.2em] font-light text-white">PRESTIGE</span>
    <div className="w-1 h-1 bg-attire-accent rounded-full mb-1" />
  </div>
);

const FashionShowPage = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  const act1Images = useMemo(() => Array.from({ length: 11 }, (_, i) => 
    `${minioBaseUrl}/uploads/WALK_1/walk1_${i + 1}.webp`
  ), []);

  const act2Images = useMemo(() => Array.from({ length: 11 }, (_, i) => 
    `${minioBaseUrl}/uploads/WALK_2/walk2_${i + 1}.webp`
  ), []);

  const heroImage = "https://images.prestigeonline.com/wp-content/uploads/sites/9/2026/02/02140813/Z629270-1353x900.jpg";
  const logo = "https://www.prestigeonline.com/wp-content/themes/prestige/assets/images/logo.png";

  return (
    <div className="bg-[#0d3542] text-white min-h-screen selection:bg-attire-accent selection:text-white font-sans leading-relaxed overflow-x-hidden">
      <GrainOverlay opacity={0.02} />
      
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "linear" }}
            src={heroImage} alt="Hero" className="w-full h-full object-cover opacity-40 lg:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d3542]/50 via-transparent to-[#0d3542]" />
        </div>

        <div className="relative z-10 px-6 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
            <span className="text-[9px] tracking-[1.2em] uppercase text-attire-accent font-bold mb-10 block opacity-80">Vol. 01 • The Inaugural Showcase</span>
            <h1 className="font-serif text-[10vw] md:text-8xl lg:text-[9rem] font-light tracking-tighter italic mb-12 leading-[0.85] mix-blend-screen">
              Sartorial <br /> Manifesto
            </h1>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-[9px] tracking-[0.4em] uppercase text-white/40 font-bold border-t border-white/5 pt-12">
              {[ { Icon: MapPin, text: 'Rosewood PP' }, { Icon: Users, text: '68 Guests' }, { Icon: Calendar, text: 'Feb 2025' } ].map(({ Icon, text }, i) => (
                <span key={i} className="flex items-center gap-2.5 transition-colors hover:text-attire-accent duration-500">
                  <Icon size={10} className="text-attire-accent" /> {text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-white" />
        </motion.div>
      </section>

      <ActGallery act="Act I" title="Shades of <br/> Elegance" description="Formal elegance for gentlemen has typically been confined to the safety of black or midnight blue. Through ACT I, we chose to show you that gentlemen’s wardrobes can be as vibrant as their ambitions. We wanted to showcase how soft-textured accessories and subtle color hues can elevate formal, elegant attire for Cambodian gentlemen." images={act1Images} />
      <ActGallery act="Act II" title="Street <br/> Sartorial" description="The word ‘sartorial’ traditionally refers to refined, elegant menswear. We placed ‘street’ before it because elegance should have room to bend. It should allow space for self-expression, mixing and matching, whether it’s a quality piece from Attire Lounge Official, something thrifted, or even something borrowed from your family’s closet" images={act2Images} isRight={true} />

      {/* Enhanced Press & CTA Section */}
      <section className="py-32 lg:py-56 relative overflow-hidden">
        {/* Top Fade Overlay */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0d3542] to-transparent z-10 pointer-events-none" />
        
        {/* Subtle Background Image */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none">
          <OptimizedImage
            src={`https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/fsb.webp`}
            alt="Fashion Show Background"
            objectFit="cover"
            containerClassName="w-full h-full"
            className="w-full h-full"
          />
        </div>

        <div className="container mx-auto px-8 lg:px-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-12 items-center">
            
            {/* Left: Press Content (6/12) */}
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="lg:col-span-6 relative"
            >
              <div className="mb-16 flex flex-col items-start">
                <div className="mb-8 opacity-60">
                  <PrestigeLogo />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.6em] text-attire-accent font-bold">Featured In</span>
                  <div className="h-px w-12 bg-attire-accent/30" />
                </div>
              </div>
              
              <h2 className="font-serif text-4xl md:text-6xl italic text-white/90 leading-[1.1] mb-12 tracking-tighter">
                &ldquo;Fit, edit, and courage converge to inspire <span className="text-attire-accent">new possibilities.</span>&rdquo;
              </h2>
              
              <a 
                href="https://www.prestigeonline.com/kh/cambodia/attire-lounge-official-hosts-first-curated-gentlemens-fashion-showcase/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group inline-flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-attire-accent group-hover:bg-attire-accent transition-all duration-700">
                  <ExternalLink size={16} className="text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 group-hover:text-white transition-colors mb-1">Press Release</span>
                  <span className="text-[11px] text-white/20 font-light border-b border-white/5 group-hover:border-attire-accent transition-colors">View Full Article</span>
                </div>
              </a>
            </motion.div>

            {/* Right: CTA Card (5/12 offset 1) */}
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="lg:col-span-5 lg:col-start-8"
            >
              <div className="relative p-12 lg:p-20 bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-px -left-px w-12 h-12 border-t border-l border-attire-accent/40" />
                <div className="absolute -bottom-px -right-px w-12 h-12 border-b border-r border-attire-accent/40" />
                
                <div className="mb-12">
                  <span className="text-[9px] tracking-[0.8em] uppercase text-white/20 mb-2 block font-bold">The Experience</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => <Star key={i} size={8} className="text-attire-accent/30" fill="currentColor" />)}
                  </div>
                </div>
                
                <h3 className="font-serif text-4xl lg:text-5xl italic font-light mb-12 tracking-tighter leading-none text-white">
                  Define Your <br/> <span className="text-attire-accent opacity-80">Own</span> Standard
                </h3>
                
                <p className="text-white/40 text-sm font-light leading-relaxed mb-16 max-w-xs">
                  Experience the pinnacle of styling excellence. Join us for a private consultation in our Phnom Penh atelier.
                </p>

                <a 
                  href="/contact" 
                  className="group flex items-center justify-between w-full py-8 border-t border-white/10 hover:border-attire-accent transition-colors duration-700"
                >
                  <span className="text-[12px] uppercase tracking-[0.6em] font-bold text-white group-hover:text-attire-accent transition-colors">Book Now</span>
                  <div className="flex items-center gap-4">
                     <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">Consultation</span>
                     <ArrowRight size={20} className="text-attire-accent transform group-hover:translate-x-4 transition-transform duration-700 ease-out" />
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default FashionShowPage;
