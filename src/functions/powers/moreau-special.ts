import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { getRandomItemFromArray } from '../randomUtils';
import { getSpellsOfCircle } from '../../data/systems/tormenta20/magias/generalSpells';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Spell } from '../../interfaces/Spells';

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

/**
 * @deprecated A habilidade virou um `sheetBonuses`/`PickSkill` (ver
 * `moreau-heritages.ts`): ela dá +2 em duas perícias de INT/CAR À ESCOLHA, e
 * esta implementação as TREINAVA, sorteadas de uma lista errada.
 *
 * O caminho de sorteio foi removido; só o replay sobrou, e por dois motivos:
 * ficha de Raposa salva carrega a cópia ANTIGA da habilidade em
 * `raca.abilities` (nunca relida do catálogo), e o despacho de ações `special`
 * em `general.ts` LANÇA ao não reconhecer a ação. Sem este ramo, todo
 * recálculo de Moreau-Raposa salvo quebraria. Remover quando não houver mais
 * ficha com a cópia antiga.
 */
export function applyMoreauEspertezaVulpina(_sheet: CharacterSheet): SubStep[] {
  if (!_sheet.moreauEspertezaSkills) return [];

  const [storedSkill1, storedSkill2] = _sheet.moreauEspertezaSkills;
  if (!_sheet.skills.includes(storedSkill1 as Skill)) {
    _sheet.skills.push(storedSkill1 as Skill);
  }
  if (!_sheet.skills.includes(storedSkill2 as Skill)) {
    _sheet.skills.push(storedSkill2 as Skill);
  }

  return [
    {
      name: 'Esperteza Vulpina',
      value: `Perícias treinadas (${storedSkill1}, ${storedSkill2})`,
    },
  ];
}
