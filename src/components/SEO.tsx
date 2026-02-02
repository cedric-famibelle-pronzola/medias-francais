import { Helmet } from 'react-helmet-async';
import { siteConfig, createCanonicalUrl } from '@/config/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  canonical?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEO({
  title,
  description = siteConfig.description,
  keywords,
  image = siteConfig.ogImage,
  url = siteConfig.url,
  type = 'website',
  canonical,
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : `${siteConfig.name} - Propriété et Actionnariat des Médias`;
  
  const canonicalUrl = canonical ? createCanonicalUrl(canonical) : url;
  
  const keywordsString = keywords 
    ? (Array.isArray(keywords) ? keywords : [keywords]).join(', ')
    : siteConfig.keywords.join(', ');

  // Convertir l'image relative en URL absolue
  const imageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={siteConfig.author.name} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:site_name" content={siteConfig.name} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Autres meta tags importants */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content={siteConfig.themeColor} />
      <meta name="msapplication-TileColor" content={siteConfig.msapplicationTileColor} />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
