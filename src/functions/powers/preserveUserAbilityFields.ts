import { ClassAbility } from '@/interfaces/Class';

/**
 * Campos de uma habilidade de classe que pertencem ao USUÁRIO, não ao catálogo.
 *
 * `classe.abilities` é reconstruído a partir de `classe.originalAbilities` em
 * três pontos diferentes (`recalculateSheet.applyClassAbilities`, `levelUp` e
 * `applyManualLevelUp`), e `originalAbilities` é um snapshot do catálogo que
 * nunca recebe edição do usuário. Sem capturar antes e reaplicar depois, tudo
 * que o jogador configurou na habilidade some — era o que acontecia com
 * rolagens e efeitos customizados ao subir de nível.
 *
 * Para adicionar um campo editável pelo usuário em `ClassAbility`, basta
 * incluí-lo aqui e em `captureUserAbilityFields`.
 */
export type UserAbilityFields = Pick<
  ClassAbility,
  'rolls' | 'customEffects' | 'customName' | 'customDescription'
>;

export function captureUserAbilityFields(
  abilities?: ClassAbility[]
): Map<string, UserAbilityFields> {
  const captured = new Map<string, UserAbilityFields>();

  (abilities || []).forEach((ability) => {
    const fields: UserAbilityFields = {};
    if (ability.rolls?.length) fields.rolls = ability.rolls;
    if (ability.customEffects?.length)
      fields.customEffects = ability.customEffects;
    if (ability.customName?.trim()) fields.customName = ability.customName;
    if (ability.customDescription?.trim())
      fields.customDescription = ability.customDescription;

    if (Object.keys(fields).length > 0) captured.set(ability.name, fields);
  });

  return captured;
}

/**
 * Reaplica os campos capturados sobre a lista reconstruída, casando por nome
 * (cobre habilidades primárias e secundárias de multiclasse). Só as chaves
 * presentes na captura são sobrescritas — nada vira `undefined` por acidente.
 */
export function restoreUserAbilityFields(
  abilities: ClassAbility[],
  captured: Map<string, UserAbilityFields>
): ClassAbility[] {
  if (captured.size === 0) return abilities;

  return abilities.map((ability) => {
    const preserved = captured.get(ability.name);
    if (!preserved) return ability;
    return { ...ability, ...preserved };
  });
}

export default captureUserAbilityFields;
