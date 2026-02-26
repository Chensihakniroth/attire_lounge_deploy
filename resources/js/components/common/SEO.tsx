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
  title = "Attire Lounge | cambodia Styling House",
  description = "Attire Lounge is Phnom Penh's premier Styling House, offering Milan-certified expert styling, curated luxury menswear collections, and personalized fashion consulting for the modern gentleman.",
  keywords = "styling house, curated menswear, luxury fashion, Attire Lounge, modern gentleman, Phnom Penh styling, menswear consulting",
  image = "/images/og-image.jpg",
  url = "https://www.attireloungeofficial.com/",
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
      <link rel="icon" type="image/png" href="https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png" />
    </Helmet>
  );
};

export default SEO;
