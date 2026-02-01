import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { getRandomItemFromArray } from '../randomUtils';
import { getDivineSpellsOfCircle } from '../../data/systems/tormenta20/magias/divine';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Spell } from '../../interfaces/Spells';

/**
 * Aplica a habilidade Fonte de Energia: Sagrada
 * Permite escolher uma magia divina de 1º círculo (atributo-chave Sabedoria)
 */
export function applyGolemDespertoSagrada(_sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];

  // Obter todas as magias divinas de 1º círculo
  const circle1Spells = getDivineSpellsOfCircle(1);

  if (circle1Spells.length > 0) {
    // Filtrar magias já conhecidas
    const availableSpells = circle1Spells.filter(
      (spell) => !_sheet.spells.some((s) => s.nome === spell.nome)
    );

    if (availableSpells.length > 0) {
      const selectedSpell = getRandomItemFromArray<Spell>(availableSpells);

      // Adicionar magia com atributo-chave Sabedoria
      const spellWithCustomAttr = {
        ...selectedSpell,
        customKeyAttr: Atributo.SABEDORIA,
      };

      _sheet.spells.push(spellWithCustomAttr);
      subSteps.push({
        name: 'Fonte de Energia: Sagrada',
        value: `Magia Divina (${selectedSpell.nome})`,
      });
    }
  }

  return subSteps;
}
