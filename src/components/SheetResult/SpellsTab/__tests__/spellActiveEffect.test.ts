import { getSpellActiveEffectDefinition } from '../spellActiveEffect';
import { Spell, spellsCircles } from '../../../../interfaces/Spells';

const NIVEL = 5;

const mkSpell = (spell: Partial<Spell> & { nome: string }): Spell =>
  ({
    spellCircle: spellsCircles.c2,
    execucao: 'Padrão',
    alcance: 'Curto',
    duracao: 'Cena',
    school: 'Trans',
    ...spell,
  } as Spell);

describe('getSpellActiveEffectDefinition', () => {
  it('devolve null para magia sem efeito ativo', () => {
    expect(
      getSpellActiveEffectDefinition(mkSpell({ nome: 'Bola de Fogo' }), NIVEL)
    ).toBeNull();
  });

  it('reconhece magia do registry pelo nome exato', () => {
    const def = getSpellActiveEffectDefinition(
      mkSpell({ nome: 'Alterar Tamanho' }),
      NIVEL
    );
    expect(def?.name).toBe('Alterar Tamanho');
    expect(def?.getUsageOptions).toBeInstanceOf(Function);
  });

  it('cobre magia homebrew pelo primeiro customEffect', () => {
    const def = getSpellActiveEffectDefinition(
      mkSpell({
        nome: 'Magia Caseira',
        customEffects: [
          {
            id: 'ce-1',
            name: 'Bênção do Autor',
            description: 'Buff caseiro',
            tiers: [],
          },
        ],
      }),
      NIVEL
    );
    expect(def?.name).toBe('Bênção do Autor');
    // Como no lançamento: magia homebrew com efeito também oferta aos aliados.
    expect(def?.affectsAllies).toBe(true);
  });

  it('registry ganha do customEffects quando os dois existem', () => {
    const def = getSpellActiveEffectDefinition(
      mkSpell({
        nome: 'Alterar Tamanho',
        customEffects: [{ id: 'x', name: 'Outro', tiers: [] }],
      }),
      NIVEL
    );
    // Mesma precedência do `handleSpellCast`, senão a estrelinha abriria um
    // efeito diferente do que o lançamento oferece.
    expect(def?.name).toBe('Alterar Tamanho');
  });
});
