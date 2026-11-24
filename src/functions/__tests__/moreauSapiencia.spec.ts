import { describe, it, expect } from 'vitest';
import { generateEmptySheet } from '../general';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';

/**
 * Sapiência (Moreau/Herança da Coruja): "Você pode lançar uma magia de 1º
 * círculo de adivinhação a sua escolha".
 *
 * `generateEmptySheet` não preenchia `raceHeritage`, então a escolha do
 * assistente era descartada e a habilidade sorteava uma magia.
 */
describe('Moreau Coruja — Sapiência pelo assistente', () => {
  const options: SelectedOptions = {
    nivel: 1,
    raca: 'Moreau',
    classe: 'Nobre',
    origin: '',
    devocao: { label: '--', value: '--' },
    supplements: [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ],
  };

  const generate = () =>
    generateEmptySheet(
      options,
      { moreauSapienciaSpell: 'Orientação' },
      {
        moreauHeritage: 'Coruja',
        moreauBonusAttributes: [Atributo.SABEDORIA, Atributo.CARISMA],
      }
    );

  it('usa a magia escolhida, não uma sorteada', () => {
    // A rota de sorteio é aleatória: repetir torna a regressão determinística.
    for (let i = 0; i < 10; i += 1) {
      const sheet = generate();
      const adivinhacao = sheet.spells.filter(
        (s) => s.customKeyAttr === Atributo.SABEDORIA && s.school === 'Adiv'
      );
      expect(sheet.moreauSapienciaSpell).toBe('Orientação');
      expect(adivinhacao.map((s) => s.nome)).toEqual(['Orientação']);
    }
  });

  it('grava a herança na ficha (o editor depende dela)', () => {
    expect(generate().raceHeritage).toBe('Coruja');
  });
});
