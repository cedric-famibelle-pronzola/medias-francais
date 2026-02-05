import { useState, useEffect, useRef, useCallback } from 'react';
import { useMedias, usePersonnes, useOrganisations } from '@/hooks/useApi';
import type { Media, Personne, Organisation } from '@/types';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Search,
  Filter,
  Info,
  MousePointer2,
  X,
  Tv,
  Users,
  Building2,
  Newspaper,
  ChevronRight,
  Hand,
  Eye,
  Crosshair
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

// Dimensions internes du canvas
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Détection mobile pour optimisations
const isMobile = typeof window !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Limiter le framerate sur mobile pour économiser la batterie
const FRAME_INTERVAL = isMobile ? 33 : 16; // ~30fps mobile, ~60fps desktop

type ToolMode = 'select' | 'pan';

interface ReseauSectionProps {
  onNavigateToMedia?: (nom: string) => void;
  onNavigateToPersonne?: (nom: string) => void;
  onNavigateToOrganisation?: (nom: string) => void;
}

export function ReseauSection({ 
  onNavigateToMedia, 
  onNavigateToPersonne, 
  onNavigateToOrganisation 
}: ReseauSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [focusMode, setFocusMode] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastFrameTime = useRef<number>(0);
  const stabilityCounter = useRef<number>(0);
  
  // Refs pour éviter les problèmes de closure
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);
  const draggingRef = useRef(dragging);
  const isPanningRef = useRef(isPanning);
  const nodesRef = useRef(nodes);
  const toolModeRef = useRef(toolMode);
  
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { isPanningRef.current = isPanning; }, [isPanning]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { toolModeRef.current = toolMode; }, [toolMode]);

  // Redémarrer la simulation quand on interagit (drag/pan)
  useEffect(() => {
    if ((dragging || isPanning) && !animationRef.current) {
      stabilityCounter.current = 0;
      const simulate = (timestamp: number) => {
        const elapsed = timestamp - lastFrameTime.current;
        if (elapsed < FRAME_INTERVAL) {
          animationRef.current = requestAnimationFrame(simulate);
          return;
        }
        lastFrameTime.current = timestamp;

        setNodes(prevNodes => {
          const newNodes = [...prevNodes];
          const currentDragging = draggingRef.current;
          
          // Forces de répulsion (simplifiées)
          for (let i = 0; i < newNodes.length; i += isMobile ? 2 : 1) {
            for (let j = i + 1; j < newNodes.length; j += isMobile ? 2 : 1) {
              const dx = newNodes[j].x - newNodes[i].x;
              const dy = newNodes[j].y - newNodes[i].y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq) || 1;
              const force = (isMobile ? 1000 : 2000) / (distSq + 100);
              
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              newNodes[i].vx -= fx;
              newNodes[i].vy -= fy;
              newNodes[j].vx += fx;
              newNodes[j].vy += fy;
            }
          }

          // Forces des edges
          const edgesToProcess = isMobile ? edges.slice(0, 50) : edges;
          edgesToProcess.forEach(edge => {
            const source = newNodes.find(n => n.id === edge.source);
            const target = newNodes.find(n => n.id === edge.target);
            if (source && target) {
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = (dist - 100) * 0.01;
              
              source.vx += (dx / dist) * force;
              source.vy += (dy / dist) * force;
              target.vx -= (dx / dist) * force;
              target.vy -= (dy / dist) * force;
            }
          });

          // Gravité et friction
          const gravityStrength = isMobile ? 0.0005 : 0.001;
          newNodes.forEach(node => {
            if (currentDragging !== node.id) {
              const dx = CANVAS_WIDTH / 2 - node.x;
              const dy = CANVAS_HEIGHT / 2 - node.y;
              node.vx += dx * gravityStrength;
              node.vy += dy * gravityStrength;
              node.vx *= isMobile ? 0.85 : 0.9;
              node.vy *= isMobile ? 0.85 : 0.9;
              node.x += node.vx;
              node.y += node.vy;
            }
          });

          return newNodes;
        });

        if (draggingRef.current || isPanningRef.current) {
          animationRef.current = requestAnimationFrame(simulate);
        } else {
          animationRef.current = null;
        }
      };
      animationRef.current = requestAnimationFrame(simulate);
    }
  }, [dragging, isPanning, edges]);

  const { data: mediasData, loading: mediasLoading } = useMedias(1, 50);
  const { data: personnesData, loading: personnesLoading } = usePersonnes(1, 50);
  const { data: orgsData, loading: orgsLoading } = useOrganisations(1, 50);

  const loading = mediasLoading || personnesLoading || orgsLoading;

  const typeColors = {
    media: '#3b82f6',
    personne: '#8b5cf6',
    organisation: '#10b981',
  };

  const typeIcons = {
    media: Tv,
    personne: Users,
    organisation: Building2,
  };

  // Initialiser le graphe
  useEffect(() => {
    if (!mediasData?.data || !personnesData?.data || !orgsData?.data) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    mediasData.data.forEach((media, i) => {
      const angle = (i / mediasData.data.length) * 2 * Math.PI;
      const radius = 250;
      newNodes.push({
        id: `media-${media.nom}`,
        label: media.nom,
        type: 'media',
        x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
        y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 20,
        color: typeColors.media,
        data: media,
      });

      media.proprietaires.forEach(prop => {
        newEdges.push({
          source: `media-${media.nom}`,
          target: `${prop.type}-${prop.nom}`,
          value: prop.valeur,
          type: 'proprietaire',
        });
      });
    });

    personnesData.data.forEach((personne, i) => {
      const angle = (i / personnesData.data.length) * 2 * Math.PI + Math.PI;
      const radius = 200;
      newNodes.push({
        id: `personne-${personne.nom}`,
        label: personne.nom,
        type: 'personne',
        x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
        y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 25,
        color: typeColors.personne,
        data: personne,
      });

      personne.organisations.forEach(org => {
        newEdges.push({
          source: `personne-${personne.nom}`,
          target: `organisation-${org.nom}`,
          value: org.valeur,
          type: 'filiale',
        });
      });
    });

    orgsData.data.forEach((org, i) => {
      const angle = (i / orgsData.data.length) * 2 * Math.PI + Math.PI / 2;
      const radius = 150;
      newNodes.push({
        id: `organisation-${org.nom}`,
        label: org.nom,
        type: 'organisation',
        x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
        y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 22,
        color: typeColors.organisation,
        data: org,
      });

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

  // Simulation physique optimisée
  useEffect(() => {
    if (nodes.length === 0) return;

    let isActive = true;
    stabilityCounter.current = 0;

    const simulate = (timestamp: number) => {
      if (!isActive) return;

      // Limiter le framerate
      const elapsed = timestamp - lastFrameTime.current;
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(simulate);
        return;
      }
      lastFrameTime.current = timestamp;

      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const currentDragging = draggingRef.current;
        let totalMovement = 0;
        
        // Optimisation: moins de calculs sur mobile
        const nodeCount = newNodes.length;
        const sampleRate = isMobile && nodeCount > 30 ? 2 : 1;
        
        for (let i = 0; i < nodeCount; i += sampleRate) {
          for (let j = i + 1; j < nodeCount; j += sampleRate) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) || 1;
            // Force plus faible sur mobile pour réduire les oscillations
            const force = (isMobile ? 1000 : 2000) / (distSq + 100);
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }

        // Optimisation: limiter le nombre d'edges traités sur mobile
        const edgesToProcess = isMobile ? edges.slice(0, 100) : edges;
        edgesToProcess.forEach(edge => {
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

        // Force de gravité vers le centre (plus faible sur mobile)
        const gravityStrength = isMobile ? 0.0005 : 0.001;
        newNodes.forEach(node => {
          const dx = CANVAS_WIDTH / 2 - node.x;
          const dy = CANVAS_HEIGHT / 2 - node.y;
          node.vx += dx * gravityStrength;
          node.vy += dy * gravityStrength;
        });

        // Appliquer la friction et mettre à jour les positions
        newNodes.forEach(node => {
          if (currentDragging !== node.id) {
            // Friction plus élevée sur mobile pour stabiliser plus vite
            node.vx *= isMobile ? 0.85 : 0.9;
            node.vy *= isMobile ? 0.85 : 0.9;
            
            const moveX = node.vx;
            const moveY = node.vy;
            
            node.x += moveX;
            node.y += moveY;
            
            totalMovement += Math.abs(moveX) + Math.abs(moveY);
          }
        });

        // Détection de stabilité: si peu de mouvement, réduire le framerate
        if (totalMovement < (isMobile ? 5 : 1)) {
          stabilityCounter.current++;
        } else {
          stabilityCounter.current = 0;
        }

        return newNodes;
      });

      // Si stable depuis longtemps, ralentir drastiquement
      const stableDelay = stabilityCounter.current > (isMobile ? 30 : 60);
      if (stableDelay) {
        // Redémarrer seulement si nécessaire (drag, etc)
        if (draggingRef.current || isPanningRef.current) {
          stabilityCounter.current = 0;
          animationRef.current = requestAnimationFrame(simulate);
        }
        // Sinon on s'arrête, le rendu se fera quand même via useEffect
      } else {
        animationRef.current = requestAnimationFrame(simulate);
      }
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length, edges]);

  // Dessiner le canvas - utilise les refs pour permettre le rendu hors React
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    const filteredNodes = nodes.filter(node => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (searchQuery.length >= 2 && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Calculer les nœuds connectés au nœud sélectionné pour le mode focus
    const connectedNodeIds = new Set<string>();
    if (focusMode && selectedNode) {
      connectedNodeIds.add(selectedNode.id);
      edges.forEach(edge => {
        if (edge.source === selectedNode.id) connectedNodeIds.add(edge.target);
        if (edge.target === selectedNode.id) connectedNodeIds.add(edge.source);
      });
    }

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

    filteredNodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isDimmed = focusMode && selectedNode && !connectedNodeIds.has(node.id);
      
      // Ombre portée
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = isSelected ? 15 : 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isSelected ? 6 : 3;
      
      // Cercle extérieur (bordure)
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#f59e0b' : 'white';
      ctx.fill();
      
      // Dégradé intérieur
      const gradient = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        0,
        node.x,
        node.y,
        node.radius
      );
      
      if (isDimmed) {
        // Grisé pour les nœuds non connectés en mode focus
        gradient.addColorStop(0, '#d1d5db');
        gradient.addColorStop(0.5, '#9ca3af');
        gradient.addColorStop(1, '#6b7280');
      } else if (node.type === 'media') {
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
      } else if (node.type === 'personne') {
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#6d28d9');
      } else {
        gradient.addColorStop(0, '#34d399');
        gradient.addColorStop(0.5, '#10b981');
        gradient.addColorStop(1, '#047857');
      }
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
      
      // Reflet (effet glossy)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        node.radius * 0.4,
        0,
        2 * Math.PI
      );
      const highlightGradient = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        0,
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        node.radius * 0.4
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      ctx.restore();
      
      // Icône au centre du nœud
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.font = `bold ${node.radius * 0.8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      let icon = '';
      if (node.type === 'media') icon = '📺';
      else if (node.type === 'personne') icon = '👤';
      else icon = '🏢';
      
      ctx.fillText(icon, node.x, node.y);
      ctx.restore();
      
      // Bordure de sélection avec glow
      if (isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Label avec fond pour meilleure lisibilité
      ctx.save();
      const label = node.label.slice(0, 15);
      ctx.font = 'bold 11px sans-serif';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 14;
      
      // Fond du label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - 4,
        node.y + node.radius + 8,
        textWidth + 8,
        textHeight,
        4
      );
      ctx.fill();
      
      // Texte du label
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, node.x, node.y + node.radius + 15);
      ctx.restore();
    });

    ctx.restore();
  }, [nodes, edges, scale, offset, filterType, searchQuery, selectedNode]);

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const displayX = (clientX - rect.left) * scaleX;
    const displayY = (clientY - rect.top) * scaleY;
    
    const x = (displayX - offsetRef.current.x) / scaleRef.current;
    const y = (displayY - offsetRef.current.y) / scaleRef.current;
    
    return { x, y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // Clic droit ou mode pan = déplacer la vue
    if (e.button === 2 || toolModeRef.current === 'pan') {
      setIsPanning(true);
      return;
    }

    const clickedNode = nodesRef.current.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    if (clickedNode) {
      setDragging(clickedNode.id);
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  }, [screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    setMousePos({ x: e.clientX, y: e.clientY });

    if (draggingRef.current && toolModeRef.current === 'select') {
      setNodes(prev => prev.map(node => 
        node.id === draggingRef.current ? { ...node, x, y, vx: 0, vy: 0 } : node
      ));
    } else if (isPanningRef.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (toolModeRef.current === 'select') {
      // Détection du survol pour tooltip
      const hovered = nodesRef.current.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < node.radius;
      });
      setHoveredNode(hovered || null);
    }
  }, [screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  // Gestionnaires tactiles pour mobile - Optimisés pour Firefox
  // Sur Firefox mobile, on évite les setState pendant le mouvement pour ne pas bloquer
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStartOffset = useRef({ x: 0, y: 0 });
  const panDelta = useRef({ x: 0, y: 0 });
  
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartOffset.current = { ...offsetRef.current };
    panDelta.current = { x: 0, y: 0 };
    lastMousePos.current = { x: touch.clientX, y: touch.clientY };

    if (toolModeRef.current === 'pan') {
      setIsPanning(true);
      isPanningRef.current = true;
      return;
    }

    const { x, y } = screenToCanvas(touch.clientX, touch.clientY);
    const clickedNode = nodesRef.current.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    if (clickedNode) {
      setDragging(clickedNode.id);
      setSelectedNode(clickedNode);
    } else {
      setIsPanning(true);
      isPanningRef.current = true;
      setSelectedNode(null);
    }
  }, [screenToCanvas]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];
    
    if (draggingRef.current && toolModeRef.current === 'select') {
      // Pour le drag de nœud, on doit mettre à jour le state
      const { x, y } = screenToCanvas(touch.clientX, touch.clientY);
      setNodes(prev => prev.map(node => 
        node.id === draggingRef.current ? { ...node, x, y, vx: 0, vy: 0 } : node
      ));
    } else if (isPanningRef.current) {
      // Pour le pan sur Firefox mobile : utiliser CSS transform (GPU accelerated)
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      
      // Stocker le delta final pour le touchEnd
      panDelta.current = { x: dx, y: dy };
      
      // Appliquer directement via CSS - ultra rapide, pas de re-render React
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    }
  }, [screenToCanvas]);

  const handleTouchEnd = useCallback(() => {
    // Synchroniser l'offset avec le state React
    if (isPanningRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.transform = ''; // Reset CSS transform
      }
      setOffset({
        x: touchStartOffset.current.x + panDelta.current.x,
        y: touchStartOffset.current.y + panDelta.current.y
      });
    }
    setDragging(null);
    setIsPanning(false);
    isPanningRef.current = false;
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

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

  const TypeIcon = selectedNode ? typeIcons[selectedNode.type] : null;

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
      <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
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

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border">
          <Button
            variant={toolMode === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setToolMode('select')}
            className={cn(
              "gap-1.5 transition-all",
              toolMode === 'select' && "shadow-sm"
            )}
          >
            <MousePointer2 className="h-4 w-4" />
            Sélection
          </Button>
          <Button
            variant={toolMode === 'pan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setToolMode('pan')}
            className={cn(
              "gap-1.5 transition-all",
              toolMode === 'pan' && "shadow-sm"
            )}
          >
            <Hand className="h-4 w-4" />
            Déplacer
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom arrière">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom avant">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} title="Réinitialiser la vue">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {selectedNode && (
          <div className="flex items-center gap-2">
            <Button
              variant={focusMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
              title="Mode focus"
            >
              <Eye className="h-4 w-4 mr-1" />
              Focus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOffset({
                  x: CANVAS_WIDTH / 2 - selectedNode.x * scale,
                  y: CANVAS_HEIGHT / 2 - selectedNode.y * scale
                });
              }}
              title="Centrer sur la sélection"
            >
              <Crosshair className="h-4 w-4 mr-1" />
              Centrer
            </Button>
          </div>
        )}
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

      {/* Canvas et Info Panel côte à côte */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas */}
        <Card className={cn(
          "overflow-hidden flex-1",
          selectedNode && "lg:w-2/3"
        )}>
          <CardContent className="p-0">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className={cn(
                "w-full touch-none",
                toolMode === 'pan' ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              )}
              style={{ 
                background: '#f8fafc',
                willChange: 'transform',
                imageRendering: 'crisp-edges'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onContextMenu={handleContextMenu}
            />
            {/* Tooltip au survol */}
            {hoveredNode && !dragging && (
              <div 
                className="absolute pointer-events-none z-50 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-sm"
                style={{
                  left: mousePos.x + 10,
                  top: mousePos.y - 30,
                }}
              >
                <p className="font-medium">{hoveredNode.label}</p>
                <p className="text-xs text-muted-foreground capitalize">{hoveredNode.type}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel - Side Panel élégant */}
        {selectedNode && TypeIcon && (
          <Card className="lg:w-1/3 animate-in slide-in-from-right duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${selectedNode.color}20` }}
                  >
                    <TypeIcon className="h-6 w-6" style={{ color: selectedNode.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className="mt-1 capitalize"
                      style={{ borderColor: selectedNode.color, color: selectedNode.color }}
                    >
                      {selectedNode.type}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedNode(null)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {selectedNode.type === 'media' && (
                  <div className="space-y-6">
                    <InfoSection title="Informations générales">
                      <InfoItem label="Type" value={(selectedNode.data as Media).type} />
                      <InfoItem label="Prix" value={(selectedNode.data as Media).prix || 'Non spécifié'} />
                      <InfoItem label="Échelle" value={(selectedNode.data as Media).echelle || 'Non spécifié'} />
                      <InfoItem label="Périodicité" value={(selectedNode.data as Media).periodicite || 'Non spécifié'} />
                    </InfoSection>

                    <Separator />

                    <InfoSection title="Propriétaires directs" icon={Users}>
                      {(selectedNode.data as Media).proprietaires?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun propriétaire connu</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Media).proprietaires.map((prop, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant={prop.type === 'personne' ? 'default' : 'secondary'}>
                                  {prop.type === 'personne' ? 'Personne' : 'Organisation'}
                                </Badge>
                                {prop.type === 'personne' && onNavigateToPersonne ? (
                                  <button
                                    onClick={() => onNavigateToPersonne(prop.nom)}
                                    className="font-medium text-primary hover:underline text-left"
                                  >
                                    {prop.nom}
                                  </button>
                                ) : prop.type === 'organisation' && onNavigateToOrganisation ? (
                                  <button
                                    onClick={() => onNavigateToOrganisation(prop.nom)}
                                    className="font-medium text-primary hover:underline text-left"
                                  >
                                    {prop.nom}
                                  </button>
                                ) : (
                                  <span className="font-medium">{prop.nom}</span>
                                )}
                              </div>
                              <Badge variant="outline">{prop.valeur}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>

                    {(selectedNode.data as Media).chaineProprietaires?.length > 0 && (
                      <>
                        <Separator />
                        <InfoSection title="Chaîne de propriété" icon={ChevronRight}>
                          <div className="space-y-3">
                            {(selectedNode.data as Media).chaineProprietaires.map((chaine, idx) => (
                              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {chaine.chemin.map((nom, i) => (
                                    <span key={i} className="flex items-center text-sm">
                                      {onNavigateToPersonne ? (
                                        <button
                                          onClick={() => onNavigateToPersonne(nom)}
                                          className="font-medium text-primary hover:underline text-left"
                                        >
                                          {nom}
                                        </button>
                                      ) : (
                                        <span className="font-medium">{nom}</span>
                                      )}
                                      {i < chaine.chemin.length - 1 && (
                                        <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                                      )}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Valeur finale: <Badge variant="outline" className="text-xs">{chaine.valeurFinale}</Badge>
                                </p>
                              </div>
                            ))}
                          </div>
                        </InfoSection>
                      </>
                    )}
                  </div>
                )}

                {selectedNode.type === 'personne' && (
                  <div className="space-y-6">
                    {((selectedNode.data as Personne).classements?.challenges2024) && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium">
                          🏆 Top Challenges 2024 : #{(selectedNode.data as Personne).classements!.challenges2024}
                        </p>
                      </div>
                    )}

                    <InfoSection title="Médias directs" icon={Newspaper}>
                      {((selectedNode.data as Personne).mediasDirects?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun média direct</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Personne).mediasDirects?.map((media, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              {onNavigateToMedia ? (
                                <button
                                  onClick={() => onNavigateToMedia(media.nom)}
                                  className="font-medium text-primary hover:underline text-left"
                                >
                                  {media.nom}
                                </button>
                              ) : (
                                <span className="font-medium">{media.nom}</span>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{media.type}</Badge>
                                <Badge variant="outline" className="text-xs">{media.valeur}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>

                    <Separator />

                    <InfoSection title="Médias via organisations" icon={Building2}>
                      {((selectedNode.data as Personne).mediasViaOrganisations?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun média via organisations</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Personne).mediasViaOrganisations?.map((media, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                {onNavigateToMedia ? (
                                  <button
                                    onClick={() => onNavigateToMedia(media.nom)}
                                    className="font-medium text-primary hover:underline text-left"
                                  >
                                    {media.nom}
                                  </button>
                                ) : (
                                  <span className="font-medium">{media.nom}</span>
                                )}
                                {media.via && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    via {media.via}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{media.type}</Badge>
                                <Badge variant="outline" className="text-xs">{media.valeur}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>

                    <Separator />

                    <InfoSection title="Organisations" icon={Building2}>
                      {((selectedNode.data as Personne).organisations?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune organisation</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Personne).organisations?.map((org, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              {onNavigateToOrganisation ? (
                                <button
                                  onClick={() => onNavigateToOrganisation(org.nom)}
                                  className="font-medium text-primary hover:underline text-left"
                                >
                                  {org.nom}
                                </button>
                              ) : (
                                <span className="font-medium">{org.nom}</span>
                              )}
                              <Badge variant="outline">{org.valeur}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>
                  </div>
                )}

                {selectedNode.type === 'organisation' && (
                  <div className="space-y-6">
                    {(selectedNode.data as Organisation).commentaire && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{(selectedNode.data as Organisation).commentaire}</p>
                      </div>
                    )}

                    <InfoSection title="Propriétaires" icon={Users}>
                      {(selectedNode.data as Organisation).proprietaires?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun propriétaire connu</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Organisation).proprietaires.map((prop, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant={prop.type === 'personne' ? 'default' : 'secondary'}>
                                  {prop.type === 'personne' ? 'Personne' : 'Organisation'}
                                </Badge>
                                {prop.type === 'personne' && onNavigateToPersonne ? (
                                  <button
                                    onClick={() => onNavigateToPersonne(prop.nom)}
                                    className="font-medium text-primary hover:underline text-left"
                                  >
                                    {prop.nom}
                                  </button>
                                ) : prop.type === 'organisation' && onNavigateToOrganisation ? (
                                  <button
                                    onClick={() => onNavigateToOrganisation(prop.nom)}
                                    className="font-medium text-primary hover:underline text-left"
                                  >
                                    {prop.nom}
                                  </button>
                                ) : (
                                  <span className="font-medium">{prop.nom}</span>
                                )}
                              </div>
                              <Badge variant="outline">{prop.valeur}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>

                    <Separator />

                    <InfoSection title="Filiales" icon={Building2}>
                      {(selectedNode.data as Organisation).filiales.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune filiale</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Organisation).filiales.map((fil, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              {onNavigateToOrganisation ? (
                                <button
                                  onClick={() => onNavigateToOrganisation(fil.nom)}
                                  className="font-medium text-primary hover:underline text-left"
                                >
                                  {fil.nom}
                                </button>
                              ) : (
                                <span className="font-medium">{fil.nom}</span>
                              )}
                              {fil.valeur && <Badge variant="outline">{fil.valeur}</Badge>}
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoSection>

                    <Separator />

                    <InfoSection title="Médias possédés" icon={Newspaper}>
                      {(selectedNode.data as Organisation).medias.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun média direct</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedNode.data as Organisation).medias.map((media, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                    </InfoSection>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Mode Sélection :</span> Cliquez sur un nœud pour voir ses détails, faites glisser pour le déplacer. 
          <span className="font-medium ml-2">Mode Déplacer :</span> Cliquez et faites glisser pour naviguer dans le graphe. 
          Vous pouvez aussi utiliser le clic droit pour déplacer la vue.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Composants utilitaires pour l'affichage
function InfoSection({ 
  title, 
  icon: Icon,
  children 
}: { 
  title: string; 
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        {Icon && <Icon className="h-4 w-4" />}
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
