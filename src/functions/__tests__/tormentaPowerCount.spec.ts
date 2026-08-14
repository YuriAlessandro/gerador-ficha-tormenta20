/**
 * Testes da contagem de poderes da Tormenta e da perda de atributo que ela
 * causa.
 *
 * Três invariantes carregam o resto:
 *  - `countTormentaPowers` é o ponto único de "quantos poderes da Tormenta esta
 *    ficha tem", e enxerga a flag `countAsTormentaPower` em QUALQUER balde de
 *    poder — não só nos poderes gerais do tipo TORMENTA.
 *  - A perda de Carisma é idempotente: `recalculateSheet` não rebaseia
 *    `atributos`, então rodar o recálculo N vezes tem que descontar uma vez só.
 *  - As fórmulas `TormentaPowersCalc` valem nos DOIS motores de derivação.
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { countTormentaPowers } from '../randomUtils';
import { isPowerAvailable } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CustomPower } from '../../interfaces/CustomPower';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';

const { ANTENAS } = tormentaPowers;

/** Poder no molde do "Escolhido de Aharadak": conta, mas não é do tipo. */
const escolhidoDeAharadak = (
  overrides: Partial<CustomPower> = {}
): CustomPower => ({
  id: 'aharadak-1',
  name: 'Escolhido de Aharadak',
  description: 'Poder da origem Escolhido dos Deuses.',
  countAsTormentaPower: true,
  ...overrides,
});

const carisma = (sheet: CharacterSheet) =>
  sheet.atributos[Atributo.CARISMA].value;

const iniciativaOthers = (sheet: CharacterSheet) =>
  sheet.completeSkills?.find((s) => s.name === Skill.INICIATIVA)?.others ?? 0;

describe('countTormentaPowers', () => {
  it('conta poderes gerais do tipo TORMENTA', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];

    expect(countTormentaPowers(sheet)).toBe(1);
  });

  it('conta poder personalizado marcado com countAsTormentaPower', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [escolhidoDeAharadak()];

    expect(countTormentaPowers(sheet)).toBe(1);
  });

  it('conta a flag em poder de origem, de classe e concedido', () => {
    const sheet = createMockCharacterSheet();
    sheet.origin = {
      name: 'Escolhido dos Deuses',
      powers: [
        {
          name: 'Marca de Aharadak',
          description: 'Poder de origem.',
          type: 'origem',
          countAsTormentaPower: true,
        },
      ],
    };
    sheet.classPowers = [
      { name: 'Corrupção Rubra', text: 'x', countAsTormentaPower: true },
    ];

    expect(countTormentaPowers(sheet)).toBe(2);
  });

  it('não conta duas vezes o mesmo poder presente em dois baldes', () => {
    const sheet = createMockCharacterSheet();
    const power = escolhidoDeAharadak();
    sheet.customPowers = [power];
    sheet.customGrantedPowers = [{ ...power }];

    expect(countTormentaPowers(sheet)).toBe(1);
  });

  it('ignora poder com tormentaCountExcludesCharisma só na conta de Carisma', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    sheet.classPowers = [
      {
        name: 'Forma Aberrante',
        text: 'Conta como poder da Tormenta (exceto para perda de Carisma).',
        countAsTormentaPower: true,
        tormentaCountExcludesCharisma: true,
      },
    ];

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(1);
  });

  it('ignora a flag deprecated de perícia (carimbada errado por addOtherBonusToSkill)', () => {
    const sheet = createMockCharacterSheet();
    sheet.completeSkills = [
      { name: Skill.PERCEPCAO, others: 2, countAsTormentaPower: true },
    ];

    expect(countTormentaPowers(sheet)).toBe(0);
  });
});

describe('requisito PODER_TORMENTA', () => {
  const exigeUmOutro: GeneralPower = {
    name: 'Armamento Aberrante (teste)',
    description: 'Pré-requisito: outro poder da Tormenta.',
    type: GeneralPowerType.TORMENTA,
    requirements: [[{ type: RequirementType.PODER_TORMENTA, value: 1 }]],
  };

  it('é satisfeito por um poder marcado com countAsTormentaPower', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    expect(isPowerAvailable(sheet, exigeUmOutro)).toBe(false);

    sheet.customPowers = [escolhidoDeAharadak()];
    expect(isPowerAvailable(sheet, exigeUmOutro)).toBe(true);
  });
});

