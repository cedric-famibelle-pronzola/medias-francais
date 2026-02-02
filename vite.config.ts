import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimisations pour le SEO et les performances
    sourcemap: true,
    // Assurer que les chunks sont bien nommés pour le cache
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors pour un meilleur cache
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        },
        // Ajouter des hashes pour le cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          // Garder les favicons et assets statiques sans hash
          if (/\.(png|ico|svg|webmanifest)$/.test(name)) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Réduire la taille du build
    chunkSizeWarningLimit: 1000,
  },
  // Optimisations du serveur de développement
  server: {
    headers: {
      // En-têtes de sécurité qui aident aussi pour le SEO
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
