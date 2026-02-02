import { useStats, useTopChallenges, useConcentration } from '@/hooks/useApi';
import { 
  Newspaper, 
  Users, 
  Building2, 
  TrendingUp, 
  Crown,
  Radio,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export function Dashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useStats();
  const { data: topChallenges, loading: tcLoading } = useTopChallenges();
  const { data: concentration, loading: concLoading } = useConcentration();

  if (statsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des données. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  // Préparer les données pour le graphique des types de médias
  const typeData = stats ? Object.entries(stats.mediasParType).map(([name, value]) => ({
    name: name.replace('Presse (généraliste  politique  économique)', 'Presse'),
    value
  })) : [];

  // Préparer les données pour le graphique prix
  const prixData = stats ? Object.entries(stats.mediasParPrix).map(([name, value]) => ({
    name,
    value
  })) : [];

  // Préparer les données de concentration
  const concentrationData = concentration?.parPersonnes?.slice(0, 8).map(p => ({
    personne: p.nom,
    nbMedias: p.nbMedias
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de la propriété des médias français
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Médias"
          value={stats?.totaux.medias}
          loading={statsLoading}
          icon={Newspaper}
          description="Total des médias répertoriés"
          color="bg-blue-500"
        />
        <StatCard
          title="Personnes"
          value={stats?.totaux.personnes}
          loading={statsLoading}
          icon={Users}
          description="Propriétaires identifiés"
          color="bg-purple-500"
        />
        <StatCard
          title="Organisations"
          value={stats?.totaux.organisations}
          loading={statsLoading}
          icon={Building2}
          description="Groupes et entreprises"
          color="bg-emerald-500"
        />
        <StatCard
          title="Médias gratuits"
          value={stats?.mediasParPrix.Gratuit}
          loading={statsLoading}
          icon={TrendingUp}
          description={`Sur ${stats?.totaux.medias || 0} médias total`}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Types de médias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-blue-500" />
              Répartition par type de média
            </CardTitle>
            <CardDescription>
              Distribution des médias selon leur format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gratuit vs Payant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Gratuit vs Payant
            </CardTitle>
            <CardDescription>
              Répartition des médias selon leur modèle économique
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Challenges & Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Challenges {topChallenges?.annee}
            </CardTitle>
            <CardDescription>
              Les plus grosses fortunes françaises propriétaires de médias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tcLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topChallenges?.classement.slice(0, 8).map((person) => (
                  <div
                    key={person.nom}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={person.rang <= 3 ? "default" : "secondary"}>
                        #{person.rang}
                      </Badge>
                      <span className="font-medium">{person.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {person.nbMedias} média{person.nbMedias > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Concentration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Concentration par personne
            </CardTitle>
            <CardDescription>
              Nombre de médias détenus par les principaux propriétaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            {concLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={concentrationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="personne" type="category" width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="nbMedias" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  loading: boolean;
  icon: React.ElementType;
  description: string;
  color: string;
}

function StatCard({ title, value, loading, icon: Icon, description, color }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-3xl font-bold">{value}</p>
          )}
          <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
