import { cloneDeep } from 'lodash';
import CharacterSheet, {
  ClassLevelEntry,
} from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import {
  isMulticlass,
  getClassLevel,
  getClassLevelsMap,
  initializeClassLevels,
  getMulticlassDisplayName,
  calculateMulticlassPV,
  calculateMulticlassPM,
  getMulticlassAvailableAbilities,
} from '../multiclass';

// Helper: create a simple class description for testing
function makeClassDesc(overrides: Partial<ClassDescription>): ClassDescription {
  return {
    name: 'TestClass',
    pv: 20,
    addpv: 5,
    pm: 3,
    addpm: 3,
    periciasbasicas: [],
    periciasrestantes: { qtd: 0, list: [] },
    proficiencias: [],
    abilities: [],
    powers: [],
    probDevoto: 0,
    attrPriority: [Atributo.FORCA],
    ...overrides,
  };
}

// Helper: create a multiclass sheet with specific class level distribution
function createMulticlassSheet(
  primaryClass: ClassDescription,
  classLevels: Array<{ className: string; classSubname?: string }>,
  conMod = 1
): CharacterSheet {
  const base = createMockCharacterSheet();
  base.classe = cloneDeep(primaryClass);
  base.nivel = classLevels.length;
  base.atributos[Atributo.CONSTITUICAO].value = conMod;
  base.classLevels = classLevels.map((cl, i) => ({
    level: i + 1,
    className: cl.className,
    classSubname: cl.classSubname,
  }));
  return base;
}

// ===== isMulticlass =====
describe('isMulticlass', () => {
  test('retorna false para sheet sem classLevels', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = undefined;
    expect(isMulticlass(sheet)).toBe(false);
  });

  test('retorna false para sheet com classLevels vazio', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [];
    expect(isMulticlass(sheet)).toBe(false);
  });

  test('retorna false para mono-classe (todas entradas mesma classe)', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
    ];
    expect(isMulticlass(sheet)).toBe(false);
  });

  test('retorna true para multiclasse (classes diferentes)', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Bárbaro' },
    ];
    expect(isMulticlass(sheet)).toBe(true);
  });

  test('retorna true para 3+ classes', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Bárbaro' },
      { level: 3, className: 'Ladino' },
    ];
    expect(isMulticlass(sheet)).toBe(true);
  });
});

// ===== getClassLevel =====
describe('getClassLevel', () => {
  test('retorna sheet.nivel quando classLevels é undefined', () => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    sheet.classLevels = undefined;
    expect(getClassLevel(sheet, 'Guerreiro')).toBe(5);
  });

  test('retorna 0 para classe não presente', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
    ];
    expect(getClassLevel(sheet, 'Bárbaro')).toBe(0);
  });

  test('conta corretamente os níveis de cada classe', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
      { level: 4, className: 'Bárbaro' },
      { level: 5, className: 'Bárbaro' },
    ];
    expect(getClassLevel(sheet, 'Guerreiro')).toBe(3);
    expect(getClassLevel(sheet, 'Bárbaro')).toBe(2);
  });
});

// ===== getClassLevelsMap =====
describe('getClassLevelsMap', () => {
  test('retorna Map com classe primária quando classLevels é undefined', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 5;
    sheet.classLevels = undefined;

    const map = getClassLevelsMap(sheet);
    expect(map.size).toBe(1);
    expect(map.get('Guerreiro')).toBe(5);
  });

  test('retorna Map com contagem correta para multiclasse', () => {
    const sheet = createMockCharacterSheet();
    sheet.classLevels = [
      { level: 1, className: 'Arcanista' },
      { level: 2, className: 'Arcanista' },
      { level: 3, className: 'Arcanista' },
      { level: 4, className: 'Paladino' },
    ];

    const map = getClassLevelsMap(sheet);
    expect(map.size).toBe(2);
    expect(map.get('Arcanista')).toBe(3);
    expect(map.get('Paladino')).toBe(1);
  });
});

// ===== initializeClassLevels =====
describe('initializeClassLevels', () => {
  test('cria entradas para todos os níveis da classe primária', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.classe.subname = undefined;
    sheet.nivel = 3;

    const entries = initializeClassLevels(sheet);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      level: 1,
      className: 'Guerreiro',
      classSubname: undefined,
    });
    expect(entries[2]).toEqual({
      level: 3,
      className: 'Guerreiro',
      classSubname: undefined,
    });
  });

  test('preserva subname (ex: Arcanista/Mago)', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Arcanista';
    sheet.classe.subname = 'Mago';
    sheet.nivel = 2;

    const entries = initializeClassLevels(sheet);
    expect(entries).toHaveLength(2);
    entries.forEach((entry) => {
      expect(entry.className).toBe('Arcanista');
      expect(entry.classSubname).toBe('Mago');
    });
  });
});

