import _ from 'lodash';
import { applyRaceAbilities } from '../general';
import {
  recalculateSheet,
  reverseSheetActionsForPower,
} from '../recalculateSheet';
import { inventor } from '../../__mocks__/classes/inventor';
import AGGELUS from '../../data/systems/tormenta20/races/aggelus';
import SULFURE from '../../data/systems/tormenta20/races/sulfure';
import ELFO from '../../data/systems/tormenta20/races/elfo';
import {
  applySuragelAlternativeAbility,
  getSuragelAbilityChoiceAction,
  getSuragelDefaultAbilityName,
} from '../../data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import { normalizeSheet } from '../sheetNormalizer';
import { ManualPowerSelections } from '../../interfaces/PowerSelections';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import Skill from '../../interfaces/Skills';

function buildSheet(
  race: Race,
  abilityName: string,
  selections?: ManualPowerSelections
): CharacterSheet {
  const sheet = _.cloneDeep(inventor(race));
  sheet.raca = applySuragelAlternativeAbility(sheet.raca, abilityName);
  sheet.suragelAbility = abilityName;
  return recalculateSheet(applyRaceAbilities(sheet, selections));
}

describe('applySuragelAlternativeAbility', () => {
  test('Aggelus: substitui Luz Sagrada pela herança escolhida', () => {
    const race = applySuragelAlternativeAbility(
      _.cloneDeep(AGGELUS),
      'Herança de Nivenciuén'
    );

    const abilityNames = race.abilities.map((ability) => ability.name);
    expect(abilityNames).toContain('Herança de Nivenciuén');
    expect(abilityNames).not.toContain('Luz Sagrada');
    // As demais habilidades da raça continuam intactas
    expect(abilityNames).toContain('Herança Divina');
  });

  test('Sulfure: substitui Sombras Profanas', () => {
    const race = applySuragelAlternativeAbility(
      _.cloneDeep(SULFURE),
      'Herança de Vitalia'
    );

    const abilityNames = race.abilities.map((ability) => ability.name);
    expect(abilityNames).toContain('Herança de Vitalia');
    expect(abilityNames).not.toContain('Sombras Profanas');
    expect(abilityNames).toContain('Herança Divina');
  });

  test('copia a habilidade inteira, sem o campo `plano`', () => {
    const race = applySuragelAlternativeAbility(
      _.cloneDeep(AGGELUS),
      'Herança de Nivenciuén'
    );

    const ability = race.abilities.find(
      (a) => a.name === 'Herança de Nivenciuén'
    );
    expect(ability).toBeDefined();
    expect(ability?.sheetBonuses).toBeDefined();
    expect(ability?.sheetActions).toBeDefined();
    expect(ability).not.toHaveProperty('plano');
  });

  test('não muda nada sem herança, com nome desconhecido ou fora de Suraggel', () => {
    const aggelus = _.cloneDeep(AGGELUS);
    expect(applySuragelAlternativeAbility(aggelus, undefined)).toBe(aggelus);
    expect(applySuragelAlternativeAbility(aggelus, 'Inexistente')).toBe(
      aggelus
    );

    const elfo = _.cloneDeep(ELFO);
    expect(applySuragelAlternativeAbility(elfo, 'Herança de Nivenciuén')).toBe(
      elfo
    );
  });

  test('não muta o catálogo compartilhado', () => {
    const before = _.cloneDeep(AGGELUS);
    applySuragelAlternativeAbility(AGGELUS, 'Herança de Nivenciuén');
    expect(AGGELUS).toEqual(before);
  });

  test('getSuragelDefaultAbilityName', () => {
    expect(getSuragelDefaultAbilityName('Suraggel (Aggelus)')).toBe(
      'Luz Sagrada'
    );
    expect(getSuragelDefaultAbilityName('Suraggel (Sulfure)')).toBe(
      'Sombras Profanas'
    );
  });
});

