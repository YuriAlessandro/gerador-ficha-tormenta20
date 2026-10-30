import _ from 'lodash';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  allDivindadeNames,
  DivindadeNames,
  FaithProbability,
} from '../interfaces/Divindade';
import { GeneralPower, GeneralPowerType } from '../interfaces/Poderes';
import Skill from '../interfaces/Skills';

// ---------------------------------------------------------------------------
// Portão de aleatoriedade (Builds v2, bloco 1B)
//
// Todo sorteio do motor de ficha passa pelos helpers deste arquivo. Fora do
// modo estrito eles sorteiam como sempre (mesma quantidade de chamadas a
// `Math.random`). Dentro de `runWithoutRandomness` nenhum deles chama
// `Math.random`: o sorteio vira uma lacuna registrada e o helper devolve um
// valor provisório determinístico — a primeira opção, dado no mínimo, float 0,
// ordem original. Quem roda o modo estrito decide o que fazer com as lacunas;
// o valor provisório só existe para o motor seguir montando a ficha.
// ---------------------------------------------------------------------------

/** Que tipo de sorteio virou lacuna. */
export type RandomGapKind = 'choice' | 'roll' | 'chance' | 'order';

export interface RandomGap {
  /** O que estava sendo sorteado (rótulo do ponto de sorteio). */
  label: string;
  kind: RandomGapKind;
  /** Nomes das opções que existiam. */
  options?: string[];
  /** Valor provisório usado no lugar do sorteio. */
  picked?: string[];
  /** Quantos itens seriam sorteados, ou quantos dados rolados. */
  count?: number;
}

/** Rótulo de um ponto de sorteio que não declarou o que sorteia. */
export const DEFAULT_RANDOM_LABEL = 'sorteio sem rótulo';

/**
 * Teto de sorteios por execução estrita. Um laço que depende do sorteio para
 * terminar (rolar até passar de um valor, sortear até achar um item novo) não
 * termina com valores fixos; o teto transforma o travamento em erro.
 */
export const STRICT_RANDOM_CALL_LIMIT = 2000;

export class StrictRandomLimitError extends Error {
  constructor() {
    super(
      `Modo estrito: mais de ${STRICT_RANDOM_CALL_LIMIT} sorteios na mesma execução`
    );
    this.name = 'StrictRandomLimitError';
  }
}

interface StrictCollector {
  onGap: (gap: RandomGap) => void;
  calls: number;
}

let strictCollector: StrictCollector | null = null;

/**
 * Roda `fn` sem nenhum sorteio: cada ponto que sortearia chama `onGap` e usa
 * o valor provisório. Pode ser aninhado; o modo anterior volta no fim, mesmo
 * com exceção.
 */
export function runWithoutRandomness<T>(
  fn: () => T,
  onGap: (gap: RandomGap) => void
): T {
  const previous = strictCollector;
  strictCollector = { onGap, calls: 0 };
  try {
    return fn();
  } finally {
    strictCollector = previous;
  }
}

export function isStrictRandomMode(): boolean {
  return strictCollector !== null;
}

const describeOption = (option: unknown): string => {
  if (typeof option === 'string') return option;
  if (typeof option === 'number' || typeof option === 'boolean') {
    return String(option);
  }
  if (option && typeof option === 'object') {
    const named = option as { name?: unknown; nome?: unknown; label?: unknown };
    const name = named.name ?? named.nome ?? named.label;
    if (typeof name === 'string') return name;
  }
  return '?';
};

const recordGap = (gap: RandomGap): void => {
  if (!strictCollector) return;
  strictCollector.calls += 1;
  if (strictCollector.calls > STRICT_RANDOM_CALL_LIMIT) {
    throw new StrictRandomLimitError();
  }
  strictCollector.onGap(gap);
};

/**
 * Substituto de `Math.random()` para pontos que sorteiam um número (cara ou
 * coroa, probabilidade). Em modo estrito devolve 0.
 */
export function randomFloat(label = DEFAULT_RANDOM_LABEL): number {
  if (strictCollector) {
    recordGap({ label, kind: 'chance' });
    return 0;
  }
  return Math.random();
}

/** `_.shuffle` que respeita o modo estrito (lá devolve a ordem original). */
export function shuffleArray<ElementType>(
  array: ElementType[],
  label = DEFAULT_RANDOM_LABEL
): ElementType[] {
  if (strictCollector) {
    recordGap({ label, kind: 'order', options: array.map(describeOption) });
    return [...array];
  }
  return _.shuffle(array);
}

