import _ from 'lodash';
import generateRandomSheet, { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription, getClassLevelsMap } from '../multiclass';
import { getLastLevelSummary, revertLastLevel } from '../revertLevel';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { createCompanion } from '../../data/systems/tormenta20/herois-de-arton/companion';
import { DestinyPowers } from '../../data/systems/tormenta20/powers/destinyPowers';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import DEUSES_ARTON_POWERS from '../../data/systems/tormenta20/deuses-de-arton/powers';

// Mesmo caminho do assistente: aplica as escolhas e recalcula.
const levelUp = (sheet: CharacterSheet, sel: LevelUpSelections) =>
  recalculateSheet(applyManualLevelUp(sheet, sel));

// Anão: Humano sorteia um poder geral a cada recálculo e deixa o teste flaky.
const generate = (classe: string): CharacterSheet =>
  recalculateSheet(
    generateRandomSheet({
      nivel: 1,
      raca: 'Anão',
      classe,
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    })
  );

const snapshot = (sheet: CharacterSheet) => ({
  nivel: sheet.nivel,
  pv: sheet.pv,
  pm: sheet.pm,
  defesa: sheet.defesa,
  atributos: _.mapValues(sheet.atributos, (a) => a.value),
  skills: [...sheet.skills].sort(),
  trained: (sheet.completeSkills ?? [])
    .filter((sk) => (sk.training ?? 0) > 0)
    .map((sk) => sk.name)
    .sort(),
  generalPowers: sheet.generalPowers.map((p) => p.name).sort(),
  classPowers: (sheet.classPowers ?? []).map((p) => p.name).sort(),
  abilities: sheet.classe.abilities.map((a) => a.name).sort(),
  spells: sheet.spells.map((sp) => sp.nome).sort(),
  classLevels: (sheet.classLevels ?? []).map((cl) => cl.className),
  steps: sheet.steps.map((st) => st.label),
});

const classPower = (className: string, name: string): ClassPower => {
  const power = findClassDescription(className)!.powers.find(
    (p) => p.name === name
  );
  if (!power) throw new Error(`Poder não encontrado: ${name}`);
  return power;
};

