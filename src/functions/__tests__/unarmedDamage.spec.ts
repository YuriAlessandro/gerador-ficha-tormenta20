/**
 * Dano desarmado — o motor único de `functions/unarmedDamage.ts`.
 *
 * Quatro invariantes carregam o resto:
 *  - As fontes do dado BASE (1d3 padrão, Estilo Desarmado, Briga) não somam: a
 *    maior vence, comparada pela MÉDIA (2d8 > 1d12, apesar do índice menor na
 *    escada).
 *  - O passo de tamanho entra UMA vez, lido de `sheet.size`. O bônus
 *    `WeaponDamageStep` do Step 11.7 é de arma e não pode vazar para cá.
 *  - A derivação é absoluta, não incremental: N recálculos dão o mesmo dado.
 *  - Vale nos DOIS motores de derivação, e também em `normalizeSheet` (abrir
 *    uma ficha não dispara recálculo).
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import generateRandomSheet from '../general';
import { normalizeSheet } from '../sheetNormalizer';
import {
  computeUnarmedDamage,
  getBrigaDice,
  getUnarmedDamageDice,
} from '../unarmedDamage';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { GeneralPower } from '../../interfaces/Poderes';
import { RACE_SIZES } from '../../data/systems/tormenta20/races/raceSizes/raceSizes';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import LUTADOR from '../../data/systems/tormenta20/classes/lutador';
import { SupplementId } from '../../types/supplement.types';

const { CORPO_ABERRANTE, ANTENAS, CARAPACA, DENTES_AFIADOS, CUSPIR_ENXAME } =
  tormentaPowers;
const { ESTILO_DESARMADO } = combatPowers;

/** Poderes da Tormenta quaisquer, para inflar `{tPowQtd}`. */
const FILLERS: GeneralPower[] = Object.values(tormentaPowers).filter(
  (power) => power.name !== 'Corpo Aberrante'
);

const sheetWith = (powers: GeneralPower[]): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.generalPowers = _.cloneDeep(powers);
  return sheet;
};

/** Ficha de Lutador de verdade (a habilidade Briga vem do catálogo). */
const lutadorSheet = (nivel: number, powers: GeneralPower[] = []) => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.classe = _.cloneDeep(LUTADOR);
  sheet.classe.abilities = sheet.classe.abilities.filter(
    (ability) => ability.nivel <= nivel
  );
  sheet.generalPowers = _.cloneDeep(powers);
  return sheet;
};

describe('dado base do ataque desarmado', () => {
  it('é 1d3 para quem não tem nada (JDA, cap. 3)', () => {
    const sheet = createMockCharacterSheet();
    expect(computeUnarmedDamage(sheet)).toMatchObject({
      base: '1d3',
      baseSource: 'Ataque desarmado',
      dice: '1d3',
    });
  });

  it('sobe para 1d6 com Estilo Desarmado', () => {
    const sheet = sheetWith([ESTILO_DESARMADO]);
    expect(computeUnarmedDamage(sheet)).toMatchObject({
      base: '1d6',
      baseSource: 'Estilo Desarmado',
    });
  });

  it('segue a tabela da Briga por nível de classe', () => {
    expect(computeUnarmedDamage(lutadorSheet(1)).base).toBe('1d6');
    expect(computeUnarmedDamage(lutadorSheet(5)).base).toBe('1d8');
    expect(computeUnarmedDamage(lutadorSheet(9)).base).toBe('1d10');
    expect(computeUnarmedDamage(lutadorSheet(13)).base).toBe('1d12');
    expect(computeUnarmedDamage(lutadorSheet(17)).base).toBe('2d8');
    expect(computeUnarmedDamage(lutadorSheet(20)).base).toBe('2d10');
  });

  it('não soma Briga com Estilo Desarmado — a maior vence', () => {
    const sheet = lutadorSheet(5, [ESTILO_DESARMADO]);
    expect(computeUnarmedDamage(sheet).base).toBe('1d8');
    expect(computeUnarmedDamage(sheet).baseSource).toBe('Briga');
  });

  it('compara pela média, não pelo índice na escada (2d8 > 1d12)', () => {
    // 2d8 vive no ramo alternativo da Tabela 3-2, com índice MENOR que 1d12 no
    // ramo principal. Comparar por índice escolheria 1d12 (média 6,5).
    expect(computeUnarmedDamage(lutadorSheet(17)).base).toBe('2d8');
  });

  it('não confunde a classe de quem não é Lutador', () => {
    // `getClassLevel` devolve o nível TOTAL em ficha mono-classe: perguntar
    // "qual meu nível de Lutador?" num Guerreiro 20 devolveria 20.
    const sheet = createMockCharacterSheet();
    sheet.nivel = 20;
    expect(computeUnarmedDamage(sheet).base).toBe('1d3');
  });
});

