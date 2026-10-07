import { describe, expect, it } from 'vitest';
import { SupplementId } from '@/types/supplement.types';
import { spellsCircles } from '@/interfaces/Spells';
import {
  CompendiumSpell,
  compendiumSpellToThreatSpell,
  diceRollToAbilityRoll,
  getCompendiumSpells,
  getRollKey,
} from '../spellCompendium';

let counter = 0;
const nextId = () => {
  counter += 1;
  return `id_${counter}`;
};

const findSpell = (spells: CompendiumSpell[], nome: string) => {
  const spell = spells.find((s) => s.nome === nome);
  if (!spell) throw new Error(`Magia ${nome} não encontrada`);
  return spell;
};

describe('getCompendiumSpells', () => {
  const core = getCompendiumSpells([SupplementId.TORMENTA20_CORE]);

  it('mescla magias universais numa entrada só com as duas tradições', () => {
    const curar = core.filter((s) => s.nome === 'Curar Ferimentos');
    expect(curar).toHaveLength(1);
    const luz = findSpell(core, 'Luz');
    expect(luz.traditions.sort()).toEqual(['arcane', 'divine']);
  });

  it('só traz magias de suplemento quando o suplemento é pedido', () => {
    const withSupplements = getCompendiumSpells([
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
    expect(withSupplements.length).toBeGreaterThan(core.length);
    expect(
      withSupplements.some(
        (s) => s.supplementId === SupplementId.TORMENTA20_HEROIS_ARTON
      )
    ).toBe(true);
    expect(
      core.every((s) => s.supplementId === SupplementId.TORMENTA20_CORE)
    ).toBe(true);
  });
});

describe('diceRollToAbilityRoll', () => {
  it('separa o bônus fixo do dado', () => {
    expect(
      diceRollToAbilityRoll({ label: 'Dano', dice: '2d6+6' }, 'r1')
    ).toEqual({ id: 'r1', name: 'Dano', dice: '2d6', bonus: 6 });
    expect(
      diceRollToAbilityRoll({ label: 'Dano', dice: '1d8-1' }, 'r2').bonus
    ).toBe(-1);
  });

  it('aceita mais de um grupo de dados', () => {
    expect(
      diceRollToAbilityRoll({ label: 'Dano', dice: '2d8+1d6+5' }, 'r4')
    ).toEqual({ id: 'r4', name: 'Dano', dice: '2d8+1d6', bonus: 5 });
  });

  it('inclui o tipo de dano no nome da rolagem', () => {
    expect(
      diceRollToAbilityRoll(
        { label: 'Dano', dice: '6d6', damageType: 'fogo' },
        'r3'
      )
    ).toEqual({ id: 'r3', name: 'Dano (fogo)', dice: '6d6', bonus: 0 });
  });
});

const indexOfAprimoramento = (spell: CompendiumSpell, text: RegExp) => {
  const index = (spell.aprimoramentos ?? []).findIndex((a) =>
    text.test(a.text)
  );
  if (index < 0) throw new Error(`Aprimoramento ${text} não encontrado`);
  return index;
};

describe('compendiumSpellToThreatSpell', () => {
  const core = getCompendiumSpells([SupplementId.TORMENTA20_CORE]);

  it('sem aprimoramentos: custo do círculo, rolagens base e sem lista de aprimoramentos', () => {
    const spell = findSpell(core, 'Bola de Fogo');
    const threatSpell = compendiumSpellToThreatSpell(spell, nextId);
    expect(spell.spellCircle).toBe(spellsCircles.c2);
    expect(threatSpell.name).toBe('Bola de Fogo');
    expect(threatSpell.pmCost).toBe(3);
    expect(threatSpell.actionType).toBeUndefined();
    expect(threatSpell.rolls).toEqual([
      expect.objectContaining({ dice: '6d6', bonus: 0 }),
    ]);
    expect(threatSpell.description).toMatch(/^Arcana 2 \(Evocação\); /);
    expect(threatSpell.description).toContain(spell.description);
    // Na mesa não dá para escolher aprimoramento: a lista não vai pro texto.
    expect(threatSpell.description).not.toContain('Aprimoramentos');
  });

  it('embute aprimoramento cumulativo no custo e nas rolagens', () => {
    const spell = findSpell(core, 'Bola de Fogo');
    const aumenta = indexOfAprimoramento(spell, /^aumenta o dano em \+2d6/);
    const threatSpell = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map([[aumenta, 2]])
    );
    expect(threatSpell.pmCost).toBe(3 + 2 * 2);
    expect(threatSpell.rolls).toEqual([
      expect.objectContaining({ dice: '10d6', bonus: 0 }),
    ]);
    expect(threatSpell.description).toContain(
      'Aprimoramentos aplicados:\n• 2× +2 PM: aumenta o dano em +2d6.'
    );
  });

  it('cura aumentada e sem a rolagem do truque', () => {
    const spell = findSpell(core, 'Curar Ferimentos');
    const aumenta = indexOfAprimoramento(spell, /^aumenta a cura/);
    const threatSpell = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map([[aumenta, 3]])
    );
    expect(threatSpell.pmCost).toBe(1 + 3);
    expect(threatSpell.rolls).toEqual([
      expect.objectContaining({
        name: 'Recuperar vida',
        dice: '5d8',
        bonus: 5,
      }),
    ]);
  });

  it('truque zera o custo e fica só com a rolagem do truque', () => {
    const spell = findSpell(core, 'Curar Ferimentos');
    const truque = (spell.aprimoramentos ?? []).findIndex((a) => a.trick);
    const threatSpell = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map([[truque, 1]])
    );
    expect(threatSpell.pmCost).toBeUndefined();
    expect(threatSpell.rolls).toHaveLength(1);
    expect(threatSpell.rolls?.[0].name).toMatch(/truque/);
  });

  it.each(['Explosão de Chamas', 'Miasma Mefítico', 'Raio Solar'])(
    'truque de %s (sem rolagem de truque) não grava o dano normal',
    (nome) => {
      const spell = findSpell(core, nome);
      const truque = (spell.aprimoramentos ?? []).findIndex((a) => a.trick);
      expect(compendiumSpellToThreatSpell(spell, nextId).rolls).toBeDefined();
      const threatSpell = compendiumSpellToThreatSpell(
        spell,
        nextId,
        new Map([[truque, 1]])
      );
      expect(threatSpell.pmCost).toBeUndefined();
      expect(threatSpell.rolls).toBeUndefined();
    }
  );

  it('truque sem rolagem de truque ainda aceita a escolha manual', () => {
    const spell = findSpell(core, 'Explosão de Chamas');
    const rolls = spell.rolls ?? [];
    const truque = (spell.aprimoramentos ?? []).findIndex((a) => a.trick);
    const threatSpell = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map([[truque, 1]]),
      new Map([[getRollKey(rolls[0], 0), true]])
    );
    expect(threatSpell.rolls).toHaveLength(1);
  });

  it('lista os aprimoramentos aplicados na ordem do livro', () => {
    const spell = findSpell(core, 'Bola de Fogo');
    const aumenta = indexOfAprimoramento(spell, /^aumenta o dano em \+2d6/);
    const outro = (spell.aprimoramentos ?? []).findIndex(
      (a, index) => index > aumenta && !a.trick
    );
    const { description } = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map([
        [outro, 1],
        [aumenta, 1],
      ])
    );
    const aplicados = description.split('Aprimoramentos aplicados:\n')[1];
    expect(aplicados.indexOf('aumenta o dano em +2d6')).toBeLessThan(
      aplicados.indexOf(spell.aprimoramentos?.[outro].text ?? '')
    );
  });

  it('respeita a escolha manual de rolagens', () => {
    const spell = findSpell(core, 'Curar Ferimentos');
    const rolls = spell.rolls ?? [];
    const truqueIndex = rolls.findIndex((r) => /truque/.test(r.label));
    const threatSpell = compendiumSpellToThreatSpell(
      spell,
      nextId,
      new Map(),
      new Map([
        [getRollKey(rolls[truqueIndex], truqueIndex), true],
        [getRollKey(rolls[0], 0), false],
      ])
    );
    expect(threatSpell.rolls?.map((r) => r.name)).toEqual([
      rolls[truqueIndex].label,
    ]);
  });

  it('converte a execução para o tipo de ação da ameaça', () => {
    const spell = findSpell(core, 'Escudo da Fé');
    expect(compendiumSpellToThreatSpell(spell, nextId).actionType).toBe(
      'Reação'
    );
  });
});
