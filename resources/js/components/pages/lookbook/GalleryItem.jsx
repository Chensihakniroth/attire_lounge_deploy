import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const GalleryItem = memo(({ image }) => {
    const imageSrc = image.src || (image.images && image.images[0]);
    const imageTitle = image.title || image.name || 'Untitled';
    const imageId = String(image.id ?? '');
    const isLinkable = !imageId.startsWith('shades') && !imageId.startsWith('street');

    const Content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-white/5"
        >
            <OptimizedImage
                src={imageSrc}
                alt={imageTitle}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                objectFit="cover"
                loading="lazy"
            />

            {/* Subtle bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content - visible on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {image.collection && (
                    <p className="text-[#f5a81c] text-[9px] uppercase tracking-[0.3em] mb-1">{image.collection}</p>
                )}
                <h4 className="text-white font-serif text-sm md:text-base leading-tight">{imageTitle}</h4>
            </div>
        </motion.div>
    );

    if (isLinkable) {
        return <Link to={`/product/${image.slug || image.id}`}>{Content}</Link>;
    }

    return Content;
});

GalleryItem.displayName = 'GalleryItem';

export default GalleryItem;
