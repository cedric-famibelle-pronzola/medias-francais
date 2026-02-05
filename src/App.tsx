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
import { CommandPalette } from '@/components/CommandPalette';
import { sectionSEO, createWebsiteJsonLd, createSoftwareApplicationJsonLd } from '@/config/seo';
import type { Media, Personne, Organisation } from '@/types';

type TabType = 'dashboard' | 'medias' | 'personnes' | 'organisations' | 'reseau';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedPersonne, setSelectedPersonne] = useState<Personne | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);

  const currentSEO = sectionSEO[activeTab];
  
  // Combiner les données structurées
  const jsonLdData = [
    createWebsiteJsonLd(),
    createSoftwareApplicationJsonLd(),
  ];

  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(media);
    setActiveTab('medias');
  };

  const handleSelectPersonne = (personne: Personne) => {
    setSelectedPersonne(personne);
    setActiveTab('personnes');
  };

  const handleSelectOrganisation = (org: Organisation) => {
    setSelectedOrg(org);
    setActiveTab('organisations');
  };

  // Navigation depuis les fiches détail
  const handleNavigateToPersonne = (nom: string) => {
    setSelectedPersonne({ nom } as Personne);
    setActiveTab('personnes');
  };

  const handleNavigateToOrganisation = (nom: string) => {
    setSelectedOrg({ nom } as Organisation);
    setActiveTab('organisations');
  };

  const handleNavigateToMedia = (nom: string) => {
    setSelectedMedia({ nom } as Media);
    setActiveTab('medias');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'medias':
        return (
          <MediasSection 
            initialMedia={selectedMedia}
            onNavigateToPersonne={handleNavigateToPersonne}
            onNavigateToOrganisation={handleNavigateToOrganisation}
          />
        );
      case 'personnes':
        return (
          <PersonnesSection 
            initialPersonne={selectedPersonne}
            onNavigateToMedia={handleNavigateToMedia}
            onNavigateToOrganisation={handleNavigateToOrganisation}
          />
        );
      case 'organisations':
        return (
          <OrganisationsSection 
            initialOrganisation={selectedOrg}
            onNavigateToPersonne={handleNavigateToPersonne}
            onNavigateToMedia={handleNavigateToMedia}
            onNavigateToOrganisation={handleNavigateToOrganisation}
          />
        );
      case 'reseau':
        return (
          <ReseauSection 
            onNavigateToMedia={handleNavigateToMedia}
            onNavigateToPersonne={handleNavigateToPersonne}
            onNavigateToOrganisation={handleNavigateToOrganisation}
          />
        );
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
        canonical="/"
        jsonLd={jsonLdData}
      />
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        onSearch={() => setCommandOpen(true)}
      />
      <main className="flex-1 pb-12">
        {renderContent()}
      </main>
      <Footer />
      <Toaster />
      <PrivacyDialog />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSelectMedia={handleSelectMedia}
        onSelectPersonne={handleSelectPersonne}
        onSelectOrganisation={handleSelectOrganisation}
      />
    </div>
  );
}

export default App;
