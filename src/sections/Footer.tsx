import { AlertTriangle, Database, Shield, ExternalLink, Github, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Ligne principale avec source des données et liens */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Source des données */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>
              Données issues du projet{' '}
              <a
                href="https://github.com/mdiplo/Medias_francais"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                mdiplo/Medias_francais
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="text-muted-foreground">Mise à jour décembre 2024</span>
          </div>

          {/* Boutons d'information */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dialog Crédits / Kimi */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Crédits
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-purple-600">
                    <Sparkles className="h-5 w-5" />
                    Crédits
                  </DialogTitle>
                  <DialogDescription className="pt-4 space-y-4 text-left">
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <p className="text-sm text-purple-800">
                        <strong>Interface développée avec Kimi</strong>
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        Cette application a été générée et développée avec l'assistance de{' '}
                        <strong>Kimi</strong>, l'assistant IA de{' '}
                        <a
                          href="https://www.moonshot.cn/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          Moonshot AI
                        </a>.
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Stack technique :</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>React 19 + TypeScript</li>
                        <li>Vite 7</li>
                        <li>Tailwind CSS + shadcn/ui</li>
                        <li>Recharts pour les visualisations</li>
                      </ul>

                      <p className="pt-2">
                        <strong>Données :</strong> Source du Monde Diplomatique via le projet{' '}
                        <a
                          href="https://github.com/mdiplo/Medias_francais"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground underline hover:no-underline inline-flex items-center gap-1"
                        >
                          mdiplo/Medias_francais
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            {/* Dialog Confidentialité */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Confidentialité
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    Confidentialité et données personnelles
                  </DialogTitle>
                  <DialogDescription className="pt-4 space-y-4 text-left">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Collecte de données :</strong> Cette application collecte des logs techniques 
                        (adresse IP, User-Agent, endpoints appelés) pour des raisons de sécurité, 
                        performance et diagnostic.
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Hébergement :</strong> Ces données sont stockées sur les serveurs de{' '}
                        <strong>Deno Land Inc</strong>, une société américaine basée à San Diego, CA, 
                        via Deno Deploy.
                      </p>
                      
                      <p>
                        <strong>Conservation :</strong> Les logs sont conservés pendant une durée 
                        limitée conformément à notre politique de confidentialité.
                      </p>

                      <p>
                        Pour plus de détails, consultez le fichier{' '}
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">PRIVACY.md</code> du projet API.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            {/* Dialog Licence */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Github className="h-4 w-4 mr-1.5" />
                  Licence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Licence et code source
                  </DialogTitle>
                  <DialogDescription className="pt-4 space-y-4 text-left">
                    <div className="rounded-lg border bg-muted p-4">
                      <p className="font-mono text-sm">AGPL-3.0</p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Ce projet est libre et open-source, distribué sous licence AGPL-3.0 
                        (GNU Affero General Public License v3.0).
                      </p>
                      
                      <p>
                        Cette licence garantit que vous pouvez utiliser, étudier, modifier et 
                        distribuer ce logiciel librement, sous réserve de respecter les termes 
                        de la licence AGPL.
                      </p>

                      <p className="pt-2">
                        <a
                          href="https://github.com/mdiplo/Medias_francais"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                        >
                          Voir le code source sur GitHub
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bandeau d'avertissement IP */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2">
          <p className="text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Avertissement :</strong> Votre adresse IP et votre User-Agent sont collectés 
              et stockés par nos services et notre hébergeur (Deno Land Inc, USA) à des fins de 
              sécurité et d'analyse. En utilisant cette application, vous acceptez cette collecte.
            </span>
          </p>
        </div>

        {/* Ligne de crédit Kimi (subtile) */}
        <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-purple-500" />
          <span>
            Interface développée avec{' '}
            <a
              href="https://kimi.moonshot.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline font-medium"
            >
              Kimi
            </a>
            {' '}— Assistant IA par Moonshot AI
          </span>
        </div>
      </div>
    </footer>
  );
}
