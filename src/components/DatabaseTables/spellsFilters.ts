import { Spell, spellsCircles, SpellSchool } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';
import { normalizeSearch } from '../../functions/stringUtils';
import { SPELL_ONTOLOGY_MAP } from './spellOntologyMap';

export interface ExtendedSpell extends Spell {
  spellType: 'arcane' | 'divine';
  supplementId?: SupplementId;
}

export interface MergedSpell extends Spell {
  spellTypes: ('arcane' | 'divine')[];
  supplementId?: SupplementId;
}

export type SpellTraditionFilter = 'all' | 'arcane' | 'divine' | 'universal';

export interface EnrichedSpell extends MergedSpell {
  traditionLabel: 'Arcana' | 'Divina' | 'Universal';
  funcao: string[];
  alvoTipo: string[];
  descritores: string[];
  tiposDano: string[];
  deities: string[];
  resistenciaGroup: string;
  alcanceGroup: string;
  execucaoGroup: string;
  formattedDescription?: string;
}

export interface SpellFilters {
  search: string;
  circles: number[];
  schools: string[];
  executionTimes: string[];
  spellType: SpellTraditionFilter;
  funcoes: string[];
  descritores: string[];
  tiposDano: string[];
  alvoTipos: string[];
  resistencias: string[];
  alcances: string[];
  deities: string[];
}

export const SCHOOL_LABELS: Record<SpellSchool, string> = {
  Abjur: 'Abjuração',
  Adiv: 'Adivinhação',
  Conv: 'Convocação',
  Encan: 'Encantamento',
  Evoc: 'Evocação',
  Ilusão: 'Ilusão',
  Necro: 'Necromancia',
  Trans: 'Transmutação',
};

export const FUNCAO_LABELS: Record<string, string> = {
  dano: 'Dano',
  cura: 'Cura',
  controle: 'Controle',
  suporte: 'Suporte',
  protecao: 'Proteção',
  informacao: 'Informação',
  invocacao: 'Invocação',
  mobilidade: 'Mobilidade',
};

export const ALVO_TIPO_LABELS: Record<string, string> = {
  criatura: 'Criatura',
  area: 'Área',
  objeto: 'Objeto',
  proprio: 'Próprio',
};

export const DESCRITOR_LABELS: Record<string, string> = {
  acido: 'Ácido',
  cura: 'Cura',
  eletricidade: 'Eletricidade',
  essencia: 'Essência',
  fogo: 'Fogo',
  frio: 'Frio',
  luz: 'Luz',
  mental: 'Mental',
  metamorfose: 'Metamorfose',
  sentidos: 'Sentidos',
  trevas: 'Trevas',
  veneno: 'Veneno',
  corte: 'Corte',
  impacto: 'Impacto',
  perfuracao: 'Perfuração',
};

export function getCircleNumber(spellCircle: spellsCircles): number {
  switch (spellCircle) {
    case spellsCircles.c1:
      return 1;
    case spellsCircles.c2:
      return 2;
    case spellsCircles.c3:
      return 3;
    case spellsCircles.c4:
      return 4;
    case spellsCircles.c5:
      return 5;
    default:
      return 1;
  }
}

export function getSpellCircleEnum(circleNumber: number): spellsCircles {
  switch (circleNumber) {
    case 1:
      return spellsCircles.c1;
    case 2:
      return spellsCircles.c2;
    case 3:
      return spellsCircles.c3;
    case 4:
      return spellsCircles.c4;
    case 5:
      return spellsCircles.c5;
    default:
      return spellsCircles.c1;
  }
}

function classifyResistencia(resistencia?: string): string {
  const n = normalizeSearch(resistencia || '');
  if (!n || n === 'nenhuma' || n === '-') return 'Sem resistência';
  if (n.includes('fortitude')) return 'Fortitude';
  if (n.includes('reflexos')) return 'Reflexos';
  if (n.includes('vontade')) return 'Vontade';
  return 'Veja texto';
}

function classifyAlcance(alcance?: string): string {
  const n = normalizeSearch(alcance || '');
  if (n.includes('pessoal')) return 'Pessoal';
  if (n.includes('toque')) return 'Toque';
  if (n.includes('curto')) return 'Curto';
  if (n.includes('medio')) return 'Médio';
  if (n.includes('longo')) return 'Longo';
  if (n.includes('ilimitado')) return 'Ilimitado';
  return 'Outro';
}

function classifyExecucao(execucao?: string): string {
  const n = normalizeSearch(execucao || '');
  if (n.includes('padrao')) return 'Padrão';
  if (n.includes('movimento')) return 'Movimento';
  if (n.includes('completa')) return 'Completa';
  if (n.includes('reacao')) return 'Reação';
  if (n.includes('livre')) return 'Livre';
  return execucao || 'Outra';
}

function inferAlvoTipos(spell: MergedSpell): string[] {
  const out: string[] = [];
  if (spell.area) out.push('area');
  const nAlcance = normalizeSearch(spell.alcance);
  const nAlvo = normalizeSearch(spell.alvo || '');
  if (nAlcance === 'pessoal' || nAlvo === 'voce') out.push('proprio');
  if (nAlvo.includes('objeto') || nAlvo.includes('arma') || nAlvo.includes('item')) {
    out.push('objeto');
  }
  if (
    nAlvo.includes('criatura') ||
    nAlvo.includes('humanoide') ||
    nAlvo.includes('ser') ||
    nAlvo.includes('morto-vivo')
  ) {
    out.push('criatura');
  }
  return out;
}

