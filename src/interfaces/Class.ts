export interface BasicExpertise {
  type: string;
  list: string[];
}

export interface RemainingExpertise {
  qtd: number;
  list: string[];
}

export interface ClassHability {
  name: string;
  text: string;
  effect: string | null;
  nivel: number;
}

export interface ClassDescription {
  name: string;
  pv: number;
  addpv: number;
  pm: number;
  addpm: number;
  periciasbasicas: BasicExpertise[];
  periciasrestantes: RemainingExpertise;
  proeficiencias: string[];
  habilities: ClassHability[];
  magics: string[];
  probDevoto: number;
  qtdPoderesConcedidos?: string;
}