export function getRandomItemFromArray<ElementType>(
  array: ElementType[],
  label = DEFAULT_RANDOM_LABEL
): ElementType {
  if (strictCollector) {
    const [first] = array;
    recordGap({
      label,
      kind: 'choice',
      options: array.map(describeOption),
      picked: array.length > 0 ? [describeOption(first)] : [],
    });
    return first;
  }
  return array[Math.floor(Math.random() * array.length)];
}

export function normalizeFaithProbabability(
  faithP: FaithProbability
): FaithProbability {
  const sum = (Object.values(faithP) as number[]).reduce(
    (acc, curr) => acc + curr
  );

  const newFaithP: FaithProbability = {};
  Object.keys(faithP).forEach((key) => {
    const typedKeys = key as DivindadeNames;
    newFaithP[typedKeys] = (faithP[typedKeys] as number) / sum;
  });
  return newFaithP;
}

export function mergeFaithProbabilities(
  arr1: FaithProbability,
  arr2: FaithProbability
): FaithProbability {
  const summedFaithProbability: FaithProbability = {};
  allDivindadeNames.forEach((key) => {
    const val1 = arr1[key] as number;
    const val2 = arr2[key] as number;

    if (val1 === 0 || val2 === 0) {
      summedFaithProbability[key] = 0;
    } else {
      summedFaithProbability[key] = (val1 || 0) + (val2 || 0);
    }
  });

  return normalizeFaithProbabability(summedFaithProbability);
}

export function pickFaith(
  faithP: FaithProbability,
  label = DEFAULT_RANDOM_LABEL
): DivindadeNames {
  const normalized = normalizeFaithProbabability(faithP);
  if (strictCollector) {
    const options = (Object.keys(normalized) as DivindadeNames[]).filter(
      (key) => (normalized[key] ?? 0) > 0
    );
    recordGap({ label, kind: 'choice', options, picked: options.slice(0, 1) });
    return options[0];
  }
  const probabilitySumArray: { divindade: DivindadeNames; sum: number }[] = [];

  Object.entries(normalized).forEach(([key, value]) => {
    const { length } = probabilitySumArray;

    probabilitySumArray.push({
      divindade: key as DivindadeNames,
      sum: (probabilitySumArray[length - 1]?.sum || 0) + (value as number),
    });
  });

  const randomNumber = Math.random();

  for (let i = 0; i < probabilitySumArray.length; i += 1) {
    if (randomNumber < probabilitySumArray[i].sum) {
      return probabilitySumArray[i].divindade;
    }
  }

  return probabilitySumArray[probabilitySumArray.length - 1].divindade;
}

/**
 * Sorteia até `qtd` elementos DISTINTOS de `array`.
 *
 * Pode devolver MENOS que `qtd`: quando as opções acabam (pool menor que o
 * pedido), a função para em vez de completar com `undefined`. Sem esse corte,
 * os buracos vazavam para dentro da ficha (proficiências, perícias, poderes
 * concedidos) e explodiam depois, longe da origem — ex.: `Couraceiro`
 * (2 proficiências de uma lista de 2) num personagem que já tinha uma delas.
 */
export function pickFromArray<ElementType>(
  array: ElementType[],
  qtd: number,
  label = DEFAULT_RANDOM_LABEL
): ElementType[] {
  if (strictCollector) {
    const distinct = array
      .filter((element, idx) => array.indexOf(element) === idx)
      .slice(0, Math.max(0, qtd));
    recordGap({
      label,
      kind: 'choice',
      options: array.map(describeOption),
      picked: distinct.map(describeOption),
      count: qtd,
    });
    return distinct;
  }
  const picked: ElementType[] = [];
  for (let index = 0; index < qtd; index += 1) {
    const filtered = array.filter((element) => !picked.includes(element));
    if (filtered.length === 0) break;
    picked.push(getRandomItemFromArray(filtered));
  }

  return picked;
}

export function removeDup<ElementType>(array: ElementType[]): ElementType[] {
  return array.filter((element, idx) => array.indexOf(element) === idx);
}

