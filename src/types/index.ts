// Types pour l'API Médias Français

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Proprietaire {
  nom: string;
  type: 'personne' | 'organisation';
  qualificatif: string;
  valeur: string;
}

export interface ChaineProprietaire {
  nom: string;
  chemin: string[];
  valeurFinale: string;
}

export interface Media {
  nom: string;
  type: string;
  periodicite: string;
  echelle: string;
  prix: string;
  disparu: boolean;
  proprietaires: Proprietaire[];
  chaineProprietaires: ChaineProprietaire[];
}

export interface MediaResponse {
  data: Media[];
  pagination: Pagination;
}

export interface Classements {
  challenges2024: number | null;
  forbes2024: boolean;
  challenges2023: number | null;
  forbes2023: boolean;
  challenges2022: number | null;
  forbes2022: boolean;
  challenges2021: number | null;
  forbes2021: boolean;
}

export interface MediaDetenu {
  nom: string;
  type: string;
  qualificatif: string;
  valeur: string;
  via?: string;
}

export interface Personne {
  nom: string;
  classements: Classements;
  mediasDirects: MediaDetenu[];
  mediasViaOrganisations: MediaDetenu[];
  organisations: Array<{
    nom: string;
    qualificatif: string;
    valeur: string;
  }>;
}

export interface PersonneResponse {
  data: Personne[];
  pagination: Pagination;
}

export interface TopChallenge {
  rang: number;
  nom: string;
  forbes: boolean;
  nbMedias: number;
}

export interface TopChallengesResponse {
  annee: number;
  classement: TopChallenge[];
}

export interface Organisation {
  nom: string;
  commentaire: string;
  proprietaires: Proprietaire[];
  filiales: Array<{
    nom: string;
    qualificatif: string;
    valeur: string;
  }>;
  medias: Array<{
    nom: string;
    type: string;
    qualificatif: string;
    valeur: string;
  }>;
}

export interface OrganisationResponse {
  data: Organisation[];
  pagination: Pagination;
}

export interface Stats {
  totaux: {
    medias: number;
    personnes: number;
    organisations: number;
  };
  mediasParType: Record<string, number>;
  mediasParPrix: Record<string, number>;
  mediasDisparus: number;
}

export interface ConcentrationPersonne {
  nom: string;
  nbMedias: number;
}

export interface ConcentrationOrg {
  nom: string;
  nbMedias: number;
}

export interface Concentration {
  parPersonnes: ConcentrationPersonne[];
  parOrganisations: ConcentrationOrg[];
}
