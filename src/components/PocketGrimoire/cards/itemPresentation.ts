import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import { formatRequirement } from '../../../functions/requirementText';

/** Tom da borda/destaque de um item (mapeado para cores do tema na UI). */
export type ItemAccent =
  | 'arcane'
  | 'divine'
  | 'power'
  | 'feature'
  | 'entity'
  | 'missing';

export interface ItemPresentation {
  title: string;
  /** Linha de contexto: "Evoc · Arcana", "Poder de Arcanista"… */
  subtitle?: string;
  /** Resumo de uma linha do card fechado no modo lista. */
  summary?: string;
  /** Estatísticas de mesa da magia: "Padrão · Médio · Instantânea". */
  metaLine?: string;
  /** Texto de regra (as cartas mostram só o começo). */
  description: string;
  /** Rodapé curto: "+3 aprimoramentos", "Req.: Magias". */
  footer?: string;
  /** Círculo da magia, para a bolinha no canto da carta. */
  circle?: number;
  /** Rótulos em chip ao lado do título (tipos da magia, categoria). */
  chips: string[];
  accent: ItemAccent;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/** Como exibir um item resolvido — fonte única para lista e cartas. */
export function presentItem(item: ResolvedItem): ItemPresentation {
  switch (item.kind) {
    case 'spell': {
      const { spell } = item;
      const aprimoramentos = spell.aprimoramentos?.length ?? 0;
      return {
        title: spell.nome,
        subtitle: `${spell.school} · ${spell.spellTypes.join('/')}`,
        summary: `${spell.school} · ${spell.execucao} · ${spell.alcance}`,
        metaLine: [spell.execucao, spell.alcance, spell.duracao]
          .filter(Boolean)
          .join(' · '),
        description: spell.description,
        footer:
          aprimoramentos > 0
            ? `+${plural(aprimoramentos, 'aprimoramento', 'aprimoramentos')}`
            : undefined,
        circle: spell.circle,
        chips: spell.spellTypes,
        accent: spell.spellTypes.includes('Arcana') ? 'arcane' : 'divine',
      };
    }
    case 'power': {
      const groups = item.power.requirements.filter((g) => g.length > 0);
      const firstGroup = groups[0]
        ?.map((req) => formatRequirement(req))
        .join(', ');
      return {
        title: item.power.name,
        subtitle: item.entry.subtitle,
        summary: item.entry.subtitle,
        description: item.power.description,
        footer: firstGroup
          ? `Req.: ${firstGroup}${groups.length > 1 ? ' (ou…)' : ''}`
          : undefined,
        chips: [],
        accent: 'power',
      };
    }
    case 'missing':
      return {
        title: item.name,
        subtitle: 'Não encontrado',
        description: `${item.name} não existe mais na enciclopédia.`,
        chips: [],
        accent: 'missing',
      };
    default:
      return {
        title: item.entry.title,
        subtitle: item.entry.subtitle ?? item.entry.categoryLabel,
        summary: item.entry.subtitle,
        description: item.entry.description,
        footer: item.entry.categoryLabel,
        chips: [item.entry.categoryLabel],
        accent: item.kind === 'summary' ? 'entity' : 'feature',
      };
  }
}
