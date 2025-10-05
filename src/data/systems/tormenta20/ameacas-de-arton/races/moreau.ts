import Race from '../../../../../interfaces/Race';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import {
  MOREAU_HERITAGES,
  MOREAU_HERITAGE_NAMES,
  MoreauHeritageName,
} from './moreau-heritages';

const MOREAU: Race = {
  name: 'Moreau',
  // Default attributes (will be overridden by heritage)
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    AZGHER: 1,
    HYNINN: 1,
    LENA: 1,
    MEGALOKK: 1,
    OCEANO: 1,
  },
  abilities: [], // Will be populated by heritage
  setup: (race) => {
    // Randomly select a heritage
    const heritageName = getRandomItemFromArray<MoreauHeritageName>(
      MOREAU_HERITAGE_NAMES
    );
    const selectedHeritage = MOREAU_HERITAGES[heritageName];

    return {
      ...race,
      heritage: heritageName,
      attributes: {
        attrs: selectedHeritage.attributes,
      },
      abilities: selectedHeritage.abilities,
    };
  },
  getDisplacement(race) {
    if (race.heritage) {
      const heritage = MOREAU_HERITAGES[race.heritage as MoreauHeritageName];
      if (heritage?.displacement) {
        return heritage.displacement;
      }
    }
    return 9; // Default displacement
  },
  getAttributes() {
    // This will be called after setup, so heritage should be set
    // Just return the current attributes (already set by setup or manual selection)
    // This method exists for compatibility with the system
    return this.attributes.attrs;
  },
};

export default MOREAU;
