import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment, {
  WeaponStrengthReplacement,
} from '../../interfaces/Equipment';
import { isWeaponMelee } from '../weaponSkill';
import {
  hasWeaponTag,
  isLightOrAgileMeleeWeapon,
  WEAPON_TAG_DESARMADO,
  WEAPON_TAG_NATURAL,
} from '../weaponTraits';
import { sheetHasPowerNamed } from './hasPowerNamed';

export const ACUIDADE_COM_ARMA = 'Acuidade com Arma';

/**
 * Acuidade com Arma (Jogo do Ano p. 124): "Quando usa uma arma corpo a corpo
 * leve ou uma arma de arremesso, você pode usar sua Destreza em vez de Força nos
 * testes de ataque e rolagens de dano."
 *
 * Corpo a corpo elegível: leve, ágil ("pode ser usada com Acuidade com Arma,
 * mesmo não sendo uma arma leve"), arma natural e ataque desarmado — os dois
 * últimos são armas leves corpo a corpo (JdA p. 143).
 *
 * Arma de arremesso que não é nada disso (Lança, Azagaia) só troca no modo
 * arremesso (`thrownOnly`): usada corpo a corpo ela não é "arma de arremesso".
 *
 * "Pode usar" → só troca quando Destreza é maior que Força. Compara o valor
 * BASE, mesma leitura das condições de bônus (`bonusConditions.ts`).
 */
export function getAcuidadeReplacement(
  sheet: CharacterSheet,
  weapon: Equipment
): WeaponStrengthReplacement | undefined {
  if (!sheetHasPowerNamed(sheet, ACUIDADE_COM_ARMA)) return undefined;
  const destreza = sheet.atributos[Atributo.DESTREZA]?.value ?? 0;
  const forca = sheet.atributos[Atributo.FORCA]?.value ?? 0;
  if (destreza <= forca) return undefined;

  const lightMelee =
    isWeaponMelee(weapon) &&
    (isLightOrAgileMeleeWeapon(weapon) ||
      hasWeaponTag(weapon, WEAPON_TAG_NATURAL) ||
      hasWeaponTag(weapon, WEAPON_TAG_DESARMADO));
  if (lightMelee) return { attribute: 'Destreza' };
  if (weapon.arremesso) return { attribute: 'Destreza', thrownOnly: true };
  return undefined;
}

/**
 * Carimba (ou apaga) `strengthReplacement` nas armas da mochila. Idempotente;
 * muta a ficha recebida. Chamado no fim de `reapplyEnhancementsAndWeaponBonuses`
 * (comum aos dois motores de ficha) e em `normalizeSheet` (ficha salva).
 */
export function applyAcuidadeComArma(sheet: CharacterSheet): void {
  const armas = sheet.bag?.equipments?.Arma;
  if (!Array.isArray(armas)) return;
  armas.forEach((arma) => {
    const replacement = getAcuidadeReplacement(sheet, arma);
    /* eslint-disable no-param-reassign */
    if (replacement) arma.strengthReplacement = replacement;
    else delete arma.strengthReplacement;
    /* eslint-enable no-param-reassign */
  });
}
