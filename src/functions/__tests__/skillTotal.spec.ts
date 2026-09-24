import { describe, it, expect } from 'vitest';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill, { CompleteSkill } from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { getSkillTotal, getSkillTotalByName } from '../skills/skillTotal';

const skill = (over: Partial<CompleteSkill>): CompleteSkill =>
  ({
    name: Skill.ATLETISMO,
    halfLevel: 2,
    modAttr: Atributo.FORCA,
    training: 0,
    others: 0,
    ...over,
  } as CompleteSkill);

const sheet = (skills: CompleteSkill[], stealth = 0): CharacterSheet =>
  ({
    atributos: {
      [Atributo.FORCA]: { value: 3 },
      [Atributo.DESTREZA]: { value: 2 },
    },
    size: { modifiers: { stealth } },
    completeSkills: skills,
  } as unknown as CharacterSheet);

describe('getSkillTotal', () => {
  it('soma meio nível, atributo, treino e outros', () => {
    const s = skill({ training: 2, others: 1 });
    expect(getSkillTotal(sheet([s]), s)).toBe(2 + 3 + 2 + 1);
  });

  it('soma o tamanho só em Furtividade', () => {
    const furt = skill({ name: Skill.FURTIVIDADE, modAttr: Atributo.DESTREZA });
    const atl = skill({});
    const small = sheet([furt, atl], 2);
    expect(getSkillTotal(small, furt)).toBe(2 + 2 + 2);
    expect(getSkillTotal(small, atl)).toBe(2 + 3);
  });
});

describe('getSkillTotalByName', () => {
  it('marca perícia somente-treinada sem treino como bloqueada', () => {
    const lad = skill({ name: Skill.LADINAGEM, modAttr: Atributo.DESTREZA });
    const info = getSkillTotalByName(sheet([lad]), Skill.LADINAGEM);
    expect(info).toMatchObject({ trained: false, blocked: true });
  });

  it('devolve undefined para perícia ausente', () => {
    expect(getSkillTotalByName(sheet([]), Skill.LUTA)).toBeUndefined();
  });
});
