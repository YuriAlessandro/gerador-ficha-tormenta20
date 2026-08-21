import { describe, it, expect } from 'vitest';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { GeneralPowerType } from '@/interfaces/Poderes';
import { updatePowerAcrossSheet } from '../updatePowerAcrossSheet';

const makeSheet = () =>
  ({
    generalPowers: [
      {
        name: 'Esquiva',
        type: GeneralPowerType.COMBATE,
        description: 'Você desvia.',
        requirements: [],
      },
    ],
    classPowers: [{ name: 'Raio Arcano', text: 'Um raio.' }],
    customPowers: [
      { id: 'uuid-1', name: 'Bênção', description: 'Homebrew A' },
      { id: 'uuid-2', name: 'Bênção', description: 'Homebrew B' },
    ],
    customGrantedPowers: [
      { id: 'uuid-3', name: 'Dádiva', description: 'Concedido' },
    ],
    origin: {
      name: 'Acólito',
      powers: [{ name: 'Esquiva', description: '', type: '' }],
    },
    raca: {
      name: 'Humano',
      abilities: [{ name: 'Versátil', description: '' }],
    },
    classe: {
      name: 'Arcanista',
      abilities: [{ name: 'Magias', text: '', nivel: 1 }],
    },
    devoto: {
      poderes: [{ name: 'Esquiva', description: '', requirements: [] }],
    },
  } as unknown as CharacterSheet);

describe('updatePowerAcrossSheet', () => {
  it('grava em TODAS as listas que contêm o poder', () => {
    const sheet = makeSheet();
    const target = sheet.generalPowers[0];

    const updated = updatePowerAcrossSheet(sheet, target, {
      customName: 'Esquiva Treinada',
    });

    expect(updated.generalPowers[0].customName).toBe('Esquiva Treinada');
    expect(updated.origin?.powers[0].customName).toBe('Esquiva Treinada');
    expect(updated.devoto?.poderes[0].customName).toBe('Esquiva Treinada');
    // Poderes de outro nome ficam intactos.
    expect(updated.classPowers?.[0].customName).toBeUndefined();
  });

  it('poder personalizado casa por id, não por nome', () => {
    const sheet = makeSheet();
    const target = sheet.customPowers?.[1];

    const updated = updatePowerAcrossSheet(sheet, target!, {
      customDescription: 'só o segundo',
    });

    expect(updated.customPowers?.[0].customDescription).toBeUndefined();
    expect(updated.customPowers?.[1].customDescription).toBe('só o segundo');
  });

  it('alcança customGrantedPowers (o handler de rolagens antigo esquecia)', () => {
    const sheet = makeSheet();
    const target = sheet.customGrantedPowers?.[0];

    const updated = updatePowerAcrossSheet(sheet, target!, {
      rolls: [{ label: 'Dano', dice: '2d6' }],
    });

    expect(updated.customGrantedPowers?.[0].rolls).toHaveLength(1);
  });

  it('undefined limpa o override', () => {
    const sheet = makeSheet();
    sheet.generalPowers[0].customName = 'Antigo';

    const updated = updatePowerAcrossSheet(sheet, sheet.generalPowers[0], {
      customName: undefined,
    });

    expect(updated.generalPowers[0].customName).toBeUndefined();
  });

  it('não encosta nos sheetBonuses do poder personalizado', () => {
    // `applyPowerPatch` (Result.tsx) grava direto na ficha, SEM recalcular —
    // os campos daqui são cosméticos. `sheetBonuses` não é: se um dia entrar no
    // `PowerUserPatch`, o caller tem que passar a chamar `recalculateSheet`.
    const sheet = makeSheet();
    const bonuses = [
      {
        source: { type: 'power', name: 'Bênção' },
        target: { type: 'PV' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ];
    sheet.customPowers![0].sheetBonuses =
      bonuses as unknown as CharacterSheet['sheetBonuses'];

    const updated = updatePowerAcrossSheet(sheet, sheet.customPowers![0], {
      customName: 'Apelido',
    });

    expect(updated.customPowers?.[0].sheetBonuses).toEqual(bonuses);
  });

  it('não quebra quando as listas opcionais não existem', () => {
    const sheet = {
      generalPowers: [
        {
          name: 'Esquiva',
          type: GeneralPowerType.COMBATE,
          description: '',
          requirements: [],
        },
      ],
    } as unknown as CharacterSheet;

    const updated = updatePowerAcrossSheet(sheet, sheet.generalPowers[0], {
      customName: 'X',
    });

    expect(updated.generalPowers[0].customName).toBe('X');
    expect(updated.classPowers).toBeUndefined();
  });
});
