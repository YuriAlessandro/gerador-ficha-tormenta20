import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import { DefenseEquipment } from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';
import { GeneralPowerType } from '../../interfaces/Poderes';

/**
 * Armadura sensual (Heróis de Arton, p. 225): "permite usar o poder Atraente.
 * Se você já tiver esse poder, em vez disso o bônus fornecido por ele aumenta
 * para +5."
 *
 * Os dois conjuntos de bônus diferem só pelo `negate` do `hasPower`, então a
 * regra proíbe estruturalmente somar +2 e +5.
 */
const CARISMA_SKILLS = [
  Skill.ADESTRAMENTO,
  Skill.ATUACAO,
  Skill.DIPLOMACIA,
  Skill.ENGANACAO,
  Skill.INTIMIDACAO,
  Skill.JOGATINA,
];

const catalogArmor = (nome: string): DefenseEquipment => {
  const found = dataRegistry
    .getEquipmentBySupplements([
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ])
    .armors.find((a) => a.nome === nome);
  if (!found) throw new Error(`${nome} não está no catálogo`);
  // Clonar: o catálogo do registry é cache COMPARTILHADO.
  return _.cloneDeep(found);
};

const others = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

interface SheetOptions {
  worn?: boolean;
  hasAtraente?: boolean;
  extraArmor?: boolean;
}

const buildSheet = (options: SheetOptions): CharacterSheet => {
  const sensual = { ...catalogArmor('Armadura sensual'), id: 'sensual-1' };
  const armors: DefenseEquipment[] = [sensual];

  if (options.extraArmor) {
    armors.push({ ...catalogArmor('Brigantina'), id: 'brigantina-1' });
  }

  const sheet = createMockCharacterSheet();
  sheet.bag = new Bag({ Armadura: armors });
  sheet.wornArmorId = options.worn ? 'sensual-1' : 'brigantina-1';

  if (options.hasAtraente) {
    sheet.generalPowers = [
      {
        name: 'Atraente',
        description:
          'Você recebe +2 em testes de perícias baseadas em Carisma contra criaturas que possam se sentir fisicamente atraídas por você.',
        type: GeneralPowerType.DESTINO,
        requirements: [],
      },
    ];
  }

  return recalculateSheet(sheet);
};

describe('Armadura sensual', () => {
  it('vestida sem o poder Atraente: +2 nas perícias de Carisma', () => {
    const sheet = buildSheet({ worn: true, extraArmor: true });
    CARISMA_SKILLS.forEach((skill) => {
      expect(others(sheet, skill)).toBe(2);
    });
  });

  it('vestida com Atraente: o bônus vira +5, e não 7', () => {
    const sheet = buildSheet({
      worn: true,
      extraArmor: true,
      hasAtraente: true,
    });
    CARISMA_SKILLS.forEach((skill) => {
      expect(others(sheet, skill)).toBe(5);
    });
  });

  it('não afeta perícias de outros atributos', () => {
    const sheet = buildSheet({ worn: true, extraArmor: true });
    expect(others(sheet, Skill.ATLETISMO)).toBe(0);
    expect(others(sheet, Skill.ACROBACIA)).toBe(0);
    expect(others(sheet, Skill.MISTICISMO)).toBe(0);
  });

  it('na mochila mas NÃO vestida: nenhum bônus', () => {
    const sheet = buildSheet({ worn: false, extraArmor: true });
    CARISMA_SKILLS.forEach((skill) => {
      expect(others(sheet, skill)).toBe(0);
    });
  });

  it('na mochila e não vestida, mesmo com Atraente: nenhum bônus', () => {
    const sheet = buildSheet({
      worn: false,
      extraArmor: true,
      hasAtraente: true,
    });
    expect(others(sheet, Skill.DIPLOMACIA)).toBe(0);
  });

  it('o breakdown de perícia credita a armadura', () => {
    const sheet = buildSheet({
      worn: true,
      extraArmor: true,
      hasAtraente: true,
    });
    const skill = sheet.completeSkills?.find(
      (s) => s.name === Skill.DIPLOMACIA
    );
    if (!skill) throw new Error('Diplomacia ausente na ficha');

    const rows = getSkillOthersBreakdown(sheet, skill);
    const row = rows.find((r) => r.label.includes('Armadura sensual'));
    expect(row).toBeDefined();
    expect(row?.value).toBe(5);
  });
});
