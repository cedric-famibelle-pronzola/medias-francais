/**
 * Configuration SEO globale de l'application
 */

export const siteConfig = {
  name: 'Médias Français',
  shortName: 'Médias FR',
  url: 'https://medias-francais.fr',
  ogImage: 'https://medias-francais.fr/og-image.png',
  description: 'Explorez la propriété des médias français : découvrez qui détient la presse, la télévision, la radio et les sites web. Visualisation interactive des liens de propriété et données transparentes.',
  keywords: [
    'médias français',
    'propriété médias',
    'actionnariat',
    'presse',
    'télévision',
    'radio',
    'concentration médias',
    'oligarques',
    'milliardaires médias',
    'propriétaires médias',
    'groupes de presse',
    'actionnaires médias',
  ],
  author: {
    name: 'Cédric Cédric Famibelle-Pronzola',
    url: 'https://github.com/cedric-famibelle-pronzola',
  },
  creator: 'Cédric Cédric Famibelle-Pronzola',
  license: 'AGPL-3.0',
  licenseUrl: 'https://www.gnu.org/licenses/agpl-3.0.html',
  repository: 'https://github.com/cedric-famibelle-pronzola/medias-francais',
  dataSource: {
    name: 'Monde Diplomatique',
    url: 'https://github.com/mdiplo/Medias_francais',
  },
  language: 'fr-FR',
  locale: 'fr_FR',
  themeColor: '#0f172a',
  msapplicationTileColor: '#0f172a',
};

export const defaultMetadata = {
  title: {
    default: 'Médias Français - Propriété et Actionnariat des Médias',
    template: '%s | Médias Français',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords.join(', '),
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Médias Français - Visualisation de la propriété des médias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Médias Français',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@cedric_fbp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

// Configuration SEO par section
export const sectionSEO = {
  dashboard: {
    title: 'Tableau de Bord - Statistiques et Concentration des Médias',
    description: 'Visualisez la concentration de la propriété des médias français. Analyses, statistiques et classements des principaux actionnaires et leur influence sur le paysage médiatique.',
    keywords: [
      'statistiques médias français',
      'concentration médias',
      'classement actionnaires',
      'analyse propriété médias',
      'top milliardaires médias',
    ],
  },
  medias: {
    title: 'Les Médias - Presse, TV, Radio et Sites Web',
    description: 'Explorez l\'ensemble des médias français : presse écrite nationale et régionale, chaînes de télévision généralistes et thématiques, stations de radio et sites d\'information en ligne.',
    keywords: [
      'presse française',
      'télévision française',
      'radio française',
      'sites d\'information',
      'journaux français',
      'chaînes TV France',
    ],
  },
  personnes: {
    title: 'Les Personnes - Propriétaires et Actionnaires des Médias',
    description: 'Découvrez les personnes physiques qui détiennent les médias français : milliardaires, oligarques, hommes d\'affaires et actionnaires majoritaires du paysage médiatique français.',
    keywords: [
      'propriétaires médias français',
      'milliardaires médias',
      'actionnaires presse',
      'oligarques médias',
      'hommes d\'affaires médias',
      'Bernard Arnault médias',
      'Patrick Drahi',
      'Vincent Bolloré',
    ],
  },
  organisations: {
    title: 'Les Organisations - Groupes et Filiales Médiatiques',
    description: 'Explorez les organisations du paysage médiatique français : groupes de presse, filiales, holdings, sociétés de production et structures de détention des médias.',
    keywords: [
      'groupes de presse',
      'filiales médias',
      'holdings médiatiques',
      'Lagardère',
      'Vivendi',
      'TF1 Group',
      'M6 Group',
      'Altice',
    ],
  },
  reseau: {
    title: 'Le Réseau - Visualisation Interactive des Liens de Propriété',
    description: 'Visualisez les connexions entre médias, propriétaires et organisations. Carte interactive et graphique des liens de propriété et d\'actionnariat dans les médias français.',
    keywords: [
      'visualisation médias',
      'réseau propriété médias',
      'graphe relations médias',
      'carte interactive médias',
      'liens actionnariat',
    ],
  },
};

// Fonction utilitaire pour créer une URL canonique
export function createCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}

// Fonction pour créer des données structurées JSON-LD
export function createWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    license: siteConfig.licenseUrl,
    isAccessibleForFree: true,
    inLanguage: siteConfig.language,
  };
}

export function createSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'DataVisualizationApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    license: siteConfig.licenseUrl,
    isAccessibleForFree: true,
    inLanguage: siteConfig.language,
  };
}

export function createBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
