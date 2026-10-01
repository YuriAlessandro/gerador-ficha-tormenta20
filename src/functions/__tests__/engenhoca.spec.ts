import { describe, expect, it, vi } from 'vitest';
import {
  buildEngenhocaCastCheck,
  countEngenhocas,
  getAparatoActivationDcIncrease,
  getEngenhocaActivationBaseDC,
  getEngenhocaCheckModifier,
  getEngenhocaLimit,
  getEngenhocaResistDC,
  getMaxEngenhocaCircle,
  hasEngenhoqueiro,
  isEngenhocaCircleAboveLimit,
  sanitizeEngenhoca,
} from '../spells/engenhoca';
import { getSpellDisplayName } from '../spells/spellDisplayName';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import Skill, { SkillsWithArmorPenalty } from '../../interfaces/Skills';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { APARATOS } from '../../data/systems/tormenta20/herois-de-arton/aparatos';
import INVENTOR from '../../data/systems/tormenta20/classes/inventor';
import INVENTOR_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/inventor';

/**
 * Engenhocas (JdA p. 70) e aparatos (Heróis de Arton pp. 235–236).
 */
describe('Engenhocas do Inventor', () => {
  const findPower = (name: string): ClassPower => {
    const power = [...INVENTOR.powers, ...INVENTOR_POWERS].find(
      (p) => p.name === name
    );
    if (!power) throw new Error(`Poder ${name} não encontrado`);
    return power;
  };

  const buildInventor = (
    nivel: number,
    powers: string[] = []
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = { ...INVENTOR, abilities: [] };
    sheet.classPowers = ['Engenhoqueiro', ...powers].map(findPower);
    sheet.atributos[Atributo.INTELIGENCIA].value = 4;
    sheet.completeSkills = [
      {
        name: Skill.OFICIO_EGENHOQUEIRO,
        modAttr: Atributo.INTELIGENCIA,
        halfLevel: Math.floor(nivel / 2),
        training: 2,
        others: 0,
      },
    ];
    return sheet;
  };

  const bolaDeFogo = (engenhoca?: Spell['engenhoca']): Spell => ({
    nome: 'Bola de Fogo',
    execucao: 'Padrão',
    alcance: 'Médio',
    duracao: 'Instantânea',
    description: 'Uma explosão de chamas.',
    spellCircle: spellsCircles.c2,
    school: 'Evoc',
    engenhoca,
  });

  it('reconhece o poder Engenhoqueiro', () => {
    expect(hasEngenhoqueiro(buildInventor(1))).toBe(true);
    expect(hasEngenhoqueiro(createMockCharacterSheet())).toBe(false);
  });

  it('o limite é a Inteligência, +3 com Manutenção Eficiente', () => {
    expect(getEngenhocaLimit(buildInventor(5))).toBe(4);
    expect(getEngenhocaLimit(buildInventor(5, ['Manutenção Eficiente']))).toBe(
      7
    );

    const burro = buildInventor(1);
    burro.atributos[Atributo.INTELIGENCIA].value = -1;
    expect(getEngenhocaLimit(burro)).toBe(0);
  });

  it('o círculo máximo sobe no 6º nível e a cada quatro níveis', () => {
    expect(getMaxEngenhocaCircle(1)).toBe(1);
    expect(getMaxEngenhocaCircle(5)).toBe(1);
    expect(getMaxEngenhocaCircle(6)).toBe(2);
    expect(getMaxEngenhocaCircle(10)).toBe(3);
    expect(getMaxEngenhocaCircle(14)).toBe(4);
    expect(getMaxEngenhocaCircle(18)).toBe(5);

    // Ficha mono-Inventor: o nível de inventor é o nível da ficha.
    expect(isEngenhocaCircleAboveLimit(buildInventor(5), bolaDeFogo())).toBe(
      true
    );
    expect(isEngenhocaCircleAboveLimit(buildInventor(6), bolaDeFogo())).toBe(
      false
    );
  });

  it('aparatos somam +2 (um) ou +5 (dois); Aparato Personalizado tira 2', () => {
    expect(getAparatoActivationDcIncrease(0, false)).toBe(0);
    expect(getAparatoActivationDcIncrease(1, false)).toBe(2);
    expect(getAparatoActivationDcIncrease(2, false)).toBe(5);
    expect(getAparatoActivationDcIncrease(1, true)).toBe(0);
    expect(getAparatoActivationDcIncrease(2, true)).toBe(3);
  });

  it('a CD de ativação é 15 + custo da magia + aparatos', () => {
    const sheet = buildInventor(6);
    // 2º círculo = 3 PM → CD 18 (exemplo do livro).
    expect(getEngenhocaActivationBaseDC(sheet, bolaDeFogo({}))).toBe(18);
    expect(
      getEngenhocaActivationBaseDC(
        sheet,
        bolaDeFogo({ aparatos: ['estabilizador', 'giroscopio'] })
      )
    ).toBe(23);
    expect(
      getEngenhocaActivationBaseDC(
        buildInventor(6, ['Aparato Personalizado']),
        bolaDeFogo({ aparatos: ['estabilizador'] })
      )
    ).toBe(18);
  });

  it('o teste soma metade do nível, Int, treino e desconta a armadura', () => {
    expect(SkillsWithArmorPenalty).not.toContain(Skill.OFICIO_EGENHOQUEIRO);

    const sheet = buildInventor(10);
    // 5 + 4 + 2 + 0
    expect(getEngenhocaCheckModifier(sheet, bolaDeFogo({}))).toBe(11);

    sheet.bag.getActiveArmorPenalty = () => 3;
    expect(getEngenhocaCheckModifier(sheet, bolaDeFogo({}))).toBe(8);
  });

  it('Giroscópio ignora a penalidade da armadura vestida, não a do escudo', () => {
    const sheet = buildInventor(10);
    sheet.bag.equipments.Armadura = [
      {
        nome: 'Brunea',
        id: 'armadura-1',
        armorPenalty: 2,
        defenseBonus: 5,
        group: 'Armadura',
      },
    ];
    sheet.wornArmorId = 'armadura-1';
    // Armadura (2) + escudo (1).
    sheet.bag.getActiveArmorPenalty = () => 3;

    const giroscopio = bolaDeFogo({ aparatos: ['giroscopio'] });
    expect(getEngenhocaCheckModifier(sheet, giroscopio)).toBe(11 - 1);
  });

  it('a CD para resistir usa Inteligência e soma o Estabilizador', () => {
    const sheet = buildInventor(10);
    // 10 + 5 + 4
    expect(getEngenhocaResistDC(sheet, bolaDeFogo({}))).toBe(19);
    expect(getEngenhocaResistDC(sheet, bolaDeFogo({}), 2)).toBe(21);
    expect(
      getEngenhocaResistDC(sheet, bolaDeFogo({ aparatos: ['estabilizador'] }))
    ).toBe(21);
  });

  it('o teste de ativação cobra só os aprimoramentos e enguiça na falha', () => {
    const sheet = buildInventor(6, ['Forçar a Calibragem']);
    const onBreak = vi.fn();
    const check = buildEngenhocaCastCheck(
      sheet,
      bolaDeFogo({ aparatos: ['comutador', 'sistema-de-refrigeracao'] }),
      onBreak
    );

    expect(check.label).toBe('Ofício (engenhoqueiro)');
    expect(check.basePmOverride).toBe(0);
    expect(check.maxAprimoramentoPm).toBe(4);
    // Falhar não devolve os PM: o diálogo cobra como no Usurpar.
    expect(check.failureNote).toContain('os PM são gastos');
    expect(check.aprimoramentoPmDelta).toBe(-1);
    // 15 + 3 + 5 (dois aparatos) + 2 PM de aprimoramentos.
    expect(check.getDC(2)).toBe(25);

    const toggleIds = check.toggles?.map((t) => t.id);
    expect(toggleIds).toEqual(
      expect.arrayContaining([
        'ativada-hoje',
        'aparato-sistema-de-refrigeracao',
        'forcar-calibragem',
      ])
    );
    expect(check.toggles?.find((t) => t.id === 'ativada-hoje')).toMatchObject({
      value: 5,
      target: 'dc',
    });

    check.onResult?.({ d20: 1, total: 12, dc: 25, success: false });
    expect(onBreak).toHaveBeenCalledTimes(1);
    check.onResult?.({ d20: 20, total: 31, dc: 25, success: true });
    expect(onBreak).toHaveBeenCalledTimes(1);
  });

  it('o nome da engenhoca só muda a exibição', () => {
    expect(getSpellDisplayName(bolaDeFogo())).toBe('Bola de Fogo');
    expect(getSpellDisplayName(bolaDeFogo({ nome: '  ' }))).toBe(
      'Bola de Fogo'
    );
    expect(getSpellDisplayName(bolaDeFogo({ nome: 'Canhão de Vapor' }))).toBe(
      'Canhão de Vapor'
    );
    expect(
      countEngenhocas([bolaDeFogo(), bolaDeFogo({}), bolaDeFogo({})])
    ).toBe(2);
  });

  it('sanitiza engenhoca malformada vinda do banco', () => {
    expect(sanitizeEngenhoca(undefined)).toBeUndefined();
    expect(sanitizeEngenhoca('engenhoca')).toBeUndefined();
    expect(sanitizeEngenhoca([])).toBeUndefined();
    expect(
      sanitizeEngenhoca({
        nome: 42,
        forma: 'voadora',
        aparatos: [
          'estabilizador',
          'estabilizador',
          'inexistente',
          7,
          'comutador',
          'giroscopio',
        ],
        enguicada: 'sim',
      })
    ).toEqual({ aparatos: ['estabilizador', 'comutador'] });
    expect(
      sanitizeEngenhoca({ nome: 'Canhão', forma: 'vestida', enguicada: true })
    ).toEqual({ nome: 'Canhão', forma: 'vestida', enguicada: true });
  });

  it('o catálogo tem os 15 aparatos do livro com ids únicos', () => {
    expect(APARATOS).toHaveLength(15);
    expect(new Set(APARATOS.map((a) => a.id)).size).toBe(15);
  });
});
