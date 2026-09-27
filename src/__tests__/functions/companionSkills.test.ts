/**
 * Perícias do Melhor Amigo: as escolhidas (`chosenSkills`) ficam separadas das
 * derivadas do tipo e do Veloz (`skills`). Antes as duas viviam em `skills`, e
 * cada recálculo relia as derivadas como escolhidas: remover o Veloz mantinha
 * Atletismo e trocar o tipo mantinha as perícias do tipo antigo.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCompanionStats,
  createCompanion,
  inferChosenSkills,
} from '../../data/systems/tormenta20/herois-de-arton/companion';
import Skill from '../../interfaces/Skills';
import { CompanionSheet, CompanionTrick } from '../../interfaces/Companion';

const make = (
  chosen: Skill[],
  tricks: CompanionTrick[],
  type: CompanionSheet['companionType'] = 'Construto'
) =>
  createCompanion({
    type,
    size: 'Médio',
    weaponDamageType: 'Corte',
    skills: chosen,
    tricks,
    trainerLevel: 4,
    trainerCharisma: 1,
  });

const recalc = (companion: CompanionSheet) =>
  calculateCompanionStats(companion, 4, 1);

describe('Veloz', () => {
  it('treina Atletismo quando o amigo não era treinado', () => {
    const c = make(
      [Skill.LUTA, Skill.FORTITUDE, Skill.REFLEXOS],
      [{ name: 'Veloz' }]
    );
    expect(c.skills).toContain(Skill.ATLETISMO);
    expect(c.skillBonuses).toBeUndefined();
    expect(c.chosenSkills).toEqual([
      Skill.LUTA,
      Skill.FORTITUDE,
      Skill.REFLEXOS,
    ]);
  });

  it('dá +2 em Atletismo quando o amigo já era treinado', () => {
    const c = make(
      [Skill.LUTA, Skill.ATLETISMO, Skill.REFLEXOS],
      [{ name: 'Veloz' }]
    );
    expect(c.skills.filter((s) => s === Skill.ATLETISMO)).toHaveLength(1);
    expect(c.skillBonuses).toEqual({ [Skill.ATLETISMO]: 2 });
  });

  it('remover o Veloz tira o Atletismo derivado', () => {
    const c = make(
      [Skill.LUTA, Skill.FORTITUDE, Skill.REFLEXOS],
      [{ name: 'Veloz' }]
    );
    const removed = recalc({ ...c, tricks: [] });
    expect(removed.skills).not.toContain(Skill.ATLETISMO);
    expect(removed.skillBonuses).toBeUndefined();
  });

  it('remover o Veloz mantém o Atletismo escolhido, sem o +2', () => {
    const c = make(
      [Skill.LUTA, Skill.ATLETISMO, Skill.REFLEXOS],
      [{ name: 'Veloz' }]
    );
    const removed = recalc({ ...c, tricks: [] });
    expect(removed.skills).toContain(Skill.ATLETISMO);
    expect(removed.skillBonuses).toBeUndefined();
  });
});

describe('tipo do amigo', () => {
  it('trocar Animal por Construto tira Percepção e Sobrevivência', () => {
    const animal = make(
      [Skill.LUTA, Skill.FORTITUDE, Skill.REFLEXOS],
      [],
      'Animal'
    );
    expect(animal.skills).toEqual(
      expect.arrayContaining([Skill.PERCEPCAO, Skill.SOBREVIVENCIA])
    );
    const construto = recalc({ ...animal, companionType: 'Construto' });
    expect(construto.skills).toEqual([
      Skill.LUTA,
      Skill.FORTITUDE,
      Skill.REFLEXOS,
    ]);
  });

  it('perícia escolhida que o tipo também treina não sai ao trocar o tipo', () => {
    const animal = make(
      [Skill.LUTA, Skill.PERCEPCAO, Skill.REFLEXOS],
      [],
      'Animal'
    );
    const construto = recalc({ ...animal, companionType: 'Construto' });
    expect(construto.skills).toEqual([
      Skill.LUTA,
      Skill.PERCEPCAO,
      Skill.REFLEXOS,
    ]);
  });
});

it('recalcular não muda o resultado', () => {
  const c = make(
    [Skill.LUTA, Skill.ATLETISMO, Skill.REFLEXOS],
    [{ name: 'Veloz' }],
    'Animal'
  );
  const again = recalc(recalc(c));
  expect(again.skills).toEqual(c.skills);
  expect(again.chosenSkills).toEqual(c.chosenSkills);
  expect(again.skillBonuses).toEqual(c.skillBonuses);
});

describe('fichas antigas (sem chosenSkills)', () => {
  const legacy = (
    skills: Skill[],
    tricks: CompanionTrick[],
    type: CompanionSheet['companionType'] = 'Animal'
  ) => {
    const c = make([], tricks, type);
    return recalc({
      ...c,
      chosenSkills: undefined,
      originalAutoState: undefined,
      skills,
    });
  };

  it('tira as derivadas do fim da lista', () => {
    const c = legacy(
      [
        Skill.LUTA,
        Skill.FORTITUDE,
        Skill.REFLEXOS,
        Skill.PERCEPCAO,
        Skill.SOBREVIVENCIA,
        Skill.ATLETISMO,
      ],
      [{ name: 'Veloz' }]
    );
    expect(c.chosenSkills).toEqual([
      Skill.LUTA,
      Skill.FORTITUDE,
      Skill.REFLEXOS,
    ]);
    expect(c.skillBonuses).toBeUndefined();
  });

  it('Atletismo entre as 3 primeiras era escolhido e passa a ganhar +2', () => {
    const c = legacy(
      [
        Skill.LUTA,
        Skill.ATLETISMO,
        Skill.REFLEXOS,
        Skill.PERCEPCAO,
        Skill.SOBREVIVENCIA,
      ],
      [{ name: 'Veloz' }]
    );
    expect(c.chosenSkills).toEqual([
      Skill.LUTA,
      Skill.ATLETISMO,
      Skill.REFLEXOS,
    ]);
    expect(c.skillBonuses).toEqual({ [Skill.ATLETISMO]: 2 });
  });

  it('corrige o Atletismo que ficou preso depois de remover o Veloz', () => {
    const c = legacy(
      [
        Skill.LUTA,
        Skill.FORTITUDE,
        Skill.REFLEXOS,
        Skill.PERCEPCAO,
        Skill.SOBREVIVENCIA,
        Skill.ATLETISMO,
      ],
      []
    );
    expect(c.skills).toEqual([
      Skill.LUTA,
      Skill.FORTITUDE,
      Skill.REFLEXOS,
      Skill.PERCEPCAO,
      Skill.SOBREVIVENCIA,
    ]);
  });

  it('usa o estado anterior aos overrides quando existe', () => {
    const c = make([Skill.LUTA, Skill.FORTITUDE, Skill.REFLEXOS], [], 'Animal');
    const withOverride = recalc({
      ...c,
      chosenSkills: undefined,
      skills: [Skill.VONTADE],
      manualOverrides: { skills: [Skill.VONTADE] },
    });
    expect(withOverride.chosenSkills).toEqual([
      Skill.LUTA,
      Skill.FORTITUDE,
      Skill.REFLEXOS,
    ]);
    expect(withOverride.skills).toEqual([Skill.VONTADE]);
  });

  it('não mexe em listas com até 3 perícias', () => {
    expect(
      inferChosenSkills([Skill.PERCEPCAO, Skill.ATLETISMO, Skill.SOBREVIVENCIA])
    ).toEqual([Skill.PERCEPCAO, Skill.ATLETISMO, Skill.SOBREVIVENCIA]);
  });
});
