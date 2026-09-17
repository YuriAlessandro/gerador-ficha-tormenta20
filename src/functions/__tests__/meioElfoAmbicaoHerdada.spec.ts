/**
 * Ambição Herdada (Meio-Elfo) concede um poder geral OU um poder único de
 * origem. Quando é um poder de origem, ele passa a morar em `origin.powers` —
 * lista que `applyPowerGetters` aplica ANTES das habilidades de raça em todo
 * recálculo. Aplicar os efeitos de novo dentro da habilidade duplicaria os
 * `sheetBonuses` (o caso que apareceu: +3 PM do Coração Heroico contado duas
 * vezes no nível 1).
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import originPowers from '../../data/systems/tormenta20/powers/originPowers';
import { OriginPower } from '../../interfaces/Poderes';
import MEIO_ELFO from '../../data/systems/tormenta20/herois-de-arton/races/meioElfo';
import CharacterSheet from '../../interfaces/CharacterSheet';

function makeMeioElfoSheet(originPowersList: OriginPower[]): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 1;
  sheet.generalPowers = [];
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.raca = MEIO_ELFO;
  sheet.origin = { name: 'Herói Camponês', powers: originPowersList };
  return sheet;
}

/**
 * Baseline sem Ambição Herdada. `cleared` é obrigatório: sem ele a habilidade
 * cai no caminho aleatório e sorteia um poder (que pode dar PM), tornando o
 * PM de referência não determinístico.
 */
function baselinePM(): number {
  const sheet = makeMeioElfoSheet([]);
  sheet.meioElfoAmbicaoType = 'cleared';
  return recalculateSheet(sheet).pm;
}

const CORACAO_HEROICO = originPowers.CORACAO_HEROICO as unknown as OriginPower;

describe('Ambição Herdada (Meio-Elfo) com poder de origem', () => {
  it('Coração Heroico soma +3 PM uma única vez no nível 1', () => {
    const basePM = baselinePM();

    const sheet = makeMeioElfoSheet([CORACAO_HEROICO]);
    sheet.meioElfoAmbicaoType = 'originPower';
    sheet.meioElfoAmbicaoPower = 'Coração Heroico';

    const result = recalculateSheet(sheet);

    expect(result.pm).toBe(basePM + 3);
    expect(
      result.sheetBonuses.filter(
        (bonus) =>
          bonus.target.type === 'PM' &&
          bonus.source.type === 'power' &&
          bonus.source.name === 'Coração Heroico'
      )
    ).toHaveLength(1);
  });

  it('sem origem na ficha o bônus ainda é aplicado uma vez', () => {
    // Sem `sheet.origin` o poder não tem onde ser guardado, então
    // `applyPowerGetters` não o aplica e a habilidade precisa aplicar sozinha.
    // Este era o caminho que já funcionava antes da correção — o teste existe
    // para garantir que ela não o quebrou.
    const baseline = makeMeioElfoSheet([]);
    delete baseline.origin;
    baseline.meioElfoAmbicaoType = 'cleared';
    const basePM = recalculateSheet(baseline).pm;

    const sheet = makeMeioElfoSheet([]);
    delete sheet.origin;
    sheet.meioElfoAmbicaoType = 'originPower';
    sheet.meioElfoAmbicaoPower = 'Coração Heroico';

    const result = recalculateSheet(sheet);

    expect(result.pm).toBe(basePM + 3);
  });

  it('recálculos sucessivos não acumulam o bônus', () => {
    const basePM = baselinePM();

    const sheet = makeMeioElfoSheet([CORACAO_HEROICO]);
    sheet.meioElfoAmbicaoType = 'originPower';
    sheet.meioElfoAmbicaoPower = 'Coração Heroico';

    const result = recalculateSheet(recalculateSheet(recalculateSheet(sheet)));

    expect(result.pm).toBe(basePM + 3);
  });
});
