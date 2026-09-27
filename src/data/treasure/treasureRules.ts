/**
 * Regras que as TABELAS de tesouro não explicitam, mas das quais o sorteio
 * depende (pré-requisitos, restrições de aplicação, exclusões).
 *
 * Nada aqui é inventado: cada regra cita o livro de onde veio, com o trecho
 * literal, conferido em `livros/`. Onde nem a planilha nem os livros dizem o
 * que fazer, o gerador NÃO decide — mostra um aviso "verificar" (ver
 * `UNRESOLVED_GAPS` e os `warning` abaixo).
 */

export interface Citation {
  /** Livro e seção. */
  source: string;
  /** Trecho literal. */
  quote: string;
}

/** Propriedades do item-base que as regras consultam. */
export type ItemPredicate =
  | 'melee'
  | 'firingNotSling'
  | 'ammo'
  | 'cutOrPierce'
  | 'armor'
  | 'heavyArmor'
  | 'shield';

export const PREDICATE_LABELS: Record<ItemPredicate, string> = {
  melee: 'armas corpo a corpo',
  firingNotSling: 'armas de disparo (exceto fundas)',
  ammo: 'munições',
  cutOrPierce: 'armas de corte ou perfuração',
  armor: 'armaduras',
  heavyArmor: 'armaduras pesadas',
  shield: 'escudos',
};

export interface EnhancementRule {
  /**
   * Pré-requisito. `anyOf` lista alternativas (qualquer uma satisfaz).
   * `'*'` = "outra melhoria/encanto qualquer".
   */
  prerequisite?: { anyOf: string[]; citation: Citation };
  /** Só se aplica a itens com esta propriedade. */
  appliesTo?: { predicate: ItemPredicate; citation: Citation };
  /** Não pode coexistir com estas melhorias/encantos. */
  exclusiveWith?: { names: string[]; citation: Citation };
  /** Aviso fixo exibido sempre que esta entrada é sorteada. */
  warning?: string;
}

// ---------------------------------------------------------------------------
// Citações
// ---------------------------------------------------------------------------

const JDA_SUPERIORES = 'Tormenta20 JdA, Cap. 3 — Itens Superiores (p. 164-166)';
const JDA_MAGICOS = 'Tormenta20 JdA, Cap. 8 — Itens Mágicos (p. 335-339)';
const HDA_MELHORIAS = 'Heróis de Arton, Cap. 3 — Novas Melhorias (p. 239-240)';
const HDA_ENCANTOS =
  'Heróis de Arton, Cap. 3 — Novos Itens Mágicos (p. 256-261)';
const JDA_TESOURO = 'Tormenta20 JdA, Cap. 8 — Tabela 8-1 (p. 329)';
const JDA_ATRIBUTOS = 'Tormenta20 JdA, Cap. 1 — Construção de Personagem';

const cite = (source: string, quote: string): Citation => ({ source, quote });

// ---------------------------------------------------------------------------
// Regras gerais
// ---------------------------------------------------------------------------

export const GENERAL_RULES = {
  /** +% acima de 100 (a planilha é omissa; a Tabela 8-1 do JdA define). */
  bonusCap: cite(
    JDA_TESOURO,
    '+% Na rolagem de d% para determinar o tipo de riqueza ou poção, você recebe +20%. Resultados acima de 100% contam como 100%.'
  ),
  /** Cada melhoria só uma vez por item. */
  improvementOncePerItem: cite(
    JDA_SUPERIORES,
    'Cada melhoria só pode ser aplicada uma vez a um mesmo item.'
  ),
  /** "Arma/Item específico" substitui os encantos. */
  specificReplacesEnchantments: cite(
    JDA_MAGICOS,
    'Se rolar “arma específica”, role na Tabela 8-9 (nesse caso, o item perderá quaisquer encantos rolados).'
  ),
  /** Item-base de arma/armadura mágica é sorteado na tabela de equipamento. */
  magicBaseItem: cite(
    JDA_MAGICOS,
    'Para gerar uma arma mágica aleatoriamente, role na Tabela 8-4 para definir o tipo de arma. Então role na tabela a seguir para determinar seus encantos.'
  ),
  /** Ordem dos atributos (poção de Orientação: "1 = Força, 2 = Destreza e assim por diante"). */
  attributeOrder: cite(
    JDA_ATRIBUTOS,
    'Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma.'
  ),
  /** Madeira Tollon só em certos itens (a tabela de material não diz o que fazer). */
  tollon: cite(
    JDA_SUPERIORES,
    'Apenas armas de madeira — arcos, bordões, clavas, lanças, piques e tacapes —, escudos leves e esotéricos podem ser feitos com madeira Tollon.'
  ),
};

