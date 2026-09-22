import { describe, expect, test } from 'vitest';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import generateRandomSheet, {
  computeFinalAttributeModifiers,
  generateEmptySheet,
} from '../general';
import { dataRegistry } from '../../data/registry';
import {
  getAgeAttributeTotalsForSelection,
  getBaseAgeAttributeModifiers,
  getBaseAgeStageForYears,
  getBaseAgeStages,
  getInitialAgeGroup,
  rollInitialAge,
} from '../ages';
import type CharacterSheet from '../../interfaces/CharacterSheet';

const ZEROED: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 0,
  [Atributo.CONSTITUICAO]: 0,
  [Atributo.INTELIGENCIA]: 0,
  [Atributo.SABEDORIA]: 0,
  [Atributo.CARISMA]: 0,
};

const PHYSICAL = [Atributo.FORCA, Atributo.DESTREZA, Atributo.CONSTITUICAO];
const MENTAL = [Atributo.INTELIGENCIA, Atributo.SABEDORIA, Atributo.CARISMA];

// Elfo (e não Humano): Versátil sorteia um poder geral a cada recálculo e deixa
// o teste intermitente.
function options(raca: string): SelectedOptions {
  return {
    nivel: 1,
    raca,
    classe: 'Guerreiro',
    origin: '',
    devocao: { label: '--', value: '--' },
    supplements: [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ],
  };
}

function buildSheet(
  selections: WizardSelections,
  raca = 'Elfo'
): CharacterSheet {
  return generateEmptySheet(options(raca), {
    baseAttributes: { ...ZEROED },
    ...selections,
  });
}

function attributeDelta(
  withAge: CharacterSheet,
  baseline: CharacterSheet,
  attr: Atributo
): number {
  return withAge.atributos[attr].value - baseline.atributos[attr].value;
}

describe('Envelhecimento (livro básico) — marcos por raça', () => {
  test('humano: Jovem até 44, Maduro dos 45 aos 69, Velho dos 70 em diante', () => {
    expect(getBaseAgeStageForYears(20, 'Humano')).toBe('jovem');
    expect(getBaseAgeStageForYears(44, 'Humano')).toBe('jovem');
    expect(getBaseAgeStageForYears(45, 'Humano')).toBe('maduro');
    expect(getBaseAgeStageForYears(69, 'Humano')).toBe('maduro');
    expect(getBaseAgeStageForYears(70, 'Humano')).toBe('velho');
    expect(getBaseAgeStageForYears(500, 'Humano')).toBe('velho');
  });

  test('elfo envelhece cinco vezes mais devagar', () => {
    expect(getBaseAgeStageForYears(224, 'Elfo')).toBe('jovem');
    expect(getBaseAgeStageForYears(225, 'Elfo')).toBe('maduro');
    expect(getBaseAgeStageForYears(350, 'Elfo')).toBe('velho');
  });

  test('goblin envelhece mais rápido', () => {
    expect(getBaseAgeStageForYears(30, 'Goblin')).toBe('jovem');
    expect(getBaseAgeStageForYears(32, 'Goblin')).toBe('maduro');
    expect(getBaseAgeStageForYears(49, 'Goblin')).toBe('velho');
  });

  test('idade não informada é Jovem — o estado neutro', () => {
    expect(getBaseAgeStageForYears(undefined, 'Humano')).toBe('jovem');
  });
});

describe('Envelhecimento — modificadores acumulados', () => {
  test('Jovem não altera nada', () => {
    expect(getBaseAgeAttributeModifiers('jovem')).toEqual([]);
  });

  test('Maduro: −1 nos físicos, +1 nos mentais', () => {
    const mods = getBaseAgeAttributeModifiers('maduro');
    PHYSICAL.forEach((attr) => {
      expect(mods.find((m) => m.attribute === attr)?.value).toBe(-1);
    });
    MENTAL.forEach((attr) => {
      expect(mods.find((m) => m.attribute === attr)?.value).toBe(1);
    });
  });

  test('Velho acumula: total −3 nos físicos e +2 nos mentais', () => {
    const mods = getBaseAgeAttributeModifiers('velho');
    PHYSICAL.forEach((attr) => {
      expect(mods.find((m) => m.attribute === attr)?.value).toBe(-3);
    });
    MENTAL.forEach((attr) => {
      expect(mods.find((m) => m.attribute === attr)?.value).toBe(2);
    });
  });
});

