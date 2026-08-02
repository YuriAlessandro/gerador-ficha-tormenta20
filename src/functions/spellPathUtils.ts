import { CrossTraditionRules, SpellPath } from '../interfaces/Class';
import { allSpellSchools, Spell } from '../interfaces/Spells';
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from '../data/registry';
import { getRandomItemFromArray, pickFromArray } from './randomUtils';

/**
 * Resolve uma escolha de escolas pendente (`schoolChoice`) sorteando as
 * escolas — usado na geração aleatória, quando não há escolha do jogador.
 * No-op se a classe não tem escolha de escolas ou se `schools` já foi
 * definido (ex.: escolha do jogador no wizard ou valor restaurado de uma
 * ficha salva).
 *
 * IMPORTANTE: muta o spellPath recebido — chame sempre sobre uma cópia,
 * nunca sobre o objeto do registry (classes homebrew são compiladas uma
 * única vez por sessão).
 */
export function resolveSchoolChoice(spellPath: SpellPath): void {
  if (!spellPath.schoolChoice || spellPath.schools) return;
  const pool = spellPath.schoolChoice.available ?? allSpellSchools;
  spellPath.schools = pickFromArray(
    pool,
    Math.min(spellPath.schoolChoice.count, pool.length)
  );
}

/**
 * Teurgista Místico: "até N magias da tradição oposta POR CÍRCULO". O limite
 * (`crossTraditionLimit`) é contado por círculo, não globalmente — um círculo
 * já esgotado para de ofertar magias cross, mas círculos ainda abertos seguem
 * ofertando.
 *
 * Recebe o mapa `círculo -> nomes das magias cross ofertadas` e as magias já
 * conhecidas, e devolve:
 *   removeNames = nomes cross de círculos já no limite (remover do pool)
 *   keepNames   = nomes cross de círculos ainda abertos (marcação/enforcement)
 *
 * Nomes de magia são únicos e cada magia pertence a exatamente um círculo, então
 * os conjuntos por círculo são disjuntos e a contagem por nome é correta.
 */
export function partitionCrossTraditionByCircle(
  crossNamesByCircle: Map<number, Set<string>>,
  knownSpellNames: Iterable<string>,
  crossTraditionLimit: number
): { removeNames: Set<string>; keepNames: Set<string> } {
  const known = new Set(knownSpellNames);
  const removeNames = new Set<string>();
  const keepNames = new Set<string>();
  crossNamesByCircle.forEach((names) => {
    let knownInCircle = 0;
    names.forEach((n) => {
      if (known.has(n)) knownInCircle += 1;
    });
    const target =
      knownInCircle >= crossTraditionLimit ? removeNames : keepNames;
    names.forEach((n) => target.add(n));
  });
  return { removeNames, keepNames };
}

/**
 * Teto de círculo do pool da tradição oposta.
 *
 * `null` = SEM teto (regra ausente) — é o default e preserva o comportamento
 * de quem só usa `includeDivineSchools`/`includeArcaneSchools` sem restrição
 * de círculo (Necromante, Teurgista Místico).
 *
 * Com regra, o teto base é `maxCircle`, elevado pelo MAIOR `maxCircle` entre
 * os poderes que o personagem possui (Linhagem Abençoada: 1º círculo, 3º com
 * Herança Aprimorada, 5º com Herança Superior).
 */
export function resolveCrossTraditionMaxCircle(
  rules: CrossTraditionRules | undefined,
  ownedPowerNames: readonly string[] = []
): number | null {
  if (!rules) return null;
  const owned = new Set(ownedPowerNames);
  return (rules.maxCircleByPower ?? []).reduce(
    (max, entry) =>
      owned.has(entry.powerName) ? Math.max(max, entry.maxCircle) : max,
    rules.maxCircle
  );
}

/**
 * Nomes que só existem na tradição oposta.
 *
 * Necessário porque as duas listas compartilham objetos: só no 1º círculo,
 * Luz, Névoa, Arma Mágica, Compreensão, Aviso, Escuridão, Visão Mística e
 * Resistência a Energia são arcanas E divinas. Contá-las como "magia da
 * tradição oposta" faria uma magia arcana satisfazer a exigência de magia
 * divina da Linhagem Abençoada (e queimar o slot cross do Teurgista).
 */
export function getExclusiveCrossNames(
  crossSpells: readonly Spell[],
  nativeSpells: readonly Spell[]
): Set<string> {
  const nativeNames = new Set(nativeSpells.map((spell) => spell.nome));
  const exclusive = new Set<string>();
  crossSpells.forEach((spell) => {
    if (!nativeNames.has(spell.nome)) exclusive.add(spell.nome);
  });
  return exclusive;
}

/**
 * Só os campos de DADOS do SpellPath que definem o pool. Um `SpellPath`
 * completo é atribuível, e o wizard de criação — que ainda não tem um
 * spellPath com funções — também consegue montar este objeto.
 */
export type SpellPoolConfig = Pick<
  SpellPath,
  | 'spellType'
  | 'schools'
  | 'excludeSchools'
  | 'includeDivineSchools'
  | 'includeArcaneSchools'
  | 'crossTraditionLimit'
  | 'crossTraditionRules'
>;

export interface BuildSpellPoolParams {
  spellPath: SpellPoolConfig;
  /** Círculo máximo já resolvido por nível de classe e divindade. */
  maxCircle: number;
  supplements: SupplementId[];
  /** Poderes que o personagem possui — destravam círculos da tradição oposta. */
  ownedPowerNames?: readonly string[];
  /**
   * 'offerAll' (wizards): oferta todas as magias cross e deixa a UI aplicar o
   * limite. 'sampleOnePerCircle' (geração aleatória com `crossTraditionLimit`):
   * sorteia uma magia cross por círculo, que é como o sorteio automático
   * respeita o limite do Teurgista Místico.
   */
  crossTraditionMode?: 'offerAll' | 'sampleOnePerCircle';
}

