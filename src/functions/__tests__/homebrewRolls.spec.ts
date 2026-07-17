import Skill from '../../interfaces/Skills';
import { compileClassContent } from '../../premium/functions/compileClass';
import { HomebrewClassContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre a compilação de rolagens de dados (HomebrewRoll → DiceRoll com id) em
 * habilidades e poderes de classe homebrew.
 */
describe('homebrew rolls', () => {
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
        name: 'Sopro Flamejante',
        description: 'Causa dano em área.',
        nivel: 1,
        rolls: [{ label: 'Dano de Fogo', dice: '2d6' }],
      },
    ],
    powers: [
      {
        name: 'Golpe Sangrento',
        description: 'Dano extra.',
        rolls: [{ label: 'Dano Extra', dice: '1d8+2' }],
      },
    ],
  });

  it('compiles rolls onto class abilities and powers with generated ids', () => {
    const c = compileClassContent(content(), 'Classe Teste');

    const ability = c.abilities[0];
    expect(ability.rolls).toHaveLength(1);
    expect(ability.rolls?.[0]).toMatchObject({
      label: 'Dano de Fogo',
      dice: '2d6',
    });
    expect(ability.rolls?.[0].id).toBeTruthy();

    const power = c.powers[0];
    expect(power.rolls).toHaveLength(1);
    expect(power.rolls?.[0]).toMatchObject({
      label: 'Dano Extra',
      dice: '1d8+2',
    });
    expect(power.rolls?.[0].id).toBeTruthy();
  });
});
