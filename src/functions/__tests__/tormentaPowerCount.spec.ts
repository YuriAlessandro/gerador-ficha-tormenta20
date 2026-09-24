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
import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import generateRandomSheet from '../general';
import { countTormentaPowers, listTormentaPowers } from '../randomUtils';
import { sheetHasPowerNamed } from '../powers/hasPowerNamed';
import {
  getCharismaPenaltyPowerCount,
  needsTormentaPenaltyBackfill,
} from '../tormentaCharismaPenalty';
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
import { SupplementId } from '../../types/supplement.types';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';
import heroisDeArtonTormentaPowers from '../../data/systems/tormenta20/herois-de-arton/powers/tormentaPowers';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import {
  COURACA_RUBEA_POWER,
  DISFORME_POWER,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/kaijin';

const {
  ANTENAS,
  CARAPACA,
  MAOS_MEMBRANOSAS,
  ARTICULACOES_FLEXIVEIS,
  PELE_CORROMPIDA,
  EMPUNHADURA_RUBRA,
  ASAS_INSETOIDES,
} = tormentaPowers;
const { CARAPACA_CORROMPIDA, BOLSOES_INSANOS, REPULSIVO } =
  heroisDeArtonTormentaPowers;

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

/**
 * `listTormentaPowers` é a varredura; `countTormentaPowers` é o `length` dela
 * (mais as perícias da Deformidade do Lefou). Os dois não podem divergir — a
 * interface mostra a LISTA para explicar o NÚMERO.
 */
describe('listTormentaPowers', () => {
  it('bate com a contagem e diz de onde cada poder veio', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    sheet.customPowers = [escolhidoDeAharadak()];
    sheet.classPowers = [
      { name: 'Corrupção Rubra', text: 'x', countAsTormentaPower: true },
    ];

    const entries = listTormentaPowers(sheet);
    expect(entries).toHaveLength(countTormentaPowers(sheet));
    expect(entries).toEqual([
      { name: 'Antenas', origin: 'poder geral' },
      { name: 'Escolhido de Aharadak', origin: 'poder personalizado' },
      { name: 'Corrupção Rubra', origin: 'poder de classe' },
    ]);
  });

  it('honra a ressalva de Carisma como a contagem', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    sheet.classPowers = [
      {
        name: 'Forma Aberrante',
        text: 'x',
        countAsTormentaPower: true,
        tormentaCountExcludesCharisma: true,
      },
    ];

    expect(listTormentaPowers(sheet)).toHaveLength(2);
    expect(
      listTormentaPowers(sheet, { forCharismaPenalty: true })
    ).toHaveLength(1);
  });

  it('não inclui as perícias da Deformidade (não são poder)', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    sheet.lefouDeformidadeSkills = [Skill.PERCEPCAO, Skill.FURTIVIDADE];

    expect(listTormentaPowers(sheet)).toHaveLength(1);
    expect(countTormentaPowers(sheet)).toBe(3);
  });
});

describe('getCharismaPenaltyPowerCount', () => {
  it('desconta o primeiro poder quando há Afinidade com a Tormenta', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS, CARAPACA];
    expect(getCharismaPenaltyPowerCount(sheet)).toBe(2);

    sheet.devoto = {
      divindade: { name: 'Aharadak' },
      poderes: [{ name: 'Afinidade com a Tormenta', description: 'x' }],
    } as unknown as CharacterSheet['devoto'];
    expect(getCharismaPenaltyPowerCount(sheet)).toBe(1);
  });
});

/**
 * O relato do usuário ("não desconta automático") vem daqui: abrir uma ficha
 * não dispara recálculo, então personagem criado antes da v4.30 fica sem o
 * desconto até editar alguma coisa.
 */
