import generalPowers from '../data/poderes';
import {
  allDivindadeNames,
  DivindadeNames,
  FaithProbability,
} from '../interfaces/Divindade';
import { GeneralPower } from '../interfaces/Poderes';
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

// Returns an array with N selected item from array
export function pickFromArray<ElementType>(
  array: ElementType[],
  qtd: number
): ElementType[] {
  const picked: ElementType[] = [];
  for (let index = 0; index < qtd; index += 1) {
    const filtered = array.filter((element) => !picked.includes(element));
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

type notRepeatedDefaultsTypes = 'power' | 'skill';

const generalPowersEmpty: GeneralPower[] = [];

const NOT_REPEATED_DEFAULTS: Record<
  notRepeatedDefaultsTypes,
  (GeneralPower | Skill)[]
> = {
  power: generalPowersEmpty.concat(...Object.values(generalPowers)),
  skill: Object.values(Skill),
};

export function getNotUsedFromAllowed(
  used: (GeneralPower | Skill)[],
  type: notRepeatedDefaultsTypes,
  allowed?: (GeneralPower | Skill)[]
): (GeneralPower | Skill)[] {
  return (allowed || NOT_REPEATED_DEFAULTS[type]).filter(
    (element) => used.indexOf(element) < 0
  );
}
export function getNotRepeatedRandom(
  used: (GeneralPower | Skill)[],
  type: notRepeatedDefaultsTypes,
  allowed?: (GeneralPower | Skill)[]
): GeneralPower | Skill {
  const notRepeated = allowed
    ? getNotUsedFromAllowed(used, type)
    : getNotUsedFromAllowed(used, type, allowed);

  return getRandomItemFromArray(notRepeated);
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = U[keyof U];
