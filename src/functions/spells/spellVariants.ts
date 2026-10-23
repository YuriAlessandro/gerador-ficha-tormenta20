import { cloneDeep } from 'lodash';
import { Spell } from '../../interfaces/Spells';

/**
 * Variantes de magia marcadas por sufixo no nome (reconhecido por
 * `spellTradition.ts`). Fora de `general.ts` para que arquivos de DADOS (raças,
 * poderes) possam montar a variante sem import circular.
 */

export function createTruqueSpell(originalSpell: Spell): Spell {
  const truqueSpell = cloneDeep(originalSpell);
  truqueSpell.nome = `${originalSpell.nome} (Apenas Truque)`;

  // Manter apenas o primeiro aprimoramento (addPm: 0)
  if (truqueSpell.aprimoramentos && truqueSpell.aprimoramentos.length > 0) {
    truqueSpell.aprimoramentos = [truqueSpell.aprimoramentos[0]];
  }

  return truqueSpell;
}

export function createAlwaysActiveSpell(originalSpell: Spell): Spell {
  const alwaysActiveSpell = cloneDeep(originalSpell);
  alwaysActiveSpell.nome = `${originalSpell.nome} (Sempre Ativo)`;

  // Remove TODOS os aprimoramentos
  alwaysActiveSpell.aprimoramentos = [];

  return alwaysActiveSpell;
}
