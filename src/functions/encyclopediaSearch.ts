/**
 * Busca unificada da Enciclopédia de Tanah-Toh.
 *
 * Constrói um índice plano de TODO o conteúdo da enciclopédia (raças, classes,
 * habilidades e poderes de classe, origens, divindades, poderes gerais e
 * magias) e pontua cada item contra a consulta do usuário.
 *
 * Priorização (do mais para o menos relevante):
 *  1. Título idêntico à busca
 *  2. Título começando com a busca
 *  3. Título contendo a busca
 *  4. Todos os termos presentes no título
 *  5. Busca/termos presentes na descrição
 *
 * O objetivo é funcionar como o "Google das regras" de Tormenta 20: o usuário
 * lembra parte do nome (ou só do efeito) e a busca encontra, sem precisar saber
 * a qual classe/tipo o item pertence.
 */
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';
import { GeneralPowerType } from '../interfaces/Poderes';
import { normalizeSearch } from './stringUtils';

export type EncyclopediaCategory =
  | 'race'
  | 'class'
  | 'origin'
  | 'deity'
  | 'power'
  | 'spell';

/** Rota da aba da enciclopédia que renderiza o item. */
export type EncyclopediaRoute =
  | 'raças'
  | 'classes'
  | 'origens'
  | 'divindades'
  | 'poderes'
  | 'magias';

export interface EncyclopediaEntry {
  /** Chave única (usada para deduplicar e como key de lista). */
  id: string;
  category: EncyclopediaCategory;
  /** Rótulo curto da categoria para exibição (chip). */
  categoryLabel: string;
  /** Nome principal do item. */
  title: string;
  /** Contexto (ex.: "Poder de Guerreiro", "Magia Arcana · 3º Círculo"). */
  subtitle?: string;
  /** Texto de efeito/descrição (pode ser vazio para itens sem descrição). */
  description: string;
  /** Aba de destino. */
  route: EncyclopediaRoute;
  /**
   * Valor passado no parâmetro `:selected*` da rota. As tabelas existentes
   * filtram/abrem o item a partir desse valor (geralmente o nome da entidade
   * navegável "pai" — classe, raça, divindade — ou o próprio nome do
   * poder/magia para Poderes/Magias).
   */
  param: string;
  /** Título normalizado (cache para pontuação). */
  nTitle: string;
  /** Descrição normalizada (cache para pontuação). */
  nDescription: string;
}

/** Conjunto padrão de suplementos — espelha o default das tabelas. */
export const DEFAULT_ENCYCLOPEDIA_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const POWER_TYPE_LABEL: Record<GeneralPowerType, string> = {
  [GeneralPowerType.COMBATE]: 'Combate',
  [GeneralPowerType.DESTINO]: 'Destino',
  [GeneralPowerType.MAGIA]: 'Magia',
  [GeneralPowerType.CONCEDIDOS]: 'Concedido',
  [GeneralPowerType.TORMENTA]: 'Tormenta',
  [GeneralPowerType.RACA]: 'Racial',
};

function makeEntry(
  raw: Omit<EncyclopediaEntry, 'nTitle' | 'nDescription'>
): EncyclopediaEntry {
  return {
    ...raw,
    nTitle: normalizeSearch(raw.title),
    nDescription: normalizeSearch(raw.description),
  };
}

/**
 * Monta o índice completo da enciclopédia para os suplementos ativos.
 * Resultado deve ser memoizado pelo chamador (custa um pouco; só muda quando
 * os suplementos mudam).
 */
