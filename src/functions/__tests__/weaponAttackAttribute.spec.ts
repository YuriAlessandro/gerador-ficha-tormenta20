import {
  getSkillAttackBonus,
  getWeaponAttackSkillBonus,
  resolveAttackSkill,
  weaponAttributeModifier,
} from '../weaponSkill';
import Equipment from '../../interfaces/Equipment';
import Skill, { CompleteSkill } from '../../interfaces/Skills';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';

const atributos: CharacterAttributes = {
  [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
  [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 },
  [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
  [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 5 },
  [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 3 },
  [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
};

// Luta treinada num personagem de nível 10: metade do nível 5, treino 2,
// outros 1 — 8 pontos que NÃO podem sumir quando o atributo é trocado.
const completeSkills: CompleteSkill[] = [
  {
    name: Skill.LUTA,
    modAttr: Atributo.FORCA,
    halfLevel: 5,
    training: 2,
    others: 1,
  },
  {
    name: Skill.PONTARIA,
    modAttr: Atributo.DESTREZA,
    halfLevel: 5,
    training: 0,
    others: 0,
  },
  {
    name: Skill.MISTICISMO,
    modAttr: Atributo.INTELIGENCIA,
    halfLevel: 5,
    training: 4,
    others: 0,
  },
];

const garra: Equipment = { nome: 'Garra', group: 'Arma', dano: '1d6' };
const arco: Equipment = { nome: 'Arco Curto', group: 'Arma', alcance: 'Médio' };

describe('weaponAttributeModifier', () => {
  test('atributo concreto devolve o valor', () => {
    expect(weaponAttributeModifier('Destreza', atributos)).toBe(4);
  });

  test("'Nenhum' e undefined devolvem 0", () => {
    expect(weaponAttributeModifier('Nenhum', atributos)).toBe(0);
    expect(weaponAttributeModifier(undefined, atributos)).toBe(0);
  });

  // Antes o fallback somava Força em silêncio — mascarava dado corrompido.
  test('atributo desconhecido devolve 0, não Força', () => {
    expect(
      weaponAttributeModifier('Aparência' as unknown as 'Força', atributos)
    ).toBe(0);
  });
});

describe('getSkillAttackBonus com override de atributo', () => {
  test('sem override usa o modAttr da perícia', () => {
    // 5 + Força 2 + 1 + 2 = 10
    expect(getSkillAttackBonus(Skill.LUTA, completeSkills, atributos)).toBe(10);
  });

  test('override troca SÓ o atributo, preservando meio nível, treino e outros', () => {
    // 5 + Destreza 4 + 1 + 2 = 12
    expect(
      getSkillAttackBonus(Skill.LUTA, completeSkills, atributos, 'Destreza')
    ).toBe(12);
  });

  test("override 'Nenhum' zera só a parcela de atributo", () => {
    // 5 + 0 + 1 + 2 = 8
    expect(
      getSkillAttackBonus(Skill.LUTA, completeSkills, atributos, 'Nenhum')
    ).toBe(8);
  });

  test('perícia sem modAttr aceita override', () => {
    const semAttr: CompleteSkill[] = [
      { name: Skill.LUTA, halfLevel: 3, training: 0, others: 0 },
    ];
    expect(getSkillAttackBonus(Skill.LUTA, semAttr, atributos)).toBe(3);
    expect(
      getSkillAttackBonus(Skill.LUTA, semAttr, atributos, 'Sabedoria')
    ).toBe(6);
  });

  test('perícia ausente devolve 0 mesmo com override', () => {
    expect(getSkillAttackBonus(Skill.LUTA, [], atributos, 'Destreza')).toBe(0);
  });
});

describe('resolveAttackSkill', () => {
  test('regra padrão: melee → Luta, ranged → Pontaria', () => {
    expect(resolveAttackSkill(garra)).toBe(Skill.LUTA);
    expect(resolveAttackSkill(arco)).toBe(Skill.PONTARIA);
  });

  test('perícia do modo sobrescreve a regra padrão', () => {
    expect(
      resolveAttackSkill(arco, { id: 'm', label: 'M', skill: 'Luta' })
    ).toBe(Skill.LUTA);
  });

  test('customSkill da arma vence a perícia do modo', () => {
    expect(
      resolveAttackSkill(
        { ...garra, customSkill: Skill.MISTICISMO },
        { id: 'm', label: 'M', skill: 'Pontaria' }
      )
    ).toBe(Skill.MISTICISMO);
  });
});

describe('getWeaponAttackSkillBonus', () => {
  test('arma sem override = mesmo resultado da perícia crua', () => {
    expect(getWeaponAttackSkillBonus(garra, completeSkills, atributos)).toBe(
      10
    );
  });

  // Cenário da queixa: arma natural que ataca com outro atributo sem que o
  // jogador tenha que trocar a perícia inteira (e perder o treino de Luta).
  test('attackAttribute troca o atributo mantendo o treino de Luta', () => {
    expect(
      getWeaponAttackSkillBonus(
        { ...garra, attackAttribute: 'Sabedoria' },
        completeSkills,
        atributos
      )
    ).toBe(11); // 5 + Sabedoria 3 + 1 + 2
  });

  test('customSkill e attackAttribute compõem (perícia de uma, atributo de outro)', () => {
    // Misticismo: 5 + treino 4 + outros 0, com Destreza no lugar de Inteligência
    expect(
      getWeaponAttackSkillBonus(
        {
          ...garra,
          customSkill: Skill.MISTICISMO,
          attackAttribute: 'Destreza',
        },
        completeSkills,
        atributos
      )
    ).toBe(13);
  });

  test('override do modo prevalece sobre o da arma', () => {
    expect(
      getWeaponAttackSkillBonus(
        { ...garra, attackAttribute: 'Nenhum' },
        completeSkills,
        atributos,
        { id: 'm', label: 'M', attackAttribute: 'Inteligência' }
      )
    ).toBe(13); // 5 + Inteligência 5 + 1 + 2
  });
});
