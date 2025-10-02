/**
 * Exporta todos os dados do suplemento Core (Livro Básico)
 */
import { SupplementId } from '../../../types/supplement.types';
import CORE_RACES from './races';
import CORE_CLASSES from './classes';
import CORE_POWERS from './powers';
import Race from '../../../interfaces/Race';
import { ClassDescription } from '../../../interfaces/Class';
import { GeneralPowers } from '../../../interfaces/Poderes';

export interface SupplementData {
  id: SupplementId;
  races: Race[];
  classes: ClassDescription[];
  powers: GeneralPowers;
  // origins: Origin[]; // TODO: adicionar depois
  // spells: Spell[]; // TODO: adicionar depois
}

export const CORE_SUPPLEMENT: SupplementData = {
  id: SupplementId.CORE,
  races: CORE_RACES,
  classes: CORE_CLASSES,
  powers: CORE_POWERS,
};

export default CORE_SUPPLEMENT;
