import type { SheetBonus } from '../../interfaces/CharacterSheet';
import type Equipment from '../../interfaces/Equipment';
import { dataRegistry } from '../../data/registry';
import { isModificationSuperseded } from '../modifications/modificationEffects';

/**
 * Bônus das melhorias do esotérico que só valem com ele em uso (Vigilante:
 * "+2 na Defesa"), de esotérico ou instrumento de bardo. Quem chama decide se
 * o item conta como esotérico e está em uso (empunhado); aqui
 * só se lê o catálogo pelo nome da melhoria, com a fonte apontando o item.
 */
export function getInUseImprovementBonuses(item: Equipment): SheetBonus[] {
  const applied = (item.modifications ?? []).map((m) => m.mod);
  return applied
    .filter((mod) => !isModificationSuperseded(mod, applied))
    .flatMap((mod) =>
      (
        dataRegistry.getImprovementByName(mod, 'esoteric')?.inUseSheetBonuses ??
        []
      ).map(
        (bonus): SheetBonus => ({
          ...bonus,
          source: {
            type: 'equipment',
            equipmentName: `${item.nome} (${mod})`,
          },
        })
      )
    );
}
