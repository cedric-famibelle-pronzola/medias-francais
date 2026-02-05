import { useState, useMemo } from 'react';
import { useOrganisations } from '@/hooks/useApi';
import type { Organisation } from '@/types';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  Users,
  Newspaper,
  Network,
  X,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface OrganisationsSectionProps {
  onSelectOrganisation?: (org: Organisation) => void;
  initialOrganisation?: Organisation | null;
}

export function OrganisationsSection({ onSelectOrganisation, initialOrganisation }: OrganisationsSectionProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(initialOrganisation || null);
  const [detailOpen, setDetailOpen] = useState(!!initialOrganisation);
  
  const limit = 24;
  
  const { data: orgsData, loading: orgsLoading, error: orgsError } = useOrganisations(page, limit);

  // Filtrer les organisations
  const filteredOrgs = useMemo(() => {
    if (!orgsData?.data) return [];
    
    let orgs = orgsData.data;
    
    if (searchQuery.length >= 2) {
      orgs = orgs.filter(o => 
        o.nom.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return orgs;
  }, [searchQuery, orgsData]);

  const handleOrgClick = (org: Organisation) => {
    setSelectedOrg(org);
    setDetailOpen(true);
    if (onSelectOrganisation) {
      onSelectOrganisation(org);
    }
  };

  if (orgsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des organisations. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Organisations</h2>
          <p className="text-muted-foreground">
            {orgsData?.pagination.total || 0} organisations répertoriées
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher une organisation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {orgsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune organisation trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrgs.map((org) => (
            <OrganisationCard 
              key={org.nom} 
              organisation={org}
              onClick={() => handleOrgClick(org)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {orgsData && searchQuery.length < 2 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {orgsData.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(orgsData.pagination.pages, p + 1))}
            disabled={page === orgsData.pagination.pages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedOrg && (
                <>
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {selectedOrg.nom}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Détails de l'organisation et de ses participations
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedOrg && (
              <div className="space-y-6">
                {/* Commentaire */}
                {selectedOrg.commentaire && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{selectedOrg.commentaire}</p>
                  </div>
                )}

                {/* Propriétaires */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Propriétaires ({selectedOrg.proprietaires?.length || 0})
                  </h4>
                  {selectedOrg.proprietaires?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun propriétaire connu</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrg.proprietaires.map((prop, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={prop.type === 'personne' ? 'default' : 'secondary'}>
                              {prop.type === 'personne' ? 'Personne' : 'Organisation'}
                            </Badge>
                            <span className="font-medium">{prop.nom}</span>
                          </div>
                          <Badge variant="outline">{prop.valeur}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filiales */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Filiales ({selectedOrg.filiales.length})
                  </h4>
                  {selectedOrg.filiales.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune filiale</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrg.filiales.map((fil, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="font-medium">{fil.nom}</span>
                          {fil.valeur && <Badge variant="outline">{fil.valeur}</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Médias possédés */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    Médias possédés ({selectedOrg.medias.length})
                  </h4>
                  {selectedOrg.medias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun média direct</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrg.medias.map((media, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{media.nom}</p>
                            <p className="text-xs text-muted-foreground">{media.type}</p>
                          </div>
                          <Badge variant="outline">{media.valeur}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OrganisationCardProps {
  organisation: Organisation;
  onClick: () => void;
}

function OrganisationCard({ organisation, onClick }: OrganisationCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{organisation.nom}</h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1" title="Propriétaires">
            <Users className="h-4 w-4" />
            {organisation.proprietaires?.length || 0}
          </span>
          <span className="flex items-center gap-1" title="Filiales">
            <Network className="h-4 w-4" />
            {organisation.filiales.length}
          </span>
          <span className="flex items-center gap-1" title="Médias">
            <Newspaper className="h-4 w-4" />
            {organisation.medias.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