export function getRandomArbitrary(
  min: number,
  max: number,
  label = DEFAULT_RANDOM_LABEL
): number {
  if (strictCollector) {
    recordGap({ label, kind: 'roll', picked: [String(min)] });
    return min;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollDice(
  qty: number,
  dice: number,
  discardLowestDiceQty = 0,
  label = DEFAULT_RANDOM_LABEL
): number {
  if (strictCollector) {
    // Todos os dados no mínimo (1): a soma é a dos dados mantidos.
    const sum = Math.max(0, qty - discardLowestDiceQty);
    recordGap({ label, kind: 'roll', count: qty, picked: [String(sum)] });
    return sum;
  }
  const results: number[] = [];
  for (let i = 0; i < qty; i += 1) {
    results.push(getRandomArbitrary(1, dice));
  }

  results.sort((a, b) => a - b);
  let sum = 0;
  for (let i = discardLowestDiceQty; i < qty; i += 1) {
    sum += results[i];
  }

  return sum;
}

type notRepeatedTypes = GeneralPower | Skill | string;

export function getNotUsedFromAllowed<T>(used: T[], allowed?: T[]): T[] {
  return (allowed as T[]).filter((element: T) => !used.includes(element));
}
export function getNotRepeatedRandom<T extends notRepeatedTypes>(
  used: T[],
  allowed: T[],
  label = DEFAULT_RANDOM_LABEL
): T {
  const notRepeated = getNotUsedFromAllowed(used, allowed);
  return getRandomItemFromArray<T>(notRepeated, label);
}

/**
 * Forma mínima do que conta como poder da Tormenta. Cobre `GeneralPower`,
 * `OriginPower`, `ClassPower` e `CustomPower` — `type` só existe em alguns
 * deles, e a flag pode aparecer em qualquer um.
 */
type TormentaCountable = {
  name: string;
  type?: string;
  countAsTormentaPower?: boolean;
  tormentaCountExcludesCharisma?: boolean;
};

/**
 * Chave do efeito ativo da Forma Aberrante do Druida. Mora aqui (e não junto da
 * definição do efeito) porque `countTormentaPowers` precisa dela e a definição
 * importa desta constante — uma string só nos dois lados.
 */
export const FORMA_ABERRANTE_POWER_KEY = 'druida:forma-aberrante';

/** Quantos poderes da Tormenta a Forma Aberrante soma enquanto está ativa. */
export const FORMA_ABERRANTE_TORMENTA_POWERS = 2;

export interface CountTormentaPowersOptions {
  /**
   * Quando true, ignora os poderes marcados com
   * `tormentaCountExcludesCharisma` ("conta como poder da Tormenta, exceto
   * para perda de Carisma").
   */
  forCharismaPenalty?: boolean;
}

export interface TormentaPowerEntry {
  /** Nome canônico do poder. */
  name: string;
  /** Balde de onde a cópia que valeu veio, para exibição. */
  origin: string;
}

/**
 * Os poderes que REALMENTE contam para a Tormenta nesta ficha, na ordem em que
 * foram encontrados. `countTormentaPowers` é o `length` disto (mais as perícias
 * da Deformidade do Lefou, que não vivem em balde de poder nenhum).
 *
 * Conta tanto os poderes cujo `type` é TORMENTA quanto os de qualquer outro
 * tipo marcados com `countAsTormentaPower`, varrendo TODOS os baldes onde um
 * poder pode viver (poder concedido, por exemplo, vive só em `devoto.poderes`).
 * A dedup por nome existe porque poderes concedidos são copiados entre baldes —
 * ver `sheetHasPowerNamed` para o mesmo problema.
 *
 * Existe separado da contagem porque a interface precisa EXPLICAR o número: o
 * cabeçalho do grupo "Poder da Tormenta" na aba de poderes lista só os poderes
 * gerais do tipo TORMENTA, então quem tem um poder concedido ou de origem
 * marcado com `countAsTormentaPower` vê dois números diferentes na mesma tela.
 */
export function listTormentaPowers(
  sheet: CharacterSheet,
  options?: CountTormentaPowersOptions
): TormentaPowerEntry[] {
  const forCharismaPenalty = options?.forCharismaPenalty ?? false;

  const buckets: [string, TormentaCountable[]][] = [
    ['poder geral', sheet.generalPowers ?? []],
    ['poder personalizado', sheet.customPowers ?? []],
    ['poder concedido', sheet.customGrantedPowers ?? []],
    ['poder de classe', sheet.classPowers ?? []],
    ['origem', sheet.origin?.powers ?? []],
    ['devoção', sheet.devoto?.poderes ?? []],
  ];

  // Dedup por nome ANTES de decidir se conta: se o mesmo poder aparece em dois
  // baldes, a primeira cópia é a que vale (senão uma cópia sem a ressalva de
  // Carisma reintroduziria o poder que a outra acabou de descartar).
  const byName = new Map<
    string,
    { power: TormentaCountable; origin: string }
  >();
  buckets.forEach(([origin, bucket]) => {
    bucket.forEach((power) => {
      if (!power || byName.has(power.name)) return;
      byName.set(power.name, { power, origin });
    });
  });

  const entries: TormentaPowerEntry[] = [];
  byName.forEach(({ power, origin }) => {
    if (forCharismaPenalty && power.tormentaCountExcludesCharisma) return;
    // Deformidade do Lefou: "Esta habilidade não causa perda de Carisma".
    // O poder trocado entra em `generalPowers` como TORMENTA puro, então a
    // ressalva não vem do objeto — vem de `lefouDeformidadePower`, que é o
    // campo que a ficha persiste. Ler daqui (em vez de carimbar a flag no
    // clone empurrado por `applyLefouDeformidade`) cura as fichas antigas de
    // graça, sem precisar de refresh em `normalizeSheet`.
    if (forCharismaPenalty && power.name === sheet.lefouDeformidadePower)
      return;
    const isTormenta =
      power.type === GeneralPowerType.TORMENTA ||
      power.countAsTormentaPower === true;
    if (isTormenta) entries.push({ name: power.name, origin });
  });

  return entries;
}

/**
 * Total de poderes da Tormenta da ficha — ponto único de verdade.
 * Ver `listTormentaPowers` para a varredura e as ressalvas.
 */
export function countTormentaPowers(
  sheet: CharacterSheet,
  options?: CountTormentaPowersOptions
): number {
  const forCharismaPenalty = options?.forCharismaPenalty ?? false;
  let tormentaPowersQtd = listTormentaPowers(sheet, options).length;

  // A outra metade da Deformidade: "Você recebe +2 em duas perícias a sua
  // escolha. CADA UM desses bônus conta como um poder da Tormenta." Os bônus
  // de perícia não vivem em nenhum balde de poder, então entram aqui — e só
  // para a ESCALA, nunca para Carisma (mesma ressalva acima).
  //
  // Somados ao poder trocado, a Deformidade sempre contribui exatamente 2 nos
  // dois arranjos possíveis: duas perícias, ou uma perícia + um poder.
  //
  // `Skill.countAsTormentaPower` continua FORA da conta: `addOtherBonusToSkill`
  // a carimbava em toda perícia que tocava, então fichas antigas trazem a flag
  // ligada em perícias que nada têm a ver com a Tormenta. `lefouDeformidadeSkills`
  // é a fonte precisa do mesmo dado.
  if (!forCharismaPenalty) {
    tormentaPowersQtd += sheet.lefouDeformidadeSkills?.length ?? 0;
  }

  // Forma Aberrante (Heróis de Arton): "Nessa forma, você conta como se tivesse
  // dois poderes da Tormenta adicionais (exceto para perda de Carisma)." A forma
  // é um efeito ativo, não um poder em balde nenhum, então é lida direto de
  // `activeEffects` — e não de `sheetBonuses`, que o recálculo zera e remonta
  // enquanto esta função é chamada antes e depois disso.
  if (
    !forCharismaPenalty &&
    (sheet.activeEffects ?? []).some(
      (effect) => effect.powerKey === FORMA_ABERRANTE_POWER_KEY
    )
  ) {
    tormentaPowersQtd += FORMA_ABERRANTE_TORMENTA_POWERS;
  }

  return tormentaPowersQtd;
}

// Paladino: Virtudes Paladinescas concedem um bônus progressivo ao total de PM
// de acordo com a quantidade de poderes desse tipo que o personagem possui.
const VIRTUDE_PALADINESCA_PM: readonly number[] = [0, 1, 3, 6, 10, 15];

export function getVirtudePaladinescaPMBonus(
  classPowers?: { name: string }[]
): number {
  if (!classPowers || classPowers.length === 0) return 0;
  const distinct = new Set(
    classPowers
      .map((p) => p.name)
      .filter((n) => n.startsWith('Virtude Paladinesca:'))
  );
  const count = Math.min(distinct.size, 5);
  return VIRTUDE_PALADINESCA_PM[count];
}

export function pickFromAllowed<
  T extends string | { name: string } | { nome: string }
>(
  options: T[],
  pick: number,
  alreadyPicked: T[] = [],
  label = DEFAULT_RANDOM_LABEL
) {
  const getName = (option: T) => {
    if (typeof option === 'string') {
      return option;
    }
    if (typeof option === 'object' && 'name' in option) {
      return option.name;
    }
    if (typeof option === 'object' && 'nome' in option) {
      return option.nome;
    }
    throw new Error('Option must have a name or nome property');
  };

  const notPicked = options.filter(
    (option) =>
      !alreadyPicked.find((picked) => getName(picked) === getName(option))
  );
  return pickFromArray(notPicked, pick, label);
}
