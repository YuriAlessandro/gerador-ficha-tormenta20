import Equipment, { BagEquipments } from '../../interfaces/Equipment';
import { Spell } from '../../interfaces/Spells';
import { allArcaneSpellsUpToCircle } from '../../data/systems/tormenta20/magias/arcane';
import { allDivineSpellsUpToCircle } from '../../data/systems/tormenta20/magias/divine';

/**
 * Look up a spell by name across the arcane + divine catalogs (covering all
 * 5 circles). Returns undefined when the name doesn't match any known spell —
 * the Conjuradora picker only offers names from this same union, so a miss
 * means the user picked a spell that has since been removed/renamed.
 */
function findSpellByName(name: string): Spell | undefined {
  const arcane = allArcaneSpellsUpToCircle(5);
  const divine = allDivineSpellsUpToCircle(5);
  return (
    arcane.find((s) => s.nome === name) || divine.find((s) => s.nome === name)
  );
}

/**
 * Removes any `equipmentSource`-tagged entries from the current spell list and
 * re-injects spells granted by Conjuradora-enchanted weapons currently in the
 * bag. Idempotent: running twice with the same bag yields the same list.
 */
export function injectConjuradoraSpells(
  currentSpells: Spell[],
  bagEquipments: BagEquipments | undefined
): Spell[] {
  const stripped = currentSpells.filter((s) => !s.equipmentSource);

  if (!bagEquipments) return stripped;

  const injected: Spell[] = [];
  const seen = new Set<string>(stripped.map((s) => s.nome));

  (Object.keys(bagEquipments) as (keyof BagEquipments)[]).forEach((cat) => {
    const list = bagEquipments[cat] as Equipment[] | undefined;
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      const conjuradora = item?.enchantments?.find(
        (e) => e.enchantment === 'Conjuradora'
      );
      if (!conjuradora?.selectedSpell || !item.id) return;
      if (seen.has(conjuradora.selectedSpell)) return;
      const spell = findSpellByName(conjuradora.selectedSpell);
      if (!spell) return;
      injected.push({ ...spell, equipmentSource: item.id });
      seen.add(conjuradora.selectedSpell);
    });
  });

  return [...stripped, ...injected];
}