describe('needsTormentaPenaltyBackfill', () => {
  it('é true só para ficha com poder da Tormenta e sem ledger', () => {
    const semPoder = createMockCharacterSheet();
    expect(needsTormentaPenaltyBackfill(semPoder)).toBe(false);

    const comPoder = createMockCharacterSheet();
    comPoder.generalPowers = [ANTENAS];
    expect(needsTormentaPenaltyBackfill(comPoder)).toBe(true);
  });

  it('nunca mais dispara depois do primeiro recálculo', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS];
    const recalculado = recalculateSheet(sheet);

    expect(needsTormentaPenaltyBackfill(recalculado)).toBe(false);
    // E o desconto de verdade aconteceu uma vez só.
    expect(carisma(recalculado)).toBe(carisma(sheet) - 1);
    expect(carisma(recalculateSheet(recalculado))).toBe(carisma(recalculado));
  });

  it('também para de disparar quando o ledger fica vazio', () => {
    // Ficha que TEVE poder da Tormenta e não tem mais: o ledger existe vazio.
    const sheet = recalculateSheet(createMockCharacterSheet());
    expect(sheet.tormentaAttributePenalties).toEqual({});
    expect(needsTormentaPenaltyBackfill(sheet)).toBe(false);
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

/**
 * "Você recebe +2 em duas perícias a sua escolha. CADA UM desses bônus conta
 * como um poder da Tormenta. Você pode trocar um desses bônus por um poder da
 * Tormenta a sua escolha. Esta habilidade NÃO CAUSA PERDA DE CARISMA."
 *
 * A ressalva não vem do objeto do poder (o trocado entra em `generalPowers`
 * como TORMENTA puro), vem dos campos `lefouDeformidade*` que a ficha persiste
 * — é o que faz a correção alcançar fichas antigas sem passar pelo
 * `sheetNormalizer`.
 */
describe('Deformidade do Lefou', () => {
  it('duas perícias contam 2 na escala e 0 no Carisma', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.lefouDeformidadeSkills = [Skill.LUTA, Skill.PERCEPCAO];

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
    expect(carisma(recalculateSheet(sheet))).toBe(antes);
  });

  it('uma perícia + o poder trocado também contam 2 na escala e 0 no Carisma', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.lefouDeformidadeSkills = [Skill.LUTA];
    sheet.lefouDeformidadePower = CARAPACA.name;
    sheet.generalPowers = [CARAPACA];

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
    expect(carisma(recalculateSheet(sheet))).toBe(antes);
  });

  it('poderes escolhidos pelo jogador continuam descontando Carisma', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.lefouDeformidadeSkills = [Skill.LUTA];
    sheet.lefouDeformidadePower = CARAPACA.name;
    sheet.generalPowers = [CARAPACA, ANTENAS, MAOS_MEMBRANOSAS];

    // Escala vê 4 (2 da Deformidade + 2 escolhidos); Carisma vê só os 2
    // escolhidos → floor((2 + 1) / 2) = 1.
    expect(countTormentaPowers(sheet)).toBe(4);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(2);
    expect(carisma(recalculateSheet(sheet))).toBe(antes - 1);
  });
});

describe('Afinidade com a Tormenta (concedido de Aharadak)', () => {
  const { AFINIDADE_COM_A_TORMENTA } = GRANTED_POWERS;

  it('isenta o primeiro poder da Tormenta, mesmo vivendo só em devoto.poderes', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [ANTENAS];
    sheet.devoto = {
      divindade: { name: 'Aharadak', poderes: [] },
      poderes: [AFINIDADE_COM_A_TORMENTA],
    };

    expect(carisma(recalculateSheet(sheet))).toBe(antes);
  });

  it('com 3 poderes desconta como se fossem 2', () => {
    const semAfinidade = createMockCharacterSheet();
    const antes = carisma(semAfinidade);
    semAfinidade.generalPowers = [ANTENAS, CARAPACA, MAOS_MEMBRANOSAS];
    // floor((3 + 1) / 2) = 2
    expect(carisma(recalculateSheet(semAfinidade))).toBe(antes - 2);

    const comAfinidade = createMockCharacterSheet();
    comAfinidade.generalPowers = [
      ANTENAS,
      CARAPACA,
      MAOS_MEMBRANOSAS,
      AFINIDADE_COM_A_TORMENTA,
    ];
    // floor((2 + 1) / 2) = 1 — e o próprio concedido não é do tipo TORMENTA.
    expect(carisma(recalculateSheet(comAfinidade))).toBe(antes - 1);
  });

  it('continua idempotente somada à Deformidade do Lefou', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.lefouDeformidadeSkills = [Skill.LUTA];
    sheet.lefouDeformidadePower = CARAPACA.name;
    sheet.generalPowers = [CARAPACA, ANTENAS, MAOS_MEMBRANOSAS];
    sheet.devoto = {
      divindade: { name: 'Aharadak', poderes: [] },
      poderes: [AFINIDADE_COM_A_TORMENTA],
    };

    // Carisma vê 2 escolhidos, menos 1 da Afinidade → floor((1 + 1) / 2) = 1.
    const resultado = recalculateSheet(
      recalculateSheet(recalculateSheet(sheet))
    );

    expect(carisma(resultado)).toBe(antes - 1);
  });
});

