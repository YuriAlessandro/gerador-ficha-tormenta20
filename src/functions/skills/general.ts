import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';

/**
 * Soma um bônus "outros" a uma perícia.
 *
 * NÃO marca `countAsTormentaPower`. Este helper é genérico — qualquer poder que
 * conceda bônus de perícia passa por aqui (Sentidos Aguçados, Frade, tamanho,
 * equipamento...) — e por muito tempo ele carimbava a flag em TODAS as perícias
 * que tocava. Isso inflava `countTormentaPowers`, e com ele a perda de Carisma,
 * as fórmulas `TormentaPowersCalc` e a RD de Pele/Carapaça Corrompida: um
 * personagem sem nenhum poder da Tormenta podia perder Carisma por ter um bônus
 * de Percepção. A flag era da Deformidade do Lefou, que hoje empurra um poder
 * da Tormenta de verdade para `generalPowers` (ver `applyLefouDeformidade`) e
 * não depende mais dela.
 */
export function addOtherBonusToSkill(
  sheet: CharacterSheet,
  skill: Skill,
  value: number
) {
  if (
    !sheet.completeSkills?.some((currentSkill) => currentSkill.name === skill)
  ) {
    sheet.completeSkills = [
      ...(sheet.completeSkills || []),
      { name: skill, others: value },
    ];
  } else {
    sheet.completeSkills = Object.values(sheet.completeSkills || {}).map(
      (currentSkill) => {
        if (currentSkill.name === skill) {
          return {
            ...currentSkill,
            others: (currentSkill.others || 0) + value,
          };
        }
        return currentSkill;
      }
    );
  }
}