describe('Herança de Nivenciuén', () => {
  test('+2 Misticismo independente da escolha élfica', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Sangue Mágico'] },
    });

    const misticismoBonus = sheet.sheetBonuses.filter(
      (bonus) =>
        bonus.target.type === 'Skill' &&
        bonus.target.name === Skill.MISTICISMO &&
        (bonus.source as { name?: string }).name === 'Herança de Nivenciuén'
    );
    expect(misticismoBonus).toHaveLength(1);
  });

  test('Graça de Glórienn: deslocamento 12m', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Graça de Glórienn'] },
    });

    expect(sheet.displacement).toBe(12);
    expect(sheet.optionChoices?.suragelNivenciuenElfica).toEqual([
      'Graça de Glórienn',
    ]);
  });

  test('Sangue Mágico: +1 PM por nível, sem mexer no deslocamento', () => {
    const base = recalculateSheet(
      applyRaceAbilities(_.cloneDeep(inventor(AGGELUS)))
    );
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Sangue Mágico'] },
    });

    expect(sheet.pm).toBe(base.pm + sheet.nivel);
    expect(sheet.displacement).toBe(9);
  });

  test('a escolha sobrevive ao recálculo sem duplicar o bônus', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Graça de Glórienn'] },
    });
    const recalculated = recalculateSheet(recalculateSheet(sheet));

    expect(recalculated.displacement).toBe(12);
    expect(
      recalculated.sheetBonuses.filter(
        (bonus) => bonus.target.type === 'Displacement'
      )
    ).toHaveLength(1);
  });

  test('a magia Luz da habilidade padrão não vai junto', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Sangue Mágico'] },
    });

    expect(sheet.spells.map((spell) => spell.nome)).not.toContain('Luz');
  });
});

describe('Herança de Werra', () => {
  test('Armas Marciais: concede só a categoria', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Werra', {
      'Herança de Werra': { chosenOption: ['Armas Marciais'] },
    });

    expect(sheet.classe.proficiencias).toContain('Armas Marciais');
    expect(sheet.classe.proficiencias).not.toContain('Katana');
  });

  test('Duas Armas Exóticas: concede as duas armas escolhidas', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Werra', {
      'Herança de Werra': {
        chosenOption: ['Duas Armas Exóticas'],
        proficiencies: ['Katana', 'Rede'],
      },
    });

    expect(sheet.classe.proficiencias).toContain('Katana');
    expect(sheet.classe.proficiencias).toContain('Rede');
  });

  test('as proficiências das armas exóticas sobrevivem ao recálculo, sem duplicar', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Werra', {
      'Herança de Werra': {
        chosenOption: ['Duas Armas Exóticas'],
        proficiencies: ['Katana', 'Rede'],
      },
    });
    const recalculated = recalculateSheet(sheet);

    expect(
      recalculated.classe.proficiencias.filter((prof) => prof === 'Katana')
    ).toHaveLength(1);
    expect(recalculated.classe.proficiencias).toContain('Rede');
  });
});

describe('Forma Selvagem por herança (Arbória / Chacina)', () => {
  test('Arbória: a forma escolhida fica em optionChoices', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Arbória', {
      'Herança de Arbória': { chosenOption: ['Forma Ágil'] },
    });

    expect(sheet.optionChoices?.suragelArboriaForma).toEqual(['Forma Ágil']);
  });

  test('Chacina: a forma escolhida fica em optionChoices', () => {
    const sheet = buildSheet(SULFURE, 'Herança de Chacina', {
      'Herança de Chacina': { chosenOption: ['Forma Resistente'] },
    });

    expect(sheet.optionChoices?.suragelChacinaForma).toEqual([
      'Forma Resistente',
    ]);
  });
});

