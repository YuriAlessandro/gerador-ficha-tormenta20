import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  allDivindadeNames,
  DivindadeNames,
  FaithProbability,
} from '../interfaces/Divindade';
import { GeneralPower, GeneralPowerType } from '../interfaces/Poderes';
import Skill from '../interfaces/Skills';

export function getRandomItemFromArray<ElementType>(
  array: ElementType[]
): ElementType {
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

export function pickFaith(faithP: FaithProbability): DivindadeNames {
  const normalized = normalizeFaithProbabability(faithP);
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
  qtd: number
): ElementType[] {
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

export function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollDice(
  qty: number,
  dice: number,
  discardLowestDiceQty = 0
): number {
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
  allowed: T[]
): T {
  const notRepeated = getNotUsedFromAllowed(used, allowed);
  return getRandomItemFromArray<T>(notRepeated);
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
>(options: T[], pick: number, alreadyPicked: T[] = []) {
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
  return pickFromArray(notPicked, pick);
}
