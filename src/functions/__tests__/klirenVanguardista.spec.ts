import { recalculateSheet } from '../recalculateSheet';
import { applyStatModifiers, generateEmptySheet } from '../general';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';
import KLIREN from '../../data/systems/tormenta20/races/kliren';

/**
 * Vanguardista (Kliren): "+2 em testes de Ofício (um qualquer, a sua escolha)".
 * O bônus ia para "Ofício (Qualquer)" em vez de um Ofício escolhido.
 */
describe('Kliren — Vanguardista', () => {
  const OPTION_KEY = 'kliren-vanguardista-oficio';
  const vanguardista = KLIREN.abilities.find((a) => a.name === 'Vanguardista');
  if (!vanguardista) throw new Error('Vanguardista não encontrada');

  const makeSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [];
    sheet.classPowers = [];
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.raca = KLIREN;
    return sheet;
  };

  const oficioOthers = (sheet: CharacterSheet, skill: Skill) =>
    sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

  it('oferece no assistente só os Ofícios treinados (inclusive já treinados)', () => {
    const requirements = getPowerSelectionRequirements(vanguardista);
    const skillReq = requirements?.requirements.find(
      (r) => r.type === 'learnSkill'
    );
    expect(skillReq).toBeDefined();
    if (!skillReq) return;

    const sheet = makeSheet();
    sheet.skills = [...sheet.skills, Skill.OFICIO_EGENHOQUEIRO];
    const options = getFilteredAvailableOptions(skillReq, sheet);

    // Ofício não treinado não tem linha na ficha: o bônus sumiria.
    expect(options).toEqual([Skill.OFICIO_EGENHOQUEIRO]);
  });

  it('no assistente, o bônus chega ao Ofício treinado escolhido', () => {
    const options: SelectedOptions = {
      nivel: 1,
      raca: 'Kliren',
      classe: 'Inventor',
      origin: '',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    };
    const sheet = generateEmptySheet(options, {
      classSkills: [Skill.OFICIO_ARMEIRO],
      powerEffectSelections: {
        Vanguardista: { skills: [Skill.OFICIO_ARMEIRO] },
      },
    });

    expect(oficioOthers(sheet, Skill.OFICIO_ARMEIRO)).toBe(2);
    expect(oficioOthers(recalculateSheet(sheet), Skill.OFICIO_ARMEIRO)).toBe(2);
  });

  it('aplica o bônus no Ofício escolhido e o mantém nos recálculos seguintes', () => {
    const chosen = recalculateSheet(makeSheet(), undefined, {
      Vanguardista: { skills: [Skill.OFICIO_ALQUIMIA] },
    });

    expect(chosen.optionChoices?.[OPTION_KEY]).toEqual([Skill.OFICIO_ALQUIMIA]);
    expect(oficioOthers(chosen, Skill.OFICIO_ALQUIMIA)).toBe(2);
    expect(oficioOthers(chosen, Skill.OFICIO)).toBe(0);

    // Edições posteriores recalculam sem `manualSelections`.
    const again = recalculateSheet(chosen);
    expect(oficioOthers(again, Skill.OFICIO_ALQUIMIA)).toBe(2);
    expect(oficioOthers(again, Skill.OFICIO)).toBe(0);
  });

  it('na geração aleatória, prefere um Ofício que o personagem treina', () => {
    const sheet = makeSheet();
    sheet.skills = [...sheet.skills, Skill.OFICIO_ARMEIRO];
    sheet.sheetBonuses = [...(vanguardista.sheetBonuses ?? [])];

    const result = applyStatModifiers(sheet);

    expect(result.optionChoices?.[OPTION_KEY]).toEqual([Skill.OFICIO_ARMEIRO]);
    expect(oficioOthers(result, Skill.OFICIO_ARMEIRO)).toBe(2);
    expect(oficioOthers(result, Skill.OFICIO)).toBe(0);
  });
});
