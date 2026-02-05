import { useState, useEffect } from 'react';
import { useSearchMedias, useSearchPersonnes, useOrganisations } from '@/hooks/useApi';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Newspaper, Users, Building2, Search, Loader2 } from 'lucide-react';
import type { Media, Personne, Organisation } from '@/types';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (media: Media) => void;
  onSelectPersonne: (personne: Personne) => void;
  onSelectOrganisation: (org: Organisation) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectMedia,
  onSelectPersonne,
  onSelectOrganisation,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  // Recherche API en temps réel
  const { data: searchMedias, loading: mediasLoading } = useSearchMedias(search, 200);
  const { data: searchPersonnes, loading: personnesLoading } = useSearchPersonnes(search, 200);
  // Pour les orgs, on n'a pas de endpoint de recherche, on filtre côté client (max 100 par l'API)
  const { data: orgsData } = useOrganisations(1, 100);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Filtrer les orgs côté client (pas de endpoint de recherche dédié)
  const filteredOrgs = search.length >= 2 && orgsData?.data
    ? orgsData.data
        .filter((o) => o.nom.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5)
    : [];

  const hasResults =
    (searchMedias && searchMedias.length > 0) ||
    (searchPersonnes && searchPersonnes.length > 0) ||
    filteredOrgs.length > 0;

  const isLoading = mediasLoading || personnesLoading;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un média, une personne, une organisation..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 mb-2 animate-spin opacity-50" />
            <p>Recherche en cours...</p>
          </div>
        )}

        {!isLoading && search.length > 0 && search.length < 2 && (
          <CommandEmpty>Continuez à taper pour rechercher (min. 2 caractères)</CommandEmpty>
        )}

        {!isLoading && !hasResults && search.length >= 2 && (
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        )}

        {!isLoading && searchMedias && searchMedias.length > 0 && (
          <CommandGroup heading="Médias">
            {searchMedias.slice(0, 5).map((media) => (
              <CommandItem
                key={`media-${media.nom}`}
                onSelect={() => {
                  onSelectMedia(media);
                  onOpenChange(false);
                }}
              >
                <Newspaper className="mr-2 h-4 w-4 text-blue-500" />
                <span>{media.nom}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {media.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && searchPersonnes && searchPersonnes.length > 0 && (
          <>
            {searchMedias && searchMedias.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Personnes">
              {searchPersonnes.slice(0, 5).map((personne) => (
                <CommandItem
                  key={`personne-${personne.nom}`}
                  onSelect={() => {
                    onSelectPersonne(personne);
                    onOpenChange(false);
                  }}
                >
                  <Users className="mr-2 h-4 w-4 text-purple-500" />
                  <span>{personne.nom}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {(personne.mediasDirects?.length || 0) + (personne.mediasViaOrganisations?.length || 0)} médias
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!isLoading && filteredOrgs.length > 0 && (
          <>
            {(searchMedias?.length || 0) + (searchPersonnes?.length || 0) > 0 && (
              <CommandSeparator />
            )}
            <CommandGroup heading="Organisations">
              {filteredOrgs.map((org) => (
                <CommandItem
                  key={`org-${org.nom}`}
                  onSelect={() => {
                    onSelectOrganisation(org);
                    onOpenChange(false);
                  }}
                >
                  <Building2 className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>{org.nom}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {org.medias?.length || 0} médias
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!search && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>Commencez à taper pour rechercher</p>
            <p className="text-xs mt-1">
              Raccourci: <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd> +{' '}
              <kbd className="px-1 py-0.5 bg-muted rounded">K</kbd>
            </p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