export const ATTRIBUTE_ORDER = [
  'Força',
  'Destreza',
  'Constituição',
  'Inteligência',
  'Sabedoria',
  'Carisma',
];

// ---------------------------------------------------------------------------
// Melhorias (itens superiores)
// ---------------------------------------------------------------------------

export const WEAPON_IMPROVEMENT_RULES: Record<string, EnhancementRule> = {
  Atroz: {
    prerequisite: {
      anyOf: ['Cruel'],
      citation: cite(JDA_SUPERIORES, 'Atroz. [...] Pré-requisito: Cruel.'),
    },
  },
  Pungente: {
    prerequisite: {
      anyOf: ['Certeira'],
      citation: cite(
        JDA_SUPERIORES,
        'Pungente. [...] Pré-requisito: Certeira.'
      ),
    },
  },
  Harmonizada: {
    prerequisite: {
      anyOf: ['*'],
      citation: cite(
        JDA_SUPERIORES,
        'Harmonizada (Arma). [...] Pré-requisito: outra melhoria qualquer.'
      ),
    },
  },
  Maciça: {
    exclusiveWith: {
      names: ['Precisa'],
      citation: cite(JDA_SUPERIORES, 'Uma arma não pode ser maciça e precisa.'),
    },
  },
  Precisa: {
    exclusiveWith: {
      names: ['Maciça'],
      citation: cite(JDA_SUPERIORES, 'Uma arma não pode ser precisa e maciça.'),
    },
  },
  'Mira telescópica': {
    appliesTo: {
      predicate: 'firingNotSling',
      citation: cite(
        JDA_SUPERIORES,
        'Esta melhoria só pode ser aplicada em armas de disparo (exceto fundas).'
      ),
    },
  },
  Farpada: {
    appliesTo: {
      predicate: 'cutOrPierce',
      citation: cite(
        HDA_MELHORIAS,
        'Só pode ser aplicada em armas de corte ou perfuração.'
      ),
    },
    prerequisite: {
      anyOf: ['Cruel'],
      citation: cite(HDA_MELHORIAS, 'Farpada. [...] Pré-requisito: cruel.'),
    },
  },
  Guarda: {
    appliesTo: {
      predicate: 'melee',
      citation: cite(
        HDA_MELHORIAS,
        'Só pode ser aplicada em armas corpo a corpo.'
      ),
    },
  },
  Incendiária: {
    appliesTo: {
      predicate: 'ammo',
      citation: cite(
        HDA_MELHORIAS,
        'Esta melhoria só pode ser aplicada em munições.'
      ),
    },
  },
  Pressurizada: {
    warning:
      'Pressurizada (Heróis de Arton p. 240): o texto consultado está incompleto — verifique no livro se há restrição de tipo de arma.',
  },
  Usada: {
    warning:
      'Usada: Heróis de Arton lista "Usado" entre as melhorias para ferramentas e vestuário; a planilha a coloca na tabela de armas — verifique.',
  },
};

