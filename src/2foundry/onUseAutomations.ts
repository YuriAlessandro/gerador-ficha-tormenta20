import { buildChange, buildOnUseEffect } from './effects';
import { FoundryEffect, FoundryEffectChange } from './types';

/**
 * Automações de uso escritas à mão, para poderes cuja regra não é um bônus
 * numérico e por isso não existe como dado estruturado na ficha (trocar a
 * perícia do ataque, por exemplo).
 *
 * Cada entrada vira um efeito de uso no item do poder: uma opção que o jogador
 * marca na janela de rolagem do Foundry. `types` diz em que rolagens a opção é
 * oferecida (`attack` = ataques com arma). As chaves de mudança são as que o
 * sistema lê em `module/apps/ability-use.mjs`.
 *
 * As condições da regra que o Foundry não verifica sozinho vão no `text`, que é
 * o que o jogador lê ao decidir marcar a opção.
 */
interface OnUseAutomation {
  text: string;
  types: string[];
  changes: FoundryEffectChange[];
}

const POWER_ON_USE: Record<string, OnUseAutomation> = {
  'Esgrima Mágica': {
    text: 'Usa Atuação no lugar de Luta neste ataque. Só sob efeito de Inspiração e com arma corpo a corpo leve ou de uma mão.',
    types: ['attack'],
    // `pericia` troca a perícia da rolagem de ataque da arma.
    changes: [buildChange('pericia', 'atua', 'override')],
  },
};

export function buildPowerOnUseEffects(powerName: string): FoundryEffect[] {
  const automation = POWER_ON_USE[powerName];
  if (!automation) return [];

  return [
    buildOnUseEffect({
      itemName: powerName,
      text: automation.text,
      cost: null,
      repeatable: false,
      changes: automation.changes,
      types: automation.types,
    }),
  ];
}
