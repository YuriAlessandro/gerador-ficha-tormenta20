import type CharacterSheet from '../../interfaces/CharacterSheet';
import type { SpellPath } from '../../interfaces/Class';
import type { Spell } from '../../interfaces/Spells';
import type { Atributo } from '../../data/systems/tormenta20/atributos';
import { findClassDescription, getClassLevelsMap } from '../multiclass';
import { getSpellTradition } from './spellTradition';

interface CasterClass {
  level: number;
  spellType: SpellPath['spellType'];
  keyAttribute?: Atributo;
}

const COVERS: Record<SpellPath['spellType'], string[]> = {
  Arcane: ['arcane'],
  Divine: ['divine'],
  Both: ['arcane', 'divine'],
};

function getCasterClasses(sheet: CharacterSheet): CasterClass[] {
  const result: CasterClass[] = [];
  // Ficha parcial (testes, efeitos ativos fora da ficha) não tem classe.
  if (!sheet.classe) return result;
  getClassLevelsMap(sheet).forEach((level, className) => {
    const spellPath =
      className === sheet.classe?.name
        ? sheet.classe.spellPath
        : sheet.multiclassSpellPaths?.[className] ??
          findClassDescription(className)?.spellPath;
    if (spellPath?.spellType) {
      result.push({
        level,
        spellType: spellPath.spellType,
        keyAttribute: spellPath.keyAttribute,
      });
    }
  });
  return result;
}

/**
 * A classe pela qual a magia é lançada: a de maior nível entre as que lançam
 * pela tradição dela. A ficha não guarda de onde cada magia veio, então uma
 * universal vale pela maior classe conjuradora.
 */
function getSpellClass(
  sheet: CharacterSheet,
  spell: Spell
): CasterClass | undefined {
  const tradition = getSpellTradition(spell.nome);
  const candidates = getCasterClasses(sheet).filter(
    (caster) =>
      !tradition ||
      tradition === 'universal' ||
      COVERS[caster.spellType].includes(tradition)
  );
  return candidates.sort((a, b) => b.level - a.level)[0];
}

/**
 * Limite base de PM gastos na magia (JdA p. 224): "o máximo de PM que você
 * pode gastar por uso é igual ao seu nível na classe que fornece a
 * habilidade. Para habilidades de raça, origem ou outras fontes e poderes
 * gerais, o limite é o seu nível de personagem."
 */
export function getSpellPmLimitBase(
  sheet: CharacterSheet,
  spell: Spell
): number {
  return getSpellClass(sheet, spell)?.level ?? sheet.nivel ?? 1;
}

/** Atributo-chave da magia: o próprio da magia ou o da classe dela. */
export function getSpellKeyAttribute(
  sheet: CharacterSheet,
  spell: Spell
): Atributo | undefined {
  return spell.customKeyAttr ?? getSpellClass(sheet, spell)?.keyAttribute;
}
