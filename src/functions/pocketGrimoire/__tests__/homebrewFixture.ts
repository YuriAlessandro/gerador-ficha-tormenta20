import { SupplementData } from '../../../data/systems/tormenta20/core';
import { GeneralPowerType } from '../../../interfaces/Poderes';
import { SupplementId } from '../../../types/supplement.types';

/** Um homebrew mínimo, montado à mão (sem depender do compilador premium). */
export const HOMEBREW = {
  id: 'homebrew:grimorio-teste',
  deity: 'Vexpo, o Testador',
  deityId: 'deity:Vexpo, o Testador',
  power: 'Foco do Testador',
  powerId: 'power:MAGIA:Foco do Testador',
};

const noPowers = () =>
  Object.fromEntries(
    Object.values(GeneralPowerType).map((type) => [type, []])
  ) as unknown as SupplementData['powers'];

export const homebrewSupplement = (): SupplementData => {
  const powers = noPowers();
  powers[GeneralPowerType.MAGIA] = [
    {
      name: HOMEBREW.power,
      description: 'Poder de teste.',
      type: GeneralPowerType.MAGIA,
      requirements: [],
    },
  ];
  return {
    id: HOMEBREW.id as SupplementId,
    displayName: 'Homebrew de teste',
    races: [],
    classes: [],
    powers,
    divindades: [{ name: HOMEBREW.deity, poderes: [] }],
  };
};
