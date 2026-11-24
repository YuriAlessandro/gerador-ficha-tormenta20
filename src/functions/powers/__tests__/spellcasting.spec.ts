import { describe, it, expect } from 'vitest';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import { SpellPath } from '../../../interfaces/Class';
import { Spell, spellsCircles } from '../../../interfaces/Spells';
import { RequirementType } from '../../../interfaces/Poderes';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { getSpellTraditionMap } from '../../spells/spellTradition';
import { sheetCastsSpells } from '../spellcasting';
import { isPowerAvailable } from '../../powers';
import { formatRequirement } from '../../requirementText';
import { getSpellPmLimitBase } from '../../spells/pmLimit';
import { getArcanistaSpellPath } from '../../../data/systems/tormenta20/classes/arcanista';
import { serializeSpellPath } from '../../multiclass';

const spellOfTradition = (tradition: 'arcane' | 'divine'): Spell => {
  const nome = [...getSpellTraditionMap()].find(
    ([, t]) => t === tradition
  )?.[0];
  if (!nome) throw new Error(`nenhuma magia ${tradition}`);
  return {
    nome,
    execucao: 'Padrão',
    alcance: 'Curto',
    duracao: 'Instantânea',
    description: '',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
  };
};

const ARCANE = spellOfTradition('arcane');
const DIVINE = spellOfTradition('divine');

const pathOf = (spellType: SpellPath['spellType']): SpellPath => ({
  initialSpells: 3,
  spellType,
  qtySpellsLearnAtLevel: () => 1,
  spellCircleAvailableAtLevel: (level) => Math.min(5, Math.ceil(level / 4)),
  keyAttribute: Atributo.INTELIGENCIA,
});

const sheetWith = ({
  nivel = 1,
  spellType,
  spells = [],
}: {
  nivel?: number;
  spellType?: SpellPath['spellType'];
  spells?: Spell[];
}): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.classLevels = undefined;
  sheet.classe = {
    ...sheet.classe,
    spellPath: spellType ? pathOf(spellType) : undefined,
  };
  sheet.spells = spells;
  return sheet;
};

describe('sheetCastsSpells', () => {
  it('quem não lança magia não atende', () => {
    expect(sheetCastsSpells(sheetWith({}))).toBe(false);
  });

  it('classe com magia atende pelo círculo liberado, mesmo antes de aprender', () => {
    // Nível 5: o assistente escolhe o poder antes das magias do 2º círculo.
    const sheet = sheetWith({ nivel: 5, spellType: 'Arcane' });
    expect(sheetCastsSpells(sheet, { circle: 2 })).toBe(true);
    expect(sheetCastsSpells(sheet, { circle: 3 })).toBe(false);
  });

  it('tradição vem da classe', () => {
    const arcanista = sheetWith({ spellType: 'Arcane' });
    expect(sheetCastsSpells(arcanista, { tradition: 'arcane' })).toBe(true);
    expect(sheetCastsSpells(arcanista, { tradition: 'divine' })).toBe(false);
    const both = sheetWith({ spellType: 'Both' });
    expect(sheetCastsSpells(both, { tradition: 'divine' })).toBe(true);
  });

  it('magia de raça ou poder conta, com a tradição da própria magia', () => {
    const sheet = sheetWith({ spells: [DIVINE] });
    expect(sheetCastsSpells(sheet)).toBe(true);
    expect(sheetCastsSpells(sheet, { tradition: 'divine' })).toBe(true);
    expect(sheetCastsSpells(sheet, { tradition: 'arcane' })).toBe(false);
    expect(sheetCastsSpells(sheet, { circle: 2 })).toBe(false);
  });

  it('magia fora de classe não cumpre requisito de círculo (JdA p. 171)', () => {
    const sheet = sheetWith({
      spells: [{ ...ARCANE, spellCircle: spellsCircles.c2 }],
    });
    expect(sheetCastsSpells(sheet)).toBe(true);
    expect(sheetCastsSpells(sheet, { circle: 2 })).toBe(false);
    expect(sheetCastsSpells(sheet, { circle: 1 })).toBe(false);
  });

  it('magia injetada por equipamento não conta', () => {
    const sheet = sheetWith({
      spells: [{ ...ARCANE, equipmentSource: 'item-1' }],
    });
    expect(sheetCastsSpells(sheet)).toBe(false);
  });

  it('magia sem tipo conhecido não confirma tradição sozinha', () => {
    const custom = { ...ARCANE, nome: 'Magia Inventada', isCustom: true };
    const sheet = sheetWith({ spells: [custom] });
    expect(sheetCastsSpells(sheet)).toBe(true);
    expect(sheetCastsSpells(sheet, { tradition: 'arcane' })).toBe(false);
  });
});