export function buildEncyclopediaIndex(
  supplementIds: SupplementId[] = DEFAULT_ENCYCLOPEDIA_SUPPLEMENTS
): EncyclopediaEntry[] {
  const byId = new Map<string, EncyclopediaEntry>();

  const add = (entry: EncyclopediaEntry) => {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  };

  // --- Raças -------------------------------------------------------------
  const races = dataRegistry.getRacesWithSupplementInfo(supplementIds);
  races.forEach((race) => {
    add(
      makeEntry({
        id: `race:${race.name}`,
        category: 'race',
        categoryLabel: 'Raça',
        title: race.name,
        subtitle: race.supplementName,
        description: '',
        route: 'raças',
        param: race.name,
      })
    );

    const collectAbilities = (
      abilities: { name: string; description: string }[],
      context: string
    ) => {
      abilities.forEach((ability) => {
        add(
          makeEntry({
            id: `race-ability:${race.name}:${ability.name}`,
            category: 'race',
            categoryLabel: 'Habilidade de raça',
            title: ability.name,
            subtitle: `${context} — ${race.name}`,
            description: ability.description || '',
            route: 'raças',
            param: race.name,
          })
        );
      });
    };

    collectAbilities(race.abilities || [], 'Habilidade racial');
    if (race.heritages) {
      Object.values(race.heritages).forEach((heritage) => {
        collectAbilities(heritage.abilities || [], `Herança ${heritage.name}`);
      });
    }
  });

  // --- Classes (incluindo habilidades e poderes de classe) ---------------
  const classes = dataRegistry.getClassesWithSupplementInfo(supplementIds);
  classes.forEach((classe) => {
    const classLabel = classe.subname
      ? `${classe.name} (${classe.subname})`
      : classe.name;

    add(
      makeEntry({
        id: `class:${classLabel}`,
        category: 'class',
        categoryLabel: 'Classe',
        title: classLabel,
        subtitle: classe.isVariant
          ? `Variante de ${classe.baseClassName}`
          : classe.supplementName,
        description: '',
        route: 'classes',
        param: classe.name,
      })
    );

    (classe.abilities || []).forEach((ability) => {
      add(
        makeEntry({
          id: `class-ability:${classLabel}:${ability.name}`,
          category: 'class',
          categoryLabel: 'Habilidade de classe',
          title: ability.name,
          subtitle: `Habilidade de ${classLabel}${
            ability.nivel ? ` · Nível ${ability.nivel}` : ''
          }`,
          description: ability.text || '',
          route: 'classes',
          param: classe.name,
        })
      );
    });

    (classe.powers || []).forEach((power) => {
      add(
        makeEntry({
          id: `class-power:${classLabel}:${power.name}`,
          category: 'class',
          categoryLabel: 'Poder de classe',
          title: power.name,
          subtitle: `Poder de ${classLabel}`,
          description: power.dynamicText || power.text || '',
          route: 'classes',
          param: classe.name,
        })
      );
    });
  });

  // --- Origens -----------------------------------------------------------
  const origins = dataRegistry.getOriginsBySupplements(supplementIds);
  origins.forEach((origin) => {
    add(
      makeEntry({
        id: `origin:${origin.name}`,
        category: 'origin',
        categoryLabel: 'Origem',
        title: origin.name,
        subtitle: origin.supplementName || undefined,
        description: '',
        route: 'origens',
        param: origin.name,
      })
    );

    (origin.poderes || []).forEach((power) => {
      add(
        makeEntry({
          id: `origin-power:${origin.name}:${power.name}`,
          category: 'origin',
          categoryLabel: 'Poder de origem',
          title: power.name,
          subtitle: `Poder de origem — ${origin.name}`,
          description: power.description || '',
          route: 'origens',
          param: origin.name,
        })
      );
    });
  });

  // --- Divindades --------------------------------------------------------
  const deities = dataRegistry.getDeitiesWithSupplementPowers(supplementIds);
  deities.forEach((deity) => {
    add(
      makeEntry({
        id: `deity:${deity.name}`,
        category: 'deity',
        categoryLabel: 'Divindade',
        title: deity.name,
        description: '',
        route: 'divindades',
        param: deity.name,
      })
    );

    (deity.poderes || []).forEach((power) => {
      add(
        makeEntry({
          id: `deity-power:${deity.name}:${power.name}`,
          category: 'deity',
          categoryLabel: 'Poder concedido',
          title: power.name,
          subtitle: `Poder concedido — ${deity.name}`,
          description: power.description || '',
          route: 'divindades',
          param: deity.name,
        })
      );
    });
  });

  // --- Poderes gerais ----------------------------------------------------
  const powers = dataRegistry.getPowersWithSupplementInfo(supplementIds);
  (Object.keys(powers) as GeneralPowerType[]).forEach((type) => {
    powers[type].forEach((power) => {
      add(
        makeEntry({
          id: `power:${type}:${power.name}`,
          category: 'power',
          categoryLabel: 'Poder geral',
          title: power.name,
          subtitle: `Poder geral · ${POWER_TYPE_LABEL[type]}`,
          description: power.description || '',
          route: 'poderes',
          param: power.name,
        })
      );
    });
  });

  // --- Magias ------------------------------------------------------------
  for (let circle = 1; circle <= 5; circle += 1) {
    const { arcane, divine } = dataRegistry.getSpellsByCircleAndSupplements(
      circle,
      supplementIds
    );

    const collectSpells = (
      schools: Record<string, { nome: string; description: string }[]>,
      kind: string
    ) => {
      Object.values(schools).forEach((spellsOfSchool) => {
        spellsOfSchool.forEach((spell) => {
          add(
            makeEntry({
              id: `spell:${spell.nome}`,
              category: 'spell',
              categoryLabel: 'Magia',
              title: spell.nome,
              subtitle: `Magia ${kind} · ${circle}º Círculo`,
              description: spell.description || '',
              route: 'magias',
              param: spell.nome,
            })
          );
        });
      });
    };

    collectSpells(arcane, 'Arcana');
    collectSpells(divine, 'Divina');
  }

  return Array.from(byId.values());
}

