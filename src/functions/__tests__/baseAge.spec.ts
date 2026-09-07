import { describe, expect, test } from 'vitest';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import { computeFinalAttributeModifiers, generateEmptySheet } from '../general';
import { dataRegistry } from '../../data/registry';
import {
  getAgeAttributeTotalsForSelection,
  getBaseAgeAttributeModifiers,
  getBaseAgeStageForYears,
  getBaseAgeStages,
  getInitialAgeGroup,
  getMaxLongevityRange,
  rollInitialAge,
} from '../ages';
import {
  getAgeBracketForYears,
  getAgeRanges,
} from '../../premium/functions/ages';
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

describe('Idades Variadas SUBSTITUI o envelhecimento do livro básico', () => {
  test('elfo de 320 anos com a regra ligada usa a faixa, não o estágio base', () => {
    const baseline = buildSheet({});
    // 320 anos é Maduro pelo livro básico (−1 físico, +1 mental) e Velho pela
    // Tabela 4-2 de Heróis de Arton (−1 físico, nada nos mentais). Com a regra
    // ligada, só a segunda vale — as duas jamais somam.
    const sheet = buildSheet({
      ageYears: 320,
      variedAges: true,
      ageBracket: 'velho',
      ageComplications: [
        { name: 'Catarata', description: '' },
        { name: 'Melancólico', description: '' },
        { name: 'Teimoso', description: '' },
      ],
    });

    PHYSICAL.forEach((attr) => {
      expect(attributeDelta(sheet, baseline, attr)).toBe(-1);
    });
    MENTAL.forEach((attr) => {
      expect(attributeDelta(sheet, baseline, attr)).toBe(0);
    });
  });

  test('escolher a faixa sem ligar a regra não aplica a faixa', () => {
    const baseline = buildSheet({});
    const sheet = buildSheet({ ageYears: 250, ageBracket: 'anciao' });

    expect(sheet.age?.bracket).toBeUndefined();
    // Sem o interruptor, vale o livro básico: 250 anos é um elfo Maduro.
    expect(attributeDelta(sheet, baseline, Atributo.FORCA)).toBe(-1);
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
      const age = rollInitialAge({ name: 'Arcanista' }, 'Humano');
      expect(age).toBeGreaterThanOrEqual(17);
      expect(age).toBeLessThanOrEqual(27);
      expect(getBaseAgeStageForYears(age, 'Humano')).toBe('jovem');
    }
  });

  test('ficha aleatória (sem assistente) já sai com idade', () => {
    const sheet = generateEmptySheet(options('Elfo'));

    expect(sheet.age?.years).toBeGreaterThan(0);
    expect(sheet.age?.stage).toBe('jovem');
  });
});

describe('Sem buracos entre as faixas de idade', () => {
  /**
   * O bug que motivou a mudança: escalar piso e teto de forma independente
   * deixava a idade de um elfo de 40 anos acima do teto de Jovem (24) e abaixo
   * do piso de Adulto (125), sem faixa nenhuma para cair.
   */
  const RACES = ['Humano', 'Elfo', 'Anão', 'Goblin'];

  test.each(RACES)(
    'todo ano de 1 a 600 tem exatamente um estágio base (%s)',
    (raca) => {
      const stages = getBaseAgeStages(raca);
      for (let years = 1; years <= 600; years += 1) {
        const matches = stages.filter(
          (s) =>
            years >= s.minAge && (s.maxAge === undefined || years <= s.maxAge)
        );
        expect(matches).toHaveLength(1);
      }
    }
  );

  test.each(RACES)(
    'todo ano de 9 a 600 tem exatamente uma faixa de Idades Variadas (%s)',
    (raca) => {
      const ranges = getAgeRanges(raca);
      for (let years = 9; years <= 600; years += 1) {
        const matches = ranges.filter(
          (r) =>
            years >= r.minAge && (r.maxAge === undefined || years <= r.maxAge)
        );
        expect(matches).toHaveLength(1);
      }
    }
  );

  test('elfo de 40 anos cai em Jovem, e não num buraco', () => {
    expect(getAgeBracketForYears(40, 'Elfo')).toBe('jovem');
    expect(getBaseAgeStageForYears(40, 'Elfo')).toBe('jovem');
  });

  test('os marcos do livro seguem valendo para as faixas escaladas', () => {
    const min = (raca: string, id: string) =>
      getAgeRanges(raca).find((r) => r.id === id)?.minAge;

    // Exemplos citados no box "Idades das Raças" (Heróis de Arton, p. 289).
    expect(min('Anão', 'adulto')).toBe(50);
    expect(min('Elfo', 'adulto')).toBe(125);
    expect(min('Goblin', 'crianca')).toBe(6);
    expect(min('Goblin', 'adulto')).toBe(18);
  });
});

describe('Longevidade máxima', () => {
  test('humano: 72 a 110 anos (70 + 2d20)', () => {
    expect(getMaxLongevityRange('Humano')).toEqual({ minAge: 72, maxAge: 110 });
  });

  test('escala com a longevidade da raça', () => {
    expect(getMaxLongevityRange('Elfo')).toEqual({ minAge: 360, maxAge: 550 });
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
        const age = rollInitialAge({ name: name as never }, raca);
        expect(getBaseAgeStageForYears(age, raca)).toBe('jovem');
      }
    });
  });
});
