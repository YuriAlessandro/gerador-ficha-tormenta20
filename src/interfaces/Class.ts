export interface BasicExpertise {
  type: string;
  list: any[];
}

export interface RemainingExpertise {
  qtd: number;
  list: any[];
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
  magics: any[];
  probDevoto: number;
  qtdPoderesConcedidos?: string;
}