describe('poderes falsos do Kaijin', () => {
  it('contam na escala mas não na perda de Carisma', () => {
    const sheet = createMockCharacterSheet();
    const antes = carisma(sheet);
    sheet.generalPowers = [COURACA_RUBEA_POWER, DISFORME_POWER];

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
    expect(carisma(recalculateSheet(sheet))).toBe(antes);
  });
});

/**
 * As duas RDs eram hardcoded POR NOME nos dois motores de derivação; viraram
 * `sheetBonuses` com alvo `DamageReduction`. Os números têm que continuar os
 * mesmos do livro.
 */
describe('RD escalável dos poderes da Tormenta', () => {
  it('Carapaça Corrompida: RD 1, +1 a cada dois outros poderes', () => {
    const sozinha = createMockCharacterSheet();
    sozinha.generalPowers = [CARAPACA, CARAPACA_CORROMPIDA];
    // 2 poderes: 1 + floor(1 / 2) = 1
    expect(recalculateSheet(sozinha).reducaoDeDano?.Geral).toBe(1);

    const acompanhada = createMockCharacterSheet();
    acompanhada.generalPowers = [
      CARAPACA,
      CARAPACA_CORROMPIDA,
      ANTENAS,
      MAOS_MEMBRANOSAS,
      ARTICULACOES_FLEXIVEIS,
    ];
    // 5 poderes: 1 + floor(4 / 2) = 3
    expect(recalculateSheet(acompanhada).reducaoDeDano?.Geral).toBe(3);
  });

  it('Pele Corrompida: RD 2 nos seis tipos elementais, +2 a cada dois outros', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [PELE_CORROMPIDA, ANTENAS, MAOS_MEMBRANOSAS];
    // 3 poderes: 2 + 2 * floor(2 / 2) = 4
    const rd = recalculateSheet(sheet).reducaoDeDano;

    ['Ácido', 'Eletricidade', 'Fogo', 'Frio', 'Luz', 'Trevas'].forEach(
      (tipo) => {
        expect(rd?.[tipo as keyof typeof rd]).toBe(4);
      }
    );
    expect(rd?.Geral).toBeUndefined();
  });
});

/**
 * Regressão da ficha real que originou esta correção: Lefou nível 10, Guerreiro,
 * devoto de Aharadak, Deformidade trocada por Carapaça + 1 perícia, e mais 8
 * poderes da Tormenta escolhidos nos level-ups.
 *
 * Na v4.29 essa ficha saía com TODOS os bônus escaláveis em zero e o Carisma
 * intacto. As asserções são derivadas da regra, não copiadas da ficha.
 */
describe('Lefou nível 10 com 8 poderes da Tormenta escolhidos', () => {
  const montar = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 10;
    sheet.generalPowers = [
      CARAPACA, // recebida pela Deformidade
      EMPUNHADURA_RUBRA,
      ANTENAS,
      ARTICULACOES_FLEXIVEIS,
      REPULSIVO,
      BOLSOES_INSANOS,
      CARAPACA_CORROMPIDA,
      ASAS_INSETOIDES,
      MAOS_MEMBRANOSAS,
    ];
    sheet.lefouDeformidadeSkills = [Skill.LUTA];
    sheet.lefouDeformidadePower = CARAPACA.name;
    sheet.devoto = {
      divindade: { name: 'Aharadak', poderes: [] },
      poderes: [GRANTED_POWERS.AFINIDADE_COM_A_TORMENTA],
    };
    return sheet;
  };

  it('conta 10 poderes da Tormenta: 8 escolhidos + os 2 da Deformidade', () => {
    expect(countTormentaPowers(montar())).toBe(10);
  });

  it('os bônus escaláveis valem +5', () => {
    // floor((10 - 1) / 2) + 1 = 5
    expect(iniciativaOthers(recalculateSheet(montar()))).toBe(5);
  });

  it('a RD da Carapaça Corrompida é 5', () => {
    // 1 + floor((10 - 1) / 2) = 5
    expect(recalculateSheet(montar()).reducaoDeDano?.Geral).toBe(5);
  });

  it('o Carisma cai 4: a Deformidade não conta e a Afinidade isenta o primeiro', () => {
    const sheet = montar();
    const antes = carisma(sheet);

    // 8 escolhidos − 1 da Afinidade = 7 → floor((7 + 1) / 2) = 4.
    expect(carisma(recalculateSheet(sheet))).toBe(antes - 4);
  });
});

