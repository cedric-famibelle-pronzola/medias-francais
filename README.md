# Médias Français - Frontend

Application React permettant de visualiser et explorer la propriété des médias français. Interface utilisateur moderne connectée à l'API Médias Français.

## 🎯 Description

Ce projet fournit une interface web intuitive pour explorer :
- **Les médias** : Presse, télévision, radio et sites web
- **Les personnes** : Propriétaires et actionnaires
- **Les organisations** : Groupes, filiales et structures de détention
- **Le réseau** : Visualisation interactive des liens de propriété
- **Les statistiques** : Analyses et classements (Top Challenges, concentration...)

Les données proviennent du projet [mdiplo/Medias_francais](https://github.com/mdiplo/Medias_francais) du Monde Diplomatique (mise à jour décembre 2024).

## 🚀 Stack Technique

- **Framework** : React 19 + TypeScript
- **Build** : Vite 7
- **Styling** : Tailwind CSS + shadcn/ui
- **Graphiques** : Recharts
- **Icônes** : Lucide React
- **Notifications** : Sonner

## 🛠️ Développement

### Prérequis

- Node.js 18+
- L'[API Médias Français](https://github.com/cedric-famibelle-pronzola/medias-francais-api) en cours d'exécution (par défaut sur http://localhost:8000)
- L'API de production est accessible sur https://api.medias-francais.fr

### Installation

```bash
npm install
```

### Configuration

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

Variables disponibles :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_API_URL` | URL de base de l'API | `http://localhost:8000` ou `https://api.medias-francais.fr` |

### Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

### Build de production

```bash
npm run build
```

Les fichiers statiques seront générés dans le dossier `dist/`.

## 📝 Licence

Ce projet est distribué sous licence **AGPL-3.0** (GNU Affero General Public License v3.0).

## 🤖 Crédits

- **Développeur** : Cédric Famibelle-Pronzola
- **Repository** : [github.com/cedric-famibelle-pronzola/medias-francais](https://github.com/cedric-famibelle-pronzola/medias-francais)
- **Interface** : Développée avec [Kimi](https://kimi.moonshot.cn), l'assistant IA de Moonshot AI
- **Données** : [Monde Diplomatique - Médias Français](https://github.com/mdiplo/Medias_francais)
- **API** : [github.com/cedric-famibelle-pronzola/medias-francais-api](https://github.com/cedric-famibelle-pronzola/medias-francais-api) - Déployée sur https://api.medias-francais.fr
- **Hébergement API** : [Deno Deploy](https://deno.com/deploy) (Deno Land Inc.)

## ⚠️ Confidentialité

**Collecte de données** : Cette application collecte des logs techniques (adresse IP, User-Agent, endpoints appelés) pour des raisons de sécurité, performance et diagnostic.

**Hébergement des données :**
- **API & Logs** : Deno Land Inc. (USA) via Deno Deploy
- **Base de données (production)** : Neon (neon.tech) - PostgreSQL serverless

Consultez le fichier [`PRIVACY.md`](https://github.com/cedric-famibelle-pronzola/medias-francais-api/blob/master/PRIVACY.md) du projet API pour plus de détails sur le traitement des données.
