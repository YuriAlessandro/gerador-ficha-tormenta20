import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { SupplementId } from '../../types/supplement.types';

/**
 * Regressão: `generateRandomSheet` termina em `applyStatModifiers`, que não tem
 * ramo para alvos de arma — logo os bônus `WeaponDamage` de habilidades nunca
 * eram bakeados na string `dano`. Ficha pelo wizard ou com level-up funcionava;
 * ficha aleatória não. Sintoma relatado: Bárbaro 3+ aleatório sem o +1 de
 * Instinto Selvagem no dano (Percepção e Reflexos vinham certos).
 */
describe('Geração aleatória: bônus de arma bakeados no dano', () => {
  const gerar = (classe: string, nivel: number): CharacterSheet =>
    generateRandomSheet({
      nivel,
      raca: 'Humano',
      classe,
      origin: '',
      devocao: { label: '', value: '' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });

  /** Bônus fixo somado ao final da string de dano ("1d8+3" → 3). */
  const flatBonusOf = (dano?: string): number => {
    const match = /([+-]\d+)\s*$/.exec(dano ?? '');
    return match ? parseInt(match[1], 10) : 0;
  };

  const autoWeaponsOf = (sheet: CharacterSheet) =>
    sheet.bag.equipments.Arma.filter((w) => !w.hasManualEdits && w.dano);

  it.each([
    [3, 1],
    [9, 2],
  ])(
    'Bárbaro nível %i: toda arma recebe +%i de Instinto Selvagem',
    (nivel, esperado) => {
      const sheet = gerar('Bárbaro', nivel as number);
      const armas = autoWeaponsOf(sheet);
      expect(armas.length).toBeGreaterThan(0);
      armas.forEach((arma) => {
        expect(flatBonusOf(arma.dano)).toBe(esperado);
      });
    }
  );

  it('Bárbaro nível 2: habilidade ainda não existe, nenhum bônus somado', () => {
    const sheet = gerar('Bárbaro', 2);
    autoWeaponsOf(sheet).forEach((arma) => {
      expect(flatBonusOf(arma.dano)).toBe(0);
    });
  });

  it('Guerreiro nível 3: o novo passo não aplica bônus de outra classe', () => {
    const sheet = gerar('Guerreiro', 3);
    autoWeaponsOf(sheet).forEach((arma) => {
      expect(flatBonusOf(arma.dano)).toBe(0);
    });
  });

  it('ficha aleatória e recalculada concordam no dano', () => {
    // O invariante de verdade: os dois caminhos de derivação (geração aleatória
    // e recalculateSheet) não podem divergir.
    const sheet = gerar('Bárbaro', 9);
    const recalculada = recalculateSheet(sheet);

    const antes = sheet.bag.equipments.Arma.map((w) => `${w.nome}:${w.dano}`);
    const depois = recalculada.bag.equipments.Arma.map(
      (w) => `${w.nome}:${w.dano}`
    );
    expect(depois).toEqual(antes);
  });
});
