import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { applyRaceAbilities } from '../general';
import { inventor } from '../../__mocks__/classes/inventor';
import SEREIA from '../../data/systems/tormenta20/races/sereia';
import ANAO from '../../data/systems/tormenta20/races/anao';
import { AMEACAS_ARTON_WEAPONS } from '../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import {
  getSheetProficiencias,
  getEffectiveWeaponCategory,
  isProficientWithWeapon,
  getWeaponNonProficiencyPenalty,
  isProficientWithDefense,
  getNonProficientArmorPenalty,
  WEAPON_NON_PROFICIENCY_PENALTY,
} from '../proficiencies';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';
import {
  Armas,
  Armaduras,
  Escudos,
} from '../../data/systems/tormenta20/equipamentos';

/**
 * Cobre a detecção de não proficiência (feedback de usuário): –5 em ataques
 * com armas sem proficiência e extensão da penalidade de armadura a todas as
 * perícias de Força/Destreza quando a armadura/escudo ativo não é proficiente.
 */
describe('proficiencies', () => {
  describe('getSheetProficiencias', () => {
    it('mescla classe + custom e remove as removidas', () => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = [
        PROFICIENCIAS.SIMPLES,
        PROFICIENCIAS.MARCIAIS,
      ];
      sheet.customProficiencias = [PROFICIENCIAS.EXOTICAS];
      sheet.removedProficiencias = [PROFICIENCIAS.MARCIAIS];

      const result = getSheetProficiencias(sheet);
      expect(result).toContain(PROFICIENCIAS.SIMPLES);
      expect(result).toContain(PROFICIENCIAS.EXOTICAS);
      expect(result).not.toContain(PROFICIENCIAS.MARCIAIS);
    });

    it('não duplica proficiência custom já presente na classe', () => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = [PROFICIENCIAS.SIMPLES];
      sheet.customProficiencias = [PROFICIENCIAS.SIMPLES];

      expect(getSheetProficiencias(sheet)).toEqual([PROFICIENCIAS.SIMPLES]);
    });
  });

  describe('getEffectiveWeaponCategory', () => {
    it('usa o campo weaponCategory quando presente', () => {
      expect(getEffectiveWeaponCategory(Armas.ESPADA_LONGA)).toBe('martial');
      expect(getEffectiveWeaponCategory(Armas.ADAGA)).toBe('simple');
      expect(getEffectiveWeaponCategory(Armas.KATANA)).toBe('exotic');
      expect(getEffectiveWeaponCategory(Armas.PISTOLA)).toBe('firearm');
    });

    it('resolve cópia legada de arma core pelo nome (ficha antiga)', () => {
      const legacyCopy: Equipment = {
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        critico: '19',
      };
      expect(getEffectiveWeaponCategory(legacyCopy)).toBe('martial');
    });

    it('retorna undefined para arma custom/desconhecida', () => {
      const custom: Equipment = {
        nome: 'Lâmina do Caos',
        group: 'Arma',
        isCustom: true,
      };
      expect(getEffectiveWeaponCategory(custom)).toBeUndefined();
    });
  });

  describe('isProficientWithWeapon / getWeaponNonProficiencyPenalty', () => {
    it('armas simples nunca penalizam', () => {
      expect(isProficientWithWeapon(Armas.ADAGA, [])).toBe(true);
      expect(getWeaponNonProficiencyPenalty(Armas.ADAGA, [])).toBe(0);
    });

    it('arma marcial sem proficiência sofre -5', () => {
      expect(
        getWeaponNonProficiencyPenalty(Armas.ESPADA_LONGA, [
          PROFICIENCIAS.SIMPLES,
        ])
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
      expect(
        getWeaponNonProficiencyPenalty(Armas.ESPADA_LONGA, [
          PROFICIENCIAS.MARCIAIS,
        ])
      ).toBe(0);
    });

    it('Armas Marciais de Distância cobre marcial com alcance, não corpo a corpo', () => {
      const soDistancia = [PROFICIENCIAS.MARCIAIS_DISTANCIA];
      // Arco Longo tem alcance Médio
      expect(
        getWeaponNonProficiencyPenalty(Armas.ARCO_LONGO, soDistancia)
      ).toBe(0);
      // Tridente é de arremesso (alcance Curto) — também coberto
      expect(getWeaponNonProficiencyPenalty(Armas.TRIDENTE, soDistancia)).toBe(
        0
      );
      // Espada Longa é corpo a corpo puro — não coberto
      expect(
        getWeaponNonProficiencyPenalty(Armas.ESPADA_LONGA, soDistancia)
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
    });

    it('exótica exige Armas Exóticas e de fogo exige Armas de Fogo', () => {
      expect(
        getWeaponNonProficiencyPenalty(Armas.KATANA, [PROFICIENCIAS.MARCIAIS])
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
      expect(
        getWeaponNonProficiencyPenalty(Armas.KATANA, [PROFICIENCIAS.EXOTICAS])
      ).toBe(0);
      expect(
        getWeaponNonProficiencyPenalty(Armas.MOSQUETE, [PROFICIENCIAS.MARCIAIS])
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
      expect(
        getWeaponNonProficiencyPenalty(Armas.MOSQUETE, [PROFICIENCIAS.FOGO])
      ).toBe(0);
    });

    it('arma custom sem categoria é tratada como proficiente', () => {
      const custom: Equipment = {
        nome: 'Lâmina do Caos',
        group: 'Arma',
        isCustom: true,
      };
      expect(getWeaponNonProficiencyPenalty(custom, [])).toBe(0);
    });
  });

  describe('isProficientWithDefense', () => {
    it('armadura leve exige Armaduras Leves', () => {
      expect(
        isProficientWithDefense(Armaduras.ARMADURADECOURO, [
          PROFICIENCIAS.LEVES,
        ])
      ).toBe(true);
      expect(
        isProficientWithDefense(Armaduras.ARMADURADECOURO, [
          PROFICIENCIAS.PESADAS,
        ])
      ).toBe(false);
    });

    it('armadura pesada exige Armaduras Pesadas (fallback por nome)', () => {
      // Brunea não tem a flag isHeavyArmor no catálogo — resolve pelo nome
      expect(
        isProficientWithDefense(Armaduras.BRUNEA, [PROFICIENCIAS.LEVES])
      ).toBe(false);
      expect(
        isProficientWithDefense(Armaduras.BRUNEA, [PROFICIENCIAS.PESADAS])
      ).toBe(true);
    });

    it('escudo exige Escudos', () => {
      expect(
        isProficientWithDefense(Escudos.ESCUDO_PESADO, [PROFICIENCIAS.LEVES])
      ).toBe(false);
      expect(
        isProficientWithDefense(Escudos.ESCUDO_PESADO, [PROFICIENCIAS.ESCUDOS])
      ).toBe(true);
    });
  });

  describe('getNonProficientArmorPenalty', () => {
    const mkSheet = (
      proficiencias: string[],
      armors: DefenseEquipment[],
      shields: DefenseEquipment[] = []
    ): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = proficiencias;
      sheet.bag = new Bag({ Armadura: armors, Escudo: shields });
      return sheet;
    };

    it('conta a armadura vestida sem proficiência', () => {
      const sheet = mkSheet(
        [PROFICIENCIAS.LEVES],
        [{ ...Armaduras.BRUNEA, id: 'a1' }]
      );
      sheet.wornArmorId = 'a1';
      expect(getNonProficientArmorPenalty(sheet)).toBe(
        Armaduras.BRUNEA.armorPenalty
      );
    });

    it('não conta armadura com proficiência', () => {
      const sheet = mkSheet(
        [PROFICIENCIAS.PESADAS],
        [{ ...Armaduras.BRUNEA, id: 'a1' }]
      );
      sheet.wornArmorId = 'a1';
      expect(getNonProficientArmorPenalty(sheet)).toBe(0);
    });

    it('fallback legado: armadura única sem wornArmorId conta como vestida', () => {
      const sheet = mkSheet([], [{ ...Armaduras.GIBAODEPELES, id: 'a1' }]);
      expect(getNonProficientArmorPenalty(sheet)).toBe(
        Armaduras.GIBAODEPELES.armorPenalty
      );
    });

    it('escudo só conta quando empunhado', () => {
      const sheet = mkSheet([], [], [{ ...Escudos.ESCUDO_PESADO, id: 's1' }]);
      expect(getNonProficientArmorPenalty(sheet)).toBe(0);

      sheet.offHandItemId = 's1';
      expect(getNonProficientArmorPenalty(sheet)).toBe(
        Escudos.ESCUDO_PESADO.armorPenalty
      );
    });

    it('soma apenas os itens ativos sem proficiência', () => {
      const sheet = mkSheet(
        [PROFICIENCIAS.ESCUDOS],
        [{ ...Armaduras.BRUNEA, id: 'a1' }],
        [{ ...Escudos.ESCUDO_PESADO, id: 's1' }]
      );
      sheet.wornArmorId = 'a1';
      sheet.offHandItemId = 's1';
      // Escudo é proficiente, só a Brunea conta
      expect(getNonProficientArmorPenalty(sheet)).toBe(
        Armaduras.BRUNEA.armorPenalty
      );
    });
  });

  describe('recalculateSheet — penalidade de armadura estendida', () => {
    const skillOthers = (sheet: CharacterSheet, skill: Skill): number =>
      sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

    const mkArmoredSheet = (proficiencias: string[]): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = proficiencias;
      sheet.bag = new Bag({
        Armadura: [{ ...Armaduras.BRUNEA, id: 'a1' }],
      });
      sheet.wornArmorId = 'a1';
      return sheet;
    };

    it('sem proficiência: penalidade em todas as perícias de For/Des', () => {
      const recalculated = recalculateSheet(mkArmoredSheet([]));
      const penalty = -Armaduras.BRUNEA.armorPenalty;

      // Perícias padrão de penalidade de armadura seguem com a penalidade cheia
      expect(skillOthers(recalculated, Skill.ACROBACIA)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.FURTIVIDADE)).toBe(penalty);
      // Demais perícias de For/Des passam a sofrer a penalidade
      expect(skillOthers(recalculated, Skill.ATLETISMO)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.INICIATIVA)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.REFLEXOS)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.LUTA)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.PONTARIA)).toBe(penalty);
      // Perícias de outros atributos ficam intocadas
      expect(skillOthers(recalculated, Skill.VONTADE)).toBe(0);
      expect(skillOthers(recalculated, Skill.FORTITUDE)).toBe(0);
    });

    it('com proficiência: só as perícias padrão sofrem a penalidade', () => {
      const recalculated = recalculateSheet(
        mkArmoredSheet([PROFICIENCIAS.PESADAS])
      );
      const penalty = -Armaduras.BRUNEA.armorPenalty;

      expect(skillOthers(recalculated, Skill.ACROBACIA)).toBe(penalty);
      expect(skillOthers(recalculated, Skill.ATLETISMO)).toBe(0);
      expect(skillOthers(recalculated, Skill.LUTA)).toBe(0);
    });
  });

  describe('recalculateSheet — weaponMatchesBonus com proficiência', () => {
    const mkWeaponSheet = (proficiencias: string[]): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = proficiencias;
      sheet.bag = new Bag({
        Arma: [
          // Cópia legada de arma core: sem weaponCategory embutido
          {
            id: 'w1',
            nome: 'Espada Longa',
            group: 'Arma',
            dano: '1d8',
            critico: '19',
          },
        ],
      });
      // sheetBonuses é zerado a cada recálculo — o bônus precisa vir de uma
      // fonte persistente (habilidade de classe).
      sheet.classe = {
        ...sheet.classe,
        originalAbilities: undefined,
        abilities: [
          {
            name: 'Bônus Teste',
            text: 'bônus de teste',
            nivel: 1,
            sheetBonuses: [
              {
                source: { type: 'class', className: sheet.classe.name },
                target: {
                  type: 'WeaponAttack',
                  weaponCategories: ['martial'],
                  proficiencyRequired: true,
                },
                modifier: { type: 'Fixed', value: 2 },
              },
            ],
          },
        ],
      };
      sheet.sheetBonuses = [];
      sheet.sheetActionHistory = [];
      return sheet;
    };

    it('aplica bônus com weaponCategories em arma core legada quando proficiente', () => {
      const recalculated = recalculateSheet(
        mkWeaponSheet([PROFICIENCIAS.MARCIAIS])
      );
      const weapon = recalculated.bag.equipments.Arma.find(
        (w) => w.id === 'w1'
      );
      expect(weapon?.atkBonus ?? 0).toBe(2);
    });

    it('bloqueia bônus proficiencyRequired quando não proficiente', () => {
      const recalculated = recalculateSheet(
        mkWeaponSheet([PROFICIENCIAS.SIMPLES])
      );
      const weapon = recalculated.bag.equipments.Arma.find(
        (w) => w.id === 'w1'
      );
      expect(weapon?.atkBonus ?? 0).toBe(0);
    });
  });

  describe('proficiência por nome de arma', () => {
    it('proficiência nomeada cobre arma marcial e exótica', () => {
      expect(getWeaponNonProficiencyPenalty(Armas.TRIDENTE, ['Tridente'])).toBe(
        0
      );
      expect(getWeaponNonProficiencyPenalty(Armas.KATANA, ['Katana'])).toBe(0);
    });

    it('normaliza caixa, espaços e acentos', () => {
      expect(
        getWeaponNonProficiencyPenalty(Armas.TRIDENTE, [' tridente '])
      ).toBe(0);
      expect(
        getWeaponNonProficiencyPenalty(AMEACAS_ARTON_WEAPONS.ARPAO, ['Arpao'])
      ).toBe(0);
    });

    it('customDisplayName não conta — só o nome base da arma', () => {
      const renamed: Equipment = {
        ...Armas.ESPADA_LONGA,
        customDisplayName: 'Tridente',
      };
      expect(getWeaponNonProficiencyPenalty(renamed, ['Tridente'])).toBe(
        WEAPON_NON_PROFICIENCY_PENALTY
      );
    });

    it('remoção manual da proficiência nomeada vence', () => {
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = [PROFICIENCIAS.SIMPLES, 'Tridente'];
      sheet.removedProficiencias = ['Tridente'];
      expect(
        getWeaponNonProficiencyPenalty(
          Armas.TRIDENTE,
          getSheetProficiencias(sheet)
        )
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
    });

    it('fallback por nome resolve categoria de arma de suplemento', () => {
      const legacyArpao: Equipment = { nome: 'Arpão', group: 'Arma' };
      expect(getEffectiveWeaponCategory(legacyArpao)).toBe('exotic');
    });
  });

  describe('poderes que tornam armas específicas simples', () => {
    it('Mestre do Tridente (Sereia): Tridente sem penalidade após recálculo', () => {
      const sheet = _.cloneDeep(inventor(SEREIA));
      const recalculated = recalculateSheet(applyRaceAbilities(sheet));
      const proficiencias = getSheetProficiencias(recalculated);

      expect(recalculated.classe.proficiencias).toContain('Tridente');
      expect(
        getWeaponNonProficiencyPenalty(Armas.TRIDENTE, proficiencias)
      ).toBe(0);
      // Controle: outra marcial continua penalizada (Inventor não tem
      // Armas Marciais).
      expect(
        getWeaponNonProficiencyPenalty(Armas.ESPADA_LONGA, proficiencias)
      ).toBe(WEAPON_NON_PROFICIENCY_PENALTY);
    });

    it('Tradição de Heredrimm (Anão): Marreta e Machado Anão sem penalidade', () => {
      const sheet = _.cloneDeep(inventor(ANAO));
      const recalculated = recalculateSheet(applyRaceAbilities(sheet));
      const proficiencias = getSheetProficiencias(recalculated);

      expect(recalculated.classe.proficiencias).toContain('Marreta');
      expect(getWeaponNonProficiencyPenalty(Armas.MARRETA, proficiencias)).toBe(
        0
      );
      expect(
        getWeaponNonProficiencyPenalty(Armas.MACHADO_ANAO, proficiencias)
      ).toBe(0);
    });
  });
});