// Elfo em todo teste que compara ATRIBUTOS: o Versátil do humano sorteia +2 num
// atributo qualquer a cada ficha, e a diferença entre duas fichas humanas nunca
// isola o efeito da idade. Os marcos élficos são os humanos ×5.
describe('Envelhecimento — efeito real na ficha, sem suplemento nenhum', () => {
  test('elfo de 250 anos recebe os modificadores de Maduro', () => {
    const baseline = buildSheet({});
    const maduro = buildSheet({ ageYears: 250 });

    expect(maduro.age?.stage).toBe('maduro');
    PHYSICAL.forEach((attr) => {
      expect(attributeDelta(maduro, baseline, attr)).toBe(-1);
    });
    MENTAL.forEach((attr) => {
      expect(attributeDelta(maduro, baseline, attr)).toBe(1);
    });
  });

  test('elfo de 400 anos recebe o total acumulado de Velho', () => {
    const baseline = buildSheet({});
    const velho = buildSheet({ ageYears: 400 });

    expect(velho.age?.stage).toBe('velho');
    PHYSICAL.forEach((attr) => {
      expect(attributeDelta(velho, baseline, attr)).toBe(-3);
    });
    MENTAL.forEach((attr) => {
      expect(attributeDelta(velho, baseline, attr)).toBe(2);
    });
  });

  test('a idade jovem é gravada mas não mexe em atributo nenhum', () => {
    const baseline = buildSheet({});
    const jovem = buildSheet({ ageYears: 100 });

    expect(jovem.age?.years).toBe(100);
    expect(jovem.age?.stage).toBe('jovem');
    Object.values(Atributo).forEach((attr) => {
      expect(attributeDelta(jovem, baseline, attr)).toBe(0);
    });
  });

  test('registra o envelhecimento no step de auditoria', () => {
    const sheet = buildSheet({ ageYears: 250 });
    const step = sheet.steps.find((s) => s.label === 'Idade');

    expect(step?.value).toContainEqual({ name: 'Idade', value: '250 anos' });
    expect(step?.value).toContainEqual({
      name: 'Envelhecimento',
      value: 'Maduro',
    });
  });
});

describe('Idade inicial rolada', () => {
  test('cada grupo de classe usa a rolagem do livro', () => {
    expect(getInitialAgeGroup({ name: 'Bárbaro' }).formula).toBe('1d6+15');
    expect(getInitialAgeGroup({ name: 'Guerreiro' }).formula).toBe('2d4+15');
    expect(getInitialAgeGroup({ name: 'Arcanista' }).formula).toBe('2d6+15');
  });

  test('variante de classe herda o grupo da classe base', () => {
    expect(
      getInitialAgeGroup({ name: 'Necromante', baseClassName: 'Arcanista' })
        .formula
    ).toBe('2d6+15');
  });

  test('humano rola entre 16 e 27 anos, sempre dentro do estágio Jovem', () => {
    for (let i = 0; i < 200; i += 1) {
      const age = rollInitialAge({ name: 'Arcanista' });
      expect(age).toBeGreaterThanOrEqual(17);
      expect(age).toBeLessThanOrEqual(27);
      expect(getBaseAgeStageForYears(age, 'Humano')).toBe('jovem');
    }
  });

  /**
   * Pelo motor ALEATÓRIO, e não por `generateEmptySheet` sem seleções — este é
   * um caminho que a produção nunca toma (o único chamador é o assistente, e
   * ele sempre passa as seleções). Os dois motores de derivação deste repo
   * divergem em silêncio, e testar o que a produção não executa dá uma
   * cobertura que não existe.
   */
  test.each(['Humano', 'Elfo', 'Goblin'])(
    'ficha aleatória de %s já sai com idade, sempre jovem',
    (raca) => {
      const sheet = generateRandomSheet(options(raca));

      expect(sheet.age?.years).toBeGreaterThan(0);
      expect(sheet.age?.stage).toBe('jovem');
      expect(getBaseAgeStageForYears(sheet.age?.years, raca)).toBe('jovem');
    }
  );

  test('a idade da ficha aleatória entra no passo-a-passo', () => {
    const sheet = generateRandomSheet(options('Humano'));
    const step = sheet.steps.find((s) => s.label === 'Idade');

    expect(step?.value).toContainEqual({
      name: 'Idade',
      value: `${sheet.age?.years} anos`,
    });
  });
});

