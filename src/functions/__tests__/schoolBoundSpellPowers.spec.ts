import { cloneDeep } from 'lodash';
import { applyPower } from '../general';
import { findClassDescription } from '../multiclass';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { resolveActionSchools } from '../spells/spellSchoolEditing';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { Spell, SpellSchool } from '../../interfaces/Spells';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

/**
 * Aumentar Repertório (Bardo) e Segredos da Natureza (Druida): "Você aprende
 * duas magias de qualquer círculo que possa lançar. Elas devem pertencer às
 * escolas que você sabe usar, mas podem ser arcanas ou divinas."
 *
 * Antes, Segredos da Natureza não tinha `sheetActions` (não abria escolha
 * nenhuma) e Aumentar Repertório oferecia TODAS as magias, de qualquer escola.
 */

const CORE = [SupplementId.TORMENTA20_CORE];

const CASES: {
  className: string;
  powerName: string;
  schools: SpellSchool[];
}[] = [
  {
    className: 'Bardo',
    powerName: 'Aumentar Repertório',
    schools: ['Abjur', 'Encan', 'Ilusão'],
  },
  {
    className: 'Druida',
    powerName: 'Segredos da Natureza',
    schools: ['Abjur', 'Evoc', 'Necro'],
  },
];

function getPower(className: string, powerName: string): ClassPower {
  const power = findClassDescription(className)!.powers.find(
    (p) => p.name === powerName
  );
  if (!power) throw new Error(`${powerName} não encontrado`);
  return power;
}

/** Ficha de nível 2 (só 1º círculo) com as escolas fixadas. */
function makeSheet(className: string, schools: SpellSchool[]): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 2;
  sheet.classe = cloneDeep(findClassDescription(className)!);
  sheet.classe.spellPath = { ...sheet.classe.spellPath!, schools };
  sheet.classLevels = [
    { level: 1, className },
    { level: 2, className },
  ];
  sheet.spells = [];
  return sheet;
}

function offeredSpells(sheet: CharacterSheet, power: ClassPower): Spell[] {
  const requirement = getPowerSelectionRequirements(power)!.requirements.find(
    (req) => req.type === 'learnAnySpellFromHighestCircle'
  )!;
  return getFilteredAvailableOptions(requirement, sheet, CORE) as Spell[];
}

function firstCircleNames(tradition: 'arcane' | 'divine'): Set<string> {
  const list =
    tradition === 'arcane'
      ? dataRegistry.getArcaneSpellsByCircleAndSupplements(1, CORE)
      : dataRegistry.getDivineSpellsByCircleAndSupplements(1, CORE);
  return new Set(list.map((spell) => spell.nome));
}

describe.each(CASES)('$powerName ($className)', (testCase) => {
  const { className, powerName, schools } = testCase;
  const power = getPower(className, powerName);

  it('é repetível e abre a escolha de 2 magias', () => {
    expect(power.canRepeat).toBe(true);
    const requirement = getPowerSelectionRequirements(power)?.requirements.find(
      (req) => req.type === 'learnAnySpellFromHighestCircle'
    );
    expect(requirement?.pick).toBe(2);
    expect(requirement?.metadata?.allowedType).toBe('Both');
  });

  it('oferece arcanas E divinas, só das escolas escolhidas', () => {
    const sheet = makeSheet(className, schools);
    const offered = offeredSpells(sheet, power);

    expect(offered.length).toBeGreaterThan(0);
    offered.forEach((spell) => expect(schools).toContain(spell.school));

    const arcane = firstCircleNames('arcane');
    const divine = firstCircleNames('divine');
    const names = offered.map((spell) => spell.nome);
    expect(names.some((n) => arcane.has(n) && !divine.has(n))).toBe(true);
    expect(names.some((n) => divine.has(n) && !arcane.has(n))).toBe(true);

    // Nada das escolas escolhidas fica de fora.
    const expected = new Set(
      [
        ...dataRegistry.getArcaneSpellsByCircleAndSupplements(1, CORE),
        ...dataRegistry.getDivineSpellsByCircleAndSupplements(1, CORE),
      ]
        .filter((spell) => schools.includes(spell.school))
        .map((spell) => spell.nome)
    );
    expect(new Set(names)).toEqual(expected);
  });

  it('na geração aleatória aprende 2 magias das escolas escolhidas', () => {
    const sheet = makeSheet(className, schools);
    const [result] = applyPower(sheet, power);

    expect(result.spells).toHaveLength(2);
    result.spells.forEach((spell) => expect(schools).toContain(spell.school));
  });
});

describe('resolveActionSchools', () => {
  const sheet = makeSheet('Bardo', ['Abjur', 'Encan', 'Ilusão']);

  it('usa as escolas da classe da família', () => {
    expect(resolveActionSchools(sheet, undefined, 'Bardo')).toEqual([
      'Abjur',
      'Encan',
      'Ilusão',
    ]);
  });

  it('cruza com a lista fixa quando há as duas', () => {
    expect(resolveActionSchools(sheet, ['Encan', 'Evoc'], 'Bardo')).toEqual([
      'Encan',
    ]);
  });

  it('não filtra quando a família não está na ficha', () => {
    expect(resolveActionSchools(sheet, undefined, 'Druida')).toEqual([]);
    expect(resolveActionSchools(sheet, ['Evoc'], 'Druida')).toEqual(['Evoc']);
  });
});
