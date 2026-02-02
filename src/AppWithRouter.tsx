// Version avec react-router-dom - si tu veux des URLs distinctes par section
// Pour l'utiliser, remplace App.tsx par ce fichier

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Dashboard } from '@/sections/Dashboard';
import { MediasSection } from '@/sections/MediasSection';
import { PersonnesSection } from '@/sections/PersonnesSection';
import { OrganisationsSection } from '@/sections/OrganisationsSection';
import { ReseauSection } from '@/sections/ReseauSection';
import { Footer } from '@/sections/Footer';
import { Toaster } from '@/components/ui/sonner';
import { SEO } from '@/components/SEO';
import { sectionSEO, createWebsiteJsonLd, createSoftwareApplicationJsonLd } from '@/config/seo';
import { useEffect } from 'react';

// Scroll to top quand on change de page
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout avec SEO dynamique
function Layout({ children, tab }: { children: React.ReactNode; tab: keyof typeof sectionSEO }) {
  const currentSEO = sectionSEO[tab];
  const jsonLdData = [createWebsiteJsonLd(), createSoftwareApplicationJsonLd()];

  return (
    <>
      <SEO 
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        canonical={`/${tab === 'dashboard' ? '' : tab}`}
        jsonLd={jsonLdData}
      />
      {children}
    </>
  );
}

function App() {
  const location = useLocation();
  const currentTab = location.pathname.slice(1) || 'dashboard';

  const handleTabChange = (tab: string) => {
    // La navigation est gérée par react-router
    window.history.pushState(null, '', tab === 'dashboard' ? '/' : `/${tab}`);
    window.location.reload(); // Pour simplifier, on recharge
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <Header activeTab={currentTab} setActiveTab={handleTabChange} />
      <main className="flex-1 pb-12">
        <Routes>
          <Route path="/" element={
            <Layout tab="dashboard"><Dashboard /></Layout>
          } />
          <Route path="/medias" element={
            <Layout tab="medias"><MediasSection /></Layout>
          } />
          <Route path="/personnes" element={
            <Layout tab="personnes"><PersonnesSection /></Layout>
          } />
          <Route path="/organisations" element={
            <Layout tab="organisations"><OrganisationsSection /></Layout>
          } />
          <Route path="/reseau" element={
            <Layout tab="reseau"><ReseauSection /></Layout>
          } />
          {/* Redirection 404 vers home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
