import { Atributo } from '../data/atributos';
import CharacterSheet from '../interfaces/CharacterSheet';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../interfaces/Poderes';
import Skill from '../interfaces/Skills';

function isPowerAvailable(sheet: CharacterSheet, power: GeneralPower) {
  return power.requirements.some((req) =>
    req.every((rule) => {
      switch (rule.type) {
        case RequirementType.PODER: {
          return false;
        }
        case RequirementType.ATRIBUTO: {
          const attr = rule.name as Atributo;
          return rule.name && sheet.atributos[attr].value >= (rule?.value || 0);
        }
        case RequirementType.PERICIA: {
          const pericia = rule.name as Skill;
          return rule.name && sheet.skills.includes(pericia);
        }
        case RequirementType.HABILIDADE: {
          return false;
        }
        case RequirementType.PODER_TORMENTA: {
          const qtdPowers = rule.value as number;
          return (
            sheet.generalPowers.filter(
              (actualPower) => actualPower.type === 'TORMENTA'
            ).length >= qtdPowers
          );
        }
        case RequirementType.PROFICIENCIA: {
          const proficiencia = (rule.value as unknown) as string;
          return (
            rule.name && sheet.classe.proeficiencias.includes(proficiencia)
          );
        }
        case RequirementType.NIVEL: {
          const nivel = rule.value as number;
          return sheet.nivel >= nivel;
        }
        case RequirementType.CLASSE: {
          const className = (rule.value as unknown) as string;
          return rule.name && sheet.classe.name === className;
        }
        default:
          return true;
      }
    })
  );
}