// ===== getMulticlassDisplayName =====
describe('getMulticlassDisplayName', () => {
  test('retorna "Classe Nível" para mono-classe', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 5;
    sheet.classLevels = undefined;

    expect(getMulticlassDisplayName(sheet)).toBe('Guerreiro 5');
  });

  test('retorna "Classe1 N / Classe2 M" para multiclasse', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 5;
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
      { level: 4, className: 'Bárbaro' },
      { level: 5, className: 'Bárbaro' },
    ];

    const display = getMulticlassDisplayName(sheet);
    expect(display).toBe('Guerreiro 3 / Bárbaro 2');
  });

  test('mostra variante corretamente para mono-classe', () => {
    const sheet = createMockCharacterSheet();
    // Clone the classe to avoid mutating the shared object
    sheet.classe = cloneDeep(sheet.classe);
    sheet.classe.name = 'Paladino';
    sheet.classe.isVariant = true;
    sheet.classe.baseClassName = 'Guerreiro';
    sheet.nivel = 5;
    sheet.classLevels = undefined;

    expect(getMulticlassDisplayName(sheet)).toBe('Paladino (Guerreiro) 5');
  });
});

// ===== calculateMulticlassPV =====
describe('calculateMulticlassPV', () => {
  const guerreiro = makeClassDesc({
    name: 'Guerreiro',
    pv: 20,
    addpv: 5,
  });

  const barbaro = makeClassDesc({
    name: 'Bárbaro',
    pv: 24,
    addpv: 6,
  });

  test('fallback mono-classe: pv + addpv * (nivel - 1) + con * nivel', () => {
    // Guerreiro nível 3, CON mod = 1
    const sheet = createMulticlassSheet(
      guerreiro,
      [
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
      ],
      1
    );

    // Fórmula: 20 + 5*(3-1) + 1*3 = 20 + 10 + 3 = 33
    expect(calculateMulticlassPV(sheet)).toBe(33);
  });

  test('multiclasse: primária usa pv base, secundária apenas addpv', () => {
    // Guerreiro 3 / Bárbaro 2, CON mod = 2
    const sheet = createMulticlassSheet(
      guerreiro,
      [
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
        { className: 'Bárbaro' },
        { className: 'Bárbaro' },
      ],
      2
    );

    // Guerreiro (primário): 20 (pv base) + 5*(3-1) = 20 + 10 = 30
    // Bárbaro (secundário): 6*2 = 12 (apenas addpv, sem pv base)
    // CON: 2 * 5 = 10
    // Total: 30 + 12 + 10 = 52
    expect(calculateMulticlassPV(sheet)).toBe(52);
  });

  test('multiclasse com CON negativo usa mínimo 0', () => {
    // Guerreiro 2 / Bárbaro 1, CON mod = -1
    const sheet = createMulticlassSheet(
      guerreiro,
      [
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
        { className: 'Bárbaro' },
      ],
      -1
    );

    // Guerreiro: 20 + 5*(2-1) = 25
    // Bárbaro: 6*1 = 6
    // CON: max(-1, 0) * 3 = 0
    // Total: 25 + 6 + 0 = 31
    expect(calculateMulticlassPV(sheet)).toBe(31);
  });

  test('multiclasse com bonusPV e manualPVEdit', () => {
    const sheet = createMulticlassSheet(
      guerreiro,
      [
        { className: 'Guerreiro' },
        { className: 'Guerreiro' },
        { className: 'Bárbaro' },
      ],
      0
    );
    sheet.bonusPV = 5;
    sheet.manualPVEdit = 3;

    // Guerreiro: 20 + 5*(2-1) = 25
    // Bárbaro: 6*1 = 6
    // CON: 0
    // Bonus: 5 + 3 = 8
    // Total: 25 + 6 + 0 + 8 = 39
    expect(calculateMulticlassPV(sheet)).toBe(39);
  });
});

