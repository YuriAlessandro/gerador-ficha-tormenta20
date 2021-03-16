import { Atributo } from '../data/atributos';
import CharacterSheet from '../interfaces/CharacterSheet';
import { GeneralPower, RequirementType } from '../interfaces/Poderes';
import Skill from '../interfaces/Skills';

function isPowerAvailable(sheet: CharacterSheet, power: GeneralPower) {
  return power.requirements.some((req) =>
    req.every((rule) => {
      switch (rule.type) {
        case RequirementType.PODER: {
          const allPowers = [
            ...sheet.generalPowers,
            ...(sheet.origin?.powers || []),
          ];

          return allPowers.some((currPower) => currPower.name === rule.name);
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
          const result = sheet.classe.abilities.some(
            (ability) => ability.name === rule.name
          );
          if (rule.not) return !result;
          return result;
        }
        case RequirementType.PODER_TORMENTA: {
          const qtdPowers = rule.value as number;
          return (
            sheet.generalPowers.filter(
              (actualPower) => actualPower.type === 'TORMENTA'
            ).length >=
            qtdPowers + 1 // OTHER powers, so can't count itself
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