describe('revertLastLevel', () => {
  test('desfazer volta a ficha ao estado anterior à subida', () => {
    const base = generate('Guerreiro');
    const up = levelUp(base, {
      level: 2,
      powerChoice: 'general',
      selectedGeneralPower: DestinyPowers.TREINAMENTO_EM_PERICIA,
      powerEffectSelections: {
        'Treinamento em Perícia': {
          skills: [
            [Skill.MISTICISMO, Skill.CURA, Skill.NOBREZA].find(
              (sk) => !base.skills.includes(sk)
            )!,
          ],
        },
      },
    });
    expect(up.nivel).toBe(2);

    const reverted = revertLastLevel(up);
    const expected = snapshot(base);
    // Mono-classe antiga não tem `classLevels` até a primeira subida.
    expected.classLevels = ['Guerreiro'];
    expect(snapshot(reverted)).toEqual(expected);
  });

  test('poder repetível perde só a instância do nível desfeito', () => {
    const base = generate('Guerreiro');
    const aumento = classPower('Guerreiro', 'Aumento de Atributo');

    const lv2 = levelUp(base, {
      level: 2,
      powerChoice: 'class',
      selectedClassPower: aumento,
      powerEffectSelections: {
        'Aumento de Atributo': { attributes: [Atributo.FORCA] },
      },
    });
    const lv3 = levelUp(lv2, {
      level: 3,
      powerChoice: 'class',
      selectedClassPower: aumento,
      powerEffectSelections: {
        'Aumento de Atributo': { attributes: [Atributo.CONSTITUICAO] },
      },
    });
    expect(lv3.atributos[Atributo.CONSTITUICAO].value).toBe(
      base.atributos[Atributo.CONSTITUICAO].value + 1
    );

    const reverted = revertLastLevel(lv3);
    expect(snapshot(reverted)).toEqual(snapshot(lv2));

    const twice = revertLastLevel(reverted);
    expect(snapshot(twice).atributos).toEqual(snapshot(base).atributos);
    expect(twice.classPowers?.map((p) => p.name)).toEqual(
      base.classPowers?.map((p) => p.name)
    );
  });

  test('multiclasse: volta ao nível 1 e tira a classe secundária', () => {
    const base = generate('Guerreiro');
    const multi = levelUp(base, {
      level: 2,
      selectedClassName: 'Ladino',
      powerChoice: 'general',
      selectedGeneralPower: DestinyPowers.TREINAMENTO_EM_PERICIA,
      powerEffectSelections: {
        'Treinamento em Perícia': {
          skills: [
            [Skill.MISTICISMO, Skill.CURA, Skill.NOBREZA].find(
              (sk) => !base.skills.includes(sk)
            )!,
          ],
        },
      },
    });
    expect(getClassLevelsMap(multi).get('Ladino')).toBe(1);
    expect(multi.classe.abilities.map((a) => a.name)).toContain(
      'Ataque Furtivo'
    );

    const reverted = revertLastLevel(multi);
    expect(reverted.nivel).toBe(1);
    expect(reverted.classLevels?.map((cl) => cl.className)).toEqual([
      'Guerreiro',
    ]);
    expect(reverted.classe.abilities.map((a) => a.name)).not.toContain(
      'Ataque Furtivo'
    );
    const expected = snapshot(base);
    expected.classLevels = ['Guerreiro'];
    expect(snapshot(reverted)).toEqual(expected);
  });

  test('magias aprendidas no nível saem', () => {
    const base = generate('Arcanista');
    const known = new Set(base.spells.map((sp) => sp.nome));
    const up = applyManualLevelUp(base, {
      level: 2,
      powerChoice: 'general',
      selectedGeneralPower: DestinyPowers.TREINAMENTO_EM_PERICIA,
      powerEffectSelections: {
        'Treinamento em Perícia': {
          skills: [
            [Skill.CURA, Skill.NOBREZA, Skill.ATLETISMO].find(
              (sk) => !base.skills.includes(sk)
            )!,
          ],
        },
      },
      spellsLearned: [
        {
          ...base.spells[0],
          nome: 'Magia de Teste',
        },
      ],
    });
    const upRecalc = recalculateSheet(up);
    expect(upRecalc.spells.map((sp) => sp.nome)).toContain('Magia de Teste');
    expect(getLastLevelSummary(upRecalc).spells).toEqual(['Magia de Teste']);

    const reverted = revertLastLevel(upRecalc);
    expect(new Set(reverted.spells.map((sp) => sp.nome))).toEqual(known);
  });

  test('truque do Melhor Amigo ganho no nível sai', () => {
    const treinador = findClassDescription('Treinador')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = _.cloneDeep(treinador);
    sheet.nivel = 3;
    sheet.classLevels = [1, 2, 3].map((level) => ({
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
        tricks: [{ name: 'Amigo Feroz' }],
        trainerLevel: 3,
        trainerCharisma: 1,
      }),
    ];

    const up = applyManualLevelUp(sheet, {
      level: 4,
      selectedClassName: 'Treinador',
      powerChoice: 'class',
      companionTrickSelections: [
        { companionIndex: 0, trick: { name: 'Veloz' }, reason: 'auto' },
      ],
    });
    expect(up.companions![0].tricks).toEqual([
      { name: 'Amigo Feroz' },
      { name: 'Veloz', level: 4 },
    ]);

    const reverted = revertLastLevel(up);
    expect(reverted.nivel).toBe(3);
    expect(reverted.companions![0].tricks).toEqual([{ name: 'Amigo Feroz' }]);
    expect(
      reverted.sheetActionHistory.some((entry) =>
        entry.changes.some((c) => c.type === 'CompanionTrickLearned')
      )
    ).toBe(false);
  });

  test('Biblioteca Divina perde a perícia do patamar ao voltar para o anterior', () => {
    const biblioteca = DEUSES_ARTON_POWERS.CONCEDIDOS.find(
      (p) => p.name === 'Biblioteca Divina'
    )!;
    const lv4 = generateRandomSheet({
      nivel: 4,
      raca: 'Anão',
      classe: 'Guerreiro',
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });
    lv4.generalPowers.push(biblioteca);
    const base = recalculateSheet(lv4);
    const tierSkill = [Skill.MISTICISMO, Skill.CURA, Skill.NOBREZA].find(
      (sk) => !base.skills.includes(sk)
    )!;

    const up = levelUp(base, {
      level: 5,
      powerChoice: 'class',
      powerEffectSelections: {
        'Biblioteca Divina': { skills: [tierSkill] },
      },
    });
    expect(up.skills).toContain(tierSkill);

    const reverted = revertLastLevel(up);
    expect(reverted.skills).not.toContain(tierSkill);
    expect([...reverted.skills].sort()).toEqual([...base.skills].sort());
    expect(
      reverted.completeSkills?.find((sk) => sk.name === tierSkill)?.training
    ).toBe(0);
  });

  test('escolha extra de habilidade racial feita no nível sai', () => {
    const base = generate('Guerreiro');
    base.raca.abilities.push({
      name: 'Mutação',
      description: '',
      sheetActions: [
        {
          source: { type: 'race', raceName: base.raca.name },
          action: {
            type: 'chooseFromOptions',
            optionKey: 'mutacao',
            options: [
              { name: 'Garras', text: '' },
              { name: 'Escamas', text: '' },
            ],
            levelUp: { pickPerLevelUp: 1, substitutes: 'none' },
          },
        },
      ],
    });
    base.optionChoices = { ...base.optionChoices, mutacao: ['Garras'] };

    const up = levelUp(base, {
      level: 2,
      powerChoice: 'class',
      levelUpOptionPicks: { mutacao: ['Escamas'] },
    });
    expect(up.optionChoices?.mutacao).toEqual(['Garras', 'Escamas']);

    expect(revertLastLevel(up).optionChoices?.mutacao).toEqual(['Garras']);
  });

  test('não faz nada no nível 1', () => {
    const base = generate('Guerreiro');
    expect(revertLastLevel(base)).toBe(base);
  });
});