export interface SpellPool {
  /** Pool completo, deduplicado por nome. Não remove magias já conhecidas. */
  spells: Spell[];
  /** Nomes exclusivos da tradição oposta presentes no pool. */
  crossNames: Set<string>;
  /** Os mesmos nomes agrupados por círculo (limite do Teurgista é por círculo). */
  crossNamesByCircle: Map<number, Set<string>>;
}

function getNativeSpellsOfCircle(
  spellType: SpellPath['spellType'],
  circle: number,
  supplements: SupplementId[]
): Spell[] {
  const byCircle = dataRegistry.getSpellsByCircleAndSupplements(
    circle,
    supplements
  );
  const arcane = Object.values(byCircle.arcane).flat();
  const divine = Object.values(byCircle.divine).flat();
  if (spellType === 'Arcane') return arcane;
  if (spellType === 'Divine') return divine;
  return [...arcane, ...divine];
}

/**
 * Monta o pool de magias disponíveis para um `SpellPath` até um círculo.
 *
 * Implementação ÚNICA: antes existiam três (geração aleatória, wizard de
 * criação e wizard de evolução) e elas divergiam — a da geração aleatória
 * tratava `spellType: 'Both'` como divina e, quando havia `schools`,
 * reconstruía a lista em vez de filtrá-la, descartando a tradição nativa e as
 * magias cross.
 */
export function buildSpellPool({
  spellPath,
  maxCircle,
  supplements,
  ownedPowerNames = [],
  crossTraditionMode = 'offerAll',
}: BuildSpellPoolParams): SpellPool {
  const {
    spellType,
    schools,
    excludeSchools,
    includeDivineSchools,
    includeArcaneSchools,
    crossTraditionRules,
  } = spellPath;

  const crossSchools =
    spellType === 'Arcane' ? includeDivineSchools : includeArcaneSchools;
  const crossCap = resolveCrossTraditionMaxCircle(
    crossTraditionRules,
    ownedPowerNames
  );
  const crossMaxCircle =
    crossCap === null ? maxCircle : Math.min(maxCircle, crossCap);

  const nativeSpells: Spell[] = [];
  for (let circle = 1; circle <= maxCircle; circle += 1) {
    nativeSpells.push(
      ...getNativeSpellsOfCircle(spellType, circle, supplements)
    );
  }

  const crossSpells: Spell[] = [];
  const crossNamesByCircle = new Map<number, Set<string>>();
  if (crossSchools && crossSchools.length > 0 && spellType !== 'Both') {
    for (let circle = 1; circle <= crossMaxCircle; circle += 1) {
      const oppositeType = spellType === 'Arcane' ? 'Divine' : 'Arcane';
      const circleSpells = getNativeSpellsOfCircle(
        oppositeType,
        circle,
        supplements
      ).filter((spell) => crossSchools.includes(spell.school));
      const offered =
        crossTraditionMode === 'sampleOnePerCircle' && circleSpells.length > 0
          ? [getRandomItemFromArray(circleSpells)]
          : circleSpells;
      crossSpells.push(...offered);
      crossNamesByCircle.set(
        circle,
        getExclusiveCrossNames(offered, nativeSpells)
      );
    }
  }

  let spells = [...nativeSpells, ...crossSpells];

  // `schools` é FILTRO, não substituição — vale para a tradição nativa e para
  // a cross.
  if (schools && schools.length > 0) {
    spells = spells.filter((spell) => schools.includes(spell.school));
  }
  if (excludeSchools && excludeSchools.length > 0) {
    spells = spells.filter((spell) => !excludeSchools.includes(spell.school));
  }

  // Dedup por nome mantendo a primeira ocorrência: a tradição nativa vem
  // primeiro, então magias que existem nas duas listas ficam como nativas.
  const seen = new Set<string>();
  spells = spells.filter((spell) => {
    if (seen.has(spell.nome)) return false;
    seen.add(spell.nome);
    return true;
  });

  // Nomes cross que sobreviveram aos filtros de escola.
  const survived = new Set(spells.map((spell) => spell.nome));
  const crossNames = new Set<string>();
  crossNamesByCircle.forEach((names, circle) => {
    const kept = new Set<string>();
    names.forEach((name) => {
      if (survived.has(name)) {
        kept.add(name);
        crossNames.add(name);
      }
    });
    crossNamesByCircle.set(circle, kept);
  });

  return { spells, crossNames, crossNamesByCircle };
}

/**
 * Sorteia `qty` magias garantindo pelo menos `minCross` da tradição oposta.
 *
 * Linhagem Abençoada: "você aprende uma magia divina de 1º círculo" — sem
 * isso, o sorteio automático podia devolver 4 magias arcanas. Degrada quando
 * o pool cross é menor que o mínimo (suplemento desativado, por exemplo).
 */
export function pickWithMinimumCrossTradition(
  pool: readonly Spell[],
  crossNames: ReadonlySet<string>,
  qty: number,
  minCross: number
): Spell[] {
  if (minCross <= 0 || qty <= 0) return pickFromArray([...pool], qty);

  const crossPool = pool.filter((spell) => crossNames.has(spell.nome));
  const nativePool = pool.filter((spell) => !crossNames.has(spell.nome));

  const crossQty = Math.min(minCross, qty, crossPool.length);
  const picked = pickFromArray(crossPool, crossQty);
  const pickedNames = new Set(picked.map((spell) => spell.nome));

  const remaining = [
    ...nativePool,
    ...crossPool.filter((spell) => !pickedNames.has(spell.nome)),
  ];
  return [...picked, ...pickFromArray(remaining, qty - picked.length)];
}
