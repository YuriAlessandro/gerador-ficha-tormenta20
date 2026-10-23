import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription } from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { ClassSetupSelection } from '../../interfaces/WizardSelections';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';

/**
 * Guerreiro que multiclassa em Feiticeiro com a Linhagem Rubra: a linhagem
 * deixa perder outro atributo em vez de Carisma pelos poderes da Tormenta, e o
 * jogador escolhe qual no 1º nível de Arcanista.
 */
function makeGuerreiro(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 1;
  sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
  sheet.classLevels = [{ level: 1, className: 'Guerreiro' }];
  return sheet;
}

function levelUpRubra(setup: ClassSetupSelection): CharacterSheet {
  const sheet = makeGuerreiro();
  return recalculateSheet(
    applyManualLevelUp(sheet, {
      level: 2,
      selectedClassName: 'Arcanista',
      powerChoice: 'class',
      classSetup: setup,
      abilityEffectSelections: {
        'Linhagem Rubra': { powers: [tormentaPowers.ANTENAS] },
      },
    })
  );
}

describe('Linhagem Rubra em multiclasse', () => {
  it('desconta o atributo escolhido no level-up, e não Carisma', () => {
    const base = makeGuerreiro();
    const lvl2 = levelUpRubra({
      arcanistaSubtype: 'Feiticeiro',
      feiticeiroLinhagem: 'Linhagem Rubra',
      linhagemRubraAtributo: Atributo.SABEDORIA,
    });

    expect(lvl2.linhagemRubraAtributo).toBe(Atributo.SABEDORIA);
    expect(lvl2.generalPowers.map((p) => p.name)).toContain(
      tormentaPowers.ANTENAS.name
    );
    expect(lvl2.tormentaAttributePenalties).toEqual({
      [Atributo.SABEDORIA]: 1,
    });
    expect(lvl2.atributos[Atributo.CARISMA].value).toBe(
      base.atributos[Atributo.CARISMA].value
    );
  });

  it('sem escolha, continua poupando Carisma', () => {
    const lvl2 = levelUpRubra({
      arcanistaSubtype: 'Feiticeiro',
      feiticeiroLinhagem: 'Linhagem Rubra',
    });

    expect(lvl2.linhagemRubraAtributo).toBeUndefined();
    expect(lvl2.tormentaAttributePenalties?.[Atributo.CARISMA] ?? 0).toBe(0);
  });
});