describe('Troca de herança pelo editor da ficha', () => {
  /**
   * Mesmo caminho do `SheetInfoEditDrawer`: reverte a habilidade anterior pelo
   * histórico, troca a raça e recalcula.
   */
  function switchAbility(
    sheet: CharacterSheet,
    previousAbilityName: string,
    nextAbilityName: string,
    optionChoices?: CharacterSheet['optionChoices']
  ): CharacterSheet {
    const working = _.cloneDeep(sheet);
    reverseSheetActionsForPower(working, previousAbilityName);
    working.raca = applySuragelAlternativeAbility(
      _.cloneDeep(AGGELUS),
      nextAbilityName
    );
    working.suragelAbility = nextAbilityName;
    if (optionChoices) working.optionChoices = optionChoices;
    return recalculateSheet(working);
  }

  test('sair de Luz Sagrada leva junto a magia Luz e os bônus dela', () => {
    const original = recalculateSheet(
      applyRaceAbilities(_.cloneDeep(inventor(AGGELUS)))
    );
    expect(original.spells.map((spell) => spell.nome)).toContain('Luz');

    const switched = switchAbility(
      original,
      'Luz Sagrada',
      'Herança de Nivenciuén',
      { suragelNivenciuenElfica: ['Graça de Glórienn'] }
    );

    expect(switched.spells.map((spell) => spell.nome)).not.toContain('Luz');
    expect(
      switched.sheetBonuses.some(
        (bonus) => (bonus.source as { name?: string }).name === 'Luz Sagrada'
      )
    ).toBe(false);
    expect(switched.displacement).toBe(12);
  });

  test('trocar entre heranças não acumula as proficiências da anterior', () => {
    const werra = buildSheet(AGGELUS, 'Herança de Werra', {
      'Herança de Werra': {
        chosenOption: ['Duas Armas Exóticas'],
        proficiencies: ['Katana', 'Rede'],
      },
    });
    expect(werra.classe.proficiencias).toContain('Katana');

    const switched = switchAbility(
      werra,
      'Herança de Werra',
      'Herança de Nivenciuén',
      { suragelNivenciuenElfica: ['Sangue Mágico'] }
    );

    expect(switched.classe.proficiencias).not.toContain('Katana');
    expect(switched.classe.proficiencias).not.toContain('Rede');
  });

  test('trocar a escolha embutida troca o bônus, sem duplicar', () => {
    const sheet = buildSheet(AGGELUS, 'Herança de Nivenciuén', {
      'Herança de Nivenciuén': { chosenOption: ['Graça de Glórienn'] },
    });
    expect(sheet.displacement).toBe(12);

    const changed = recalculateSheet({
      ...sheet,
      optionChoices: { suragelNivenciuenElfica: ['Sangue Mágico'] },
    });

    expect(changed.displacement).toBe(9);
    expect(
      changed.sheetBonuses.filter((bonus) => bonus.target.type === 'PM')
    ).toHaveLength(1);
  });
});

describe('Fichas antigas (normalizeSheet)', () => {
  test('a herança embutida é refrescada pelo catálogo atual', () => {
    // Fichas criadas antes da mecanização levavam só 4 campos da herança — e a
    // ação de escolha nem existia.
    const sheet = _.cloneDeep(inventor(AGGELUS));
    sheet.suragelAbility = 'Herança de Nivenciuén';
    sheet.raca.abilities = sheet.raca.abilities.map((ability) =>
      ability.name === 'Luz Sagrada'
        ? {
            name: 'Herança de Nivenciuén',
            description: 'descrição antiga',
            sheetBonuses: [],
          }
        : ability
    );

    normalizeSheet(sheet);

    const ability = sheet.raca.abilities.find(
      (a) => a.name === 'Herança de Nivenciuén'
    );
    expect(ability?.sheetActions).toBeDefined();
    expect(ability?.description).not.toBe('descrição antiga');

    // E o motor passa a oferecer a escolha élfica
    const recalculated = recalculateSheet(
      applyRaceAbilities(sheet, {
        'Herança de Nivenciuén': { chosenOption: ['Graça de Glórienn'] },
      })
    );
    expect(recalculated.displacement).toBe(12);
  });

  test('não mexe em habilidades de outras raças', () => {
    const sheet = _.cloneDeep(inventor(ELFO));
    const before = _.cloneDeep(sheet.raca.abilities);

    normalizeSheet(sheet);

    expect(sheet.raca.abilities).toEqual(before);
  });
});

describe('getSuragelAbilityChoiceAction', () => {
  test('devolve as opções das heranças com escolha embutida', () => {
    expect(
      getSuragelAbilityChoiceAction('Herança de Nivenciuén')?.options.map(
        (option) => option.name
      )
    ).toEqual(['Graça de Glórienn', 'Sangue Mágico']);

    expect(getSuragelAbilityChoiceAction('Herança de Arbória')?.optionKey).toBe(
      'suragelArboriaForma'
    );
  });

  test('devolve undefined para heranças sem escolha ou inexistentes', () => {
    expect(getSuragelAbilityChoiceAction('Herança de Vitalia')).toBeUndefined();
    expect(getSuragelAbilityChoiceAction(undefined)).toBeUndefined();
  });
});
