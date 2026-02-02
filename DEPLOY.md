# Déploiement Manuel sur VPS Ubuntu

Guide pour déployer le frontend sur un serveur Ubuntu (22.04 ou 24.04).

> **Note** : Dans ce guide, remplacez `example.com` par votre propre nom de domaine.

## Prérequis

- Un VPS avec Ubuntu 22.04/24.04
- Un nom de domaine (ex: `example.com`, `mon-site.fr`)
- Un accès SSH root ou sudo

## 1. Préparation du build (local)

Sur votre machine locale :

```bash
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

## 2. Installation sur le VPS

### Connexion au serveur

Remplacez `example.com` par votre domaine ou IP :

```bash
ssh root@example.com
# ou
ssh root@192.168.1.100
```

### Mise à jour du système

```bash
apt update && apt upgrade -y
```

### Installation de nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### Création du dossier du site

```bash
mkdir -p /var/www/medias-francais
chown -R www-data:www-data /var/www/medias-francais
```

## 3. Configuration nginx

Créer le fichier de configuration :

```bash
nano /etc/nginx/sites-available/medias-francais
```

> **⚠️ Important** : Remplacez `example.com` par votre domaine réel

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    root /var/www/medias-francais;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Cache des assets (1 an)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback : toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Activer le site :

```bash
ln -s /etc/nginx/sites-available/medias-francais /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## 4. SSL / HTTPS (Let's Encrypt)

> **⚠️ Important** : Remplacez `example.com` par votre domaine réel

```bash
certbot --nginx -d example.com -d www.example.com
```

Suivre les instructions. Le renouvellement est automatique.

## 5. Déploiement des fichiers

### Méthode 1 : SCP (depuis votre machine locale)

Remplacez `example.com` par votre domaine ou IP :

```bash
# Compresser le build
cd dist
tar -czf ../medias-francais.tar.gz .
cd ..

# Envoyer sur le VPS
scp medias-francais.tar.gz root@example.com:/tmp/
```

### Méthode 2 : Git (si le repo est sur le VPS)

```bash
# Sur le VPS
git clone https://github.com/cedric-famibelle-pronzola/medias-francais.git /tmp/medias-francais
cd /tmp/medias-francais
npm install
npm run build
```

### Installation des fichiers

Sur le VPS :

```bash
# Arrêter nginx temporairement
systemctl stop nginx

# Vider le dossier et extraire les nouveaux fichiers
rm -rf /var/www/medias-francais/*
tar -xzf /tmp/medias-francais.tar.gz -C /var/www/medias-francais/

# Permissions
chown -R www-data:www-data /var/www/medias-francais
chmod -R 755 /var/www/medias-francais

# Redémarrer nginx
systemctl start nginx
```

## 6. Vérification

```bash
# Tester la configuration
nginx -t

# Voir le statut
systemctl status nginx

# Tester l'accès (remplacez example.com)
curl -I https://example.com
```

## 7. Mise à jour (procédure)

Pour mettre à jour l'application :

```bash
# 1. Sur votre machine locale
npm run build
cd dist && tar -czf ../medias-francais.tar.gz . && cd ..
scp medias-francais.tar.gz root@example.com:/tmp/

# 2. Sur le VPS
systemctl stop nginx
rm -rf /var/www/medias-francais/*
tar -xzf /tmp/medias-francais.tar.gz -C /var/www/medias-francais/
chown -R www-data:www-data /var/www/medias-francais
systemctl start nginx
```

## Commandes utiles

```bash
# Redémarrer nginx
systemctl restart nginx

# Voir les logs d'accès
tail -f /var/log/nginx/access.log

# Voir les logs d'erreurs
tail -f /var/log/nginx/error.log

# Tester la config
nginx -t

# Renouvellement manuel SSL
certbot renew
```

## Structure finale sur le VPS

```
/var/www/medias-francais/
├── index.html
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── favicon.ico
├── robots.txt
└── ...

/etc/nginx/sites-available/medias-francais
/etc/nginx/sites-enabled/medias-francais → ../sites-available/medias-francais
```

## Exemples de domaines

Selon votre cas, adaptez les commandes :

| Votre situation | Domaine à utiliser |
|-----------------|-------------------|
| Site personnel | `monsite.fr` |
| Sous-domaine | `app.example.com` |
| IP uniquement | `192.168.1.100` |

### Exemple avec monsite.fr

```bash
# Connexion
ssh root@monsite.fr

# SSL
certbot --nginx -d monsite.fr -d www.monsite.fr

# Déploiement
scp medias-francais.tar.gz root@monsite.fr:/tmp/
```

## Sans nom de domaine (IP uniquement)

Si vous n'avez pas de domaine, modifiez la config nginx :

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/medias-francais;
    index index.html;
    
    # ... reste identique (sans server_name)
}
```

Pas besoin de certbot dans ce cas (pas de HTTPS).
