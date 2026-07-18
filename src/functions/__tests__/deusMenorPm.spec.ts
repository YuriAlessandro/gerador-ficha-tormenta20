import { recalculateSheet } from '../recalculateSheet';
import { getDeusMenorPmBonus } from '../powers/general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Divindade from '../../interfaces/Divindade';
import DEUSES_MENORES_DIVINDADES from '../../data/systems/tormenta20/deuses-menores/divindades';
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';

/**
 * Regra do Guia de Deuses Menores: um deus menor concede um único poder. Para
 * classes divinas que receberiam DOIS poderes concedidos, o segundo é trocado
 * por PM extras iguais a 1 + status divino, limitados pelo nível do personagem.
 */
describe('PM extras de deus menor', () => {
  const findDeity = (name: string): Divindade => {
    const deity = DEUSES_MENORES_DIVINDADES.find((d) => d.name === name);
    if (!deity) throw new Error(`Divindade de teste não encontrada: ${name}`);
    return deity;
  };

  // Sckhar tem status divino 5 (o mais alto), Toris tem 1 (o mais baixo).
  const SCKHAR = findDeity('Sckhar');
  const TORIS = findDeity('Toris');

  const buildSheet = (
    divindade: Divindade,
    nivel: number,
    qtdPoderesConcedidos: CharacterSheet['classe']['qtdPoderesConcedidos'] = 2
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe.qtdPoderesConcedidos = qtdPoderesConcedidos;
    sheet.devoto = { divindade, poderes: [...divindade.poderes] };
    return sheet;
  };

  it('concede 1 + status divino a classes de dois poderes concedidos', () => {
    expect(getDeusMenorPmBonus(buildSheet(SCKHAR, 10))).toBe(6);
    expect(getDeusMenorPmBonus(buildSheet(TORIS, 10))).toBe(2);
  });

  it('limita o bônus pelo nível do personagem', () => {
    // Sckhar daria 6, mas um personagem de nível 3 recebe no máximo 3.
    expect(getDeusMenorPmBonus(buildSheet(SCKHAR, 3))).toBe(3);
    // Abaixo do teto, o nível não interfere.
    expect(getDeusMenorPmBonus(buildSheet(SCKHAR, 20))).toBe(6);
  });

  it('não se aplica a classes que não perdem o segundo poder', () => {
    // Clérigo recebe 'all' — não perde nada, então não há o que compensar.
    expect(getDeusMenorPmBonus(buildSheet(SCKHAR, 10, 'all'))).toBe(0);
    expect(getDeusMenorPmBonus(buildSheet(SCKHAR, 10, 1))).toBe(0);
  });

  it('não se aplica a deuses maiores', () => {
    const sheet = buildSheet(SCKHAR, 10);
    sheet.devoto = {
      divindade: DivindadeEnum.KHALMYR,
      poderes: [],
    };
    expect(getDeusMenorPmBonus(sheet)).toBe(0);
  });

  it('não se aplica a quem não é devoto', () => {
    const sheet = buildSheet(SCKHAR, 10);
    sheet.devoto = undefined;
    expect(getDeusMenorPmBonus(sheet)).toBe(0);
  });

  it('chega ao total de PM da ficha e não acumula ao recalcular', () => {
    const sheet = buildSheet(SCKHAR, 10);
    const semDeusMenor = recalculateSheet({
      ...buildSheet(SCKHAR, 10),
      devoto: { divindade: DivindadeEnum.KHALMYR, poderes: [] },
    });

    const primeira = recalculateSheet(sheet);
    expect(primeira.pm - semDeusMenor.pm).toBe(6);

    // Recalcular de novo não pode somar o bônus outra vez.
    const segunda = recalculateSheet(primeira);
    expect(segunda.pm).toBe(primeira.pm);
  });
});
