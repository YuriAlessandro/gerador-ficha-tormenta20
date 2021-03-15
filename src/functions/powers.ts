import { Atributo } from '../data/atributos';
import CharacterSheet from '../interfaces/CharacterSheet';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../interfaces/Poderes';

function isPowerAvailable(sheet: CharacterSheet, power: GeneralPower) {
  return power.requirements.some((req) =>
    req.every((rule) => {
      switch (rule.type) {
        case RequirementType.ATRIBUTO: {
          const attr = rule.name as Atributo;
          return rule.name && sheet.atributos[attr].value >= (rule?.value || 0);
        }
        default:
          return true;
      }
    })
  );
}
