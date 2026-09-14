import { describe, expect, it } from 'vitest';
import generateRandomSheet, { applyManualLevelUp } from '@/functions/general';
import SelectOptions from '@/interfaces/SelectedOptions';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { SupplementId } from '@/types/supplement.types';

/**
 * O Caminho do Cavaleiro (5º nível) precisa ser resolvido nos DOIS fluxos que
 * aplicam habilidades novas: o sorteio de `levelUp` (ficha gerada já num
 * nível) e o `applyManualLevelUp` (assistente de subida de nível).
 *
 * O bloco original vivia num terceiro laço, que filtra `classe.abilities` por
 * nível — e por isso nunca rodava. O campo ficava sempre indefinido e a RD do
 * Bastião, já implementada, nunca ligava.
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
        gerar('Cavaleiro', 5).cavaleiroCaminho
      );
    });

    it('Vassalo 5 recebe Montaria, determinada pela classe', () => {
      expect(gerar('Vassalo', 5).cavaleiroCaminho).toBe('Montaria');
    });

    it('nenhum dos dois tem caminho no 4º nível', () => {
      expect(gerar('Cavaleiro', 4).cavaleiroCaminho).toBeUndefined();
      expect(gerar('Vassalo', 4).cavaleiroCaminho).toBeUndefined();
    });
  });

  describe('subindo do 4º para o 5º', () => {
    it('Cavaleiro ganha o caminho na subida', () => {
      const nivel4 = gerar('Cavaleiro', 4);
      expect(nivel4.cavaleiroCaminho).toBeUndefined();

      const nivel5 = subirNivel(nivel4);

      expect(nivel5.nivel).toBe(5);
      expect(['Bastião', 'Montaria']).toContain(nivel5.cavaleiroCaminho);
    });

    it('Vassalo ganha Montaria na subida', () => {
      const nivel5 = subirNivel(gerar('Vassalo', 4));

      expect(nivel5.nivel).toBe(5);
      expect(nivel5.cavaleiroCaminho).toBe('Montaria');
    });

    it('subir de novo não troca o caminho já escolhido', () => {
      const nivel5 = subirNivel(gerar('Cavaleiro', 4));
      const escolhido = nivel5.cavaleiroCaminho;

      expect(subirNivel(nivel5).cavaleiroCaminho).toBe(escolhido);
    });
  });
});
