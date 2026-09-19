import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import { formatRequirement } from '../../../functions/requirementText';

/** Tom da moldura/destaque de um item (mapeado para cores do tema na UI). */
export type ItemAccent =
  | 'arcane'
  | 'divine'
  | 'arcaneDivine'
  | 'power'
  | 'feature'
  | 'entity'
  | 'missing';

/** Ordem em que os tons aparecem na legenda. */
export const ACCENT_ORDER: ItemAccent[] = [
  'arcane',
  'divine',
  'arcaneDivine',
  'power',
  'feature',
  'entity',
  'missing',
];

const ACCENT_LABELS: Record<ItemAccent, string> = {
  arcane: 'Magia arcana',
  divine: 'Magia divina',
  arcaneDivine: 'Magia arcana e divina',
  power: 'Poder geral',
  feature: 'Habilidade ou poder de classe, raça, origem ou divindade',
  entity: 'Classe, raça, origem ou divindade',
  missing: 'Não encontrado na enciclopédia',
};

export const accentLabel = (accent: ItemAccent): string =>
  ACCENT_LABELS[accent];

/** Estatística de mesa, exibida com ícone (como no Baralho de Magias). */
export type ItemStatKind =
  | 'execution'
  | 'range'
  | 'duration'
  | 'target'
  | 'area'
  | 'resistance'
  | 'requirement';

export interface ItemStat {
  kind: ItemStatKind;
  value: string;
}

export interface ItemAprimoramento {
  /** "+2 PM" ou "Truque". */
  cost: string;
  text: string;
}

export interface ItemPresentation {
  title: string;
  /** Linha de contexto: "Evoc · Arcana", "Poder de Arcanista"… */
  subtitle?: string;
  /** Resumo de uma linha do card fechado no modo lista. */
  summary?: string;
  stats: ItemStat[];
  /** Texto de regra. */
  description: string;
  aprimoramentos: ItemAprimoramento[];
  /** Círculo da magia, para o selo da carta. */
  circle?: number;
  /** Rótulos em chip ao lado do título no modo lista. */
  chips: string[];
  accent: ItemAccent;
}

const spellAccent = (types: string[]): ItemAccent => {
  if (types.includes('Arcana') && types.includes('Divina')) {
    return 'arcaneDivine';
  }
  return types.includes('Arcana') ? 'arcane' : 'divine';
};

/** Como exibir um item resolvido — fonte única para lista e cartas. */
export function presentItem(item: ResolvedItem): ItemPresentation {
  switch (item.kind) {
    case 'spell': {
      const { spell } = item;
      const stats: ItemStat[] = [
        { kind: 'execution' as const, value: spell.execucao },
        { kind: 'range' as const, value: spell.alcance },
        { kind: 'duration' as const, value: spell.duracao },
        { kind: 'target' as const, value: spell.alvo ?? '' },
        { kind: 'area' as const, value: spell.area ?? '' },
        { kind: 'resistance' as const, value: spell.resistencia ?? '' },
      ].filter((stat) => Boolean(stat.value));
      return {
        title: spell.nome,
        subtitle: `${spell.school} · ${spell.spellTypes.join('/')}`,
        summary: `${spell.school} · ${spell.execucao} · ${spell.alcance}`,
        stats,
        description: spell.description,
        aprimoramentos: (spell.aprimoramentos ?? []).map((apr) => ({
          cost: apr.trick ? 'Truque' : `+${apr.addPm} PM`,
          text: apr.text,
        })),
        circle: spell.circle,
        chips: spell.spellTypes,
        accent: spellAccent(spell.spellTypes),
      };
    }
    case 'power': {
      const groups = item.power.requirements.filter((g) => g.length > 0);
      const requirement = groups
        .map((group) => group.map((req) => formatRequirement(req)).join(', '))
        .join(' ou ');
      return {
        title: item.power.name,
        subtitle: item.entry.subtitle,
        summary: item.entry.subtitle,
        stats: requirement ? [{ kind: 'requirement', value: requirement }] : [],
        description: item.power.description,
        aprimoramentos: [],
        chips: [],
        accent: 'power',
      };
    }
    case 'missing':
      return {
        title: item.name,
        subtitle: 'Não encontrado',
        stats: [],
        description: `${item.name} não existe mais na enciclopédia.`,
        aprimoramentos: [],
        chips: [],
        accent: 'missing',
      };
    default:
      return {
        title: item.entry.title,
        subtitle: item.entry.subtitle ?? item.entry.categoryLabel,
        summary: item.entry.subtitle,
        stats: [],
        description: item.entry.description,
        aprimoramentos: [],
        chips: [item.entry.categoryLabel],
        accent: item.kind === 'summary' ? 'entity' : 'feature',
      };
  }
}
