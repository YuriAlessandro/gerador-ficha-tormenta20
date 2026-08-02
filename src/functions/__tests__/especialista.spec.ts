import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
  countRequirementSelections,
  validateSelections,
} from '../powers/manualPowerSelection';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import LADINO from '../../data/systems/tormenta20/classes/ladino';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';

/**
 * Habilidade "Especialista" (Ladino).
 *
 * "Escolha um número de perícias treinadas igual a sua Inteligência (mínimo 1).
 * Ao fazer um teste de uma dessas perícias, você pode gastar 1 PM para dobrar
 * seu bônus de treinamento."
 *
 * A escolha não existia no dado: a habilidade era texto puro, sem `sheetActions`,
 * então o assistente nunca perguntava — nem para um Ladino, nem para quem a
 * recebesse pela origem Duplo Feérico. As perícias marcadas não alteram número
 * nenhum na ficha; são registro, e por isso saem como recibo no histórico.
 */
describe('Especialista (Ladino)', () => {
  const ABILITY_NAME = 'Especialista';

  const especialista = LADINO.abilities.find((a) => a.name === ABILITY_NAME)!;

  const mkLadino = (intModifier: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 1;
    sheet.classe = _.cloneDeep(LADINO);
    sheet.atributos[Atributo.INTELIGENCIA].value = intModifier;
    sheet.skills = [Skill.ATLETISMO, Skill.LADINAGEM, Skill.REFLEXOS];
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.classPowers = [];
    return sheet;
  };

  const requirement = () =>
    getPowerSelectionRequirements(especialista)!.requirements[0];

  const markedSkillsOf = (sheet: CharacterSheet) =>
    sheet.sheetActionHistory
      .filter((entry) => entry.powerName === ABILITY_NAME)
      .flatMap((entry) =>
        entry.changes.flatMap((c) =>
          c.type === 'TrainedSkillsMarked' ? c.skills : []
        )
      );

  it('declara a escolha no dado da habilidade', () => {
    const reqs = getPowerSelectionRequirements(especialista);
    expect(reqs).not.toBeNull();
    expect(requirement().type).toBe('markTrainedSkills');
    expect(requirement().metadata?.pickByAttribute).toBe(Atributo.INTELIGENCIA);
    expect(requirement().metadata?.minPick).toBe(1);
  });

  it('oferece apenas perícias em que o personagem já é treinado', () => {
    const options = getFilteredAvailableOptions(requirement(), mkLadino(2));

    expect(options).toEqual([Skill.ATLETISMO, Skill.LADINAGEM, Skill.REFLEXOS]);
    expect(options).not.toContain(Skill.MISTICISMO);
  });

  it('aplica as perícias escolhidas pelo jogador', () => {
    const sheet = recalculateSheet(mkLadino(2), undefined, {
      [ABILITY_NAME]: { skills: [Skill.ATLETISMO, Skill.LADINAGEM] },
    });

    expect(markedSkillsOf(sheet)).toEqual([Skill.ATLETISMO, Skill.LADINAGEM]);
  });

  it('não concede treinamento nem bônus — é só registro', () => {
    const before = mkLadino(2);
    const sheet = recalculateSheet(before, undefined, {
      [ABILITY_NAME]: { skills: [Skill.ATLETISMO] },
    });

    const bonusesFromAbility = sheet.sheetBonuses.filter(
      (b) => b.source.type === 'power' && b.source.name === ABILITY_NAME
    );
    expect(bonusesFromAbility).toEqual([]);
    expect(sheet.skills).toEqual(before.skills);
  });

  it('sorteia entre as treinadas quando não há escolha manual', () => {
    const sheet = recalculateSheet(mkLadino(0));

    // Inteligência 0 → piso de 1 perícia
    const marked = markedSkillsOf(sheet);
    expect(marked).toHaveLength(1);
    expect(mkLadino(0).skills).toContain(marked[0]);
  });

  it('não duplica o registro em recálculos sucessivos', () => {
    const first = recalculateSheet(mkLadino(2), undefined, {
      [ABILITY_NAME]: { skills: [Skill.ATLETISMO, Skill.LADINAGEM] },
    });
    const second = recalculateSheet(first, undefined, {
      [ABILITY_NAME]: { skills: [Skill.ATLETISMO, Skill.LADINAGEM] },
    });

    expect(markedSkillsOf(second)).toEqual([Skill.ATLETISMO, Skill.LADINAGEM]);
  });

  describe('quantidade dinâmica (= Inteligência, mínimo 1)', () => {
    it('conta as perícias escolhidas', () => {
      expect(countRequirementSelections(requirement(), {})).toBe(0);
      expect(
        countRequirementSelections(requirement(), {
          skills: [Skill.ATLETISMO, Skill.LADINAGEM],
        })
      ).toBe(2);
    });

    it('exige exatamente o modificador de Inteligência', () => {
      const sheet = mkLadino(2);

      const tooFew = validateSelections(
        { powerName: ABILITY_NAME, requirements: [requirement()] },
        { skills: [Skill.ATLETISMO] },
        sheet
      );
      expect(tooFew.isValid).toBe(false);
      expect(tooFew.errors[0]).toContain('esperado 2');

      const exact = validateSelections(
        { powerName: ABILITY_NAME, requirements: [requirement()] },
        { skills: [Skill.ATLETISMO, Skill.LADINAGEM] },
        sheet
      );
      expect(exact.isValid).toBe(true);
    });

    it('respeita o piso de 1 quando a Inteligência é 0 ou negativa', () => {
      const dullard = mkLadino(-1);

      const none = validateSelections(
        { powerName: ABILITY_NAME, requirements: [requirement()] },
        {},
        dullard
      );
      expect(none.isValid).toBe(false);

      const one = validateSelections(
        { powerName: ABILITY_NAME, requirements: [requirement()] },
        { skills: [Skill.ATLETISMO] },
        dullard
      );
      expect(one.isValid).toBe(true);
    });

    it('não pede mais perícias do que o personagem tem treinadas', () => {
      const genius = mkLadino(8); // só 3 perícias treinadas

      const all = validateSelections(
        { powerName: ABILITY_NAME, requirements: [requirement()] },
        { skills: [Skill.ATLETISMO, Skill.LADINAGEM, Skill.REFLEXOS] },
        genius
      );
      expect(all.isValid).toBe(true);
    });
  });
});