describe('Corpo Aberrante', () => {
  const withOthers = (qtd: number) =>
    sheetWith([CORPO_ABERRANTE, ...FILLERS.slice(0, qtd)]);

  it('sozinho aumenta um passo (1d3 → 1d4)', () => {
    const breakdown = computeUnarmedDamage(withOthers(0));
    expect(breakdown.bonusSteps).toBe(1);
    expect(breakdown.dice).toBe('1d4');
  });

  it.each([
    [0, 1],
    [1, 1],
    [3, 1],
    [4, 2],
    [7, 2],
    [8, 3],
  ])(
    'com %i outros poderes da Tormenta dá %i passo(s)',
    (others, expectedSteps) => {
      expect(computeUnarmedDamage(withOthers(others)).bonusSteps).toBe(
        expectedSteps
      );
    }
  );

  it('empilha os passos na escada (4 outros: 1d3 → 1d6)', () => {
    expect(computeUnarmedDamage(withOthers(4)).dice).toBe('1d6');
  });

  it('não faz nada sem o poder', () => {
    expect(computeUnarmedDamage(sheetWith([ANTENAS, CARAPACA])).dice).toBe(
      '1d3'
    );
  });

  it('destrava o ramo 2dX da Briga do Lutador 17º', () => {
    // Sem o ramo alternativo da escada, 2d8 não sobe passo nenhum — e o poder
    // ficaria inerte justamente para quem mais bate desarmado.
    const sheet = lutadorSheet(17, [CORPO_ABERRANTE]);
    expect(computeUnarmedDamage(sheet).dice).toBe('2d10');
  });

  it('Lutador 20 com Corpo Aberrante chega a 3d10', () => {
    expect(computeUnarmedDamage(lutadorSheet(20, [CORPO_ABERRANTE])).dice).toBe(
      '3d10'
    );
  });
});

describe('passo de tamanho', () => {
  const sized = (
    size: typeof RACE_SIZES.MEDIO,
    powers: GeneralPower[] = []
  ) => {
    const sheet = sheetWith(powers);
    sheet.size = size;
    return sheet;
  };

  it('Minúsculo reduz um passo', () => {
    expect(getUnarmedDamageDice(sized(RACE_SIZES.MINUSCULO))).toBe('1d2');
  });

  it('Grande aumenta um passo', () => {
    expect(getUnarmedDamageDice(sized(RACE_SIZES.GRANDE))).toBe('1d4');
  });

  it('Colossal aumenta dois passos', () => {
    expect(getUnarmedDamageDice(sized(RACE_SIZES.COLOSSAL))).toBe('1d6');
  });

  it('soma UMA vez só junto de Corpo Aberrante', () => {
    // O Step 11.7 emite o passo de tamanho como `WeaponDamageStep`; se o motor
    // desarmado também o lesse dali, Grande + Corpo Aberrante daria 3 passos.
    const breakdown = computeUnarmedDamage(
      sized(RACE_SIZES.GRANDE, [CORPO_ABERRANTE])
    );
    expect(breakdown.sizeStep).toBe(1);
    expect(breakdown.bonusSteps).toBe(1);
    expect(breakdown.totalSteps).toBe(2);
    expect(breakdown.dice).toBe('1d6');
  });
});

