import { cloneDeep } from 'lodash';
import { describe, test, expect } from 'vitest';
import generateRandomSheet from '../../../../../../functions/general';
import { recalculateSheet } from '../../../../../../functions/recalculateSheet';
import { normalizeSheet } from '../../../../../../functions/sheetNormalizer';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../../../interfaces/CharacterSheet';
import Equipment from '../../../../../../interfaces/Equipment';
import { SupplementId } from '../../../../../../types/supplement.types';
import { RACE_SIZES } from '../../../races/raceSizes/raceSizes';
import CERATOPS from '../ceratops';
import CENTAURO from '../centauro';

/**
 * Ceratops (Chifres) e Centauro (Cascos): "dano 1d8" (Ameaças de Arton, p. 105
 * e Ceratops). O livro imprime o valor já para o tamanho Grande; o passo de
 * dano por tamanho do recálculo (Step 11.7) somava +1 em cima e a arma saía
 * 1d10.
 */
const CASES = [
  { race: 'Ceratops', weapon: 'Chifres', data: CERATOPS },
  { race: 'Centauro', weapon: 'Cascos', data: CENTAURO },
] as const;

const findWeapon = (sheet: CharacterSheet, name: string) =>
  sheet.bag.equipments.Arma.find((weapon) => weapon.nome === name);

const savedSheet = (
  race: (typeof CASES)[number],
  weapon: Partial<Equipment>
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.raca = cloneDeep(race.data);
  sheet.size = RACE_SIZES.GRANDE;
  sheet.bag.equipments.Arma = [
    {
      group: 'Arma',
      nome: race.weapon,
      critico: 'x2',
      preco: 0,
      weaponTags: ['natural'],
      ...weapon,
    } as Equipment,
  ];
  return sheet;
};

describe.each(CASES)('$race: $weapon com o dano do livro', (race) => {
  test('ficha aleatória nova sai com 1d8', () => {
    const sheet = generateRandomSheet({
      nivel: 1,
      raca: race.race,
      classe: 'Guerreiro',
      origin: '',
      devocao: { label: '--', value: '--' },
      supplements: [
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_AMEACAS_ARTON,
      ],
    });

    expect(findWeapon(sheet, race.weapon)?.dano).toBe('1d8');
    // E continua 1d8 em edições futuras.
    const again = recalculateSheet(cloneDeep(sheet));
    expect(findWeapon(again, race.weapon)?.dano).toBe('1d8');
  });

  test('ficha salva já recalculada (base 1d8, exibindo 1d10) abre com 1d8', () => {
    const sheet = savedSheet(race, { baseDano: '1d8', dano: '1d10+2' });
    normalizeSheet(sheet);

    const weapon = findWeapon(sheet, race.weapon);
    expect(weapon?.baseDano).toBe('1d6');
    // O "+2" bakeado por outro bônus é preservado.
    expect(weapon?.dano).toBe('1d8+2');

    const recalculated = recalculateSheet(sheet);
    expect(findWeapon(recalculated, race.weapon)?.dano).toMatch(/^1d8/);
  });

  test('ficha salva nunca recalculada (1d8 sem base) segue 1d8 depois de editar', () => {
    const sheet = savedSheet(race, { dano: '1d8' });
    normalizeSheet(sheet);

    expect(findWeapon(sheet, race.weapon)?.dano).toBe('1d8');
    const recalculated = recalculateSheet(sheet);
    expect(findWeapon(recalculated, race.weapon)?.dano).toBe('1d8');
  });

  test('a cura é idempotente e respeita edição manual', () => {
    const sheet = savedSheet(race, { baseDano: '1d8', dano: '1d10' });
    normalizeSheet(sheet);
    normalizeSheet(sheet);
    expect(findWeapon(sheet, race.weapon)?.dano).toBe('1d8');

    const manual = savedSheet(race, {
      baseDano: '1d8',
      dano: '1d10',
      hasManualEdits: true,
    });
    normalizeSheet(manual);
    expect(findWeapon(manual, race.weapon)?.dano).toBe('1d10');
  });
});

test('arma de mesmo nome em outra raça não é tocada', () => {
  const sheet = createMockCharacterSheet();
  sheet.bag.equipments.Arma = [
    { group: 'Arma', nome: 'Chifres', dano: '1d8', baseDano: '1d8' },
  ];
  normalizeSheet(sheet);
  expect(sheet.bag.equipments.Arma[0].dano).toBe('1d8');
  expect(sheet.bag.equipments.Arma[0].baseDano).toBe('1d8');
});
