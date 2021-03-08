// eslint-disable-next-line
export function getRandomItemFromArray<ElementType>(array: ElementType[]): ElementType {
  return array[Math.floor(Math.random() * array.length)];
}

export function normalizeProbababilityArray(array: number[]): number[] {
  const sum = array.reduce((acc, curr) => acc + curr);
  return array.map((curr) => curr / sum);
}

// TODO: Remove examples
// Examples
// if you have something like [1/4, 1/4, 1/2] and [0, 1/2, 1/2] use below to turn those in a single probability array
export function mergeProbabilityArrays(
  arr1: number[],
  arr2: number[]
): number[] {
  if (arr1.length !== arr2.length) return [];

  const multipliedArray: number[] = [];
  for (let i = 0; i < arr1.length; i += 1) {
    multipliedArray.push(arr1[i] * arr2[i]);
  }

  return normalizeProbababilityArray(multipliedArray);
}

// TODO: Remove examples
// Examples
// if you have something like [1/4, 1/4, 1/2] use below to get the index based on the probability
export function pickFromProbabilityArray(array: number[]): number {
  const normalized = normalizeProbababilityArray(array);
  const probabilitySumArray: number[] = [];
  for (let i = 0; i < normalized.length; i += 1) {
    probabilitySumArray.push((probabilitySumArray[i - 1] || 0) + normalized[i]);
  }

  const randomNumber = Math.random();

  for (let i = 0; i < probabilitySumArray.length; i += 1) {
    if (randomNumber < probabilitySumArray[i]) {
      return i;
    }
  }

  return probabilitySumArray.length - 1;
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
