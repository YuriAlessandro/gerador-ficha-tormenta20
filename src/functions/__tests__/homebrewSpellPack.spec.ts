import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { spellsCircles } from '../../interfaces/Spells';
import {
  compileSpellPackContent,
  compileHomebrewSpell,
} from '../../premium/functions/compileSpellPackage';
import { collectVirtualCustomEffectDefinitions } from '../../premium/data/activePowers/customEffectAdapter';
import { HomebrewSpellPackContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre o compilador de Pacote de Magias homebrew (buckets por tradição, mapa de
 * círculo, efeito ativo → customEffects, aprimoramentos/rolagens) e a coleta de
 * efeitos ativos a partir de `sheet.spells`.
 */
describe('homebrew spell pack', () => {
  const content = (): HomebrewSpellPackContent => ({
    spells: [
      {
        name: 'Flecha Ácida',
        tradition: 'arcane',
        circle: 2,
        school: 'Evoc',
        execucao: 'Padrão',
        alcance: 'Médio',
        duracao: 'Instantânea',
        description: 'Dispara um projétil ácido.',
        aprimoramentos: [{ addPm: 1, text: 'Aumenta o dano em +1d6.' }],
        rolls: [{ label: 'Dano de Ácido', dice: '2d6' }],
      },
      {
        name: 'Bênção Menor',
        tradition: 'divine',
        circle: 1,
        school: 'Abjur',
        execucao: 'Padrão',
        alcance: 'Toque',
        duracao: 'Cena',
        description: 'Concede +2 na Defesa enquanto ativa.',
        activeEffect: {
          id: 'eff-bencao',
          name: 'Bênção Menor',
          tiers: [
            {
              id: 'tier-1',
              label: '+2 na Defesa',
              bonuses: [
                {
                  target: { type: 'Defense' },
                  modifier: { type: 'Fixed', value: 2 },
                },
              ],
            },
          ],
        },
      },
      {
        name: 'Detectar Tudo',
        tradition: 'universal',
        circle: 3,
        school: 'Adiv',
        execucao: 'Padrão',
        alcance: 'Pessoal',
        duracao: 'Cena',
        description: 'Detecta presenças próximas.',
      },
    ],
  });

  it('buckets spells by tradition and maps fields/circle/isCustom', () => {
    const spells = compileSpellPackContent(content());
    expect(spells.arcane?.map((s) => s.nome)).toEqual(['Flecha Ácida']);
    expect(spells.divine?.map((s) => s.nome)).toEqual(['Bênção Menor']);
    expect(spells.universal?.map((s) => s.nome)).toEqual(['Detectar Tudo']);

    const arcane = spells.arcane?.[0];
    expect(arcane?.spellCircle).toBe(spellsCircles.c2);
    expect(arcane?.isCustom).toBe(true);
    expect(arcane?.aprimoramentos?.[0].text).toContain('+1d6');
    expect(arcane?.rolls?.[0].dice).toBe('2d6');
    expect(arcane?.rolls?.[0].id).toBeTruthy(); // uuid gerado no compile
  });

  it('maps a single activeEffect onto Spell.customEffects', () => {
    const spells = compileSpellPackContent(content());
    const divine = spells.divine?.[0];
    expect(divine?.customEffects).toHaveLength(1);
    expect(divine?.customEffects?.[0].name).toBe('Bênção Menor');

    const noEffect = spells.universal?.[0];
    expect(noEffect?.customEffects).toBeUndefined();
  });

  it('collector surfaces a spell active effect from sheet.spells', () => {
    const sheet = createMockCharacterSheet();
    sheet.spells = [compileHomebrewSpell(content().spells[1])]; // Bênção Menor
    const defs = collectVirtualCustomEffectDefinitions(sheet);
    const found = defs.find((d) => d.name === 'Bênção Menor');
    expect(found).toBeDefined();
  });
});
