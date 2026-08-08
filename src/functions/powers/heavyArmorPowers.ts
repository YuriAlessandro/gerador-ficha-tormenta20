/**
 * Poderes de armadura pesada cujo valor ESCALA com outros poderes da ficha.
 *
 * Encouraçado ("+2 na Defesa, +2 para cada outro poder que você possua que tenha
 * Encouraçado como pré-requisito") e Encastelado ("RD 2, +1 para cada outro
 * poder...") não cabem num `sheetBonuses` estático no dado do poder: o valor
 * depende de QUAIS outros poderes o personagem tem. Por isso são injetados no
 * recálculo, no mesmo espírito de `injectEstiloDeUmaArmaBonuses`.
 *
 * Como os bônus carregam `source: { type: 'power', name }`, eles aparecem na
 * seção "Aplicado na ficha" do card do poder (`getPowerAppliedBonuses`) — que é
 * como o jogador confirma que a automação funcionou.
 *
 * ⚠️ Os dois pontos de injeção rodam DEPOIS do filtro `isBonusActive`, então
 * anexar `condition: wearingHeavyArmor` aqui não seria aplicado. O gate de
 * armadura pesada é feito à mão, no início de `getHeavyArmorPowerBonuses`.
 */
import CharacterSheet, { SheetBonus } from '../../interfaces/CharacterSheet';
import { RequirementType } from '../../interfaces/Poderes';
import { isWearingHeavyArmor } from '../wornArmor';

export const ENCOURACADO_POWER_NAME = 'Encouraçado';
export const ENCASTELADO_POWER_NAME = 'Encastelado';
export const FANATICO_POWER_NAME = 'Fanático';

function hasGeneralPower(sheet: CharacterSheet, name: string): boolean {
  return (sheet.generalPowers ?? []).some((power) => power.name === name);
}

/**
 * Fanático: "seu deslocamento não é reduzido por usar armaduras pesadas".
 * Não é um bônus — cancela a penalidade dentro de `calcDisplacement`, então os
 * dois motores consultam isto em vez de somar algo em `sheetBonuses`.
 */
export function hasFanatico(sheet: CharacterSheet): boolean {
  return hasGeneralPower(sheet, FANATICO_POWER_NAME);
}

/**
 * Quantos poderes da ficha listam `prerequisiteName` como pré-requisito.
 *
 * `excludePowerName` tira o próprio poder da conta — as duas regras falam em
 * "cada OUTRO poder", e Encastelado É um dos dependentes de Encouraçado.
 */
export function countPowersRequiring(
  sheet: CharacterSheet,
  prerequisiteName: string,
  excludePowerName?: string
): number {
  return (sheet.generalPowers ?? []).filter(
    (power) =>
      power.name !== excludePowerName &&
      (power.requirements ?? []).some((reqGroup) =>
        reqGroup.some(
          (req) =>
            req.type === RequirementType.PODER && req.name === prerequisiteName
        )
      )
  ).length;
}

/**
 * Bônus passivos de Encouraçado e Encastelado. Devolve `[]` quando não há
 * armadura pesada VESTIDA — carregar a armadura na mochila não conta.
 */
export function getHeavyArmorPowerBonuses(sheet: CharacterSheet): SheetBonus[] {
  if (!isWearingHeavyArmor(sheet)) return [];

  const bonuses: SheetBonus[] = [];

  if (hasGeneralPower(sheet, ENCOURACADO_POWER_NAME)) {
    const dependents = countPowersRequiring(sheet, ENCOURACADO_POWER_NAME);
    bonuses.push({
      source: { type: 'power', name: ENCOURACADO_POWER_NAME },
      target: { type: 'Defense' },
      modifier: { type: 'Fixed', value: 2 + dependents * 2 },
    });
  }

  if (hasGeneralPower(sheet, ENCASTELADO_POWER_NAME)) {
    const dependents = countPowersRequiring(
      sheet,
      ENCOURACADO_POWER_NAME,
      ENCASTELADO_POWER_NAME
    );
    bonuses.push({
      source: { type: 'power', name: ENCASTELADO_POWER_NAME },
      target: { type: 'DamageReduction', damageType: 'Geral' },
      modifier: { type: 'Fixed', value: 2 + dependents },
    });
  }

  return bonuses;
}