const countPower = (sheet: CharacterSheet, name: string) =>
  [...sheet.generalPowers, ...(sheet.classPowers ?? [])].filter(
    (p) => p.name === name
  ).length;

describe('revertLastLevel — fichas aleatórias', () => {
  const CLASSES = [
    'Arcanista',
    'Bárbaro',
    'Bardo',
    'Bucaneiro',
    'Caçador',
    'Cavaleiro',
    'Clérigo',
    'Druida',
    'Guerreiro',
    'Inventor',
    'Ladino',
    'Lutador',
    'Nobre',
    'Paladino',
  ];

  test.each(CLASSES)(
    '%s: desfaz do 8 ao 1 sem sobrar nada dos níveis',
    (classe) => {
      let sheet = recalculateSheet(
        generateRandomSheet({
          nivel: 8,
          raca: 'Anão',
          classe,
          origin: 'Aleatório',
          devocao: { label: '--', value: '--' },
          supplements: [SupplementId.TORMENTA20_CORE],
        })
      );

      for (let level = 8; level > 1; level -= 1) {
        const { powers } = getLastLevelSummary(sheet);
        const before = sheet;
        sheet = revertLastLevel(sheet);

        expect(sheet.nivel).toBe(level - 1);
        expect(sheet.classLevels).toHaveLength(level - 1);
        expect(sheet.pv).toBeLessThan(before.pv);
        expect(
          sheet.sheetActionHistory.some(
            (entry) =>
              entry.source.type === 'levelUp' && entry.source.level >= level
          )
        ).toBe(false);
        expect(sheet.steps.map((st) => st.label)).not.toContain(
          `Nível ${level}`
        );
        // Cada poder do nível perde exatamente uma instância.
        const after = sheet;
        _.uniq(powers).forEach((name) => {
          expect(countPower(after, name)).toBe(
            countPower(before, name) - powers.filter((p) => p === name).length
          );
        });
      }
    }
  );
});
