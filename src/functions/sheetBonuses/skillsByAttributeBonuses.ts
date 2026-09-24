import Skill, { SkillsAttrs } from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import type { BonusCondition, SheetBonus } from '@/interfaces/CharacterSheet';

/**
 * Expande "bônus em perícias baseadas em <atributo>" nas `Skill` correspondentes.
 *
 * O livro escreve regras assim com frequência ("+5 em perícias baseadas em
 * Carisma"), mas NÃO existe um `StatModifierTarget` para isso — e criar um sairia
 * caro: há mais de 140 ramificações em `target.type` espalhadas pelo core e pelo
 * submódulo premium (builder de homebrew, agregação de condições, destaques de
 * efeito ativo, breakdown de perícia), e `describeBonusTarget` é um switch
 * exaustivo. Expandir na AUTORIA custa nada e ainda faz o breakdown por perícia
 * mostrar a origem do bônus de graça.
 *
 * Mesmo molde de `expandAttributeBonus` em `functions/attributeExpansion.ts`.
 */
export function skillsByAttributeBonuses(
  attribute: Atributo,
  equipmentName: string,
  value: number,
  condition?: BonusCondition
): SheetBonus[] {
  return (Object.entries(SkillsAttrs) as [Skill, Atributo][])
    .filter(([, attr]) => attr === attribute)
    .map(([name]) => ({
      source: { type: 'equipment' as const, equipmentName },
      target: { type: 'Skill' as const, name },
      modifier: { type: 'Fixed' as const, value },
      ...(condition ? { condition } : {}),
    }));
}

export default skillsByAttributeBonuses;