describe('sheetCastsSpells em multiclasse', () => {
  // Guerreiro 1 / Arcanista 5: o Arcanista não tem spellPath no registry, ele
  // nasce do subtipo e fica gravado (sem funções) em `multiclassSpellPaths`.
  const guerreiroArcanista = (withSerialized: boolean): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 6;
    sheet.classe = { ...sheet.classe, name: 'Guerreiro', spellPath: undefined };
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      ...[2, 3, 4, 5, 6].map((level) => ({ level, className: 'Arcanista' })),
    ];
    sheet.multiclassSetups = withSerialized
      ? { Arcanista: { arcanistaSubtype: 'Mago' } }
      : undefined;
    sheet.multiclassSpellPaths = withSerialized
      ? {
          Arcanista: serializeSpellPath(
            getArcanistaSpellPath('Mago'),
            'Arcanista',
            'Mago'
          ),
        }
      : undefined;
    sheet.spells = [ARCANE];
    return sheet;
  };

  it('classe secundária reconstruída do spellPath gravado', () => {
    const sheet = guerreiroArcanista(true);
    expect(sheetCastsSpells(sheet, { circle: 2 })).toBe(true);
    expect(sheetCastsSpells(sheet, { circle: 3 })).toBe(false);
    expect(sheetCastsSpells(sheet, { circle: 1, tradition: 'arcane' })).toBe(
      true
    );
    expect(sheetCastsSpells(sheet, { tradition: 'divine' })).toBe(false);
  });

  it('ficha antiga sem spellPath gravado ainda conta o Arcanista', () => {
    const sheet = guerreiroArcanista(false);
    expect(sheetCastsSpells(sheet, { circle: 2, tradition: 'arcane' })).toBe(
      true
    );
  });

  it('limite de PM é o nível de Arcanista, não o de personagem', () => {
    expect(getSpellPmLimitBase(guerreiroArcanista(true), ARCANE)).toBe(5);
    expect(getSpellPmLimitBase(guerreiroArcanista(false), ARCANE)).toBe(5);
  });
});

describe('requisito LANCAR_MAGIAS nos dados', () => {
  const powers = dataRegistry.getPowersBySupplements(
    Object.values(SupplementId)
  );
  const all = Object.values(powers).flat();
  const find = (name: string) => {
    const power = all.find((p) => p.name === name);
    if (!power) throw new Error(`${name} não encontrado`);
    return power;
  };

  it('nenhum poder oficial pede "Lançar magias" como texto livre', () => {
    const textual = all.filter((power) =>
      (power.requirements ?? []).some((group) =>
        group.some(
          (rule) =>
            rule.type === RequirementType.TEXT &&
            /^lan[çc]ar magia/i.test(rule.text ?? '')
        )
      )
    );
    expect(textual.map((p) => p.name)).toEqual([]);
  });

  it('nenhum poder de Magia fica sem pré-requisito', () => {
    // Barreira Mística, Explosão Fulgente etc. (HdA) estavam com
    // `requirements: []`, e o guarda de TEXT acima não as pegava.
    const open = powers.MAGIA.filter(
      (power) => (power.requirements ?? []).flat().length === 0
    );
    expect(open.map((p) => p.name)).toEqual([]);
  });

  it('Barreira Mística exige lançar magias; Magia Suspensa, 2º círculo', () => {
    expect(isPowerAvailable(sheetWith({}), find('Barreira Mística'))).toBe(
      false
    );
    expect(
      isPowerAvailable(
        sheetWith({ spellType: 'Arcane' }),
        find('Barreira Mística')
      )
    ).toBe(true);
    const suspensa = find('Magia Suspensa');
    expect(
      isPowerAvailable(sheetWith({ nivel: 4, spellType: 'Arcane' }), suspensa)
    ).toBe(false);
    expect(
      isPowerAvailable(sheetWith({ nivel: 5, spellType: 'Arcane' }), suspensa)
    ).toBe(true);
  });

  it('Presente de Wynlla exige magia arcana', () => {
    const wynlla = find('Presente de Wynlla');
    expect(isPowerAvailable(sheetWith({}), wynlla)).toBe(false);
    expect(isPowerAvailable(sheetWith({ spellType: 'Divine' }), wynlla)).toBe(
      false
    );
    expect(isPowerAvailable(sheetWith({ spellType: 'Arcane' }), wynlla)).toBe(
      true
    );
  });

  it('Magia Acelerada exige 2º círculo', () => {
    const acelerada = find('Magia Acelerada');
    expect(
      isPowerAvailable(sheetWith({ nivel: 4, spellType: 'Divine' }), acelerada)
    ).toBe(false);
    expect(
      isPowerAvailable(sheetWith({ nivel: 5, spellType: 'Divine' }), acelerada)
    ).toBe(true);
  });

  it('texto exibido', () => {
    expect(formatRequirement({ type: RequirementType.LANCAR_MAGIAS })).toBe(
      'Lançar magias'
    );
    expect(
      formatRequirement({
        type: RequirementType.LANCAR_MAGIAS,
        name: 'divine',
        value: 2,
      })
    ).toBe('Lançar magias divinas de 2º círculo');
  });
});
