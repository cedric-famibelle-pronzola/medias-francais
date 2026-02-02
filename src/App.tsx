import { useState } from 'react';
import { Header } from '@/sections/Header';
import { Dashboard } from '@/sections/Dashboard';
import { MediasSection } from '@/sections/MediasSection';
import { PersonnesSection } from '@/sections/PersonnesSection';
import { OrganisationsSection } from '@/sections/OrganisationsSection';
import { ReseauSection } from '@/sections/ReseauSection';
import { Footer } from '@/sections/Footer';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pb-12">
        {renderContent()}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