function scoreEntry(
  entry: EncyclopediaEntry,
  query: string,
  tokens: string[]
): number {
  const { nTitle, nDescription } = entry;
  let score = 0;

  // Pontuação por título (mais importante).
  if (nTitle === query) {
    score += 1000;
  } else if (nTitle.startsWith(query)) {
    score += 600;
  } else if (nTitle.includes(query)) {
    score += 350;
  }

  const titleTokenHits = tokens.filter((t) => nTitle.includes(t)).length;
  if (tokens.length > 0 && titleTokenHits === tokens.length) {
    score += 120;
  }
  score += titleTokenHits * 25;

  // Pontuação por descrição (ajuda, mas pesa menos).
  if (query.length > 0 && nDescription.includes(query)) {
    score += 70;
  }
  const descTokenHits = tokens.filter((t) => nDescription.includes(t)).length;
  score += descTokenHits * 8;

  // Relevância mínima: ou a busca inteira aparece em algum lugar, ou todos os
  // termos aparecem (somando título + descrição). Caso contrário, descarta.
  const fullAnywhere = nTitle.includes(query) || nDescription.includes(query);
  const everyTokenSomewhere =
    tokens.length > 0 &&
    tokens.every((t) => nTitle.includes(t) || nDescription.includes(t));
  if (!fullAnywhere && !everyTokenSomewhere) return 0;

  // Itens "principais" (entidade navegável, sem subtítulo de sub-item) ganham
  // um leve empurrão sobre sub-itens de mesmo nome.
  if (entry.id.indexOf('-') === -1 || !entry.subtitle) {
    score += 5;
  }

  return score;
}

export interface EncyclopediaSearchResult {
  entry: EncyclopediaEntry;
  score: number;
}

/**
 * Pesquisa o índice e retorna os melhores resultados ordenados por relevância.
 */
export function searchEncyclopedia(
  index: EncyclopediaEntry[],
  rawQuery: string,
  limit = 40
): EncyclopediaSearchResult[] {
  const query = normalizeSearch(rawQuery).trim();
  if (query.length < 2) return [];

  const tokens = query.split(/\s+/).filter(Boolean);

  const scored: EncyclopediaSearchResult[] = [];
  index.forEach((entry) => {
    const score = scoreEntry(entry, query, tokens);
    if (score > 0) scored.push({ entry, score });
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Empate: título mais curto costuma ser o match mais "limpo".
    if (a.entry.title.length !== b.entry.title.length) {
      return a.entry.title.length - b.entry.title.length;
    }
    return a.entry.title.localeCompare(b.entry.title, 'pt-BR');
  });

  return scored.slice(0, limit);
}
