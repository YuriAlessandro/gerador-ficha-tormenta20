import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';
import { compileClassContent } from '../../premium/functions/compileClass';
import { HomebrewClassContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre a conversão, no compile, dos bônus de ATRIBUTO em AÇÕES (atributo via
 * sheetBonuses não é aplicado pelo motor) e a marcação de `optionKey` em
 * PickSkill (escolha do jogador persistida).
 */
describe('homebrew choice bonuses (skill/attribute)', () => {
  const content = (): HomebrewClassContent => ({
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
        name: 'Talento Versátil',
        description: 'bônus de escolha',
        nivel: 1,
        sheetBonuses: [
          {
            source: { type: 'power', name: 'x' },
            target: { type: 'Attribute', attribute: Atributo.FORCA },
            modifier: { type: 'Fixed', value: 1 },
          },
          {
            source: { type: 'power', name: 'x' },
            target: { type: 'PickAttribute', pick: 2, oncePerTier: true },
            modifier: { type: 'Fixed', value: 1 },
          },
          {
            source: { type: 'power', name: 'x' },
            target: {
              type: 'PickSkill',
              skills: Object.values(Skill),
              pick: 1,
            },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
    powers: [],
  });

  it('converts Attribute -> ModifyAttribute and PickAttribute -> increaseAttribute actions', () => {
    const c = compileClassContent(content(), 'Classe Teste');
    const ability = c.abilities[0];
    const actions = ability.sheetActions || [];

    const modify = actions.filter((a) => a.action.type === 'ModifyAttribute');
    expect(modify).toHaveLength(1);
    expect(modify[0].action).toMatchObject({
      type: 'ModifyAttribute',
      attribute: Atributo.FORCA,
      value: 1,
    });

    const increases = actions.filter(
      (a) => a.action.type === 'increaseAttribute'
    );
    expect(increases).toHaveLength(2); // pick: 2 → uma ação por escolha
    increases.forEach((a) => {
      expect(a.action).toMatchObject({
        type: 'increaseAttribute',
        value: 1,
        oncePerTier: true,
      });
      // cada ação tem optionKey próprio (persistência da escolha)
      expect((a.action as { optionKey?: string }).optionKey).toBeTruthy();
    });
  });

  it('keeps PickSkill as a bonus and stamps an optionKey; drops attribute targets', () => {
    const c = compileClassContent(content(), 'Classe Teste');
    const bonuses = c.abilities[0].sheetBonuses || [];

    // Atributo/PickAttribute viraram ações — não restam como bônus.
    expect(
      bonuses.some(
        (b) =>
          b.target.type === 'Attribute' || b.target.type === 'PickAttribute'
      )
    ).toBe(false);

    const pickSkill = bonuses.find((b) => b.target.type === 'PickSkill');
    expect(pickSkill).toBeDefined();
    expect(
      (pickSkill?.target as { optionKey?: string }).optionKey
    ).toBeTruthy();
  });
});
