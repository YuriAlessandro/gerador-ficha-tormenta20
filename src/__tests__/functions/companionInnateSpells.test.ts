/**
 * Magia Inata (Treinador — Heróis de Arton).
 *
 * Cobre a fonte compartilhada de magias (getInnateSpellOptions), incluindo a
 * completude — todas as magias de 1º círculo devem estar disponíveis, já que o
 * feedback do usuário relatava "diversas magias faltando" — e a derivação
 * autoritativa das magias do melhor amigo a partir dos truques Magia Inata em
 * calculateCompanionStats (o ponto único por onde passam criação, level up e
 * edição do parceiro).
 */
import { describe, it, expect } from 'vitest';
import {
  getInnateSpellOptions,
  findInnateSpell,
} from '../../data/systems/tormenta20/herois-de-arton/companion/innateSpells';
import {
  createCompanion,
  calculateCompanionStats,
} from '../../data/systems/tormenta20/herois-de-arton/companion';
import { spellsCircle1 } from '../../data/systems/tormenta20/magias/generalSpells';
import { spellsCircles, Spell } from '../../interfaces/Spells';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { CompanionSheet, CompanionTrick } from '../../interfaces/Companion';

describe('getInnateSpellOptions', () => {
  const options = getInnateSpellOptions();

  it('só contém magias de 1º círculo', () => {
    expect(options.length).toBeGreaterThan(0);
    options.forEach((s) => expect(s.spellCircle).toBe(spellsCircles.c1));
  });

  it('não tem nomes duplicados e está ordenado por nome', () => {
    const names = options.map((s) => s.nome);
    expect(new Set(names).size).toBe(names.length);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('cobre TODAS as magias de 1º círculo (nada faltando)', () => {
    const available = new Set(options.map((s) => s.nome));
    const missing = Object.values(spellsCircle1)
      .map((s) => s.nome)
      .filter((nome) => !available.has(nome));
    expect(missing).toEqual([]);
    // Guarda contra regressão silenciosa de tamanho.
    expect(options.length).toBe(Object.keys(spellsCircle1).length);
  });

  it('findInnateSpell encontra por nome e ignora inexistentes', () => {
    const first = options[0];
    expect(findInnateSpell(first.nome)?.nome).toBe(first.nome);
    expect(findInnateSpell('Magia Que Não Existe')).toBeUndefined();
  });
});

describe('calculateCompanionStats — magias derivadas de Magia Inata', () => {
  const baseArgs = {
    type: 'Espírito' as const,
    size: 'Médio' as const,
    weaponDamageType: 'Corte' as const,
    spiritEnergyType: 'Positiva' as const,
    skills: [],
    trainerLevel: 3,
    trainerCharisma: 3,
  };

  const spellName = getInnateSpellOptions()[0].nome;

  const trick = (
    name: string,
    choices?: Record<string, string>
  ): CompanionTrick => (choices ? { name, choices } : { name });

  it('createCompanion concede a magia com Carisma como atributo-chave', () => {
    const companion = createCompanion({
      ...baseArgs,
      tricks: [trick('Magia Inata', { spell: spellName })],
    });
    expect(companion.spells?.map((s) => s.nome)).toEqual([spellName]);
    expect(companion.spells?.[0].customKeyAttr).toBe(Atributo.CARISMA);
  });

  it('Magia Inata sem escolha de magia não concede magia', () => {
    const companion = createCompanion({
      ...baseArgs,
      tricks: [trick('Magia Inata')],
    });
    expect(companion.spells).toBeUndefined();
  });

  it('é autoritativa: remover o truque remove a magia', () => {
    const withSpell = createCompanion({
      ...baseArgs,
      tricks: [trick('Magia Inata', { spell: spellName })],
    });
    const withoutTrick = calculateCompanionStats(
      { ...withSpell, tricks: [] },
      baseArgs.trainerLevel,
      baseArgs.trainerCharisma
    );
    expect(withoutTrick.spells).toBeUndefined();
  });

  it('substitui (não duplica) magias já presentes em companion.spells', () => {
    const companion = createCompanion({
      ...baseArgs,
      tricks: [trick('Magia Inata', { spell: spellName })],
    });
    // Simula um estado com magia "pré-carregada" além do truque: a derivação
    // autoritativa deve reconstruir a lista só a partir dos truques.
    const staleSpell = { ...getInnateSpellOptions()[1] } as Spell;
    const recalculated = calculateCompanionStats(
      {
        ...companion,
        spells: [...(companion.spells || []), staleSpell],
      } as CompanionSheet,
      baseArgs.trainerLevel,
      baseArgs.trainerCharisma
    );
    expect(recalculated.spells?.map((s) => s.nome)).toEqual([spellName]);
  });

  it('múltiplos truques Magia Inata concedem múltiplas magias', () => {
    const [a, b] = getInnateSpellOptions();
    const companion = createCompanion({
      ...baseArgs,
      tricks: [
        trick('Magia Inata', { spell: a.nome }),
        trick('Magia Inata', { spell: b.nome }),
      ],
    });
    expect(companion.spells?.map((s) => s.nome).sort()).toEqual(
      [a.nome, b.nome].sort()
    );
  });
});
