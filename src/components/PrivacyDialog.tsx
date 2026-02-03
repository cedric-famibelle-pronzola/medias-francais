import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink } from 'lucide-react';

const PRIVACY_DISMISSED_KEY = 'privacy-notice-dismissed';

export function PrivacyDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'avertissement
    const dismissed = localStorage.getItem(PRIVACY_DISMISSED_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(PRIVACY_DISMISSED_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confidentialité
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              <p>
                Cette application collecte des <strong>logs techniques</strong> (adresse IP, 
                User-Agent, endpoints appelés) pour des raisons de sécurité, performance 
                et diagnostic.
              </p>
              
              <div className="space-y-2 text-sm">
                <p><strong>Hébergement des données :</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>API & Logs : Deno Land Inc. (USA) via Deno Deploy</li>
                  <li>Base de données (production) : Neon (PostgreSQL serverless)</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                Pour plus de détails, consultez le fichier{' '}
                <a 
                  href="https://github.com/cedric-famibelle-pronzola/medias-francais-api/blob/master/PRIVACY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  PRIVACY.md
                  <ExternalLink className="h-3 w-3" />
                </a>{' '}
                du projet API.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button onClick={handleDismiss} className="w-full sm:w-auto">
            J'ai compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
