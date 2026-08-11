import {
  USURPAR_BASE_DC,
  buildUsurparCastCheck,
  getRouboDivinoAdjustment,
  getUsurparCheckModifier,
  getUsurparDC,
  hasUsurpar,
} from '../spells/usurpar';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Skill, { SkillsWithArmorPenalty } from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';

/**
 * Usurpar: teste de Enganação CD 15 + custo em PM, com penalidade de armadura.
 * Roubo Divino (20º): −1 PM e +1 na CD a cada 10 pontos no resultado.
 */
describe('Usurpador — Usurpar e Roubo Divino', () => {
  const SUPPLEMENTS: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const usurpadorClass = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(SUPPLEMENTS)
      .find((c) => c.name === 'Usurpador');
    if (!classe) throw new Error('Usurpador não encontrado no registry');
    return classe;
  };

  /** Ficha com `classe.abilities` filtrado por nível, como o recálculo entrega. */
  const buildUsurpador = (nivel: number): CharacterSheet => {
    const classe = usurpadorClass();
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = {
      ...classe,
      abilities: classe.abilities.filter((a) => a.nivel <= nivel),
    };
    sheet.atributos[Atributo.CARISMA].value = 4;
    sheet.completeSkills = [
      {
        name: Skill.ENGANACAO,
        modAttr: Atributo.CARISMA,
        halfLevel: Math.floor(nivel / 2),
        training: 2,
        others: 0,
      },
    ];
    return sheet;
  };

  it('a CD é 15 + o custo em PM da magia', () => {
    expect(USURPAR_BASE_DC).toBe(15);
    expect(getUsurparDC(1)).toBe(16);
    expect(getUsurparDC(9)).toBe(24);
    // Truque custa 0 PM: a CD cai para a base.
    expect(getUsurparDC(0)).toBe(15);
  });

  it('reconhece a habilidade só a partir do nível em que ela existe', () => {
    expect(hasUsurpar(buildUsurpador(1))).toBe(true);

    const clerigo = createMockCharacterSheet();
    clerigo.classe = CLERIGO.setup ? CLERIGO.setup(CLERIGO) : { ...CLERIGO };
    expect(hasUsurpar(clerigo)).toBe(false);
    expect(buildUsurparCastCheck(clerigo)).toBeUndefined();
  });

  it('o modificador soma metade do nível, Carisma, treino e "outros"', () => {
    const sheet = buildUsurpador(10);
    // 5 (metade do nível) + 4 (Carisma) + 2 (treinado) + 0
    expect(getUsurparCheckModifier(sheet)).toBe(11);

    sheet.completeSkills![0].others = 3;
    expect(getUsurparCheckModifier(sheet)).toBe(14);
  });

  it('desconta a penalidade de armadura sem duplicar', () => {
    // Enganação é Carisma e não está em SkillsWithArmorPenalty, então a
    // penalidade NÃO chega em `others` pelo recálculo — subtrair aqui é o que
    // a regra pede e não conta duas vezes.
    expect(SkillsWithArmorPenalty).not.toContain(Skill.ENGANACAO);

    const sheet = buildUsurpador(10);
    const semArmadura = getUsurparCheckModifier(sheet);

    sheet.bag.getActiveArmorPenalty = () => 5;
    expect(getUsurparCheckModifier(sheet)).toBe(semArmadura - 5);
  });

  it('oferece a penalidade de símbolo sagrado como escolha do jogador', () => {
    const check = buildUsurparCastCheck(buildUsurpador(5));
    expect(check).toBeDefined();
    expect(check?.label).toContain('Enganação');
    expect(check?.getDC(3)).toBe(18);
    expect(check?.toggles).toEqual([
      {
        id: 'simbolo-sagrado',
        label: 'Símbolo sagrado visível no local',
        value: -5,
      },
    ]);
    expect(check?.note).toContain('escolher 10');
  });

  it('Roubo Divino reduz 1 PM e sobe 1 na CD a cada 10 pontos', () => {
    const nivel20 = buildUsurpador(20);
    expect(getRouboDivinoAdjustment(nivel20, 9)).toMatchObject({
      pmDelta: 0,
      dcBonus: 0,
    });
    expect(getRouboDivinoAdjustment(nivel20, 10)).toMatchObject({
      pmDelta: -1,
      dcBonus: 1,
    });
    expect(getRouboDivinoAdjustment(nivel20, 27)).toMatchObject({
      pmDelta: -2,
      dcBonus: 2,
    });
    // Resultado negativo (falha feia) não vira bônus.
    expect(getRouboDivinoAdjustment(nivel20, -4)).toMatchObject({
      pmDelta: 0,
      dcBonus: 0,
    });
  });

  it('Roubo Divino não vale antes do 20º nível nem para outras classes', () => {
    expect(getRouboDivinoAdjustment(buildUsurpador(19), 30)).toMatchObject({
      pmDelta: 0,
      dcBonus: 0,
    });

    const clerigo = createMockCharacterSheet();
    clerigo.nivel = 20;
    clerigo.classe = CLERIGO.setup ? CLERIGO.setup(CLERIGO) : { ...CLERIGO };
    expect(getRouboDivinoAdjustment(clerigo, 30)).toMatchObject({
      pmDelta: 0,
      dcBonus: 0,
    });
  });

  it('o resolve do teste entrega o ajuste do Roubo Divino', () => {
    const check = buildUsurparCastCheck(buildUsurpador(20));
    const ajuste = check?.resolve?.({
      d20: 18,
      total: 32,
      dc: 20,
      success: true,
    });
    expect(ajuste).toMatchObject({ pmDelta: -3, dcBonus: 3 });
    expect(ajuste?.note).toContain('Roubo Divino');
  });
});
