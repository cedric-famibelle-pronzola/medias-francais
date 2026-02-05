import { useState, useMemo, useEffect } from 'react';
import { usePersonnes, useTopChallenges, usePersonneDetail, useSearchPersonnes } from '@/hooks/useApi';
import type { Personne, TopChallenge } from '@/types';
import { 
  Users, 
  Crown, 
  ChevronLeft,
  ChevronRight,
  Building2,
  Newspaper,
  Eye,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonnesSectionProps {
  onSelectPersonne?: (personne: Personne) => void;
  initialPersonne?: Personne | null;
  onNavigateToMedia?: (nom: string) => void;
  onNavigateToOrganisation?: (nom: string) => void;
}

export function PersonnesSection({ onSelectPersonne, initialPersonne, onNavigateToMedia, onNavigateToOrganisation }: PersonnesSectionProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonne, setSelectedPersonne] = useState<Personne | null>(initialPersonne || null);
  const [detailOpen, setDetailOpen] = useState(!!initialPersonne);
  const [activeTab, setActiveTab] = useState('all');
  const [personneToLoad, setPersonneToLoad] = useState<string | null>(initialPersonne ? initialPersonne.nom : null);
  
  const { data: personneDetail, loading: detailLoading } = usePersonneDetail(personneToLoad);
  
  const limit = 24;
  
  const { data: personnesData, loading: personnesLoading, error: personnesError } = usePersonnes(page, limit);
  const { data: searchResults, loading: searchLoading } = useSearchPersonnes(searchQuery);
  const { data: topChallenges, loading: tcLoading } = useTopChallenges();

  // Utiliser les résultats de recherche si une recherche est active, sinon la pagination
  const filteredPersonnes = useMemo(() => {
    if (searchQuery.length >= 2) {
      return searchResults || [];
    }
    return personnesData?.data || [];
  }, [searchQuery, searchResults, personnesData]);

  // Vérifier si une personne est dans le top challenges
  const isTopChallenge = (nom: string): boolean => {
    return topChallenges?.classement.some(p => p.nom === nom) || false;
  };

  // Obtenir le rang d'une personne dans le top challenges
  const getTopChallengeRank = (nom: string): number | null => {
    const person = topChallenges?.classement.find(p => p.nom === nom);
    return person?.rang || null;
  };

  // Calculer le nombre total de médias pour une personne
  const getTotalMedias = (personne: Personne): number => {
    const directMedias = personne.mediasDirects?.length || 0;
    const viaOrgs = personne.mediasViaOrganisations?.length || 0;
    return directMedias + viaOrgs;
  };

  // Charger les détails quand on récupère via l'API
  useEffect(() => {
    if (personneDetail && personneToLoad) {
      setSelectedPersonne(personneDetail);
      setPersonneToLoad(null);
      if (onSelectPersonne) {
        onSelectPersonne(personneDetail);
      }
    }
  }, [personneDetail, personneToLoad, onSelectPersonne]);

  const handlePersonneClick = (personne: Personne) => {
    // Toujours charger le détail complet via l'API pour avoir toutes les infos
    setPersonneToLoad(personne.nom);
    setDetailOpen(true);
  };
  
  const handleTopChallengeClick = (nom: string) => {
    // Toujours charger via l'API pour avoir les données complètes
    setPersonneToLoad(nom);
    setDetailOpen(true);
  };

  if (personnesError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des personnes. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Personnes</h2>
          <p className="text-muted-foreground">
            {personnesData?.pagination.total || 0} propriétaires identifiés
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all">Tous les propriétaires</TabsTrigger>
          <TabsTrigger value="top">Top Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une personne..."
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
          {personnesLoading || searchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredPersonnes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune personne trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPersonnes.map((personne) => (
                <PersonneCard 
                  key={personne.nom} 
                  personne={personne}
                  isTop={isTopChallenge(personne.nom)}
                  rank={getTopChallengeRank(personne.nom)}
                  totalMedias={getTotalMedias(personne)}
                  onClick={() => handlePersonneClick(personne)}
                />
              ))}
            </div>
          )}

          {/* Pagination - uniquement sans recherche */}
          {personnesData && searchQuery.length < 2 && (
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
                Page {page} sur {personnesData.pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(personnesData.pagination.pages, p + 1))}
                disabled={page === personnesData.pagination.pages}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-6">
          {tcLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topChallenges?.classement.map((person) => (
                <TopChallengeCard 
                  key={person.nom} 
                  person={person} 
                  onClick={() => handleTopChallengeClick(person.nom)}
                  isLoading={detailLoading && personneToLoad === person.nom}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPersonne && (
                <>
                  {isTopChallenge(selectedPersonne.nom) && (
                    <Crown className="h-5 w-5 text-amber-500" />
                  )}
                  {selectedPersonne.nom}
                  {getTopChallengeRank(selectedPersonne.nom) && (
                    <Badge variant="default">
                      #{getTopChallengeRank(selectedPersonne.nom)}
                    </Badge>
                  )}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Détails du propriétaire et de ses participations
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedPersonne && (
              <div className="space-y-6">
                {/* Classements */}
                {selectedPersonne.classements && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2">Classements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersonne.classements.challenges2024 && (
                        <Badge variant="default">Challenges 2024: #{selectedPersonne.classements.challenges2024}</Badge>
                      )}
                      {selectedPersonne.classements.forbes2024 && (
                        <Badge variant="secondary">Forbes 2024</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Médias directs */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    Médias directs ({selectedPersonne.mediasDirects?.length || 0})
                  </h4>
                  {(!selectedPersonne.mediasDirects || selectedPersonne.mediasDirects.length === 0) ? (
                    <p className="text-sm text-muted-foreground">Aucun média direct</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPersonne.mediasDirects.map((media, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            {onNavigateToMedia ? (
                              <button
                                onClick={() => onNavigateToMedia(media.nom)}
                                className="font-medium text-primary hover:underline text-left"
                              >
                                {media.nom}
                              </button>
                            ) : (
                              <p className="font-medium">{media.nom}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{media.type}</p>
                          </div>
                          <Badge variant="outline">{media.valeur}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Médias via organisations */}
                {selectedPersonne.mediasViaOrganisations && selectedPersonne.mediasViaOrganisations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Médias via organisations
                    </h4>
                    <div className="space-y-4">
                      {/* Regrouper les médias par organisation (via) */}
                      {(() => {
                        const grouped = selectedPersonne.mediasViaOrganisations.reduce((acc, media) => {
                          const orgName = media.via || 'Organisation inconnue';
                          if (!acc[orgName]) acc[orgName] = [];
                          acc[orgName].push(media);
                          return acc;
                        }, {} as Record<string, typeof selectedPersonne.mediasViaOrganisations>);
                        
                        return Object.entries(grouped).map(([orgName, medias], idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg">
                            {onNavigateToOrganisation ? (
                              <button
                                onClick={() => onNavigateToOrganisation(orgName.split(' → ')[0])}
                                className="font-medium text-primary hover:underline text-left mb-2"
                              >
                                {orgName}
                              </button>
                            ) : (
                              <p className="font-medium mb-2">{orgName}</p>
                            )}
                            <div className="space-y-1">
                              {medias.map((media, mIdx) => (
                                <div key={mIdx} className="flex items-center justify-between text-sm">
                                  {onNavigateToMedia ? (
                                    <button
                                      onClick={() => onNavigateToMedia(media.nom)}
                                      className="text-primary hover:underline"
                                    >
                                      {media.nom}
                                    </button>
                                  ) : (
                                    <span>{media.nom}</span>
                                  )}
                                  <Badge variant="outline" className="text-xs">{media.valeur}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Organisations */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organisations ({selectedPersonne.organisations?.length || 0})
                  </h4>
                  {(!selectedPersonne.organisations || selectedPersonne.organisations.length === 0) ? (
                    <p className="text-sm text-muted-foreground">Aucune organisation</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPersonne.organisations.map((org, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          {onNavigateToOrganisation ? (
                            <button
                              onClick={() => onNavigateToOrganisation(org.nom)}
                              className="font-medium text-primary hover:underline text-left"
                            >
                              {org.nom}
                            </button>
                          ) : (
                            <p className="font-medium">{org.nom}</p>
                          )}
                          <Badge variant="outline">{org.valeur}</Badge>
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

interface PersonneCardProps {
  personne: Personne;
  isTop: boolean;
  rank: number | null;
  totalMedias: number;
  onClick: () => void;
}

function PersonneCard({ personne, isTop, rank, totalMedias, onClick }: PersonneCardProps) {
  return (
    <div 
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            {isTop && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Crown className="h-3 w-3 mr-1" />
                #{rank}
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2">{personne.nom}</h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Newspaper className="h-4 w-4" />
              {totalMedias}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {personne.organisations?.length || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TopChallengeCardProps {
  person: TopChallenge;
  onClick: () => void;
  isLoading?: boolean;
}

function TopChallengeCard({ person, onClick, isLoading }: TopChallengeCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-white';
    if (rank === 4) return 'bg-gray-300 text-gray-800';
    if (rank === 5) return 'bg-orange-400 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div
      onClick={isLoading ? undefined : onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg bg-card border transition-all",
        isLoading ? "opacity-70 cursor-wait" : "hover:shadow-md cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4">
        <Badge className={`${getRankColor(person.rang)} text-lg px-3 py-1`}>
          #{person.rang}
        </Badge>
        <div>
          <p className="font-semibold text-lg">{person.nom}</p>
          <p className="text-sm text-muted-foreground">
            Classement Forbes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-2xl font-bold">{person.nbMedias}</p>
          <p className="text-xs text-muted-foreground">média{person.nbMedias > 1 ? 's' : ''}</p>
        </div>
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Eye className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