export const ARMOR_IMPROVEMENT_RULES: Record<string, EnhancementRule> = {
  'Sob medida': {
    prerequisite: {
      anyOf: ['Ajustada'],
      citation: cite(
        JDA_SUPERIORES,
        'Sob Medida. [...] Pré-requisito: Ajustada.'
      ),
    },
  },
  Delicada: {
    appliesTo: {
      predicate: 'heavyArmor',
      citation: cite(
        JDA_SUPERIORES,
        'Esta melhoria só pode ser aplicada a armaduras pesadas [...]'
      ),
    },
    exclusiveWith: {
      names: ['Reforçada'],
      citation: cite(
        JDA_SUPERIORES,
        'Uma armadura não pode ser delicada e reforçada.'
      ),
    },
  },
  Reforçada: {
    exclusiveWith: {
      names: ['Delicada'],
      citation: cite(
        JDA_SUPERIORES,
        'Um item não pode ser reforçado e delicado.'
      ),
    },
  },
  Selada: {
    appliesTo: {
      predicate: 'heavyArmor',
      citation: cite(
        JDA_SUPERIORES,
        '[...] mas só pode ser aplicado em armaduras pesadas.'
      ),
    },
  },
  Balístico: {
    appliesTo: {
      predicate: 'shield',
      citation: cite(
        HDA_MELHORIAS,
        'Esta melhoria só pode ser aplicada em escudos.'
      ),
    },
    prerequisite: {
      anyOf: ['Reforçada'],
      citation: cite(
        HDA_MELHORIAS,
        'Balístico. [...] Pré-requisito: reforçado.'
      ),
    },
  },
  Deslumbrante: {
    appliesTo: {
      predicate: 'armor',
      citation: cite(
        HDA_MELHORIAS,
        'Só pode ser aplicada em armaduras e vestuários.'
      ),
    },
    prerequisite: {
      anyOf: ['Banhada a ouro', 'Cravejada de gemas'],
      citation: cite(
        HDA_MELHORIAS,
        'Deslumbrante. [...] Pré-requisito: banhado a ouro ou cravejado de gemas.'
      ),
    },
  },
};

export const ESOTERIC_IMPROVEMENT_RULES: Record<string, EnhancementRule> = {
  Potencializador: {
    prerequisite: {
      anyOf: ['Canalizador'],
      citation: cite(
        HDA_MELHORIAS,
        'Potencializador. [...] Pré-requisito: canalizador.'
      ),
    },
  },
};

// ---------------------------------------------------------------------------
// Encantos (itens mágicos)
// ---------------------------------------------------------------------------

export const WEAPON_ENCHANTMENT_RULES: Record<string, EnhancementRule> = {
  Energética: {
    prerequisite: {
      anyOf: ['Formidável'],
      citation: cite(
        JDA_MAGICOS,
        'Energética. [...] Pré-requisito: formidável.'
      ),
    },
  },
  Lancinante: {
    prerequisite: {
      anyOf: ['Dilacerante'],
      citation: cite(
        JDA_MAGICOS,
        'Lancinante. [...] Pré-requisito: dilacerante.'
      ),
    },
  },
  Magnífica: {
    prerequisite: {
      anyOf: ['Formidável'],
      citation: cite(
        JDA_MAGICOS,
        'Magnífica. [...] Pré-requisito: formidável.'
      ),
    },
  },
  Cronal: {
    prerequisite: {
      anyOf: ['Formidável'],
      citation: cite(HDA_ENCANTOS, 'Cronal. [...] Pré-requisito: formidável.'),
    },
  },
  Manáfaga: {
    prerequisite: {
      anyOf: ['Formidável'],
      citation: cite(
        HDA_ENCANTOS,
        'Manáfaga. [...] Pré-requisito: formidável.'
      ),
    },
  },
  Reflexiva: {
    prerequisite: {
      anyOf: ['Cristalina'],
      citation: cite(
        HDA_ENCANTOS,
        'Reflexiva. [...] Pré-requisito: cristalina.'
      ),
    },
  },
  Sepulcral: {
    prerequisite: {
      anyOf: ['Tumular'],
      citation: cite(HDA_ENCANTOS, 'Sepulcral. [...] Pré-requisito: tumular.'),
    },
  },
  Crescente: {
    appliesTo: {
      predicate: 'melee',
      citation: cite(
        HDA_ENCANTOS,
        'Este encanto só pode ser aplicado a armas de combate corpo a corpo.'
      ),
    },
  },
};

