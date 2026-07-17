import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { findClassDescription, getClassLevelsMap } from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { createCompanion } from '../../data/systems/tormenta20/herois-de-arton/companion';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

describe('applyManualLevelUp - sincronia de classLevels', () => {
  test('multiclasse não infla a classe primária quando classLevels veio dessincronizado', () => {
    // Cenário do bug: ficha Druida cujo nível foi reduzido para 3 sem aparar
    // classLevels (que ficou com 4 entradas). O level-up com multiclasse não
    // pode acumular um 4º nível de Druida fantasma.
    const druida = findClassDescription('Druida')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(druida);
    sheet.nivel = 3;
    sheet.classLevels = [1, 2, 3, 4].map((level) => ({
      level,
      className: 'Druida',
    }));

    const selections: LevelUpSelections = {
      level: 4,
      selectedClassName: 'Guerreiro',
      powerChoice: 'class',
    };

    const result = applyManualLevelUp(sheet, selections);

    expect(result.nivel).toBe(4);
    expect(result.classLevels).toHaveLength(4);
    expect(result.classLevels!.map((cl) => cl.className)).toEqual([
      'Druida',
      'Druida',
      'Druida',
      'Guerreiro',
    ]);

    const map = getClassLevelsMap(result);
    expect(map.get('Druida')).toBe(3);
    expect(map.get('Guerreiro')).toBe(1);
  });

  test('caso normal (classLevels já em sincronia) continua correto', () => {
    const druida = findClassDescription('Druida')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(druida);
    sheet.nivel = 3;
    sheet.classLevels = [1, 2, 3].map((level) => ({
      level,
      className: 'Druida',
    }));

    const result = applyManualLevelUp(sheet, {
      level: 4,
      selectedClassName: 'Guerreiro',
      powerChoice: 'class',
    });

    expect(result.nivel).toBe(4);
    expect(result.classLevels).toHaveLength(4);
    const map = getClassLevelsMap(result);
    expect(map.get('Druida')).toBe(3);
    expect(map.get('Guerreiro')).toBe(1);
  });
});

describe('applyManualLevelUp - Treino Especializado (Treinador 5)', () => {
  const buildTreinadorLevel4 = (): CharacterSheet => {
    const treinador = findClassDescription('Treinador')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(treinador);
    sheet.nivel = 4;
    sheet.classLevels = [1, 2, 3, 4].map((level) => ({
      level,
      className: 'Treinador',
    }));
    sheet.companions = [
      createCompanion({
        name: 'Rex',
        type: 'Animal',
        size: 'Médio',
        weaponDamageType: 'Corte',
        skills: [Skill.LUTA, Skill.FORTITUDE, Skill.PERCEPCAO],
        tricks: [{ name: 'Amigo Feroz' }, { name: 'Veloz' }],
        trainerLevel: 4,
        trainerCharisma: 1,
      }),
    ];
    return sheet;
  };

  const levelUpTo5 = (
    extra: Partial<LevelUpSelections>
  ): LevelUpSelections => ({
    level: 5,
    selectedClassName: 'Treinador',
    powerChoice: 'class',
    ...extra,
  });

  test('Conquistar pelos Números usa a personalização do wizard quando completa', () => {
    const sheet = buildTreinadorLevel4();
    const result = applyManualLevelUp(
      sheet,
      levelUpTo5({
        abilityEffectSelections: {
          'Treino Especializado': {
            chosenOption: ['Conquistar pelos Números'],
          },
        },
        companionName: 'Sombra',
        companionType: 'Morto-Vivo',
        companionSize: 'Grande',
        companionWeaponDamageType: 'Perfuração',
        companionSkills: [Skill.FURTIVIDADE, Skill.LUTA, Skill.VONTADE],
        companionTricks: [
          { name: 'Táticas de Matilha' },
          { name: 'Treinamento Defensivo' },
        ],
      })
    );

    expect(result.companions).toHaveLength(2);
    const second = result.companions![1];
    expect(second.name).toBe('Sombra');
    expect(second.companionType).toBe('Morto-Vivo');
    expect(second.size).toBe('Grande');
    expect(second.skills).toEqual([
      Skill.FURTIVIDADE,
      Skill.LUTA,
      Skill.VONTADE,
    ]);
    expect(second.tricks.map((t) => t.name)).toEqual([
      'Táticas de Matilha',
      'Treinamento Defensivo',
    ]);
    // O primeiro amigo permanece intacto
    expect(result.companions![0].name).toBe('Rex');
    expect(result.companions![0].treinoIntensivo).toBeFalsy();
  });

  test('Conquistar pelos Números sem personalização cai no fallback aleatório', () => {
    const sheet = buildTreinadorLevel4();
    const result = applyManualLevelUp(
      sheet,
      levelUpTo5({
        abilityEffectSelections: {
          'Treino Especializado': {
            chosenOption: ['Conquistar pelos Números'],
          },
        },
      })
    );

    expect(result.companions).toHaveLength(2);
    expect(result.companions![1].companionType).toBeTruthy();
    expect(result.companions![1].tricks.length).toBeGreaterThan(0);
  });

  test('Treino Intensivo ignora campos companion* obsoletos e só marca a flag', () => {
    const sheet = buildTreinadorLevel4();
    const result = applyManualLevelUp(
      sheet,
      levelUpTo5({
        abilityEffectSelections: {
          'Treino Especializado': { chosenOption: ['Treino Intensivo'] },
        },
        // Campos deixados para trás por uma tentativa abandonada de
        // Conquistar pelos Números — não podem virar um 2º companheiro
        companionType: 'Animal',
        companionSize: 'Pequeno',
        companionWeaponDamageType: 'Impacto',
        companionSkills: [Skill.LUTA, Skill.FORTITUDE, Skill.PERCEPCAO],
        companionTricks: [{ name: 'Asas' }, { name: 'Veloz' }],
      })
    );

    expect(result.companions).toHaveLength(1);
    expect(result.companions![0].treinoIntensivo).toBe(true);
  });
});
