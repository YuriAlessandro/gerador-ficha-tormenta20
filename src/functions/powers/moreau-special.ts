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

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (_sheet.moreauSapienciaSpell) {
    if (!_sheet.spells.some((s) => s.nome === _sheet.moreauSapienciaSpell)) {
      const circle1Spells = getSpellsOfCircle(1);
      const storedSpell = circle1Spells.find(
        (s) => s.nome === _sheet.moreauSapienciaSpell
      );
      if (storedSpell) {
        const spellWithCustomAttr = {
          ...storedSpell,
          customKeyAttr: Atributo.SABEDORIA,
        };
        _sheet.spells.push(spellWithCustomAttr);
      }
    }
    subSteps.push({
      name: 'Sapiência',
      value: `Magia de Adivinhação (${_sheet.moreauSapienciaSpell})`,
    });
    return subSteps;
  }

  // RANDOM PATH: First-time generation
  const circle1Spells = getSpellsOfCircle(1);
  const divinationSpells = circle1Spells.filter(
    (spell) => spell.school === 'Adiv'
  );

  if (divinationSpells.length > 0) {
    const availableSpells = divinationSpells.filter(
      (spell) => !_sheet.spells.some((s) => s.nome === spell.nome)
    );

    if (availableSpells.length > 0) {
      const selectedSpell = getRandomItemFromArray<Spell>(availableSpells);

      const spellWithCustomAttr = {
        ...selectedSpell,
        customKeyAttr: Atributo.SABEDORIA,
      };

      _sheet.spells.push(spellWithCustomAttr);
      _sheet.moreauSapienciaSpell = selectedSpell.nome;
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

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (_sheet.moreauEspertezaSkills) {
    const [storedSkill1, storedSkill2] = _sheet.moreauEspertezaSkills;
    if (!_sheet.skills.includes(storedSkill1 as Skill)) {
      _sheet.skills.push(storedSkill1 as Skill);
    }
    if (!_sheet.skills.includes(storedSkill2 as Skill)) {
      _sheet.skills.push(storedSkill2 as Skill);
    }
    subSteps.push({
      name: 'Esperteza Vulpina',
      value: `Perícias treinadas (${storedSkill1}, ${storedSkill2})`,
    });
    return subSteps;
  }

  // RANDOM PATH: First-time generation
  const skill1 = getNotRepeatedRandom(_sheet.skills, INT_CHA_SKILLS);
  _sheet.skills.push(skill1);

  const skill2 = getNotRepeatedRandom(_sheet.skills, INT_CHA_SKILLS);
  _sheet.skills.push(skill2);

  _sheet.moreauEspertezaSkills = [skill1, skill2];

  subSteps.push({
    name: 'Esperteza Vulpina',
    value: `Perícias treinadas (${skill1}, ${skill2})`,
  });

  return subSteps;
}
