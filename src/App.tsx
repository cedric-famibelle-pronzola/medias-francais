import { useState } from 'react';
import { Header } from '@/sections/Header';
import { Dashboard } from '@/sections/Dashboard';
import { MediasSection } from '@/sections/MediasSection';
import { PersonnesSection } from '@/sections/PersonnesSection';
import { OrganisationsSection } from '@/sections/OrganisationsSection';
import { ReseauSection } from '@/sections/ReseauSection';
import { Footer } from '@/sections/Footer';
import { Toaster } from '@/components/ui/sonner';
import { SEO } from '@/components/SEO';
import { PrivacyDialog } from '@/components/PrivacyDialog';
import { sectionSEO, createWebsiteJsonLd, createSoftwareApplicationJsonLd } from '@/config/seo';

type TabType = 'dashboard' | 'medias' | 'personnes' | 'organisations' | 'reseau';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const currentSEO = sectionSEO[activeTab];
  
  // Combiner les données structurées
  const jsonLdData = [
    createWebsiteJsonLd(),
    createSoftwareApplicationJsonLd(),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'medias':
        return <MediasSection />;
      case 'personnes':
        return <PersonnesSection />;
      case 'organisations':
        return <OrganisationsSection />;
      case 'reseau':
        return <ReseauSection />;
      default:
        return <Dashboard />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        // Pas de canonical différent par onglet - c'est la même URL
        canonical="/"
        jsonLd={jsonLdData}
      />
      <Header activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="flex-1 pb-12">
        {renderContent()}
      </main>
      <Footer />
      <Toaster />
      <PrivacyDialog />
    </div>
  );
}

export default App;
