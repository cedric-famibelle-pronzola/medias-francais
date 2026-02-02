# Guide SEO - Médias Français

Ce document récapitule toutes les optimisations SEO mises en place pour l'application.

## 🚀 Librairies installées

- **react-helmet-async** : Gestion dynamique des balises meta dans React

## 📁 Structure des fichiers SEO

```
public/
├── robots.txt           # Instructions pour les crawlers
├── sitemap.xml          # Plan du site pour les moteurs de recherche
├── site.webmanifest     # Manifest pour PWA
├── _headers            # Configuration des en-têtes HTTP (Netlify)
├── _redirects          # Redirections (Netlify)
├── favicon.ico         # Favicon principal
├── favicon-16x16.png   # Favicon petite taille
├── favicon-32x32.png   # Favicon moyenne taille
├── apple-touch-icon.png # Icône Apple
└── og-image.png        # Image Open Graph (partage réseaux sociaux)

src/
├── components/
│   ├── SEO.tsx         # Composant SEO avec react-helmet-async
│   └── SEOProvider.tsx # Provider pour Helmet
├── config/
│   └── seo.ts          # Configuration centralisée SEO
└── hooks/
    └── useSEO.ts       # Hooks pour SEO dynamique
```

## ✅ Optimisations mises en place

### 1. Meta tags de base
- Title et description optimisés par section
- Mots-clés pertinents pour le sujet des médias français
- Auteur et créateur identifiés
- Langue et locale (fr-FR)
- Robots index/follow

### 2. Open Graph (Facebook, LinkedIn)
- `og:title`, `og:description`, `og:image`
- `og:type`, `og:url`, `og:locale`
- `og:site_name`
- Dimensions d'image optimales (1200x630)

### 3. Twitter Cards
- `twitter:card` (summary_large_image)
- `twitter:title`, `twitter:description`, `twitter:image`

### 4. Données structurées (JSON-LD)
- **WebSite** : Informations générales du site
- **SoftwareApplication** : Informations sur l'application
- Prêt pour l'ajout de :
  - Organization (pour les groupes médias)
  - Person (pour les propriétaires)
  - NewsMediaOrganization (pour les médias)
  - BreadcrumbList (pour la navigation)

### 5. Favicons et icônes
- favicon.ico (multi-résolution)
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png (180x180)
- Manifest PWA (site.webmanifest)

### 6. Performance et cache
- Preconnect vers les domaines externes
- DNS Prefetch
- Configuration des en-têtes de cache
- Splitting des chunks (vendor, ui)

### 7. Sécurité (aide au SEO)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy

### 8. Accessibilité
- Balise `lang="fr"` sur html
- Noscript fallback pour les bots sans JavaScript
- Structure sémantique HTML5

## 📝 Configuration par section

| Section | Title | Description |
|---------|-------|-------------|
| Dashboard | Tableau de Bord - Statistiques... | Visualisez la concentration... |
| Médias | Les Médias - Presse, TV... | Explorez l'ensemble des médias... |
| Personnes | Les Personnes - Propriétaires... | Découvrez les personnes physiques... |
| Organisations | Les Organisations - Groupes... | Explorez les organisations... |
| Réseau | Le Réseau - Visualisation... | Visualisez les connexions... |

## 🛠️ Utilisation dans les composants

### SEO de base
```tsx
import { SEO } from '@/components/SEO';

function MaPage() {
  return (
    <>
      <SEO 
        title="Titre de la page"
        description="Description de la page"
        keywords={['mot-clé1', 'mot-clé2']}
      />
      {/* contenu */}
    </>
  );
}
```

### SEO avec données structurées
```tsx
import { SEO } from '@/components/SEO';
import { createPersonJsonLd } from '@/config/seo';

function PagePersonne({ personne }) {
  const jsonLd = createPersonJsonLd(
    personne.nom,
    personne.description
  );

  return (
    <>
      <SEO 
        title={personne.nom}
        description={personne.description}
        jsonLd={jsonLd}
      />
      {/* contenu */}
    </>
  );
}
```

### Hook useSEO (pour contenu dynamique)
```tsx
import { useSEO } from '@/hooks/useSEO';

function ModalDetail({ item }) {
  useSEO({
    title: item.nom,
    description: item.description,
    noindex: true, // si vous ne voulez pas indexer
  });
  
  return <>{/* contenu */}</>;
}
```

## 🔍 Vérification du SEO

### Outils recommandés
1. **Google Search Console** : Indexation et performance
2. **Google Rich Results Test** : Validation des données structurées
3. **Facebook Sharing Debugger** : Vérification des Open Graph
4. **Twitter Card Validator** : Vérification des Twitter Cards
5. **Lighthouse** : Audit SEO intégré à Chrome DevTools

### URLs à tester
- https://medias-francais.fr/
- https://medias-francais.fr/#medias
- https://medias-francais.fr/#personnes

## 🔄 Mises à jour régulières

Pour maintenir un bon SEO :

1. **Mettre à jour le sitemap.xml** quand de nouvelles sections sont ajoutées
2. **Vérifier les liens cassés** régulièrement
3. **Actualiser les données structurées** si le format change
4. **Surveiller Google Search Console** pour les erreurs d'indexation

## 🌐 Déploiement

Les fichiers statiques (robots.txt, sitemap.xml) sont automatiquement copiés dans le dossier `dist/` lors du build.

```bash
npm run build
```

Tous les fichiers SEO seront dans `dist/` prêts à être déployés.

## 📚 Ressources

- [Schema.org](https://schema.org/) : Types de données structurées
- [Open Graph Protocol](https://ogp.me/) : Documentation Open Graph
- [Google Search Central](https://developers.google.com/search) : Guidelines SEO
- [Web.dev](https://web.dev/) : Bonnes pratiques web
