import { useState, useEffect, useRef } from 'react';
import { useMedias, usePersonnes, useOrganisations } from '@/hooks/useApi';
import type { Media, Personne, Organisation } from '@/types';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types pour le graphe
interface Node {
  id: string;
  label: string;
  type: 'media' | 'personne' | 'organisation';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  data: Media | Personne | Organisation;
}

interface Edge {
  source: string;
  target: string;
  value: string;
  type: 'proprietaire' | 'filiale' | 'media';
}

export function ReseauSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const animationRef = useRef<number | null>(null);

  const { data: mediasData, loading: mediasLoading } = useMedias(1, 50);
  const { data: personnesData, loading: personnesLoading } = usePersonnes(1, 50);
  const { data: orgsData, loading: orgsLoading } = useOrganisations(1, 50);

  const loading = mediasLoading || personnesLoading || orgsLoading;

  // Couleurs par type
  const typeColors = {
    media: '#3b82f6',
    personne: '#8b5cf6',
    organisation: '#10b981',
  };

  // Initialiser le graphe
  useEffect(() => {
    if (!mediasData?.data || !personnesData?.data || !orgsData?.data) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Ajouter les médias
    mediasData.data.forEach((media, i) => {
      const angle = (i / mediasData.data.length) * 2 * Math.PI;
      const radius = 250;
      newNodes.push({
        id: `media-${media.nom}`,
        label: media.nom,
        type: 'media',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 20,
        color: typeColors.media,
        data: media,
      });

      // Ajouter les liens vers les propriétaires
      media.proprietaires.forEach(prop => {
        newEdges.push({
          source: `media-${media.nom}`,
          target: `${prop.type}-${prop.nom}`,
          value: prop.valeur,
          type: 'proprietaire',
        });
      });
    });

    // Ajouter les personnes
    personnesData.data.forEach((personne, i) => {
      const angle = (i / personnesData.data.length) * 2 * Math.PI + Math.PI;
      const radius = 200;
      newNodes.push({
        id: `personne-${personne.nom}`,
        label: personne.nom,
        type: 'personne',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 25,
        color: typeColors.personne,
        data: personne,
      });

      // Ajouter les liens vers les organisations
      personne.organisations.forEach(org => {
        newEdges.push({
          source: `personne-${personne.nom}`,
          target: `organisation-${org.nom}`,
          value: org.valeur,
          type: 'filiale',
        });
      });
    });

    // Ajouter les organisations
    orgsData.data.forEach((org, i) => {
      const angle = (i / orgsData.data.length) * 2 * Math.PI + Math.PI / 2;
      const radius = 150;
      newNodes.push({
        id: `organisation-${org.nom}`,
        label: org.nom,
        type: 'organisation',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 22,
        color: typeColors.organisation,
        data: org,
      });

      // Ajouter les liens vers les médias
      org.medias.forEach(media => {
        newEdges.push({
          source: `organisation-${org.nom}`,
          target: `media-${media.nom}`,
          value: media.valeur,
          type: 'media',
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [mediasData, personnesData, orgsData]);

  // Simulation physique
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        
        // Forces de répulsion
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 2000 / (dist * dist);
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }

        // Forces d'attraction (liens)
        edges.forEach(edge => {
          const source = newNodes.find(n => n.id === edge.source);
          const target = newNodes.find(n => n.id === edge.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.01;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // Centre de gravité
        newNodes.forEach(node => {
          const dx = 400 - node.x;
          const dy = 300 - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
        });

        // Mise à jour des positions
        newNodes.forEach(node => {
          if (dragging !== node.id) {
            node.vx *= 0.9;
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;
          }
        });

        return newNodes;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length, edges, dragging]);

  // Dessiner le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Filtrer les nœuds
    const filteredNodes = nodes.filter(node => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (searchQuery.length >= 2 && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Dessiner les liens
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target && filteredNodes.includes(source) && filteredNodes.includes(target)) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Dessiner les nœuds
    filteredNodes.forEach(node => {
      // Cercle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Bordure si sélectionné
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label.slice(0, 15), node.x, node.y + node.radius + 15);
    });

    ctx.restore();
  }, [nodes, edges, scale, offset, filterType, searchQuery, selectedNode]);

  // Gestion des événements souris
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    if (clickedNode) {
      setDragging(clickedNode.id);
      setSelectedNode(clickedNode);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    if (dragging) {
      setNodes(prev => prev.map(node => 
        node.id === dragging ? { ...node, x, y, vx: 0, vy: 0 } : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.3));
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Réseau de propriété
          </h2>
          <p className="text-muted-foreground">
            Visualisation interactive des liens entre médias, personnes et organisations
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un nœud..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="media">Médias</SelectItem>
              <SelectItem value="personne">Personnes</SelectItem>
              <SelectItem value="organisation">Organisations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: typeColors.media }} />
          <span className="text-sm">Médias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: typeColors.personne }} />
          <span className="text-sm">Personnes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: typeColors.organisation }} />
          <span className="text-sm">Organisations</span>
        </div>
      </div>

      {/* Canvas */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full cursor-move"
            style={{ background: '#f8fafc' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </CardContent>
      </Card>

      {/* Info panel */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedNode.color }} 
              />
              {selectedNode.label}
              <Badge variant="outline">{selectedNode.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode.type === 'media' && (
              <div className="space-y-2">
                <p><strong>Type:</strong> {(selectedNode.data as Media).type}</p>
                <p><strong>Prix:</strong> {(selectedNode.data as Media).prix || 'Non spécifié'}</p>
                <p><strong>Propriétaires:</strong> {(selectedNode.data as Media).proprietaires.map(p => p.nom).join(', ')}</p>
              </div>
            )}
            {selectedNode.type === 'personne' && (
              <div className="space-y-2">
                <p><strong>Médias directs:</strong> {(selectedNode.data as Personne).mediasDirects?.length || 0}</p>
                <p><strong>Organisations:</strong> {(selectedNode.data as Personne).organisations?.length || 0}</p>
              </div>
            )}
            {selectedNode.type === 'organisation' && (
              <div className="space-y-2">
                <p><strong>Propriétaires:</strong> {(selectedNode.data as Organisation).proprietaires.map(p => p.nom).join(', ')}</p>
                <p><strong>Médias:</strong> {(selectedNode.data as Organisation).medias.length}</p>
                <p><strong>Filiales:</strong> {(selectedNode.data as Organisation).filiales.length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cliquez et déplacez les nœuds pour réorganiser le graphe. Utilisez les boutons de zoom pour agrandir ou réduire la vue.
        </AlertDescription>
      </Alert>
    </div>
  );
}