describe('TormentaPowersCalc no motor de recálculo', () => {
  it('escala o bônus de Antenas conforme o total de poderes da Tormenta', () => {
    const soAntenas = createMockCharacterSheet();
    soAntenas.generalPowers = [ANTENAS];
    // 1 poder: floor((1 - 1) / 2) + 1 = +1
    expect(iniciativaOthers(recalculateSheet(soAntenas))).toBe(1);

    const comAharadak = createMockCharacterSheet();
    comAharadak.generalPowers = [ANTENAS];
    comAharadak.customPowers = [
      escolhidoDeAharadak(),
      escolhidoDeAharadak({ id: 'aharadak-2', name: 'Marca Rubra' }),
    ];
    // 3 poderes: floor((3 - 1) / 2) + 1 = +2
    expect(iniciativaOthers(recalculateSheet(comAharadak))).toBe(2);
  });
});

describe('perda de atributo por poderes da Tormenta', () => {
  it('desconta Carisma no caminho de edição/assistente', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [ANTENAS];

    expect(carisma(recalculateSheet(sheet))).toBe(antes - 1);
  });

  it('é idempotente: recalcular várias vezes desconta uma vez só', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [ANTENAS];

    const resultado = recalculateSheet(
      recalculateSheet(recalculateSheet(sheet))
    );

    expect(carisma(resultado)).toBe(antes - 1);
  });

  it('cresce +1 a cada dois poderes da Tormenta', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [ANTENAS];
    sheet.customPowers = [
      escolhidoDeAharadak(),
      escolhidoDeAharadak({ id: 'aharadak-2', name: 'Marca Rubra' }),
    ];

    // 3 poderes: floor((3 + 1) / 2) = 2
    expect(carisma(recalculateSheet(sheet))).toBe(antes - 2);
  });

  it('devolve o atributo quando o poder é removido', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [ANTENAS];

    const comPoder = recalculateSheet(sheet);
    expect(carisma(comPoder)).toBe(antes - 1);

    comPoder.generalPowers = [];
    expect(carisma(recalculateSheet(comPoder))).toBe(antes);
  });

  it('não desconta de quem tem tormentaCountExcludesCharisma', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.classPowers = [
      {
        name: 'Forma Aberrante',
        text: 'Conta como poder da Tormenta (exceto para perda de Carisma).',
        countAsTormentaPower: true,
        tormentaCountExcludesCharisma: true,
      },
    ];

    expect(carisma(recalculateSheet(sheet))).toBe(antes);
  });

  it('Linhagem Rubra drena o maior atributo que não seja Carisma', () => {
    const sheet = createMockCharacterSheet();
    const carismaAntes = carisma(sheet);
    const forcaAntes = sheet.atributos[Atributo.FORCA].value;
    sheet.classe = {
      ...sheet.classe,
      abilities: [{ name: 'Linhagem Rubra', text: 'x', nivel: 1 }],
    };
    sheet.generalPowers = [ANTENAS];

    const resultado = recalculateSheet(sheet);

    expect(carisma(resultado)).toBe(carismaAntes);
    expect(resultado.atributos[Atributo.FORCA].value).toBe(forcaAntes - 1);
  });

  it('não redesconta em ficha antiga que já trazia a penalidade no passo-a-passo', () => {
    // Ficha gerada pelo motor aleatório ANTES do ledger existir: o Carisma já
    // vem descontado e o único registro disso é o SubStep da criação.
    const sheet = createMockCharacterSheet();
    const base = carisma(sheet);
    sheet.generalPowers = [ANTENAS];
    sheet.atributos[Atributo.CARISMA].value = base - 1;
    sheet.steps = [
      {
        type: 'Poderes',
        label: 'Poderes Gerais',
        value: [{ name: 'Carisma', value: '-1 por 1 poderes da Tormenta' }],
      },
    ];
    expect(sheet.tormentaAttributePenalties).toBeUndefined();

    expect(carisma(recalculateSheet(sheet))).toBe(base - 1);
  });
});
