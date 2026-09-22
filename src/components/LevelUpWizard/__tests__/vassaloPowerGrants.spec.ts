import { describe, expect, it } from 'vitest';
import { findClassDescription } from '@/functions/multiclass';
import { classGrantsPowerAtLevel, findPowerGrant } from '../LevelUpWizardModal';

/**
 * O passo "Escolha de Poder" era empurrado em TODO nível. Para o Vassalo isso
 * produzia dois defeitos ao mesmo tempo: um passo vazio do lado da classe (ele
 * não tem catálogo próprio) em níveis que não concedem poder nenhum, e um
 * segundo passo de escolha nos níveis que concedem.
 */

const vassalo = findClassDescription('Vassalo');
const cavaleiro = findClassDescription('Cavaleiro');

describe('concessão de poder por nível', () => {
  it('classe padrão concede em qualquer nível', () => {
    // Sem `powerGrants`, vale a regra de T20 e nada muda.
    expect(cavaleiro?.powerGrants).toBeUndefined();
    [2, 3, 4, 5, 11].forEach((level) =>
      expect(classGrantsPowerAtLevel(cavaleiro, level)).toBe(true)
    );
  });

  it.each([2, 4, 6, 7, 9, 12, 14, 16, 18])(
    'Vassalo concede poder no nível %i',
    (level) => {
      expect(classGrantsPowerAtLevel(vassalo, level)).toBe(true);
    }
  );

  it.each([1, 3, 5, 8, 10, 11, 13, 15, 17, 19, 20])(
    'Vassalo NÃO concede poder no nível %i',
    (level) => {
      expect(classGrantsPowerAtLevel(vassalo, level)).toBe(false);
    }
  );

  it('a concessão diz de qual classe o poder vem', () => {
    expect(findPowerGrant(vassalo, 2)?.fromClasses).toEqual(['Cavaleiro']);
    expect(findPowerGrant(vassalo, 7)?.fromClasses).toEqual([
      'Cavaleiro',
      'Guerreiro',
    ]);
    expect(findPowerGrant(vassalo, 3)).toBeUndefined();
  });
});
