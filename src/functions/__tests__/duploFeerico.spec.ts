import _ from 'lodash';
import {
  recalculateSheet,
  reverseSheetActionsForPower,
} from '../recalculateSheet';
import { removeOriginBenefits } from '../originBenefits';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import { dataRegistry } from '../../data/registry';
import BARBARO from '../../data/systems/tormenta20/classes/barbaro';
import BARDO from '../../data/systems/tormenta20/classes/bardo';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import LADINO from '../../data/systems/tormenta20/classes/ladino';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';

/**
 * Origem "Duplo Feérico (Pondsmânia)" (Atlas de Arton).
 *
 * O poder concede uma habilidade de classe de 1º nível de OUTRA classe, à
 * escolha do jogador. A ação `learnClassAbility` não tinha nenhuma costura de
 * seleção manual: o assistente nunca perguntava nada, o gerador sempre sorteava
 * e o sorteio congelava no `sheetActionHistory` para sempre (feedback de
 * usuário: "a origem não funciona e defaulta pra bárbaro toda hora", ago/2026).
 */
describe('Duplo Feérico', () => {
  const POWER_NAME = 'Duplo Feérico';
  const ORIGIN_NAME = 'Duplo Feérico (Pondsmânia)';
  const power = atlasOriginPowers.DUPLO_FEERICO;

  const mkSheet = (classe: ClassDescription = GUERREIRO): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 1;
    sheet.classe = _.cloneDeep(classe);
    sheet.origin = { name: ORIGIN_NAME, powers: [_.cloneDeep(power)] };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.classPowers = [];
    return sheet;
  };

  const manualPick = (
    className: string,
    abilityName: string,
    skills?: Skill[]
  ) => ({
    [POWER_NAME]: {
      classAbilities: [{ className, abilityName }],
      // Sub-escolhas da habilidade aprendida vivem na MESMA entrada
      ...(skills ? { skills } : {}),
    },
  });

  const markedSkillsOf = (sheet: CharacterSheet, powerName: string) =>
    sheet.sheetActionHistory
      .filter((entry) => entry.powerName === powerName)
      .flatMap((entry) =>
        entry.changes.flatMap((c) =>
          c.type === 'TrainedSkillsMarked' ? c.skills : []
        )
      );

  const classPowerNames = (sheet: CharacterSheet) =>
    (sheet.classPowers || []).map((p) => p.name);

  describe('requisito de seleção manual', () => {
    // Regressão direta do bug: sem requisito emitido o assistente pula o passo
    // e o jogador nunca escolhe.
    it('emite um requisito learnClassAbility para o poder', () => {
      const reqs = getPowerSelectionRequirements(power);
      expect(reqs).not.toBeNull();

      const requirement = reqs!.requirements.find(
        (r) => r.type === 'learnClassAbility'
      );
      expect(requirement).toBeDefined();
      expect(requirement!.pick).toBe(1);
      expect(requirement!.metadata?.abilityLevel).toBe(1);
    });

    it('a sheetAction é carimbada como origem (para a limpeza encontrá-la)', () => {
      expect(power.sheetActions).toHaveLength(1);
      expect(power.sheetActions![0].source).toEqual({
        type: 'origin',
        originName: ORIGIN_NAME,
      });
    });
  });

  describe('opções oferecidas', () => {
    const optionsFor = (
      classe: ClassDescription,
      supplements: SupplementId[] = [SupplementId.TORMENTA20_CORE]
    ): string[] => {
      const requirement = getPowerSelectionRequirements(
        power
      )!.requirements.find((r) => r.type === 'learnClassAbility')!;
      return getFilteredAvailableOptions(
        requirement,
        mkSheet(classe),
        supplements
      ) as string[];
    };

    it('exclui a própria classe do personagem', () => {
      const options = optionsFor(BARBARO);
      expect(options).not.toContain('Bárbaro');
      expect(options).toContain('Guerreiro');
    });

    it('exclui a classe base quando o personagem é de uma variante', () => {
      // Duelista é variante de Bucaneiro e herda as habilidades de 1º nível dele
      const duelista = dataRegistry.getClassByName('Duelista', [
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ]);
      expect(duelista).toBeDefined();
      expect(duelista!.baseClassName).toBe('Bucaneiro');

      const options = optionsFor(duelista!);
      expect(options).not.toContain('Bucaneiro');
    });

    it('só oferece classes de suplemento quando o suplemento está ativo', () => {
      expect(optionsFor(GUERREIRO)).not.toContain('Frade');
      expect(
        optionsFor(GUERREIRO, [
          SupplementId.TORMENTA20_CORE,
          SupplementId.TORMENTA20_DEUSES_ARTON,
        ])
      ).toContain('Frade');
    });
  });

  describe('aplicação na ficha', () => {
    it('respeita a escolha manual do jogador', () => {
      const sheet = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Ataque Furtivo')
      );

      expect(classPowerNames(sheet)).toContain('Ataque Furtivo (Ladino)');
    });

    it('não duplica a habilidade em recálculos sucessivos', () => {
      const first = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Ataque Furtivo')
      );
      const second = recalculateSheet(
        first,
        undefined,
        manualPick('Ladino', 'Ataque Furtivo')
      );

      const matches = classPowerNames(second).filter(
        (name) => name === 'Ataque Furtivo (Ladino)'
      );
      expect(matches).toHaveLength(1);

      const bonusesFromAbility = (sheet: CharacterSheet) =>
        sheet.sheetBonuses.filter(
          (b) =>
            b.source.type === 'power' &&
            b.source.name === 'Ataque Furtivo (Ladino)'
        ).length;
      expect(bonusesFromAbility(second)).toBe(bonusesFromAbility(first));
    });

    // Ressalva do livro: +1 PM, sem somar o atributo-chave da habilidade.
    it('Magias concede +1 PM fixo e não soma o atributo-chave', () => {
      const sheet = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Bardo', 'Magias')
      );

      const learned = (sheet.classPowers || []).find(
        (p) => p.name === 'Magias (Bardo)'
      );
      expect(learned).toBeDefined();
      expect(learned!.sheetBonuses).toEqual([
        {
          source: { type: 'power', name: 'Magias (Bardo)' },
          target: { type: 'PM' },
          modifier: { type: 'Fixed', value: 1 },
        },
      ]);

      // A habilidade original soma Carisma no PM — exatamente o que o livro proíbe
      const originalMagias = BARDO.abilities.find((a) => a.name === 'Magias');
      expect(originalMagias!.sheetBonuses).toEqual([
        {
          source: { type: 'power', name: 'Magias' },
          target: { type: 'PM' },
          modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
        },
      ]);

      const pmBonusesFromLearned = sheet.sheetBonuses.filter(
        (b) => b.source.type === 'power' && b.source.name === 'Magias (Bardo)'
      );
      expect(pmBonusesFromLearned).toHaveLength(1);
      expect(pmBonusesFromLearned[0].modifier).toEqual({
        type: 'Fixed',
        value: 1,
      });
    });
  });

  // A habilidade aprendida pode ter escolha própria. Antes, `applyPower` pulava
  // de propósito os `sheetActions` da habilidade aprendida — o jogador escolhia
  // "Especialista" e nada acontecia.
  describe('escolha aninhada da habilidade aprendida', () => {
    it('a Especialista do Ladino declara a escolha de perícias', () => {
      const especialista = LADINO.abilities.find(
        (a) => a.name === 'Especialista'
      );
      expect(especialista).toBeDefined();

      const reqs = getPowerSelectionRequirements(especialista!);
      expect(reqs).not.toBeNull();

      const requirement = reqs!.requirements[0];
      expect(requirement.type).toBe('markTrainedSkills');
      expect(requirement.metadata?.pickByAttribute).toBe(Atributo.INTELIGENCIA);
      expect(requirement.metadata?.minPick).toBe(1);
    });

    it('aplica a escolha de perícias feita junto com a habilidade', () => {
      const sheet = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.ATLETISMO])
      );

      expect(classPowerNames(sheet)).toContain('Especialista (Ladino)');
      expect(markedSkillsOf(sheet, 'Especialista (Ladino)')).toEqual([
        Skill.ATLETISMO,
      ]);
    });

    it('só aceita perícias em que o personagem é treinado', () => {
      const base = mkSheet();
      expect(base.skills).not.toContain(Skill.MISTICISMO);

      const sheet = recalculateSheet(
        base,
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.MISTICISMO])
      );

      // Misticismo é descartado; cai no sorteio entre as treinadas
      const marked = markedSkillsOf(sheet, 'Especialista (Ladino)');
      expect(marked).not.toContain(Skill.MISTICISMO);
      marked.forEach((skill) => expect(base.skills).toContain(skill));
    });

    it('não duplica a escolha aninhada em recálculos sucessivos', () => {
      const first = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.ATLETISMO])
      );
      const second = recalculateSheet(
        first,
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.ATLETISMO])
      );

      expect(markedSkillsOf(second, 'Especialista (Ladino)')).toEqual([
        Skill.ATLETISMO,
      ]);
    });
  });

  describe('limpeza ao trocar de origem', () => {
    const applied = () =>
      recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Ataque Furtivo')
      );

    it('remove a habilidade aprendida e a entrada de histórico', () => {
      const sheet = applied();
      expect(classPowerNames(sheet)).toContain('Ataque Furtivo (Ladino)');

      const cleaned = removeOriginBenefits(sheet);

      expect(classPowerNames(cleaned)).not.toContain('Ataque Furtivo (Ladino)');
      expect(
        cleaned.sheetActionHistory.some((entry) =>
          entry.changes.some((c) => c.type === 'ClassAbilityLearned')
        )
      ).toBe(false);
    });

    // Fichas criadas antes da correção gravaram `source: { type: 'power' }`
    it('também limpa fichas legadas com source do tipo power', () => {
      const sheet = applied();
      sheet.sheetActionHistory = sheet.sheetActionHistory.map((entry) =>
        entry.powerName === POWER_NAME
          ? { ...entry, source: { type: 'power' as const, name: POWER_NAME } }
          : entry
      );

      const cleaned = removeOriginBenefits(sheet);

      expect(classPowerNames(cleaned)).not.toContain('Ataque Furtivo (Ladino)');
      expect(
        cleaned.sheetActionHistory.some((entry) =>
          entry.changes.some((c) => c.type === 'ClassAbilityLearned')
        )
      ).toBe(false);
    });

    // O bug do "toda hora bárbaro": sem a limpeza o histórico sobrevive, o
    // `isActionAlreadyApplied` curto-circuita e a escolha antiga fica congelada.
    it('permite escolher outra habilidade depois de trocar de origem', () => {
      const cleaned = removeOriginBenefits(applied());
      cleaned.origin = { name: ORIGIN_NAME, powers: [_.cloneDeep(power)] };

      const reapplied = recalculateSheet(
        cleaned,
        undefined,
        manualPick('Bárbaro', 'Fúria')
      );

      expect(classPowerNames(reapplied)).toContain('Fúria (Bárbaro)');
      expect(classPowerNames(reapplied)).not.toContain(
        'Ataque Furtivo (Ladino)'
      );
    });

    it('reverseSheetActionsForPower remove a habilidade de classPowers', () => {
      const sheet = applied();
      reverseSheetActionsForPower(sheet, POWER_NAME);

      expect(classPowerNames(sheet)).not.toContain('Ataque Furtivo (Ladino)');
    });

    // Mesma armadilha do "toda hora bárbaro", um nível abaixo: o recibo da
    // escolha aninhada é carimbado com o nome composto, não com o da origem.
    it('limpa também a escolha aninhada da habilidade aprendida', () => {
      const sheet = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.ATLETISMO])
      );
      expect(markedSkillsOf(sheet, 'Especialista (Ladino)')).toEqual([
        Skill.ATLETISMO,
      ]);

      const cleaned = removeOriginBenefits(sheet);
      expect(markedSkillsOf(cleaned, 'Especialista (Ladino)')).toEqual([]);

      const reversed = recalculateSheet(
        mkSheet(),
        undefined,
        manualPick('Ladino', 'Especialista', [Skill.ATLETISMO])
      );
      reverseSheetActionsForPower(reversed, POWER_NAME);
      expect(markedSkillsOf(reversed, 'Especialista (Ladino)')).toEqual([]);
    });
  });
});
