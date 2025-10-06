/**
 * Exporta todos os dados do suplemento Core (Livro Básico) - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import CORE_RACES from './races';
import CORE_CLASSES from './classes';
import CORE_POWERS from './powers';
import Race from '../../../../interfaces/Race';
import { ClassDescription } from '../../../../interfaces/Class';
import { GeneralPowers } from '../../../../interfaces/Poderes';
import Equipment, { DefenseEquipment } from '../../../../interfaces/Equipment';
import { Spell } from '../../../../interfaces/Spells';
import Origin from '../../../../interfaces/Origin';

export interface SupplementEquipment {
  weapons?: Record<string, Equipment>;
  armors?: Record<string, DefenseEquipment>;
  generalItems?: Equipment[];
  clothing?: Equipment[];
  alchemy?: Equipment[];
  food?: Equipment[];
}

export interface SupplementSpells {
  arcane?: Spell[];
  divine?: Spell[];
  universal?: Spell[];
}

export interface SupplementData {
  id: SupplementId;
  races: Race[];
  classes: ClassDescription[];
  powers: GeneralPowers;
  equipment?: SupplementEquipment;
  spells?: SupplementSpells;
  origins?: Origin[];
}

export const TORMENTA20_CORE_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_CORE,
  races: CORE_RACES,
  classes: CORE_CLASSES,
  powers: CORE_POWERS,
};

// Legacy export for backwards compatibility
export const CORE_SUPPLEMENT = TORMENTA20_CORE_SUPPLEMENT;
