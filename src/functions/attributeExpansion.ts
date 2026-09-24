import Skill, { SkillsAttrs } from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import type { SheetBonus, StatModifier } from '@/interfaces/CharacterSheet';

/** Um bônus sem `source` — mesma forma de `ActiveEffectBonus` no premium. */
type SourcelessBonus = Omit<SheetBonus, 'source'>;

/**
 * Lista QUAIS campos da ficha um boost de atributo afeta.
 *
 * ⚠️ **Isto não é mais um motor.** Desde a camada de atributo efetivo
 * (`functions/effectiveAttributes.ts`), um bônus com alvo `Attribute` é somado
 * em `atributosTemporarios` no Step 7.46 do `recalculateSheet`, e cada
 * derivação lê o atributo já efetivo. Emitir estes bônus para o motor contaria
 * em DOBRO.
 *
 * O que sobrou é o uso de DESTAQUE visual: `getActiveEffectHighlights` chama
 * isto para saber quais perícias / Defesa / dano marcar como "sob efeito" —
 * informação que antes vinha de graça, porque os bônus expandidos existiam de
 * verdade em `sheetBonuses`.
 *
 * Cobertura por atributo:
 *  - Sempre: uma `Skill` para cada perícia que usa o atributo (cobre
 *    Luta/Pontaria = ataques, Fortitude/Reflexos/Vontade = resistências,
 *    Iniciativa).
 *  - FOR: também `WeaponDamage` melee.
 *  - DES: também `Defense`.
 *
 * Não lista PV (CON) nem PM máximo (atributo-chave): em RAW de T20 um boost
 * temporário não retroage neles, e a camada efetiva respeita isso lendo o
 * atributo BASE no cálculo de PV/PM.
 */
export function expandAttributeBonus(
  attr: Atributo,
  modifier: StatModifier
): SourcelessBonus[] {
  const skillBonuses: SourcelessBonus[] = (
    Object.entries(SkillsAttrs) as [Skill, Atributo][]
  )
    .filter(([, a]) => a === attr)
    .map(([name]) => ({
      target: { type: 'Skill', name },
      modifier,
    }));

  const extras: SourcelessBonus[] = [];
  if (attr === Atributo.FORCA) {
    extras.push({
      target: { type: 'WeaponDamage', meleeOnly: true },
      modifier,
    });
  }
  if (attr === Atributo.DESTREZA) {
    extras.push({
      target: { type: 'Defense' },
      modifier,
    });
  }

  return [...skillBonuses, ...extras];
}
