import Skill from '../../interfaces/Skills';
import { OriginPower } from '../../interfaces/Poderes';
import { compileOriginContent } from '../../premium/functions/compileOrigin';
import { HomebrewOriginContent } from '../../premium/interfaces/Homebrew';
import { applyRegionalOriginBenefits } from '../originBenefits';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';

/**
 * Cobre a compilação de uma Origem homebrew: modo tradicional (escolha) vs
 * receber tudo (regional), resolução de poderes gerais por nome, compilação dos
 * poderes de origem próprios e a aplicação regional concedendo perícias +
 * poderes gerais + poder de origem na ficha.
 */
describe('homebrew origin', () => {
  const content = (grantMode: 'choice' | 'all'): HomebrewOriginContent => ({
    grantMode,
    skills: [Skill.LUTA],
    generalPowers: ['Ataque Poderoso'],
    originPowers: [
      {
        name: 'Tradição Familiar',
        description: 'sua família te ensinou a se defender',
        sheetBonuses: [
          {
            source: { type: 'origin', originName: 'x' },
            target: { type: 'Defense' },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
    items: [{ name: 'Espada Longa' }],
  });

  it('compiles a traditional (choice) origin: pool + items, no regional', () => {
    const origin = compileOriginContent(content('choice'), 'Guardião');

    expect(origin.name).toBe('Guardião');
    expect(origin.pericias).toEqual([Skill.LUTA]);
    expect(origin.isRegional).toBeUndefined();
    expect(origin.getPowersAndSkills).toBeUndefined();

    // Poder de origem próprio compilado (type ORIGEM + bônus de Defesa).
    const op = origin.poderes.find((p) => p.name === 'Tradição Familiar') as
      | OriginPower
      | undefined;
    expect(op).toBeDefined();
    expect(op?.type).toBe('ORIGEM');
    expect(
      (op?.sheetBonuses || []).some((b) => b.target.type === 'Defense')
    ).toBe(true);

    // Poder geral resolvido por nome.
    expect(origin.poderes.some((p) => p.name === 'Ataque Poderoso')).toBe(true);

    // Itens sempre concedidos.
    expect(origin.getItems()).toEqual([
      { equipment: 'Espada Longa', qtd: undefined, description: undefined },
    ]);
  });

  it('compiles a "receive all" origin as regional with full benefits', () => {
    const origin = compileOriginContent(content('all'), 'Guardião');

    expect(origin.isRegional).toBe(true);
    expect(origin.getPowersAndSkills).toBeDefined();

    const benefits = origin.getPowersAndSkills?.([], origin, true);
    expect(benefits?.skills).toEqual([Skill.LUTA]);
    expect(
      benefits?.powers.origin.some((p) => p.name === 'Tradição Familiar')
    ).toBe(true);
    expect(
      (benefits?.powers.generalPowers || []).some(
        (p) => p.name === 'Ataque Poderoso'
      )
    ).toBe(true);
  });

  it('regional application grants skills + general powers + origin power', () => {
    const origin = compileOriginContent(content('all'), 'Guardião');
    const sheet = createMockCharacterSheet();
    sheet.skills = [];
    sheet.generalPowers = [];

    const updated = applyRegionalOriginBenefits(sheet, origin);

    expect(updated.skills).toContain(Skill.LUTA);
    expect(
      updated.generalPowers.some((p) => p.name === 'Ataque Poderoso')
    ).toBe(true);
    expect(
      updated.origin?.powers.some((p) => p.name === 'Tradição Familiar')
    ).toBe(true);
  });

  it('caps custom origin powers at 3', () => {
    const c = content('choice');
    c.originPowers = [0, 1, 2, 3].map((i) => ({
      name: `Poder ${i}`,
      description: 'x',
      sheetBonuses: [],
    }));
    const origin = compileOriginContent(c, 'Guardião');
    const originPowers = origin.poderes.filter(
      (p) => (p as OriginPower).type === 'ORIGEM'
    );
    expect(originPowers).toHaveLength(3);
  });
});
