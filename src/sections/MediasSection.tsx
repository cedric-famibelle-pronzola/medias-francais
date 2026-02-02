import { useState, useMemo } from 'react';
import { useMedias, useSearchMedias } from '@/hooks/useApi';
import type { Media } from '@/types';
import { 
  Search, 
  Filter, 
  Tv, 
  Radio, 
  Globe, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const TYPE_ICONS: Record<string, React.ElementType> = {
  'Télévision': Tv,
  'Radio': Radio,
  'Site': Globe,
  'Presse (généraliste  politique  économique)': BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
  'Télévision': 'bg-blue-100 text-blue-700 border-blue-200',
  'Radio': 'bg-purple-100 text-purple-700 border-purple-200',
  'Site': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Presse (généraliste  politique  économique)': 'bg-amber-100 text-amber-700 border-amber-200',
};

interface MediasSectionProps {
  onSelectMedia?: (media: Media) => void;
}

export function MediasSection({ onSelectMedia }: MediasSectionProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const limit = 24;
  
  const { data: mediasData, loading: mediasLoading, error: mediasError } = useMedias(page, limit);
  const { data: searchResults, loading: searchLoading } = useSearchMedias(searchQuery);

  // Filtrer les médias
  const filteredMedias = useMemo(() => {
    let medias: Media[] = [];
    
    if (searchQuery.length >= 2 && searchResults) {
      medias = searchResults;
    } else if (mediasData) {
      medias = mediasData.data;
    }
    
    if (typeFilter !== 'all') {
      medias = medias.filter(m => m.type === typeFilter);
    }
    
    return medias;
  }, [searchQuery, searchResults, mediasData, typeFilter]);

  // Types uniques pour le filtre
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    if (mediasData?.data) {
      mediasData.data.forEach(m => types.add(m.type));
    }
    return Array.from(types).sort();
  }, [mediasData]);

  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
    setDetailOpen(true);
    if (onSelectMedia) {
      onSelectMedia(media);
    }
  };

  if (mediasError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des médias. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  const loading = mediasLoading || (searchLoading && searchQuery.length >= 2);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Médias</h2>
          <p className="text-muted-foreground">
            {mediasData?.pagination.total || 0} médias répertoriés
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un média..."
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
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filteredMedias.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun média trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedias.map((media) => (
            <MediaCard 
              key={media.nom} 
              media={media} 
              onClick={() => handleMediaClick(media)}
            />
          ))}
        </div>
      )}

      {/* Pagination (only when not searching) */}
      {searchQuery.length < 2 && mediasData && (
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
            Page {page} sur {mediasData.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(mediasData.pagination.pages, p + 1))}
            disabled={page === mediasData.pagination.pages}
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
              {selectedMedia && (
                <>
                  <Badge className={TYPE_COLORS[selectedMedia.type] || 'bg-gray-100'}>
                    {selectedMedia.type}
                  </Badge>
                  {selectedMedia.nom}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Détails du média et propriétaires
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedMedia && (
              <div className="space-y-6">
                {/* Info générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Échelle</p>
                    <p className="font-medium">{selectedMedia.echelle || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <p className="font-medium">{selectedMedia.prix || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Périodicité</p>
                    <p className="font-medium">{selectedMedia.periodicite || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-medium">
                      {selectedMedia.disparu ? (
                        <Badge variant="destructive">Disparu</Badge>
                      ) : (
                        <Badge variant="default">Actif</Badge>
                      )}
                    </p>
                  </div>
                </div>

                {/* Propriétaires directs */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Propriétaires directs
                  </h4>
                  {selectedMedia.proprietaires.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun propriétaire connu</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMedia.proprietaires.map((prop, idx) => (
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

                {/* Chaîne de propriété */}
                {selectedMedia.chaineProprietaires.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Chaîne de propriété</h4>
                    <div className="space-y-3">
                      {selectedMedia.chaineProprietaires.map((chaine, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 flex-wrap">
                            {chaine.chemin.map((nom, i) => (
                              <span key={i} className="flex items-center">
                                <span className="text-sm">{nom}</span>
                                {i < chaine.chemin.length - 1 && (
                                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                                )}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Valeur finale: <Badge variant="outline">{chaine.valeurFinale}</Badge>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MediaCardProps {
  media: Media;
  onClick: () => void;
}

function MediaCard({ media, onClick }: MediaCardProps) {
  const TypeIcon = TYPE_ICONS[media.type] || BookOpen;
  const typeColorClass = TYPE_COLORS[media.type] || 'bg-gray-100 text-gray-700';

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${typeColorClass}`}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <Badge variant={media.prix === 'Gratuit' ? 'default' : 'secondary'}>
            {media.prix || '?'}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{media.nom}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {media.type}
          </Badge>
          {media.echelle && (
            <Badge variant="outline" className="text-xs">
              {media.echelle}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {media.proprietaires.length > 0 ? (
            <p className="line-clamp-1">
              {media.proprietaires.map(p => p.nom).join(', ')}
            </p>
          ) : (
            <p>Propriétaire inconnu</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