function inferDeitiesFromEnhancements(spell: MergedSpell): string[] {
  const deities = new Set<string>();
  const text = [
    spell.description,
    ...(spell.aprimoramentos || []).map((a) => a.text),
  ].join(' ');
  const matches = text.matchAll(/Apenas Devotos de ([^):]+)/gi);
  for (const m of matches) {
    m[1]
      .split(/\s+ou\s+|,/i)
      .map((s) => s.trim())
      .filter((s) => s && !normalizeSearch(s).includes('dahllan'))
      .forEach((d) => deities.add(d));
  }
  return Array.from(deities);
}

export function mergeAndEnrichSpells(spells: ExtendedSpell[]): EnrichedSpell[] {
  const spellMap: Record<string, MergedSpell> = {};

  spells.forEach((spell) => {
    const key = `${spell.nome}-${spell.spellCircle}`;
    if (spellMap[key]) {
      if (!spellMap[key].spellTypes.includes(spell.spellType)) {
        spellMap[key].spellTypes.push(spell.spellType);
      }
    } else {
      spellMap[key] = {
        ...spell,
        spellTypes: [spell.spellType],
        supplementId: spell.supplementId,
      };
    }
  });

  return Object.values(spellMap)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map((spell) => {
      const onto = SPELL_ONTOLOGY_MAP[normalizeSearch(spell.nome)];
      const hasBothTypes =
        spell.spellTypes.includes('arcane') &&
        spell.spellTypes.includes('divine');
      const isOntoUniversal = onto?.tradicao?.some(
        (t) => normalizeSearch(t) === 'universal'
      );

      let traditionLabel: 'Arcana' | 'Divina' | 'Universal' = 'Arcana';
      if (hasBothTypes || isOntoUniversal) {
        traditionLabel = 'Universal';
      } else if (spell.spellTypes.includes('divine')) {
        traditionLabel = 'Divina';
      }

      const deitySet = new Set<string>([
        ...(onto?.exclusivaDevocao || []),
        ...(onto?.aprimoramentoExclusivo || []),
        ...inferDeitiesFromEnhancements(spell),
      ]);

      return {
        ...spell,
        traditionLabel,
        funcao: onto?.funcao || [],
        alvoTipo: onto?.alvoTipo || inferAlvoTipos(spell),
        descritores: onto?.descritores || [],
        tiposDano: onto?.tiposDano || [],
        deities: Array.from(deitySet).sort((a, b) =>
          a.localeCompare(b, 'pt-BR')
        ),
        resistenciaGroup: classifyResistencia(spell.resistencia),
        alcanceGroup: classifyAlcance(spell.alcance),
        execucaoGroup: classifyExecucao(spell.execucao),
        formattedDescription: onto?.formattedDescription,
      };
    });
}

export function filterEnrichedSpells(
  spells: EnrichedSpell[],
  filters: SpellFilters
): EnrichedSpell[] {
  const searchTerm = normalizeSearch(filters.search.trim());

  return spells.filter((spell) => {
    if (searchTerm) {
      const haystack = normalizeSearch(
        [
          spell.nome,
          spell.description,
          spell.formattedDescription || '',
          spell.school,
          SCHOOL_LABELS[spell.school] || '',
          spell.traditionLabel,
          ...spell.funcao.map((f) => FUNCAO_LABELS[f] || f),
          ...spell.descritores.map((d) => DESCRITOR_LABELS[d] || d),
          ...spell.tiposDano.map((d) => DESCRITOR_LABELS[d] || d),
          ...spell.deities,
          ...(spell.aprimoramentos || []).map((a) => a.text),
        ].join(' ')
      );
      if (!haystack.includes(searchTerm)) return false;
    }

    if (filters.circles.length > 0) {
      const circleNum = getCircleNumber(spell.spellCircle);
      if (!filters.circles.includes(circleNum)) return false;
    }

    if (filters.schools.length > 0) {
      if (!filters.schools.includes(spell.school)) return false;
    }

    if (filters.executionTimes.length > 0) {
      if (!filters.executionTimes.includes(spell.execucaoGroup)) return false;
    }

    if (filters.spellType !== 'all') {
      if (filters.spellType === 'universal') {
        if (spell.traditionLabel !== 'Universal') return false;
      } else if (!spell.spellTypes.includes(filters.spellType)) {
        return false;
      }
    }

    if (filters.funcoes.length > 0) {
      if (!spell.funcao.some((f) => filters.funcoes.includes(f))) return false;
    }

    if (filters.descritores.length > 0) {
      const allDesc = new Set([...spell.descritores, ...spell.tiposDano]);
      if (!filters.descritores.some((d) => allDesc.has(d))) return false;
    }

    if (filters.tiposDano.length > 0) {
      if (!spell.tiposDano.some((t) => filters.tiposDano.includes(t))) {
        return false;
      }
    }

    if (filters.alvoTipos.length > 0) {
      if (!spell.alvoTipo.some((a) => filters.alvoTipos.includes(a))) {
        return false;
      }
    }

    if (filters.resistencias.length > 0) {
      if (!filters.resistencias.includes(spell.resistenciaGroup)) return false;
    }

    if (filters.alcances.length > 0) {
      if (!filters.alcances.includes(spell.alcanceGroup)) return false;
    }

    if (filters.deities.length > 0) {
      if (!spell.deities.some((d) => filters.deities.includes(d))) return false;
    }

    return true;
  });
}
