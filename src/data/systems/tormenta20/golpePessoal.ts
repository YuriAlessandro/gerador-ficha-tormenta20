export interface GolpePessoalEffect {
  name: string;
  cost: number; // Pode ser negativo para limitações
  description: string;
  category: 'offensive' | 'utility' | 'drawback';
  canRepeat?: boolean;
  maxRepeats?: number;
  requiresChoice?: 'spell' | 'element' | 'damageType';
  variableCost?: boolean; // Para efeitos como CONJURADOR
}

export interface GolpePessoalBuild {
  weapon: string;
  effects: Array<{
    effectName: string;
    repeats: number;
    choices?: string[];
  }>;
  totalCost: number;
  description: string;
}

export interface GolpePessoalEffectInstance {
  effect: GolpePessoalEffect;
  count: number;
  choices?: string[];
}

export const GOLPE_PESSOAL_EFFECTS: Record<string, GolpePessoalEffect> = {
  AMPLO: {
    name: 'Amplo',
    cost: 3,
    description:
      'Seu ataque atinge todas as criaturas em alcance curto (incluindo aliados, mas não você mesmo). Faça um único teste de ataque e compare com a Defesa de cada criatura.',
    category: 'utility',
  },
  ATORDOANTE: {
    name: 'Atordoante',
    cost: 2,
    description:
      'Uma criatura que sofra dano de ataque fica atordoada por uma rodada (apenas uma vez por cena; Fortitude CD For anula).',
    category: 'offensive',
  },
  BRUTAL: {
    name: 'Brutal',
    cost: 1,
    description: 'Fornece um dado extra de dano do mesmo tipo.',
    category: 'offensive',
  },
  CONJURADOR: {
    name: 'Conjurador',
    cost: 1, // Base cost, actual cost is spell cost + 1
    description:
      'Escolha uma magia de 1º ou 2º círculos que tenha como alvo uma criatura ou que afete uma área. Se acertar seu golpe, você lança a magia como uma ação livre, tendo como alvo a criatura atingida pelo ataque (atributo-chave e um mental a sua escolha). Considere que a mão da arma está livre para lançar esta magia.',
    category: 'utility',
    requiresChoice: 'spell',
    variableCost: true,
  },
  DESTRUIDOR: {
    name: 'Destruidor',
    cost: 3,
    description: 'Aumenta o multiplicador de crítico em +1.',
    category: 'offensive',
  },
  DISTANTE: {
    name: 'Distante',
    cost: 1,
    description:
      'Aumenta o alcance em um passo (de corpo a corpo para curto, médio e longo). Outras características não mudam (um ataque corpo a corpo com alcance curto continua usando Luta e somando sua Força ao dano).',
    category: 'utility',
  },
  ELEMENTAL: {
    name: 'Elemental',
    cost: 2,
    description:
      'Causa +2d6 pontos de dano de ácido, eletricidade, fogo ou frio. Você pode escolher esse efeito mais vezes para aumentar o dano em +2d6 (do mesmo tipo ou de outro), por +2 PM a cada vez.',
    category: 'offensive',
    canRepeat: true,
    requiresChoice: 'element',
  },
  IMPLACAVEL: {
    name: 'Implacável',
    cost: 1,
    description:
      'Empurra o alvo 1,5m para cada 10 pontos de dano causado (arredondado para baixo). Por exemplo, 3m para 22 pontos de dano.',
    category: 'utility',
  },
  LETAL: {
    name: 'Letal',
    cost: 3,
    description:
      'Aumenta a margem de ameaça em +2. Você pode escolher esse efeito três vezes para aumentar a margem de ameaça em +3.',
    category: 'offensive',
    canRepeat: true,
    maxRepeats: 3,
  },
  PENETRANTE: {
    name: 'Penetrante',
    cost: 1,
    description: 'Ignora 10 pontos de RD.',
    category: 'offensive',
  },
  PRECISO: {
    name: 'Preciso',
    cost: 1,
    description:
      'Quando faz o teste de ataque, você rola dois dados e usa o melhor resultado.',
    category: 'utility',
  },
  QUALQUER_ARMA: {
    name: 'Qualquer Arma',
    cost: 1,
    description: 'Você pode usar seu Golpe Pessoal com qualquer tipo de arma.',
    category: 'utility',
  },
  RICOCHETEANTE: {
    name: 'Ricocheteante',
    cost: 1,
    description:
      'A arma volta para você após o ataque. Só pode ser usado com armas de arremesso.',
    category: 'utility',
  },
  TELEGUIO: {
    name: 'Teleguio',
    cost: 1,
    description: 'Ignora penalidades por camuflagem ou cobertura leves.',
    category: 'utility',
  },
  // Limitações (custos negativos)
  LENTO: {
    name: 'Lento',
    cost: -1,
    description: 'Seu ataque exige uma ação completa para ser usado.',
    category: 'drawback',
  },
  PERTO_DA_MORTE: {
    name: 'Perto da Morte',
    cost: -2,
    description:
      'O ataque só pode ser usado se você estiver com um quarto de seus PV ou menos.',
    category: 'drawback',
  },
  SACRIFICIO: {
    name: 'Sacrifício',
    cost: -2,
    description:
      'Sempre que usar seu Golpe Pessoal, você perde 1d10 pontos de vida.',
    category: 'drawback',
  },
};

export const ELEMENTAL_DAMAGE_TYPES = [
  'ácido',
  'eletricidade',
  'fogo',
  'frio',
] as const;

export const BASIC_SPELLS_1ST_2ND_CIRCLE = [
  // 1º Círculo
  'Alarme',
  'Arma Mágica',
  'Compreensão',
  'Curar Ferimentos',
  'Detectar Magia',
  'Disco Flutuante',
  'Escudo',
  'Identificação',
  'Imagem Ilusória',
  'Mísseis Mágicos',
  'Primeiros Socorros',
  'Proteção',
  'Queda Suave',
  'Raio de Luz',
  'Recuo Acelerado',
  'Santuário',
  'Sono',
  'Suporte',
  'Toque Chocante',
  'Zumbido',
  // 2º Círculo
  'Agilidade do Gato',
  'Arma Espiritual',
  'Armadura Arcana',
  'Aura Mágica',
  'Força do Touro',
  'Ignorar Ferimentos',
  'Imagem Maior',
  'Invisibilidade',
  'Levitação',
  'Localizar',
  'Lufada de Vento',
  'Moldar Metal',
  'Passos Longos',
  'Resistência a Energia',
  'Restauração Menor',
  'Silêncio',
  'Sugestão',
  'Velocidade',
  'Web',
] as const;

export type ElementalDamageType = (typeof ELEMENTAL_DAMAGE_TYPES)[number];
export type SpellChoice = (typeof BASIC_SPELLS_1ST_2ND_CIRCLE)[number];
