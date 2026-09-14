import { describe, expect, it } from 'vitest';
import generateRandomSheet, { applyManualLevelUp } from '@/functions/general';
import { getCavaleiroCaminho } from '@/functions/powers/cavaleiroCaminho';
import SelectOptions from '@/interfaces/SelectedOptions';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { SupplementId } from '@/types/supplement.types';

/**
 * O Caminho do Cavaleiro (5º nível) precisa ser resolvido nos DOIS fluxos que
 * aplicam habilidades novas: o sorteio de `levelUp` (ficha gerada já num
 * nível) e o `applyManualLevelUp` (assistente de subida de nível).
 *
 * A escolha original vivia num terceiro laço, que filtra `classe.abilities` por
 * nível — e por isso nunca rodava. A RD do Bastião, já implementada, nunca
 * ligava.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const gerar = (classe: string, nivel: number) =>
  generateRandomSheet({
    nivel,
    classe,
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

/** Subida sem escolhas: só o que a classe concede automaticamente. */
const subirNivel = (sheet: ReturnType<typeof gerar>) =>
  applyManualLevelUp(sheet, {} as unknown as LevelUpSelections);

describe('Caminho do Cavaleiro', () => {
  describe('ficha gerada direto no nível', () => {
    it('Cavaleiro 5 tem um caminho definido', () => {
      expect(['Bastião', 'Montaria']).toContain(
        getCavaleiroCaminho(gerar('Cavaleiro', 5))
      );
    });

    it('Vassalo 5 recebe Montaria, determinada pela classe', () => {
      expect(getCavaleiroCaminho(gerar('Vassalo', 5))).toBe('Montaria');
    });

    it('nenhum dos dois tem caminho no 4º nível', () => {
      expect(getCavaleiroCaminho(gerar('Cavaleiro', 4))).toBeUndefined();
      expect(getCavaleiroCaminho(gerar('Vassalo', 4))).toBeUndefined();
    });
  });

  describe('subindo do 4º para o 5º', () => {
    it('Cavaleiro ganha o caminho na subida', () => {
      const nivel4 = gerar('Cavaleiro', 4);
      expect(getCavaleiroCaminho(nivel4)).toBeUndefined();

      const nivel5 = subirNivel(nivel4);

      expect(nivel5.nivel).toBe(5);
      expect(['Bastião', 'Montaria']).toContain(getCavaleiroCaminho(nivel5));
    });

    it('Vassalo ganha Montaria na subida', () => {
      const nivel5 = subirNivel(gerar('Vassalo', 4));

      expect(nivel5.nivel).toBe(5);
      expect(getCavaleiroCaminho(nivel5)).toBe('Montaria');
    });

    it('subir de novo não troca o caminho já escolhido', () => {
      const nivel5 = subirNivel(gerar('Cavaleiro', 4));
      const escolhido = getCavaleiroCaminho(nivel5);

      expect(getCavaleiroCaminho(subirNivel(nivel5))).toBe(escolhido);
    });
  });
});
