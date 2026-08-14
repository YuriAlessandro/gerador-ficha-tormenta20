import { GeneralPowerType } from '../../interfaces/Poderes';
import { compilePowerPackContent } from '../../premium/functions/compilePowerPackage';
import { HomebrewPowerPackContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre o compilador de Pacote de Poderes homebrew: poder geral → `powers[tipo]`,
 * poder de classe → `classPowers[classe-alvo]`, com requisitos/efeitos preservados.
 */
describe('homebrew power pack', () => {
  const content = (): HomebrewPowerPackContent => ({
    powers: [
      {
        kind: 'general',
        generalType: GeneralPowerType.COMBATE,
        name: 'Investida Brutal',
        description: 'Avança e ataca.',
        requirements: [[{ type: 'NIVEL', value: 3 }]],
        canRepeat: true,
        customEffects: [
          {
            id: 'eff-1',
            name: 'Fúria',
            tiers: [
              {
                id: 't1',
                label: '+2 dano',
                bonuses: [
                  {
                    target: { type: 'WeaponDamage' },
                    modifier: { type: 'Fixed', value: 2 },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        kind: 'class',
        targetClass: 'Guerreiro',
        name: 'Golpe Decisivo',
        description: 'Um golpe poderoso.',
        requirements: [[{ type: 'NIVEL', value: 5 }]],
      },
    ],
  });

  it('routes a general power into powers[category]', () => {
    const { powers } = compilePowerPackContent(content());
    expect(powers[GeneralPowerType.COMBATE].map((p) => p.name)).toEqual([
      'Investida Brutal',
    ]);
    const gp = powers[GeneralPowerType.COMBATE][0];
    expect(gp.type).toBe(GeneralPowerType.COMBATE);
    expect(gp.requirements[0][0].value).toBe(3);
    expect(gp.canRepeat).toBe(true);
    expect(gp.customEffects).toHaveLength(1);
  });

  it('routes a class power into classPowers[targetClass]', () => {
    const { classPowers } = compilePowerPackContent(content());
    expect(classPowers.Guerreiro?.map((p) => p.name)).toEqual([
      'Golpe Decisivo',
    ]);
    expect(classPowers.Guerreiro?.[0].requirements?.[0][0].value).toBe(5);
  });

  it('preserva "conta como poder da Tormenta" nos dois tipos de poder', () => {
    const withFlag: HomebrewPowerPackContent = {
      powers: [
        {
          kind: 'general',
          generalType: GeneralPowerType.CONCEDIDOS,
          name: 'Escolhido de Aharadak',
          description: 'Poder concedido que conta como poder da Tormenta.',
          countAsTormentaPower: true,
        },
        {
          kind: 'class',
          targetClass: 'Arcanista',
          name: 'Corrupção Rubra',
          description: 'Conta como poder da Tormenta, exceto para Carisma.',
          countAsTormentaPower: true,
          tormentaCountExcludesCharisma: true,
        },
      ],
    };

    const { powers, classPowers } = compilePowerPackContent(withFlag);

    const concedido = powers[GeneralPowerType.CONCEDIDOS][0];
    expect(concedido.countAsTormentaPower).toBe(true);
    expect(concedido.tormentaCountExcludesCharisma).toBeUndefined();

    const doClasse = classPowers.Arcanista?.[0];
    expect(doClasse?.countAsTormentaPower).toBe(true);
    expect(doClasse?.tormentaCountExcludesCharisma).toBe(true);
  });
});
