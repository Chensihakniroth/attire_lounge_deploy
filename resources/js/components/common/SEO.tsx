import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Attire Lounge | Elite Bespoke Tailoring",
  description = "Experience the finest bespoke tailoring at Attire Lounge. Luxury suits, custom shirts, and artisanal craftsmanship for the modern gentleman.",
  keywords = "tailoring, bespoke suits, custom fashion, Attire Lounge, luxury menswear",
  image = "/images/og-image.jpg",
  url = "https://attire-lounge.com",
  type = "website"
}) => {
  const siteTitle = title.includes("Attire Lounge") ? title : `${title} | Attire Lounge`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
