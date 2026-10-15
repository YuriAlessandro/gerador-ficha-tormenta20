import { cloneDeep } from 'lodash';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { SpellSchool } from '../../interfaces/Spells';
import DRUIDA_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/druida';
import { applyPower } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription } from '../multiclass';
import { getSchoolChoiceConfig, XAMA_MISTICO } from '../spellPathUtils';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import {
  getEditableSchoolTargets,
  getPendingAppendedSchools,
} from '../spells/spellSchoolEditing';

const XAMA = DRUIDA_POWERS.find((p) => p.name === XAMA_MISTICO) as ClassPower;
const SCHOOLS: SpellSchool[] = ['Abjur', 'Evoc', 'Necro'];

function makeDruid(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  const classDesc = cloneDeep(findClassDescription('Druida')!);
  sheet.classe = classDesc.setup ? classDesc.setup(classDesc) : classDesc;
  sheet.classe.spellPath!.schools = [...SCHOOLS];
  sheet.steps = [];
  return sheet;
}

function withXama(sheet: CharacterSheet): CharacterSheet {
  return { ...sheet, classPowers: [...(sheet.classPowers ?? []), XAMA] };
}

describe('Xamã Místico', () => {
  it('libera uma 4ª escola no limite do Druida', () => {
    const sheet = makeDruid();
    expect(getSchoolChoiceConfig(sheet.classe, sheet)?.count).toBe(3);
    expect(getSchoolChoiceConfig(sheet.classe, withXama(sheet))?.count).toBe(4);
    expect(getEditableSchoolTargets(withXama(sheet))[0].config.count).toBe(4);
  });

  it('não muda o limite do Bardo', () => {
    const bardo = findClassDescription('Bardo')!;
    expect(getSchoolChoiceConfig(bardo, withXama(makeDruid()))?.count).toBe(3);
  });

  it('acrescenta a escola escolhida às escolas do Druida, sem duplicar', () => {
    const [once] = applyPower(withXama(makeDruid()), XAMA, {
      chosenOption: ['Ilusão'],
    });
    expect(once.classe.spellPath?.schools).toEqual([...SCHOOLS, 'Ilusão']);
    expect(once.optionChoices?.xamaMisticoEscola).toEqual(['Ilusão']);

    const [twice] = applyPower(once, XAMA, { chosenOption: ['Ilusão'] });
    expect(twice.classe.spellPath?.schools).toEqual([...SCHOOLS, 'Ilusão']);
  });

  it('sorteio (geração aleatória) escolhe uma escola que o Druida não tem', () => {
    for (let i = 0; i < 20; i += 1) {
      const [result] = applyPower(withXama(makeDruid()), XAMA);
      const schools = result.classe.spellPath?.schools ?? [];
      expect(schools).toHaveLength(4);
      expect(new Set(schools).size).toBe(4);
    }
  });

  it('o assistente só oferece escolas que o Druida ainda não tem', () => {
    const sheet = withXama(makeDruid());
    const [requirement] = getPowerSelectionRequirements(XAMA)!.requirements;
    const offered = (
      getFilteredAvailableOptions(requirement, sheet) as { name: string }[]
    ).map((o) => o.name);
    expect(offered).toHaveLength(5);
    expect(offered).not.toContain('Abjuração');
    expect(offered).toContain('Ilusão');
  });

  it('escola pendente do level-up entra no pool do mesmo nível', () => {
    const sheet = makeDruid();
    expect(
      getPendingAppendedSchools(
        XAMA,
        { [XAMA_MISTICO]: { chosenOption: ['Ilusão'] } },
        sheet.classe
      )
    ).toEqual(['Ilusão']);
    expect(
      getPendingAppendedSchools(
        XAMA,
        { [XAMA_MISTICO]: { chosenOption: ['Ilusão'] } },
        findClassDescription('Bardo')!
      )
    ).toEqual([]);
  });

  it('concede +1 PM por nível de druida e +1 na CD', () => {
    const [result] = applyPower(withXama(makeDruid()), XAMA, {
      chosenOption: ['Ilusão'],
    });
    const fromXama = result.sheetBonuses.filter(
      (b) => b.source?.type === 'power' && b.source.name === XAMA_MISTICO
    );
    expect(fromXama.map((b) => b.target.type).sort()).toEqual([
      'PM',
      'SpellDC',
    ]);
  });

  it('recálculo soma +1 PM por nível de druida', () => {
    const base = makeDruid();
    base.nivel = 5;
    base.classLevels = Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      className: 'Druida',
    }));
    const [withPower] = applyPower(withXama(base), XAMA, {
      chosenOption: ['Ilusão'],
    });
    const before = recalculateSheet(base).pm;
    const after = recalculateSheet(withPower).pm;
    expect(after - before).toBe(5);
  });
});