export const ARMOR_ENCHANTMENT_RULES: Record<string, EnhancementRule> = {
  Guardião: {
    prerequisite: {
      anyOf: ['Defensor'],
      citation: cite(JDA_MAGICOS, 'Guardião. [...] Pré-requisito: defensor.'),
    },
  },
  Anulador: {
    prerequisite: {
      anyOf: ['Abascanto'],
      citation: cite(HDA_ENCANTOS, 'Anulador. [...] Pré-requisito: abascanto.'),
    },
  },
  Estígio: {
    prerequisite: {
      anyOf: ['Abençoado'],
      citation: cite(HDA_ENCANTOS, 'Estígio. [...] Pré-requisito: abençoado.'),
    },
  },
};

export const ESOTERIC_ENCHANTMENT_RULES: Record<string, EnhancementRule> = {
  Implacável: {
    prerequisite: {
      anyOf: ['*'],
      citation: cite(
        HDA_ENCANTOS,
        'Implacável. [...] Pré-requisito: outro encanto.'
      ),
    },
  },
  Majestoso: {
    prerequisite: {
      anyOf: ['*'],
      citation: cite(
        HDA_ENCANTOS,
        'Majestoso. [...] Pré-requisito: outro encanto.'
      ),
    },
  },
  Pulverizante: {
    prerequisite: {
      anyOf: ['*'],
      citation: cite(
        HDA_ENCANTOS,
        'Pulverizante. [...] Pré-requisito: outro encanto.'
      ),
    },
    exclusiveWith: {
      names: ['Contido'],
      citation: cite(
        HDA_ENCANTOS,
        'Um esotérico pulverizante não pode ser contido.'
      ),
    },
  },
  Contido: {
    exclusiveWith: {
      names: ['Pulverizante'],
      citation: cite(
        HDA_ENCANTOS,
        'Um esotérico pulverizante não pode ser contido.'
      ),
    },
  },
};

// ---------------------------------------------------------------------------
// Lacunas que nem a planilha nem os livros resolvem
// ---------------------------------------------------------------------------

export const UNRESOLVED_GAPS = {
  duplicateEnchantment:
    'Encanto repetido: nem a planilha nem o livro dizem o que fazer quando o mesmo encanto é rolado duas vezes — verifique.',
  missingPrerequisite: (name: string, prereq: string) =>
    `${name} tem pré-requisito (${prereq}), mas a tabela não o marca como "conta como dois" e o item não o possui — a fonte não diz o que fazer; verifique.`,
  inapplicableNoReroll: (name: string, what: string) =>
    `${name} só se aplica a ${what}, mas esta tabela não manda rolar novamente — verifique.`,
  unknownItem: (item: string, name: string, what: string) =>
    `Não foi possível identificar "${item}" no catálogo para conferir se ${name} se aplica (só ${what}) — verifique.`,
  exclusive: (a: string, b: string) =>
    `${a} e ${b} não podem estar no mesmo item — verifique.`,
  tollon: (item: string) =>
    `Madeira Tollon em "${item}": o livro só permite armas de madeira, escudos leves e esotéricos, e a tabela não diz o que fazer — verifique.`,
  noSlotForDouble: (name: string) =>
    `${name} conta como dois, mas só restava espaço para um — rolado novamente (interpretação de "se o item só possuir um, role novamente").`,
  rerollLimit:
    'Não foi possível encontrar um resultado válido após várias rolagens — verifique manualmente.',
};
