import _ from 'lodash';
import { applyManualLevelUp, applyPower } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { resetOriginPowerChoice } from '../originBenefits';
import {
  getChosenOptionNestedRequirements,
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { getGeneralPowerCatalogByTypes, isPowerAvailable } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { GeneralPower, GeneralPowerType } from '../../interfaces/Poderes';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import heroisArtonOriginPowers from '../../data/systems/tormenta20/herois-de-arton/origins/originPowers';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import { SupplementId } from '../../types/supplement.types';

/**
 * Origens "Cosmopolita (Valkaria)" (Atlas de Arton) e "Citadino Abastado"
 * (Heróis de Arton).
 *
 * Os dois poderes prometem "escolha um poder" e eram texto inerte: sem
 * `sheetActions`, `getPowerSelectionRequirements` devolvia `null`, o assistente
 * não desenhava passo nenhum e o `applyPower` não concedia nada — nem na
 * criação, nem na subida de nível, nem na edição (reporte de usuário, set/2026).
 * Mesma classe de bug do Duplo Feérico.
 */
describe('Escolha de poder das origens Cosmopolita e Citadino Abastado', () => {
  const { COSMOPOLITA } = atlasOriginPowers;
  const CITADINO = heroisArtonOriginPowers.CITADINO_ABASTADO;

  const SUPPLEMENTS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_ATLAS_ARTON,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const mkSheet = (
    power = COSMOPOLITA,
    originName = 'Cosmopolita (Valkaria)',
    classe: ClassDescription = GUERREIRO
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 1;
    sheet.classe = _.cloneDeep(classe);
    sheet.origin = { name: originName, powers: [_.cloneDeep(power)] };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.generalPowers = [];
    sheet.classPowers = [];
    sheet.optionChoices = {};
    sheet.supplements = SUPPLEMENTS;
    return sheet;
  };

  const generalBranch = (powerName: string, picked: GeneralPower) => ({
    [powerName]: { chosenOption: ['Poder geral'], powers: [picked] },
  });

  /** Primeiro poder geral elegível para o ramo "Poder geral" do Cosmopolita. */
  const pickGeneral = (sheet: CharacterSheet): GeneralPower => {
    const requirement = getChosenOptionNestedRequirements(COSMOPOLITA, {
      chosenOption: ['Poder geral'],
    })[0];
    return (
      getFilteredAvailableOptions(
        requirement,
        sheet,
        SUPPLEMENTS
      ) as GeneralPower[]
    )[0];
  };

  describe('requisitos oferecidos ao assistente', () => {
    it('Cosmopolita pede a escolha do tipo de poder', () => {
      const reqs = getPowerSelectionRequirements(COSMOPOLITA);
      expect(reqs).not.toBeNull();
      expect(reqs?.requirements).toHaveLength(1);
      expect(reqs?.requirements[0].type).toBe('chooseFromOptions');
      expect(reqs?.requirements[0].availableOptions).toHaveLength(2);
    });

    it('Citadino Abastado pede a escolha do tipo de poder', () => {
      const reqs = getPowerSelectionRequirements(CITADINO);
      expect(reqs).not.toBeNull();
      expect(reqs?.requirements[0].type).toBe('chooseFromOptions');
    });

    it('o ramo escolhido revela o requisito aninhado', () => {
      const geral = getChosenOptionNestedRequirements(COSMOPOLITA, {
        chosenOption: ['Poder geral'],
      });
      expect(geral).toHaveLength(1);
      expect(geral[0].type).toBe('getGeneralPower');
      expect(geral[0].metadata?.availableTypes).toEqual([
        GeneralPowerType.COMBATE,
        GeneralPowerType.DESTINO,
        GeneralPowerType.MAGIA,
      ]);

      const classe = getChosenOptionNestedRequirements(COSMOPOLITA, {
        chosenOption: ['Poder de classe'],
      });
      expect(classe).toHaveLength(1);
      expect(classe[0].type).toBe('getClassPower');
      expect(classe[0].metadata?.minLevel).toBe(2);
    });

    it('sem escolha de ramo, nenhum requisito aninhado aparece', () => {
      expect(getChosenOptionNestedRequirements(COSMOPOLITA, {})).toHaveLength(
        0
      );
    });
  });

  describe('piscina de poderes gerais', () => {
    const generalRequirement = (power: typeof COSMOPOLITA, option: string) =>
      getChosenOptionNestedRequirements(power, { chosenOption: [option] })[0];

    it('Cosmopolita exclui poderes concedidos e da Tormenta', () => {
      const sheet = mkSheet();
      const options = getFilteredAvailableOptions(
        generalRequirement(COSMOPOLITA, 'Poder geral'),
        sheet,
        SUPPLEMENTS
      ) as GeneralPower[];

      expect(options.length).toBeGreaterThan(0);
      expect(options.some((p) => p.type === GeneralPowerType.TORMENTA)).toBe(
        false
      );
      expect(options.some((p) => p.type === GeneralPowerType.CONCEDIDOS)).toBe(
        false
      );
    });

    // A piscina sai do `dataRegistry` na hora, não de uma lista congelada no
    // arquivo de dado. Nenhum suplemento publicado acrescenta poder de combate,
    // destino ou magia hoje — quem colhe o ganho é o homebrew, que registra
    // `SupplementData` em runtime e entraria numa lista estática nunca.
    it('Cosmopolita monta a piscina pelo catálogo do registry', () => {
      const sheet = mkSheet();
      const options = getFilteredAvailableOptions(
        generalRequirement(COSMOPOLITA, 'Poder geral'),
        sheet,
        SUPPLEMENTS
      ) as GeneralPower[];

      const doRegistry = getGeneralPowerCatalogByTypes(
        sheet,
        [
          GeneralPowerType.COMBATE,
          GeneralPowerType.DESTINO,
          GeneralPowerType.MAGIA,
        ],
        SUPPLEMENTS
      ).filter((power) => isPowerAvailable(sheet, power));

      expect(options.map((p) => p.name).sort()).toEqual(
        doRegistry.map((p) => p.name).sort()
      );
    });

    it('Citadino Abastado só oferece combate e destino', () => {
      const sheet = mkSheet(CITADINO, 'Citadino Abastado');
      const options = getFilteredAvailableOptions(
        generalRequirement(CITADINO, 'Poder de combate ou destino'),
        sheet,
        SUPPLEMENTS
      ) as GeneralPower[];

      expect(options.length).toBeGreaterThan(0);
      expect(
        options.every(
          (p) =>
            p.type === GeneralPowerType.COMBATE ||
            p.type === GeneralPowerType.DESTINO
        )
      ).toBe(true);
    });
  });

  describe('piscina de poderes de classe', () => {
    const classRequirement = (power: typeof COSMOPOLITA) =>
      getChosenOptionNestedRequirements(power, {
        chosenOption: ['Poder de classe'],
      })[0];

    it('Cosmopolita avalia no 2º nível, independente do nível da ficha', () => {
      const nivel1 = mkSheet();
      const nivel10 = mkSheet();
      nivel10.nivel = 10;

      const req = classRequirement(COSMOPOLITA);
      const a = getFilteredAvailableOptions(req, nivel1, SUPPLEMENTS);
      const b = getFilteredAvailableOptions(req, nivel10, SUPPLEMENTS);

      expect(a.length).toBeGreaterThan(0);
      expect(a.map((p) => p.name)).toEqual(b.map((p) => p.name));
    });

    it('Citadino Abastado acompanha o nível atual do personagem', () => {
      const nivel1 = mkSheet(CITADINO, 'Citadino Abastado');
      const nivel10 = mkSheet(CITADINO, 'Citadino Abastado');
      nivel10.nivel = 10;

      const req = classRequirement(CITADINO);
      expect(req.metadata?.levelSource).toBe('sheet');

      const a = getFilteredAvailableOptions(req, nivel1, SUPPLEMENTS);
      const b = getFilteredAvailableOptions(req, nivel10, SUPPLEMENTS);

      expect(b.length).toBeGreaterThan(a.length);
    });
  });

  describe('aplicação na ficha', () => {
    it('o ramo geral concede o poder escolhido', () => {
      const sheet = mkSheet();
      const escolhido = pickGeneral(sheet);

      const [updated] = applyPower(
        sheet,
        COSMOPOLITA,
        generalBranch('Cosmopolita', escolhido).Cosmopolita
      );

      expect(updated.generalPowers.map((p) => p.name)).toContain(
        escolhido.name
      );
      expect(updated.classPowers ?? []).toHaveLength(0);
    });

    it('o ramo de classe concede um poder de classe', () => {
      const sheet = mkSheet();
      const [updated] = applyPower(sheet, COSMOPOLITA, {
        chosenOption: ['Poder de classe'],
      });

      expect((updated.classPowers ?? []).length).toBe(1);
      expect(updated.generalPowers).toHaveLength(0);
    });

    it('o caminho aleatório (sem seleção manual) concede exatamente um poder', () => {
      const sheet = mkSheet();
      const [updated] = applyPower(sheet, COSMOPOLITA);

      const total =
        updated.generalPowers.length + (updated.classPowers ?? []).length;
      expect(total).toBe(1);
    });

    it('recálculo não duplica a concessão', () => {
      const sheet = mkSheet();
      const escolhido = pickGeneral(sheet);
      const selections = generalBranch('Cosmopolita', escolhido);

      const once = recalculateSheet(sheet, undefined, selections);
      const twice = recalculateSheet(once, once, selections);

      expect(
        twice.generalPowers.filter((p) => p.name === escolhido.name)
      ).toHaveLength(1);
      expect(twice.optionChoices?.cosmopolitaPoder).toEqual(['Poder geral']);
    });
  });

  describe('troca na subida de nível', () => {
    it('substitui o poder escolhido sem acumular', () => {
      const sheet = mkSheet();
      const escolhido = pickGeneral(sheet);
      const [comGeral] = applyPower(
        sheet,
        COSMOPOLITA,
        generalBranch('Cosmopolita', escolhido).Cosmopolita
      );
      comGeral.classLevels = [{ level: 1, className: comGeral.classe.name }];

      const outro = pickGeneral(comGeral);
      expect(outro.name).not.toBe(escolhido.name);

      const subiu = applyManualLevelUp(comGeral, {
        level: 2,
        powerChoice: 'class',
        originPowerSwaps: {
          Cosmopolita: { chosenOption: ['Poder geral'], powers: [outro] },
        },
      });

      const nomes = subiu.generalPowers.map((p) => p.name);
      expect(nomes).toContain(outro.name);
      expect(nomes).not.toContain(escolhido.name);
    });

    it('troca pela metade (sem poder escolhido) é ignorada', () => {
      const sheet = mkSheet();
      const escolhido = pickGeneral(sheet);
      const [comGeral] = applyPower(
        sheet,
        COSMOPOLITA,
        generalBranch('Cosmopolita', escolhido).Cosmopolita
      );
      comGeral.classLevels = [{ level: 1, className: comGeral.classe.name }];

      const subiu = applyManualLevelUp(comGeral, {
        level: 2,
        powerChoice: 'class',
        originPowerSwaps: {
          Cosmopolita: { chosenOption: ['Poder de classe'] },
        },
      });

      expect(subiu.generalPowers.map((p) => p.name)).toContain(escolhido.name);
    });
  });

  describe('troca da escolha (resetOriginPowerChoice)', () => {
    it('limpa o poder concedido, o histórico e a opção escolhida', () => {
      const sheet = mkSheet();
      const [applied] = applyPower(sheet, COSMOPOLITA, {
        chosenOption: ['Poder de classe'],
      });
      expect((applied.classPowers ?? []).length).toBe(1);

      resetOriginPowerChoice(applied, COSMOPOLITA);

      expect(applied.classPowers ?? []).toHaveLength(0);
      expect(applied.optionChoices?.cosmopolitaPoder).toBeUndefined();
      expect(
        applied.sheetActionHistory.filter(
          (entry) => entry.powerName === 'Cosmopolita'
        )
      ).toHaveLength(0);
    });

    it('trocar de ramo não deixa o poder antigo para trás', () => {
      const sheet = mkSheet();
      const escolhido = pickGeneral(sheet);

      // Ramo geral primeiro…
      const [comGeral] = applyPower(
        sheet,
        COSMOPOLITA,
        generalBranch('Cosmopolita', escolhido).Cosmopolita
      );
      expect(comGeral.generalPowers).toHaveLength(1);

      // …e agora a troca para o ramo de classe.
      resetOriginPowerChoice(comGeral, COSMOPOLITA);
      const [comClasse] = applyPower(comGeral, COSMOPOLITA, {
        chosenOption: ['Poder de classe'],
      });

      expect(comClasse.generalPowers).toHaveLength(0);
      expect((comClasse.classPowers ?? []).length).toBe(1);
    });
  });
});
