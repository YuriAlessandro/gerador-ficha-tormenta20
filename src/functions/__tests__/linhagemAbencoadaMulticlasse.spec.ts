import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import {
  classSetupNeedsRecovery,
  findClassDescription,
  getLinhagemAbencoadaDeus,
  resolveClassSetup,
} from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import {
  ClassSetupSelection,
  LevelUpSelections,
} from '../../interfaces/WizardSelections';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { DIVINDADES } from '../../data/systems/tormenta20/divindades';

/**
 * Druida que multiclassa em Feiticeiro com a Linhagem Abençoada (Aharadak): o
 * deus é escolhido no 1º nível de Arcanista, mas o poder concedido só sai no
 * 2º. O `classSetup` morava apenas na seleção daquele 1º nível — no 2º a
 * habilidade nem existia, e o poder nunca era oferecido.
 */
const DEUS = 'Aharadak';
const PODERES_DO_DEUS = DIVINDADES.find((d) => d.name === DEUS)!.poderes;
const PODER_CONCEDIDO = 'Linhagem Abençoada (Poder Concedido)';

const SETUP: ClassSetupSelection = {
  arcanistaSubtype: 'Feiticeiro',
  feiticeiroLinhagem: 'Linhagem Abençoada',
  linhagemAbencoadaDeus: DEUS,
};

function makeDruida(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 1;
  sheet.classe = cloneDeep(findClassDescription('Druida')!);
  sheet.classLevels = [{ level: 1, className: 'Druida' }];
  return sheet;
}

function levelUpArcanista(
  sheet: CharacterSheet,
  extra: Partial<LevelUpSelections> = {}
): CharacterSheet {
  return applyManualLevelUp(sheet, {
    level: sheet.nivel + 1,
    selectedClassName: 'Arcanista',
    powerChoice: 'class',
    ...extra,
  });
}

describe('Linhagem Abençoada em multiclasse', () => {
  it('grava o setup do 1º nível na ficha', () => {
    const lvl2 = levelUpArcanista(makeDruida(), { classSetup: SETUP });
    expect(lvl2.multiclassSetups?.Arcanista).toEqual(SETUP);
    expect(getLinhagemAbencoadaDeus(lvl2)).toBe(DEUS);
  });

  it('concede o poder escolhido no 2º nível de Feiticeiro', () => {
    const lvl2 = levelUpArcanista(makeDruida(), { classSetup: SETUP });
    const escolhido = PODERES_DO_DEUS[0];
    // No 2º nível da classe o assistente não tem mais o passo de setup.
    const lvl3 = levelUpArcanista(lvl2, {
      abilityEffectSelections: {
        [PODER_CONCEDIDO]: { powers: [escolhido] },
      },
    });
    expect(lvl3.generalPowers.map((p) => p.name)).toContain(escolhido.name);
  });

  it('mantém as habilidades do setup da classe secundária após o recálculo', () => {
    // MainScreen recalcula a ficha depois de cada level-up; o recálculo
    // reconstrói `classe.abilities` e apagava Caminho do Arcanista e linhagem.
    const escolhido = PODERES_DO_DEUS[1];
    let sheet = recalculateSheet(
      levelUpArcanista(makeDruida(), { classSetup: SETUP })
    );
    sheet = recalculateSheet(
      levelUpArcanista(sheet, {
        abilityEffectSelections: {
          [PODER_CONCEDIDO]: { powers: [escolhido] },
        },
      })
    );
    sheet = recalculateSheet(
      applyManualLevelUp(sheet, {
        level: sheet.nivel + 1,
        selectedClassName: 'Druida',
        powerChoice: 'class',
      })
    );
    sheet = recalculateSheet(sheet);

    const arcanista = sheet.classe.abilities
      .filter((ability) => ability.sourceClassName === 'Arcanista')
      .map((ability) => ability.name);
    expect(arcanista).toEqual([
      'Caminho do Arcanista',
      'Linhagem Abençoada',
      PODER_CONCEDIDO,
    ]);
    const concedidos = sheet.generalPowers.filter((power) =>
      PODERES_DO_DEUS.some((p) => p.name === power.name)
    );
    expect(concedidos.map((p) => p.name)).toEqual([escolhido.name]);
  });

  describe('fichas anteriores a multiclassSetups', () => {
    const legacyLvl2 = () => {
      const sheet = levelUpArcanista(makeDruida(), { classSetup: SETUP });
      delete sheet.multiclassSetups;
      return sheet;
    };

    it('recupera subtipo, linhagem e deus pelo spellPath e pelo texto', () => {
      expect(resolveClassSetup(legacyLvl2(), 'Arcanista', undefined)).toEqual(
        SETUP
      );
    });

    it('sem o texto da habilidade, pede o deus de novo no 2º nível', () => {
      const sheet = legacyLvl2();
      sheet.classe.abilities = sheet.classe.abilities.filter(
        (ability) => ability.name !== 'Linhagem Abençoada'
      );
      expect(classSetupNeedsRecovery(sheet, 'Arcanista', 2)).toBe(true);
      expect(classSetupNeedsRecovery(sheet, 'Arcanista', 3)).toBe(false);
      expect(classSetupNeedsRecovery(legacyLvl2(), 'Arcanista', 2)).toBe(false);
    });

    it('distingue Mago e Bruxo pelo spellPath gravado', () => {
      const mago = levelUpArcanista(makeDruida(), {
        classSetup: { arcanistaSubtype: 'Mago' },
      });
      const bruxo = levelUpArcanista(makeDruida(), {
        classSetup: { arcanistaSubtype: 'Bruxo' },
      });
      delete mago.multiclassSetups;
      delete bruxo.multiclassSetups;
      expect(resolveClassSetup(mago, 'Arcanista', undefined)).toEqual({
        arcanistaSubtype: 'Mago',
      });
      expect(resolveClassSetup(bruxo, 'Arcanista', undefined)).toEqual({
        arcanistaSubtype: 'Bruxo',
      });
    });
  });
});
