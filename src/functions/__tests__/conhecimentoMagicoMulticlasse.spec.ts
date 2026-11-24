import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription, getHighestSpellCircle } from '../multiclass';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { dataRegistry } from '../../data/registry';
import { getArcanistaSpellPath } from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Conhecimento Mágico: "magias de qualquer círculo que possa lançar". O teto
 * de círculo sai do nível na classe CONJURADORA — nunca só da classe principal
 * (Lutador não conjura) nem do nível total da ficha.
 */
const conhecimentoMagico = findClassDescription('Arcanista')!.powers.find(
  (power) => power.name === 'Conhecimento Mágico'
) as ClassPower;

function makeSheet(className: string, level: number): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = level;
  sheet.classe = cloneDeep(findClassDescription(className)!);
  // O spellPath do Arcanista nasce do subtipo, não da entrada do registry.
  if (className === 'Arcanista') {
    sheet.classe.spellPath = getArcanistaSpellPath('Mago');
  }
  sheet.classLevels = Array.from({ length: level }, (_, i) => ({
    level: i + 1,
    className,
  }));
  return sheet;
}

function levelUp(
  sheet: CharacterSheet,
  selections: Partial<LevelUpSelections>
): CharacterSheet {
  return recalculateSheet(
    applyManualLevelUp(sheet, {
      level: sheet.nivel + 1,
      powerChoice: 'class',
      ...selections,
    })
  );
}

/** Lutador 6 que pega `arcanistaLevels` níveis de Feiticeiro Rubro. */
function makeLutadorFeiticeiro(arcanistaLevels: number): CharacterSheet {
  let sheet = makeSheet('Lutador', 6);
  for (let i = 1; i <= arcanistaLevels; i += 1) {
    sheet = levelUp(sheet, {
      selectedClassName: 'Arcanista',
      classSetup:
        i === 1
          ? {
              arcanistaSubtype: 'Feiticeiro',
              feiticeiroLinhagem: 'Linhagem Rubra',
            }
          : undefined,
    });
  }
  return sheet;
}

function offeredSpells(sheet: CharacterSheet): Spell[] {
  const requirement = getPowerSelectionRequirements(
    conhecimentoMagico
  )!.requirements.find((req) => req.type === 'learnAnySpellFromHighestCircle')!;
  return getFilteredAvailableOptions(requirement, sheet) as Spell[];
}

const circlesOf = (spells: Spell[]): Set<spellsCircles> =>
  new Set(spells.map((spell) => spell.spellCircle));

describe('Conhecimento Mágico em multiclasse', () => {
  it('Lutador 6 / Feiticeiro 5 enxerga até o 2º círculo', () => {
    const sheet = makeLutadorFeiticeiro(5);

    expect(sheet.classe.name).toBe('Lutador');
    expect(getHighestSpellCircle(sheet, 'Arcane')).toBe(2);
    expect(circlesOf(offeredSpells(sheet))).toEqual(
      new Set([spellsCircles.c1, spellsCircles.c2])
    );
  });

  it('Lutador 6 / Feiticeiro 4 ainda fica no 1º círculo', () => {
    const sheet = makeLutadorFeiticeiro(4);

    expect(getHighestSpellCircle(sheet, 'Arcane')).toBe(1);
    expect(circlesOf(offeredSpells(sheet))).toEqual(
      new Set([spellsCircles.c1])
    );
  });

  it('ficha recarregada (serializada) mantém o 2º círculo', () => {
    const loaded = JSON.parse(
      JSON.stringify(makeLutadorFeiticeiro(5))
    ) as CharacterSheet;

    expect(getHighestSpellCircle(loaded, 'Arcane')).toBe(2);

    // Ficha anterior a `multiclassSetups`: subtipo inferido do spellPath gravado
    delete loaded.multiclassSetups;
    expect(getHighestSpellCircle(loaded, 'Arcane')).toBe(2);
    expect(circlesOf(offeredSpells(loaded))).toEqual(
      new Set([spellsCircles.c1, spellsCircles.c2])
    );
  });

  it('aprende magias de 2º círculo no nível em que chega a Arcanista 5', () => {
    const picked = dataRegistry
      .getArcaneSpellsByCircleAndSupplements(2, [])
      .slice(0, 2);
    const sheet = levelUp(makeLutadorFeiticeiro(4), {
      selectedClassName: 'Arcanista',
      selectedClassPower: conhecimentoMagico,
      powerEffectSelections: {
        'Conhecimento Mágico': { spells: picked },
      },
    });

    expect(sheet.spells.map((spell) => spell.nome)).toEqual(
      expect.arrayContaining(picked.map((spell) => spell.nome))
    );
  });

  it('classe principal conjuradora usa o nível de classe, não o total', () => {
    let sheet = makeSheet('Arcanista', 5);
    for (let i = 0; i < 6; i += 1) {
      sheet = levelUp(sheet, { selectedClassName: 'Lutador' });
    }

    expect(sheet.nivel).toBe(11);
    expect(getHighestSpellCircle(sheet, 'Arcane')).toBe(2);
  });

  it('mono-classe segue o nível da ficha', () => {
    expect(getHighestSpellCircle(makeSheet('Arcanista', 5))).toBe(2);
    expect(getHighestSpellCircle(makeSheet('Arcanista', 9))).toBe(3);
  });

  it('quem não conjura continua no 1º círculo', () => {
    const sheet = makeSheet('Lutador', 6);

    expect(getHighestSpellCircle(sheet)).toBe(0);
    expect(circlesOf(offeredSpells(sheet))).toEqual(
      new Set([spellsCircles.c1])
    );
  });
});
