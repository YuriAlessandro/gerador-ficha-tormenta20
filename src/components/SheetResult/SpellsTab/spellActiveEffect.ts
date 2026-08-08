import type { Spell } from '@/interfaces/Spells';
import type { ActivePowerDefinition } from '@/premium/interfaces/ActiveEffect';
import { getActiveEffectForSpell } from '@/premium/data/activePowers';
import { buildVirtualDefinitionFromCustomEffect } from '@/premium/data/activePowers/customEffectAdapter';

/**
 * O efeito ativo que uma magia aplica na ficha, quando ela aplica algum.
 *
 * Duas fontes, na mesma ordem que o `handleSpellCast` do `Result` usa para
 * decidir qual definição oferecer depois do lançamento — senão a estrelinha
 * apareceria em magia que não oferta nada, abriria um efeito diferente do que
 * o lançamento entrega, ou faltaria em magia que oferta:
 *  1. registry (`ACTIVE_SPELLS`, casado pelo nome exato da magia);
 *  2. `spell.customEffects` das magias homebrew (usa o primeiro, como lá).
 *
 * Devolve `null` quando a magia não mexe na ficha — a maioria delas.
 */
export function getSpellActiveEffectDefinition(
  spell: Spell,
  nivel: number
): ActivePowerDefinition | null {
  const registryDef = getActiveEffectForSpell(spell.nome);
  if (registryDef) return registryDef;

  const [customEffect] = spell.customEffects ?? [];
  if (!customEffect) return null;

  // `affectsAllies` true espelha o lançamento: magia homebrew com efeito
  // também é ofertada aos aliados da mesa. Sem o submódulo premium o builder é
  // inerte e devolve null — a linha simplesmente não ganha estrelinha.
  return (
    buildVirtualDefinitionFromCustomEffect(
      spell.nome,
      customEffect,
      nivel,
      true
    ) ?? null
  );
}
