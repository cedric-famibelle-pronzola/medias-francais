import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
}

/**
 * Hook pour mettre à jour les meta tags SEO dynamiquement
 * À utiliser dans les composants qui changent le contenu (modales, détails, etc.)
 */
export function useSEO({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
}: SEOOptions) {
  useEffect(() => {
    // Sauvegarder les valeurs originales
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords?.getAttribute('content');
    const metaRobots = document.querySelector('meta[name="robots"]');
    const originalRobots = metaRobots?.getAttribute('content');
    const linkCanonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = linkCanonical?.getAttribute('href');

    // Mettre à jour les valeurs
    if (title) {
      document.title = `${title} | Médias Français`;
    }

    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    if (keywords && metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    if (noindex && metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }

    if (canonical) {
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonical);
      } else {
        const newCanonical = document.createElement('link');
        newCanonical.setAttribute('rel', 'canonical');
        newCanonical.setAttribute('href', canonical);
        document.head.appendChild(newCanonical);
      }
    }

    // Cleanup : restaurer les valeurs originales
    return () => {
      document.title = originalTitle;
      
      if (metaDescription && originalDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
      
      if (metaKeywords && originalKeywords) {
        metaKeywords.setAttribute('content', originalKeywords);
      }
      
      if (metaRobots && originalRobots) {
        metaRobots.setAttribute('content', originalRobots);
      }
      
      if (linkCanonical && originalCanonical) {
        linkCanonical.setAttribute('href', originalCanonical);
      }
    };
  }, [title, description, keywords, canonical, noindex]);
}

/**
 * Hook pour mettre à jour uniquement le titre
 */
export function useTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | Médias Français`;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

/**
 * Hook pour marquer une page comme noindex
 */
export function useNoindex() {
  useEffect(() => {
    const metaRobots = document.querySelector('meta[name="robots"]');
    const originalRobots = metaRobots?.getAttribute('content');
    
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }
    
    return () => {
      if (metaRobots && originalRobots) {
        metaRobots.setAttribute('content', originalRobots);
      }
    };
  }, []);
}