/**
 * Fichas salvas embutem a cópia do poder da época. Sem o refresh do
 * `sheetNormalizer` a migração das RDs para `sheetBonuses` TIRARIA a RD de quem
 * já tem o poder — este teste é o que impede essa regressão silenciosa.
 */
describe('normalizeSheet — refresh das cópias embutidas', () => {
  it('liga a automação em Carapaça Corrompida e Pele Corrompida salvas sem sheetBonuses', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { ...CARAPACA, sheetBonuses: undefined },
      { ...CARAPACA_CORROMPIDA, sheetBonuses: undefined },
      { ...PELE_CORROMPIDA, sheetBonuses: undefined },
    ];

    normalizeSheet(sheet);
    const rd = recalculateSheet(sheet).reducaoDeDano;

    // 3 poderes: Carapaça Corrompida 1 + floor(2 / 2) = 2;
    // Pele Corrompida 2 + 2 * floor(2 / 2) = 4.
    expect(rd?.Geral).toBe(2);
    expect(rd?.Fogo).toBe(4);
  });

  it('troca o "Fixed: 2" antigo de Bolsões Insanos pela fórmula escalável', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      {
        ...BOLSOES_INSANOS,
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Bolsões Insanos' },
            target: { type: 'MaxSpaces' },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
      ANTENAS,
      CARAPACA,
    ];

    normalizeSheet(sheet);

    const bonus = sheet.generalPowers[0].sheetBonuses?.[0];
    expect(bonus?.modifier).toEqual({
      type: 'TormentaPowersCalc',
      formula: '2 + ({tPowQtd} - 1)',
    });
  });
});

/**
 * Regressão do motor de ficha ALEATÓRIA.
 *
 * A penalidade rodava no Passo 11 (`applyGeneralPowers`), antes do laço de
 * níveis — então poder da Tormenta sorteado em level-up não descontava nada, e
 * ainda gravava o ledger vazio: o atributo caía "sozinho" na primeira edição da
 * ficha. Hoje é o Passo 13.5, depois do laço.
 *
 * A ficha é aleatória, então NÃO dá para fixar totais (ver
 * `randomSheetWeaponBonuses.spec.ts`): as duas asserções abaixo são relacionais,
 * derivadas da própria ficha. `Elfo` de propósito — Humano sorteia um poder
 * geral a cada recálculo e deixaria o segundo teste intermitente.
 */
describe('perda de atributo por poderes da Tormenta: motor de ficha aleatória', () => {
  const AMOSTRA = 30;

  const gerar = (): CharacterSheet =>
    generateRandomSheet({
      nivel: 10,
      raca: 'Elfo',
      classe: 'Bárbaro',
      origin: '',
      devocao: { label: '', value: '' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });

  const somaLedger = (sheet: CharacterSheet) =>
    Object.values(sheet.tormentaAttributePenalties ?? {}).reduce(
      (acc, value) => acc + value,
      0
    );

  it('o ledger bate com a contagem final, incluindo poderes de level-up', () => {
    for (let i = 0; i < AMOSTRA; i += 1) {
      const sheet = gerar();
      const qtd = countTormentaPowers(sheet, { forCharismaPenalty: true });
      // A divindade é sorteada quando não vem no formulário, então Aharadak
      // (e com ele "Afinidade com a Tormenta", que isenta o primeiro poder da
      // Tormenta) cai em parte das amostras.
      const isento = sheetHasPowerNamed(sheet, 'Afinidade com a Tormenta')
        ? 1
        : 0;

      expect(somaLedger(sheet)).toBe(
        Math.floor((Math.max(0, qtd - isento) + 1) / 2)
      );
    }
  });

  it('o primeiro recálculo não mexe no Carisma', () => {
    for (let i = 0; i < AMOSTRA; i += 1) {
      const sheet = gerar();
      const antes = carisma(sheet);

      expect(carisma(recalculateSheet(_.cloneDeep(sheet)))).toBe(antes);
    }
  });
});
