import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { applyPower, generateEmptySheet } from '../general';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';
import MOREAU from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import {
  ESPERTEZA_VULPINA_ABILITY_NAME,
  ESPERTEZA_VULPINA_OPTION_KEY,
  MOREAU_HERITAGES,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { Atributo } from '../../data/systems/tormenta20/atributos';

/**
 * Esperteza Vulpina (Moreau/Herança da Raposa): "+2 em duas perícias
 * originalmente baseadas em Inteligência ou Carisma, a sua escolha."
 *
 * A implementação antiga TREINAVA duas perícias sorteadas de uma lista escrita
 * à mão que divergira do catálogo (trazia Cavalgar, Cura, Intuição e Religião;
 * esquecia Adestramento e 13 dos 16 Ofícios) — daí o relato de usuário de
 * "Cavalgar e Atuação treinadas automaticamente".
 */
describe('Moreau — Esperteza Vulpina', () => {
  const esperteza = MOREAU_HERITAGES.Raposa.abilities.find(
    (a) => a.name === ESPERTEZA_VULPINA_ABILITY_NAME
  );
  if (!esperteza) throw new Error('Esperteza Vulpina não encontrada');

  const pickSkillTarget = esperteza.sheetBonuses?.find(
    (b) => b.target.type === 'PickSkill'
  )?.target;
  if (pickSkillTarget?.type !== 'PickSkill') {
    throw new Error('Esperteza Vulpina deveria ter um alvo PickSkill');
  }
  const pool = pickSkillTarget.skills;

  const raposa = {
    ...MOREAU,
    heritage: 'Raposa',
    abilities: MOREAU_HERITAGES.Raposa.abilities,
  };

  const makeSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [];
    sheet.classPowers = [];
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.raca = raposa;
    return sheet;
  };

  const othersOf = (sheet: CharacterSheet, skill: Skill) =>
    sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

  const trainingOf = (sheet: CharacterSheet, skill: Skill) =>
    sheet.completeSkills?.find((s) => s.name === skill)?.training ?? 0;

  describe('pool de perícias', () => {
    it('é derivada de SkillsAttrs: só Inteligência e Carisma', () => {
      // Carisma
      expect(pool).toContain(Skill.ADESTRAMENTO);
      expect(pool).toContain(Skill.ATUACAO);
      expect(pool).toContain(Skill.DIPLOMACIA);
      // Inteligência
      expect(pool).toContain(Skill.NOBREZA);
      expect(pool).toContain(Skill.INVESTIGACAO);
      // Todos os Ofícios específicos são de Inteligência, não só três.
      expect(pool).toContain(Skill.OFICIO_ALFAIATE);
      expect(pool).toContain(Skill.OFICIO_MINERADOR);
    });

    it('não traz as perícias que a lista antiga incluía por engano', () => {
      expect(pool).not.toContain(Skill.CAVALGAR); // Destreza
      expect(pool).not.toContain(Skill.CURA); // Sabedoria
      expect(pool).not.toContain(Skill.INTUICAO); // Sabedoria
      expect(pool).not.toContain(Skill.RELIGIAO); // Sabedoria
    });

    it('não traz o placeholder "Ofício (Qualquer)"', () => {
      expect(pool).not.toContain(Skill.OFICIO);
    });
  });

  describe('escolha no assistente', () => {
    it('gera um requisito de 2 perícias marcado como bônus, não treino', () => {
      const requirements = getPowerSelectionRequirements(esperteza);
      const skillReq = requirements?.requirements.find(
        (r) => r.type === 'learnSkill'
      );

      expect(skillReq).toBeDefined();
      expect(skillReq?.pick).toBe(2);
      // `skillBonusOnly` é o que mantém perícia já treinada selecionável.
      expect(skillReq?.metadata?.skillBonusOnly).toBe(true);
    });

    it('oferece perícias de INT/CAR mesmo já treinadas e esconde Ofício não treinado', () => {
      const requirements = getPowerSelectionRequirements(esperteza);
      const skillReq = requirements?.requirements.find(
        (r) => r.type === 'learnSkill'
      );
      if (!skillReq) throw new Error('requisito não gerado');

      const sheet = makeSheet();
      sheet.skills = [Skill.DIPLOMACIA, Skill.OFICIO_ARMEIRO];
      const options = getFilteredAvailableOptions(skillReq, sheet);

      // Já treinada continua selecionável: o efeito é bônus.
      expect(options).toContain(Skill.DIPLOMACIA);
      // Não treinada, não-Ofício: também vale (ganha +2 na coluna "Outros").
      expect(options).toContain(Skill.NOBREZA);
      // Ofício sem linha na ficha: o bônus sumiria.
      expect(options).toContain(Skill.OFICIO_ARMEIRO);
      expect(options).not.toContain(Skill.OFICIO_ALFAIATE);
    });

    it('a escolha do assistente chega ao bônus na criação da ficha', () => {
      const options: SelectedOptions = {
        nivel: 1,
        raca: 'Moreau',
        classe: 'Nobre',
        origin: '',
        devocao: { label: '--', value: '--' },
        supplements: [
          SupplementId.TORMENTA20_CORE,
          SupplementId.TORMENTA20_AMEACAS_ARTON,
        ],
      };

      const sheet = generateEmptySheet(
        options,
        {
          powerEffectSelections: {
            [ESPERTEZA_VULPINA_ABILITY_NAME]: {
              skills: [Skill.NOBREZA, Skill.INVESTIGACAO],
            },
          },
        },
        {
          moreauHeritage: 'Raposa',
          moreauBonusAttributes: [Atributo.INTELIGENCIA, Atributo.CARISMA],
        }
      );

      expect(sheet.optionChoices?.[ESPERTEZA_VULPINA_OPTION_KEY]).toEqual([
        Skill.NOBREZA,
        Skill.INVESTIGACAO,
      ]);
      expect(othersOf(sheet, Skill.NOBREZA)).toBe(2);
      expect(othersOf(sheet, Skill.INVESTIGACAO)).toBe(2);
    });
  });

  describe('efeito na ficha', () => {
    it('dá +2 nas escolhidas e NÃO as treina', () => {
      const base = makeSheet();
      const baseline = othersOf(recalculateSheet(base), Skill.NOBREZA);

      const chosen = recalculateSheet({ ...base, raca: raposa }, undefined, {
        [ESPERTEZA_VULPINA_ABILITY_NAME]: {
          skills: [Skill.NOBREZA, Skill.DIPLOMACIA],
        },
      });

      expect(othersOf(chosen, Skill.NOBREZA)).toBe(baseline + 2);
      expect(chosen.skills).not.toContain(Skill.NOBREZA);
      expect(trainingOf(chosen, Skill.NOBREZA)).toBe(0);
    });

    it('a escolha sobrevive a recálculos sem manualSelections', () => {
      const chosen = recalculateSheet(makeSheet(), undefined, {
        [ESPERTEZA_VULPINA_ABILITY_NAME]: {
          skills: [Skill.NOBREZA, Skill.DIPLOMACIA],
        },
      });
      expect(chosen.optionChoices?.[ESPERTEZA_VULPINA_OPTION_KEY]).toEqual([
        Skill.NOBREZA,
        Skill.DIPLOMACIA,
      ]);

      const again = recalculateSheet(chosen, chosen);
      expect(othersOf(again, Skill.NOBREZA)).toBe(
        othersOf(chosen, Skill.NOBREZA)
      );
      expect(othersOf(again, Skill.DIPLOMACIA)).toBe(
        othersOf(chosen, Skill.DIPLOMACIA)
      );
    });

    it('o detalhamento de "Outros" nomeia a habilidade', () => {
      const chosen = recalculateSheet(makeSheet(), undefined, {
        [ESPERTEZA_VULPINA_ABILITY_NAME]: {
          skills: [Skill.NOBREZA, Skill.DIPLOMACIA],
        },
      });
      const nobreza = chosen.completeSkills?.find(
        (s) => s.name === Skill.NOBREZA
      );
      if (!nobreza) throw new Error('Nobreza não encontrada');

      expect(getSkillOthersBreakdown(chosen, nobreza)).toContainEqual({
        label: ESPERTEZA_VULPINA_ABILITY_NAME,
        value: 2,
      });
    });
  });

  describe('fichas antigas', () => {
    /**
     * Ficha salva carrega a cópia ANTIGA da habilidade em `raca.abilities`, com
     * a ação `special`. O despacho de `special` em `general.ts` termina em
     * `throw` para ação desconhecida, então o ramo tem de continuar existindo.
     */
    const legacyAbility = {
      name: ESPERTEZA_VULPINA_ABILITY_NAME,
      description: 'Versão antiga, com ação special.',
      sheetActions: [
        {
          source: {
            type: 'power' as const,
            name: ESPERTEZA_VULPINA_ABILITY_NAME,
          },
          action: {
            type: 'special' as const,
            specialAction: 'moreauEspertezaVulpina' as const,
          },
        },
      ],
    };

    it('não lança ao aplicar a ação special antiga', () => {
      const sheet = makeSheet();
      sheet.moreauEspertezaSkills = [Skill.CAVALGAR, Skill.ATUACAO];

      expect(() => applyPower(sheet, legacyAbility)).not.toThrow();
    });

    it('replica a escolha armazenada, sem sortear nada novo', () => {
      const sheet = makeSheet();
      sheet.skills = [];
      sheet.moreauEspertezaSkills = [Skill.CAVALGAR, Skill.ATUACAO];

      const [result] = applyPower(sheet, legacyAbility);

      expect(result.skills).toEqual([Skill.CAVALGAR, Skill.ATUACAO]);
    });

    /**
     * O que o `SheetInfoEditDrawer` faz ao mudar a escolha: reconstrói a raça
     * pelo catálogo (trocando a ação `special` pelo bônus `PickSkill`) e grava
     * a escolha em `optionChoices`. É o escape hatch da ficha antiga.
     */
    it('passa a receber o +2 quando a raça é reconstruída pelo catálogo', () => {
      const legacy = makeSheet();
      legacy.raca = {
        ...MOREAU,
        heritage: 'Raposa',
        abilities: [legacyAbility],
      };
      legacy.moreauEspertezaSkills = [Skill.CAVALGAR, Skill.ATUACAO];

      const baseline = othersOf(recalculateSheet(legacy), Skill.NOBREZA);
      expect(baseline).toBe(0);

      const edited = recalculateSheet({
        ...legacy,
        raca: raposa,
        optionChoices: {
          [ESPERTEZA_VULPINA_OPTION_KEY]: [Skill.NOBREZA, Skill.DIPLOMACIA],
        },
      });

      expect(othersOf(edited, Skill.NOBREZA)).toBe(2);
      expect(othersOf(edited, Skill.DIPLOMACIA)).toBe(2);
    });

    it('sem escolha armazenada, não treina nada (o sorteio foi removido)', () => {
      const sheet = makeSheet();
      sheet.skills = [];
      sheet.moreauEspertezaSkills = undefined;

      const [result] = applyPower(sheet, legacyAbility);

      expect(result.skills).toEqual([]);
    });
  });
});
