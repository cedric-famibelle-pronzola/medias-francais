import { useState, useEffect, useMemo } from 'react';
import { useMedias, usePersonnes, useOrganisations } from '@/hooks/useApi';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Newspaper, Users, Building2, Search } from 'lucide-react';
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

  const { data: mediasData } = useMedias(1, 100);
  const { data: personnesData } = usePersonnes(1, 100);
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

  const filteredMedias = useMemo(() => {
    if (!search || search.length < 2 || !mediasData?.data) return [];
    return mediasData.data
      .filter((m) => m.nom.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [search, mediasData]);

  const filteredPersonnes = useMemo(() => {
    if (!search || search.length < 2 || !personnesData?.data) return [];
    return personnesData.data
      .filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [search, personnesData]);

  const filteredOrgs = useMemo(() => {
    if (!search || search.length < 2 || !orgsData?.data) return [];
    return orgsData.data
      .filter((o) => o.nom.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [search, orgsData]);

  const hasResults =
    filteredMedias.length > 0 ||
    filteredPersonnes.length > 0 ||
    filteredOrgs.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un média, une personne, une organisation..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!hasResults && search.length >= 2 && (
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        )}

        {filteredMedias.length > 0 && (
          <CommandGroup heading="Médias">
            {filteredMedias.map((media) => (
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

        {filteredPersonnes.length > 0 && (
          <>
            {filteredMedias.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Personnes">
              {filteredPersonnes.map((personne) => (
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
                    {personne.mediasDirects.length + personne.mediasViaOrganisations.length} médias
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredOrgs.length > 0 && (
          <>
            {(filteredMedias.length > 0 || filteredPersonnes.length > 0) && (
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
                    {org.medias.length} médias
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
