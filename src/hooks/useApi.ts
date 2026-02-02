import { useState, useEffect } from 'react';
import type {
  Media,
  MediaResponse,
  Personne,
  PersonneResponse,
  Organisation,
  OrganisationResponse,
  TopChallengesResponse,
  Stats,
  Concentration,
} from '@/types';

// URL de base de l'API (configurable via variables d'environnement Vite)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper pour faire les requêtes API
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Erreur HTTP ${response.status}`
    );
  }

  return response.json();
}

// Hook pour la liste des médias
export function useMedias(page: number = 1, limit: number = 50) {
  const [data, setData] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<MediaResponse>(
          `/medias?page=${page}&limit=${limit}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}

// Hook pour la recherche de médias
export function useSearchMedias(query: string) {
  const [data, setData] = useState<Media[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<{ query: string; count: number; results: Media[] }>(
          `/medias/search?q=${encodeURIComponent(query)}`
        );
        setData(result.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return { data, loading, error };
}

// Hook pour le détail d'un média
export function useMediaDetail(nom: string | null) {
  const [data, setData] = useState<Media | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nom) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<Media>(
          `/medias/${encodeURIComponent(nom)}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nom]);

  return { data, loading, error };
}

// Hook pour la liste des personnes
export function usePersonnes(page: number = 1, limit: number = 50) {
  const [data, setData] = useState<PersonneResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<PersonneResponse>(
          `/personnes?page=${page}&limit=${limit}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}

// Hook pour le détail d'une personne
export function usePersonneDetail(nom: string | null) {
  const [data, setData] = useState<Personne | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nom) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<Personne>(
          `/personnes/${encodeURIComponent(nom)}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nom]);

  return { data, loading, error };
}

// Hook pour le top challenges
export function useTopChallenges() {
  const [data, setData] = useState<TopChallengesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<TopChallengesResponse>(
          '/personnes/top-challenges'
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// Hook pour la liste des organisations
export function useOrganisations(page: number = 1, limit: number = 50) {
  const [data, setData] = useState<OrganisationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<OrganisationResponse>(
          `/organisations?page=${page}&limit=${limit}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}

// Hook pour le détail d'une organisation
export function useOrganisationDetail(nom: string | null) {
  const [data, setData] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nom) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<Organisation>(
          `/organisations/${encodeURIComponent(nom)}`
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nom]);

  return { data, loading, error };
}

// Hook pour les statistiques
export function useStats() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<Stats>('/stats');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// Hook pour la concentration
export function useConcentration() {
  const [data, setData] = useState<Concentration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApi<Concentration>('/stats/concentration');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
