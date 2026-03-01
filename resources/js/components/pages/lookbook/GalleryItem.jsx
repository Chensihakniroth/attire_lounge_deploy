import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const GalleryItem = memo(({ image }) => {
    const isStaticItem = image.id.startsWith('shades') || image.id.startsWith('street');

    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.98
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.4 }
        }
    };

    const Content = (
        <motion.div
            variants={itemVariants}
            whileHover={{ 
                y: -12,
                transition: { duration: 0.2, ease: "easeOut" } // Instant Pop 💥
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }} // Slow, elegant return 💖
            className={`group relative overflow-hidden aspect-[3/4.5] rounded-xl shadow-2xl border border-white/5 bg-white/[0.02] ${!isStaticItem ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <OptimizedImage
                src={image.src}
                alt={image.title}
                containerClassName="w-full h-full"
                className={`w-full h-full object-cover transform group-hover:opacity-80
                    transition-all duration-[1200ms] ease-in-out group-hover:duration-[200ms]`} // No more scale-110 💖
                objectFit="cover"
                priority={false}
                loading="lazy"
            />

            {/* Atelier Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:duration-150" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:duration-200 ease-out">
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-attire-accent uppercase tracking-[0.4em]">{image.collection || 'Archive'}</p>
                        <h4 className="text-lg font-serif text-white leading-tight">{image.title || 'Untitled Work'}</h4>
                    </div>
                    {!isStaticItem ? (
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
                            <ArrowUpRight size={18} strokeWidth={1.5} />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center text-attire-accent backdrop-blur-md">
                            <Search size={16} strokeWidth={2} />
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Border Glow */}
            <div className="absolute inset-0 border-2 border-attire-accent/0 group-hover:border-attire-accent/20 transition-all duration-1000 group-hover:duration-200 pointer-events-none rounded-xl" />
        </motion.div>
    );

    if (!isStaticItem) {
        return <Link to={`/product/${image.id}`}>{Content}</Link>;
    }

    return Content;
});

GalleryItem.displayName = 'GalleryItem';

export default GalleryItem;
