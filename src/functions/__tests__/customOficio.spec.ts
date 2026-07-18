import { recalculateSheet } from '../recalculateSheet';
import { generateEmptySheet } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { buildCustomOficio } from '../oficio';
import { convertToFoundry } from '../../2foundry';

/**
 * Ofício customizado é o único nome de perícia que vive FORA do enum `Skill`.
 * Antes destes fixes ele era descartado silenciosamente em todo ponto que
 * reconstruía `completeSkills` iterando o enum — o usuário criava o Ofício no
 * wizard e ele sumia da ficha no primeiro recálculo.
 */
const CUSTOM = (() => {
  const result = buildCustomOficio('Ferreiro anão');
  if (!result.ok) throw new Error('fixture inválida');
  return result.value;
})();

const findSkill = (sheet: CharacterSheet, name: string) =>
  sheet.completeSkills?.find((skill) => skill.name === name);

describe('Ofício customizado na ficha', () => {
  it('ganha linha em completeSkills quando só existe em skills', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, CUSTOM];

    const result = recalculateSheet(sheet);

    const row = findSkill(result, CUSTOM);
    expect(row).toBeDefined();
    expect(row?.modAttr).toBe(Atributo.INTELIGENCIA);
    expect(row?.training ?? 0).toBeGreaterThan(0);
  });

  it('sobrevive à reconstrução completa (completeSkills indefinido)', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, CUSTOM];
    sheet.completeSkills = undefined;

    const result = recalculateSheet(sheet);

    const row = findSkill(result, CUSTOM);
    expect(row).toBeDefined();
    expect(row?.modAttr).toBe(Atributo.INTELIGENCIA);
  });

  it('sobrevive a recálculos sucessivos e a level-up', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, CUSTOM];

    let result = recalculateSheet(sheet);
    result = recalculateSheet(result);
    result.nivel = 8;
    result = recalculateSheet(result);

    const row = findSkill(result, CUSTOM);
    expect(row).toBeDefined();
    expect(row?.halfLevel).toBe(4);
    expect(row?.training).toBe(4); // nível 7+ => +4
  });

  it('não ressuscita Ofício do livro destreinado pelo usuário', () => {
    const sheet = createMockCharacterSheet();
    // Presente em completeSkills sem treino e ausente de `skills`: é o estado
    // que o SkillsEditDrawer produz ao destreinar
    sheet.completeSkills = [
      ...(sheet.completeSkills ?? []),
      {
        name: Skill.OFICIO_ALQUIMIA,
        halfLevel: 1,
        training: 0,
        modAttr: Atributo.INTELIGENCIA,
        others: 0,
      },
    ];

    const result = recalculateSheet(sheet);

    expect(findSkill(result, Skill.OFICIO_ALQUIMIA)?.training ?? 0).toBe(0);
  });

  it('não duplica a linha quando ela já existe', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, CUSTOM];

    const result = recalculateSheet(recalculateSheet(sheet));

    const rows = result.completeSkills?.filter((s) => s.name === CUSTOM) ?? [];
    expect(rows).toHaveLength(1);
  });

  it('chega na ficha pelo caminho real do wizard (generateEmptySheet)', () => {
    const options: SelectOptions = {
      nivel: 1,
      raca: 'Humano',
      classe: 'Guerreiro',
      origin: 'Acólito',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    };
    const wizardSelections: WizardSelections = {
      classSkills: [CUSTOM],
      intelligenceSkills: [],
    };

    const sheet = generateEmptySheet(options, wizardSelections);

    expect(sheet.skills).toContain(CUSTOM);
    const row = findSkill(sheet, CUSTOM);
    expect(row).toBeDefined();
    expect(row?.modAttr).toBe(Atributo.INTELIGENCIA);
    expect(row?.training ?? 0).toBeGreaterThan(0);
  });

  it('é exportado para o Foundry (era descartado pelo lookup em FOUNDRY_SKILLS)', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, CUSTOM, Skill.OFICIO_ALQUIMIA];

    const foundry = convertToFoundry(recalculateSheet(sheet));

    const labels = Object.values(foundry.system.pericias.ofic.mais ?? {}).map(
      (entry) => entry.label
    );
    expect(labels).toContain(CUSTOM);
    expect(labels).toContain(Skill.OFICIO_ALQUIMIA);
  });
});
