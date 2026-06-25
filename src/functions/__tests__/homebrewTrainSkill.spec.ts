import Skill from '../../interfaces/Skills';
import { compileClassContent } from '../../premium/functions/compileClass';
import { HomebrewClassContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre a conversão, no compile, do bônus "treinar perícia" (target
 * `TrainSkill`) na ação `learnSkill`: específico (`pick >= total` → treina
 * todas) ou escolha do jogador (`pick < total` → escolhe `pick` da lista). O
 * marcador `TrainSkill` é removido dos bônus (vira ação).
 */
describe('homebrew TrainSkill bonus', () => {
  const content = (
    target: Extract<
      import('../../interfaces/CharacterSheet').StatModifierTarget,
      { type: 'TrainSkill' }
    >
  ): HomebrewClassContent => ({
    pv: 12,
    addpv: 3,
    pm: 3,
    addpm: 3,
    proficiencies: ['Armas Simples'],
    skills: {
      basic: [{ mode: 'and', skills: [Skill.LUTA] }],
      remaining: { qtd: 1, list: [Skill.ATLETISMO] },
    },
    abilities: [
      {
        name: 'Treinamento',
        description: 'treina perícia',
        nivel: 1,
        sheetBonuses: [
          {
            source: { type: 'power', name: 'x' },
            target,
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
    powers: [],
  });

  it('converts specific TrainSkill into a learnSkill action picking all listed', () => {
    const c = compileClassContent(
      content({
        type: 'TrainSkill',
        skills: [Skill.FURTIVIDADE, Skill.ACROBACIA],
        pick: 2,
      }),
      'Classe Teste'
    );
    const actions = c.abilities[0].sheetActions || [];
    const learn = actions.filter((a) => a.action.type === 'learnSkill');
    expect(learn).toHaveLength(1);
    expect(learn[0].action).toMatchObject({
      type: 'learnSkill',
      availableSkills: [Skill.FURTIVIDADE, Skill.ACROBACIA],
      pick: 2,
    });
  });

  it('converts player-choice TrainSkill into a learnSkill action with pick < total', () => {
    const c = compileClassContent(
      content({
        type: 'TrainSkill',
        skills: [Skill.FURTIVIDADE, Skill.ACROBACIA, Skill.ATLETISMO],
        pick: 1,
      }),
      'Classe Teste'
    );
    const learn = (c.abilities[0].sheetActions || []).find(
      (a) => a.action.type === 'learnSkill'
    );
    expect(learn?.action).toMatchObject({ type: 'learnSkill', pick: 1 });
    expect(
      (learn?.action as { availableSkills: Skill[] }).availableSkills
    ).toHaveLength(3);
  });

  it('drops the TrainSkill target from the compiled bonuses', () => {
    const c = compileClassContent(
      content({ type: 'TrainSkill', skills: [Skill.LUTA], pick: 1 }),
      'Classe Teste'
    );
    const bonuses = c.abilities[0].sheetBonuses || [];
    expect(bonuses.some((b) => b.target.type === 'TrainSkill')).toBe(false);
  });
});
