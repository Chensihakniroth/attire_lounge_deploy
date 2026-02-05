import React, { memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const FashionShow = memo(forwardRef((props, ref) => {
  return (
    <section 
      className="relative snap-section min-h-screen w-full bg-attire-navy overflow-hidden flex items-center" 
      ref={ref}
    >
      {/* Dynamic Background Color Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-attire-navy" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-attire-accent"></span>
                <span className="text-attire-accent text-[10px] tracking-[0.5em] uppercase font-bold">Inaugural Event</span>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tighter">
                  Sartorial <br />
                  <span className="text-attire-accent italic">Excellence</span>
                </h2>
                <p className="text-attire-silver/60 text-sm tracking-[0.2em] uppercase font-light">
                  Rosewood Phnom Penh • Feb 2025
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="max-w-md">
                <p className="text-attire-silver text-lg font-light leading-relaxed border-l border-white/10 pl-8 py-2">
                  An exclusive evening where traditional craftsmanship met contemporary street refinement, setting a new standard for menswear in the heart of Cambodia.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-6">
                <a 
                  href="https://www.prestigeonline.com/kh/cambodia/attire-lounge-official-hosts-first-curated-gentlemens-fashion-showcase/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-8 py-5 px-10 border border-white/10 bg-white/[0.02] hover:bg-white hover:text-black transition-all duration-700 rounded-full backdrop-blur-sm"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Read Full Story</span>
                  <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                    <ArrowRight size={16} />
                  </div>
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative group">
              {/* Main Image Frame */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="relative z-10 aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/3] overflow-hidden rounded-sm shadow-2xl"
              >
                <img 
                  src="https://images.prestigeonline.com/wp-content/uploads/sites/9/2026/02/02140813/Z629270-1353x900.jpg" 
                  alt="Rosewood Fashion Event" 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                
                {/* Floating Info Card */}
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase">The Highlight</p>
                      <h4 className="text-white font-serif text-2xl italic tracking-wide">Street Sartorial</h4>
                    </div>
                    <div className="hidden md:block">
                      <ExternalLink className="text-attire-accent opacity-50" size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Secondary Image or Element */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.4, duration: 1.2 }}
                viewport={{ once: true }}
                className="absolute -bottom-10 -left-10 w-2/3 h-2/3 border border-attire-accent/20 z-0 pointer-events-none rounded-sm"
              />
              
              {/* Visual Accent */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-attire-accent/10 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Progress/Status Bar */}
      <div className="absolute bottom-10 left-0 w-full px-6 md:px-20 hidden lg:flex justify-between items-center opacity-30">
        <div className="flex gap-4 items-center">
            <span className="text-[9px] tracking-widest uppercase font-bold text-white">03</span>
            <div className="w-20 h-px bg-white/20"></div>
            <span className="text-[9px] tracking-widest uppercase font-bold text-white">Rosewood Event</span>
        </div>
        <div className="text-[9px] tracking-[0.5em] uppercase text-white">Attire Lounge Official</div>
      </div>
    </section>
  );
}));

FashionShow.displayName = 'FashionShow';

export default FashionShow;
