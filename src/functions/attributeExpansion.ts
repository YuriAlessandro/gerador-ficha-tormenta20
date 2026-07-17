import Skill, { SkillsAttrs } from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import type { SheetBonus, StatModifier } from '@/interfaces/CharacterSheet';

/** Um bônus sem `source` — mesma forma de `ActiveEffectBonus` no premium. */
type SourcelessBonus = Omit<SheetBonus, 'source'>;

/**
 * Expande um boost de atributo (ex.: "+2 Inteligência") numa lista de bônus
 * aplicáveis pelo motor. Mesma estratégia das condições e dos efeitos ativos
 * pré-canned (ver `attributeBoostBonuses` no premium, que delega aqui): mutar
 * `atributos[attr].value` foi tentado antes e abandonado porque vazava efeitos
 * temporários para o estado persistido (PM máximo, Defesa, perícias) e corrompia
 * atributos editados manualmente.
 *
 * Cobertura por atributo:
 *  - Sempre: uma `Skill` bonus para cada perícia que usa o atributo (cobre
 *    testes de perícia incluindo Luta/Pontaria = ataques CaC/à distância,
 *    Fortitude/Reflexos/Vontade = resistências, Iniciativa).
 *  - FOR: também `WeaponDamage` melee (FOR adiciona ao dano corpo a corpo, fora
 *    do sistema de perícias).
 *  - DES: também `Defense` (DES contribui pra Defesa; o cap por armadura pesada
 *    NÃO é enforced aqui — usuário ajusta se for o caso).
 *
 * Não cobre PV (CON), PM máximo (atributo-chave) nem perícias adicionais
 * treinadas — RAW de T20 para boosts temporários: PV/PM são calculados no
 * level-up, não retroagem.
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
