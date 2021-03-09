import {
  allDivindadeNames,
  DivindadeNames,
  FaithProbability,
} from '../interfaces/Divindade';

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
  const arr1Normalized = normalizeFaithProbabability(arr1);
  const arr2Normalized = normalizeFaithProbabability(arr2);

  const multipliedFaithProbability: FaithProbability = {};
  allDivindadeNames.forEach((key) => {
    const val1: number =
      arr1Normalized[key] !== undefined ? (arr1Normalized[key] as number) : 0.5;
    const val2: number =
      arr2Normalized[key] !== undefined ? (arr2Normalized[key] as number) : 0.5;

    multipliedFaithProbability[key] = val1 * val2;
  });

  return normalizeFaithProbabability(multipliedFaithProbability);
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