// ===== calculateMulticlassPM =====
describe('calculateMulticlassPM', () => {
  const guerreiro = makeClassDesc({
    name: 'Guerreiro',
    pm: 3,
    addpm: 3,
  });

  const arcanista = makeClassDesc({
    name: 'Arcanista',
    pm: 6,
    addpm: 6,
  });

  test('fallback mono-classe: pm + addpm * (nivel - 1)', () => {
    const sheet = createMulticlassSheet(guerreiro, [
      { className: 'Guerreiro' },
      { className: 'Guerreiro' },
      { className: 'Guerreiro' },
    ]);

    // 3 + 3*(3-1) = 3 + 6 = 9
    expect(calculateMulticlassPM(sheet)).toBe(9);
  });

  test('multiclasse: cada classe contribui pm + addpm * (classLevel - 1)', () => {
    // Guerreiro 3 / Arcanista 2
    const sheet = createMulticlassSheet(guerreiro, [
      { className: 'Guerreiro' },
      { className: 'Guerreiro' },
      { className: 'Guerreiro' },
      { className: 'Arcanista' },
      { className: 'Arcanista' },
    ]);

    // Guerreiro: 3 + 3*(3-1) = 9
    // Arcanista: 6 + 6*(2-1) = 12
    // Total: 9 + 12 = 21
    expect(calculateMulticlassPM(sheet)).toBe(21);
  });

  test('multiclasse com bonusPM e manualPMEdit', () => {
    const sheet = createMulticlassSheet(guerreiro, [
      { className: 'Guerreiro' },
      { className: 'Arcanista' },
    ]);
    sheet.bonusPM = 4;
    sheet.manualPMEdit = 2;

    // Guerreiro: 3 + 3*(1-1) = 3
    // Arcanista: 6 + 6*(1-1) = 6
    // Bonus: 4 + 2 = 6
    // Total: 3 + 6 + 6 = 15
    expect(calculateMulticlassPM(sheet)).toBe(15);
  });
});

// ===== getMulticlassAvailableAbilities =====
describe('getMulticlassAvailableAbilities', () => {
  test('mono-classe: retorna habilidades até nível do personagem', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'TestClass';
    sheet.nivel = 5;
    sheet.classLevels = undefined;
    sheet.classe.abilities = [
      { name: 'Hab1', text: 'test', nivel: 1 },
      { name: 'Hab2', text: 'test', nivel: 3 },
      { name: 'Hab3', text: 'test', nivel: 5 },
      { name: 'Hab4', text: 'test', nivel: 7 },
    ];

    const abilities = getMulticlassAvailableAbilities(sheet);
    expect(abilities).toHaveLength(3);
    expect(abilities.map((a) => a.name)).toEqual(['Hab1', 'Hab2', 'Hab3']);
  });
});

// ===== Integration: backward compatibility =====
describe('Backward compatibility', () => {
  test('sheet sem classLevels se comporta como mono-classe em todas as funções', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 5;
    sheet.classLevels = undefined;

    expect(isMulticlass(sheet)).toBe(false);
    expect(getClassLevel(sheet, 'Guerreiro')).toBe(5);
    expect(getClassLevel(sheet, 'Bárbaro')).toBe(5); // Falls back to sheet.nivel
    expect(getMulticlassDisplayName(sheet)).toBe('Guerreiro 5');
  });

  test('sheet com classLevels mono-classe funciona igual a sem classLevels', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.classe.pv = 20;
    sheet.classe.addpv = 5;
    sheet.classe.pm = 3;
    sheet.classe.addpm = 3;
    sheet.nivel = 3;
    sheet.atributos[Atributo.CONSTITUICAO].value = 1;
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
    ];

    // isMulticlass should be false (only one unique class)
    expect(isMulticlass(sheet)).toBe(false);

    // PV should use fallback formula: 20 + 5*(3-1) + 1*3 = 33
    expect(calculateMulticlassPV(sheet)).toBe(33);

    // PM should use fallback formula: 3 + 3*(3-1) = 9
    expect(calculateMulticlassPM(sheet)).toBe(9);
  });
});

// ===== Edge cases =====
describe('Edge cases', () => {
  test('personagem com apenas 1 nível numa nova classe', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 4;
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
      { level: 4, className: 'Bárbaro' },
    ];

    expect(isMulticlass(sheet)).toBe(true);
    expect(getClassLevel(sheet, 'Guerreiro')).toBe(3);
    expect(getClassLevel(sheet, 'Bárbaro')).toBe(1);
    expect(getMulticlassDisplayName(sheet)).toBe('Guerreiro 3 / Bárbaro 1');
  });

  test('3 classes diferentes', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 6;
    sheet.classLevels = [
      { level: 1, className: 'Guerreiro' },
      { level: 2, className: 'Guerreiro' },
      { level: 3, className: 'Guerreiro' },
      { level: 4, className: 'Bárbaro' },
      { level: 5, className: 'Bárbaro' },
      { level: 6, className: 'Ladino' },
    ];

    expect(isMulticlass(sheet)).toBe(true);
    expect(getClassLevel(sheet, 'Guerreiro')).toBe(3);
    expect(getClassLevel(sheet, 'Bárbaro')).toBe(2);
    expect(getClassLevel(sheet, 'Ladino')).toBe(1);

    const display = getMulticlassDisplayName(sheet);
    expect(display).toContain('Guerreiro 3');
    expect(display).toContain('Bárbaro 2');
    expect(display).toContain('Ladino 1');
  });

  test('initializeClassLevels para nível 1', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe.name = 'Guerreiro';
    sheet.nivel = 1;

    const entries = initializeClassLevels(sheet);
    expect(entries).toHaveLength(1);
    expect(entries[0].className).toBe('Guerreiro');
    expect(entries[0].level).toBe(1);
  });
});