describe('Sem buracos entre os estágios de envelhecimento', () => {
  /**
   * O bug que motivou a mudança: escalar piso e teto de forma independente
   * deixava a idade de um elfo de 40 anos acima do teto de Jovem (24) e abaixo
   * do piso de Adulto (125), sem faixa nenhuma para cair. A varredura das
   * FAIXAS de Idades Variadas vive em `age.spec.ts`, a suíte que já depende do
   * submódulo privado — aqui ficam só os estágios do livro básico, que são
   * justamente o código público desta mudança.
   */
  const RACES = ['Humano', 'Elfo', 'Anão', 'Goblin'];

  test.each(RACES)(
    'todo ano de 1 a 600 tem exatamente um estágio base (%s)',
    (raca) => {
      const stages = getBaseAgeStages(raca);
      for (let years = 1; years <= 600; years += 1) {
        const matches = stages.filter(
          (st) =>
            years >= st.minAge &&
            (st.maxAge === undefined || years <= st.maxAge)
        );
        expect(matches).toHaveLength(1);
      }
    }
  );

  test('elfo de 40 anos cai no estágio Jovem, e não num buraco', () => {
    expect(getBaseAgeStageForYears(40, 'Elfo')).toBe('jovem');
  });
});

describe('Idade integrada aos atributos do assistente', () => {
  /**
   * A idade é escolhida no primeiro passo, mas os modificadores dela só
   * existiam quando a ficha era montada, no fim de tudo. No meio ficavam os
   * passos que LEEM os atributos: quantas perícias a Inteligência concede e
   * quais poderes passam no pré-requisito. Um personagem maduro tem Int +1 e
   * precisa ver isso desde o passo de atributos.
   */
  const humano = dataRegistry
    .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
    .find((r) => r.name === 'Humano');

  test('os modificadores da idade entram no total do assistente', () => {
    const base = { [Atributo.INTELIGENCIA]: 1, [Atributo.FORCA]: 3 };

    const jovem = computeFinalAttributeModifiers(
      humano,
      undefined,
      base,
      [Atributo.INTELIGENCIA, Atributo.FORCA, Atributo.DESTREZA],
      []
    );
    const maduro = computeFinalAttributeModifiers(
      humano,
      undefined,
      base,
      [Atributo.INTELIGENCIA, Atributo.FORCA, Atributo.DESTREZA],
      getBaseAgeAttributeModifiers('maduro')
    );

    expect(maduro[Atributo.INTELIGENCIA]).toBe(
      jovem[Atributo.INTELIGENCIA] + 1
    );
    expect(maduro[Atributo.FORCA]).toBe(jovem[Atributo.FORCA] - 1);
  });

  test('sem idade informada o total é o mesmo de antes', () => {
    const args = [
      humano,
      undefined,
      { [Atributo.FORCA]: 2 },
      undefined,
    ] as const;

    expect(
      computeFinalAttributeModifiers(args[0], args[1], args[2], args[3], [])
    ).toEqual(
      computeFinalAttributeModifiers(args[0], args[1], args[2], args[3])
    );
  });

  test('a seleção do assistente escala pela raça antes de virar modificador', () => {
    const selection = { years: 50, variedAges: false };

    // 50 anos é Maduro para um humano e ainda Jovem para um elfo.
    expect(getAgeAttributeTotalsForSelection(selection, 'Humano')).toEqual(
      getBaseAgeAttributeModifiers('maduro')
    );
    expect(getAgeAttributeTotalsForSelection(selection, 'Elfo')).toEqual([]);
  });
});

describe('Ficha aleatória nasce sempre jovem', () => {
  /**
   * Vale para toda raça e toda classe, e não por acaso: o teto da rolagem de
   * idade inicial é 27 × multiplicador da raça, e o piso do estágio Maduro é
   * 45 × o MESMO multiplicador. Como 27 < 45, nenhuma combinação alcança o
   * primeiro marco — por isso a geração aleatória não precisa integrar os
   * modificadores de idade aos passos que leem atributos.
   */
  const RACES = ['Humano', 'Elfo', 'Anão', 'Goblin', 'Qareen', 'Trog'];
  const CLASSES = ['Bárbaro', 'Guerreiro', 'Arcanista'];

  test.each(RACES)('%s: toda rolagem de toda classe cai em Jovem', (raca) => {
    CLASSES.forEach((name) => {
      for (let i = 0; i < 100; i += 1) {
        const age = rollInitialAge({ name: name as never });
        expect(getBaseAgeStageForYears(age, raca)).toBe('jovem');
      }
    });
  });
});
