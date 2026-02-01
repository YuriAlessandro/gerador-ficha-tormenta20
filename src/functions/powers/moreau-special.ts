import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { getNotRepeatedRandom, getRandomItemFromArray } from '../randomUtils';
import { getSpellsOfCircle } from '../../data/systems/tormenta20/magias/generalSpells';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Spell } from '../../interfaces/Spells';

// Perícias baseadas em Inteligência ou Carisma
const INT_CHA_SKILLS = [
  Skill.ATUACAO,
  Skill.CAVALGAR,
  Skill.CONHECIMENTO,
  Skill.CURA,
  Skill.DIPLOMACIA,
  Skill.ENGANACAO,
  Skill.GUERRA,
  Skill.INTIMIDACAO,
  Skill.INTUICAO,
  Skill.INVESTIGACAO,
  Skill.JOGATINA,
  Skill.MISTICISMO,
  Skill.NOBREZA,
  Skill.OFICIO_ALQUIMIA,
  Skill.OFICIO_ARMEIRO,
  Skill.OFICIO_EGENHOQUEIRO,
  Skill.RELIGIAO,
];

export function applyMoreauSapiencia(_sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];

  // Get all 1st circle divination spells
  const circle1Spells = getSpellsOfCircle(1);
  const divinationSpells = circle1Spells.filter(
    (spell) => spell.school === 'Adiv'
  );

  if (divinationSpells.length > 0) {
    // Filter out spells already in sheet
    const availableSpells = divinationSpells.filter(
      (spell) => !_sheet.spells.some((s) => s.nome === spell.nome)
    );

    if (availableSpells.length > 0) {
      const selectedSpell = getRandomItemFromArray<Spell>(availableSpells);

      // Set custom attribute to Sabedoria
      const spellWithCustomAttr = {
        ...selectedSpell,
        customKeyAttr: Atributo.SABEDORIA,
      };

      _sheet.spells.push(spellWithCustomAttr);
      subSteps.push({
        name: 'Sapiência',
        value: `Magia de Adivinhação (${selectedSpell.nome})`,
      });
    }
  }

  return subSteps;
}

export function applyMoreauEspertezaVulpina(_sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];

  // Select 2 skills from INT/CHA skills
  const skill1 = getNotRepeatedRandom(_sheet.skills, INT_CHA_SKILLS);
  _sheet.skills.push(skill1);

  const skill2 = getNotRepeatedRandom(_sheet.skills, INT_CHA_SKILLS);
  _sheet.skills.push(skill2);

  subSteps.push({
    name: 'Esperteza Vulpina',
    value: `Perícias treinadas (${skill1}, ${skill2})`,
  });

  return subSteps;
}