describe('bônus fixo `UnarmedDamage` (Ossos Afiados, Tocado pelo Indomável)', () => {
  const OSSOS_AFIADOS_LIKE: GeneralPower = {
    name: 'Poder de Teste',
    description: '',
    type: CORPO_ABERRANTE.type,
    requirements: [],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Poder de Teste' },
        target: { type: 'UnarmedDamage' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  };

  it('soma ao dado sem alterá-lo, ao contrário de `UnarmedDamageStep`', () => {
    const breakdown = computeUnarmedDamage(sheetWith([OSSOS_AFIADOS_LIKE]));
    expect(breakdown.totalSteps).toBe(0);
    expect(breakdown.flatBonus).toBe(2);
    expect(breakdown.dice).toBe('1d3+2');
  });

  it('compõe com o passo de tamanho', () => {
    const sheet = sheetWith([OSSOS_AFIADOS_LIKE]);
    sheet.size = RACE_SIZES.GRANDE;
    const breakdown = computeUnarmedDamage(sheet);
    expect(breakdown.dice).toBe('1d4+2');
  });
});

describe('integração com o motor de recálculo', () => {
  const corpoAberranteRoll = (sheet: CharacterSheet) =>
    sheet.generalPowers
      ?.find((power) => power.name === 'Corpo Aberrante')
      ?.rolls?.find((roll) => roll.label === 'Dano Desarmado');

  it('escreve o dado na rolagem do card do poder', () => {
    const sheet = recalculateSheet(sheetWith([CORPO_ABERRANTE, ANTENAS]));
    expect(corpoAberranteRoll(sheet)?.dice).toBe('1d4');
  });

  it('é idempotente: 3 recálculos dão o mesmo dado e o mesmo id', () => {
    let sheet = recalculateSheet(sheetWith([CORPO_ABERRANTE]));
    const first = corpoAberranteRoll(sheet);
    sheet = recalculateSheet(sheet);
    sheet = recalculateSheet(sheet);
    const last = corpoAberranteRoll(sheet);

    expect(last?.dice).toBe(first?.dice);
    // Id novo a cada recálculo sujaria o delta da nuvem e a key do React.
    expect(last?.id).toBe(first?.id);
  });

  it('reverte quando o poder é removido', () => {
    let sheet = recalculateSheet(lutadorSheet(9, [CORPO_ABERRANTE]));
    const briga = () =>
      sheet.classe.abilities.find((ability) => ability.name === 'Briga')
        ?.rolls?.[0]?.dice;
    expect(briga()).toBe('1d12');

    sheet.generalPowers = [];
    sheet = recalculateSheet(sheet);
    expect(briga()).toBe('1d10');
  });

  it('a Briga passa a respeitar o tamanho (antes ignorava)', () => {
    const base = lutadorSheet(5);
    base.size = RACE_SIZES.GRANDE;
    const sheet = recalculateSheet(base);
    expect(
      sheet.classe.abilities.find((ability) => ability.name === 'Briga')
        ?.rolls?.[0]?.dice
    ).toBe('1d10');
  });

  it('preserva rolagem que o jogador adicionou ao mesmo poder', () => {
    const base = sheetWith([CORPO_ABERRANTE]);
    const power = base.generalPowers?.[0] as GeneralPower;
    power.rolls = [
      ...(power.rolls ?? []),
      { id: 'custom-1', label: 'Sangramento', dice: '1d6' },
    ];

    const sheet = recalculateSheet(base);
    const rolls = sheet.generalPowers?.[0]?.rolls ?? [];
    expect(rolls.find((roll) => roll.label === 'Sangramento')?.dice).toBe(
      '1d6'
    );
    expect(rolls.find((roll) => roll.label === 'Dano Desarmado')?.dice).toBe(
      '1d4'
    );
  });

  it('não toca em poderes da Tormenta que não são do dano desarmado', () => {
    const sheet = recalculateSheet(
      sheetWith([CORPO_ABERRANTE, DENTES_AFIADOS, CUSPIR_ENXAME])
    );
    const enxame = sheet.generalPowers?.find(
      (power) => power.name === 'Cuspir Enxame'
    );
    expect(enxame?.rolls?.[0]?.dice).toBe('2d6');
  });
});

describe('fichas salvas antes da automação', () => {
  it('normalizeSheet cura a cópia congelada, sem recálculo', () => {
    // Ficha salva embute o poder como era: texto puro, sem `sheetBonuses` nem
    // `rolls`. Abrir uma ficha não dispara recálculo, então quem cura é o
    // normalizer — senão o poder segue inerte para sempre.
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      {
        name: 'Corpo Aberrante',
        description: CORPO_ABERRANTE.description,
        type: CORPO_ABERRANTE.type,
        requirements: [],
      },
      _.cloneDeep(ANTENAS),
    ];

    normalizeSheet(sheet);

    const power = sheet.generalPowers?.[0];
    expect(power?.sheetBonuses?.[0]?.target).toEqual({
      type: 'UnarmedDamageStep',
    });
    expect(
      power?.rolls?.find((roll) => roll.label === 'Dano Desarmado')?.dice
    ).toBe('1d4');
  });
});

describe('paridade entre os dois motores', () => {
  const AMOSTRA = 20;

  /**
   * Ficha ALEATÓRIA, então nada de fixar totais: a asserção é relacional —
   * o dado escrito na ficha pelo motor aleatório tem que ser exatamente o que a
   * derivação pura devolve, e o recálculo não pode mexer nele. `Elfo` de
   * propósito: Humano sorteia um poder geral a cada recálculo (podendo cair um
   * poder da Tormenta) e deixaria o teste intermitente.
   */
  const gerar = (): CharacterSheet =>
    generateRandomSheet({
      nivel: 12,
      raca: 'Elfo',
      classe: 'Lutador',
      origin: '',
      devocao: { label: '', value: '' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });

  const brigaDice = (sheet: CharacterSheet) =>
    sheet.classe.abilities.find((ability) => ability.name === 'Briga')
      ?.rolls?.[0]?.dice;

  it('o motor aleatório escreve o mesmo dado que a derivação pura', () => {
    for (let i = 0; i < AMOSTRA; i += 1) {
      const sheet = gerar();
      expect(brigaDice(sheet)).toBe(getUnarmedDamageDice(sheet));
    }
  });

  it('o primeiro recálculo não mexe no dado', () => {
    for (let i = 0; i < AMOSTRA; i += 1) {
      const sheet = gerar();
      expect(brigaDice(recalculateSheet(_.cloneDeep(sheet)))).toBe(
        brigaDice(sheet)
      );
    }
  });
});

describe('getBrigaDice continua exportado pela tabela oficial', () => {
  it('mantém os degraus do livro', () => {
    expect(getBrigaDice(4)).toBe('1d6');
    expect(getBrigaDice(16)).toBe('1d12');
    expect(getBrigaDice(20)).toBe('2d10');
  });
});
