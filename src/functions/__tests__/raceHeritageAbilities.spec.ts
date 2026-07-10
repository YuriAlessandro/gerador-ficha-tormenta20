import { cloneDeep } from 'lodash';
import MOREAU from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import ELFO from '../../data/systems/tormenta20/races/elfo';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  applyOsteonMemoriaPostuma,
  applyYidishanNaturezaOrganica,
} from '../powers/special';
import {
  findSelectableRaceAbility,
  getSelectableRaceAbilities,
} from '../raceHeritageAbilities';

/**
 * Regressão: escolher Moreau como raça anterior de um Osteon (Memória
 * Póstuma) ou Yidishan (Natureza Orgânica) travava o wizard, porque a raça
 * base do Moreau tem `abilities: []` — as habilidades vivem nas heranças por
 * animal. O helper achata as heranças em opções rotuladas ("Faro (Lobo)").
 */
describe('getSelectableRaceAbilities', () => {
  it('retorna as habilidades diretas para raças sem heranças', () => {
    const options = getSelectableRaceAbilities(ELFO);
    expect(options.length).toBe(ELFO.abilities.length);
    options.forEach((option) => {
      expect(option.value).toBe(option.ability.name);
      expect(option.heritageKey).toBeUndefined();
    });
  });

  it('achata as heranças do Moreau em opções rotuladas pelo animal', () => {
    const options = getSelectableRaceAbilities(MOREAU);
    expect(options.length).toBeGreaterThan(0);
    options.forEach((option) => {
      expect(option.heritageKey).toBeDefined();
      expect(option.value).toBe(
        `${option.ability.name} (${option.heritageKey})`
      );
    });
  });

  it('gera values únicos mesmo com nomes repetidos entre heranças', () => {
    const options = getSelectableRaceAbilities(MOREAU);
    const values = options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
    // "Mordida" existe em mais de uma herança com dados diferentes
    const mordidas = options.filter((o) => o.ability.name === 'Mordida');
    expect(mordidas.length).toBeGreaterThan(1);
  });
});

describe('findSelectableRaceAbility', () => {
  it('encontra pelo value composto "Nome (Animal)"', () => {
    const options = getSelectableRaceAbilities(MOREAU);
    const target = options.find((o) => o.heritageKey === 'Lobo');
    expect(target).toBeDefined();
    const found = findSelectableRaceAbility(MOREAU, target!.value);
    expect(found?.value).toBe(target!.value);
    expect(found?.heritageKey).toBe('Lobo');
  });

  it('faz fallback legado pelo nome puro da habilidade', () => {
    const options = getSelectableRaceAbilities(MOREAU);
    const anyName = options[0].ability.name;
    const found = findSelectableRaceAbility(MOREAU, anyName);
    expect(found).toBeDefined();
    expect(found?.ability.name).toBe(anyName);
  });

  it('retorna undefined para valor desconhecido', () => {
    expect(findSelectableRaceAbility(MOREAU, 'Inexistente')).toBeUndefined();
  });
});

describe('Memória Póstuma / Natureza Orgânica com Moreau como raça anterior', () => {
  const buildSheetWithMoreauPast = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.raca = {
      name: 'Osteon',
      attributes: { attrs: [] },
      faithProbability: {},
      abilities: [],
      oldRace: cloneDeep(MOREAU),
    };
    return sheet;
  };

  it('caminho manual: aplica a habilidade escolhida pelo value composto', () => {
    const sheet = buildSheetWithMoreauPast();
    applyOsteonMemoriaPostuma(sheet, {
      raceAbilities: [{ raceName: 'Moreau', abilityName: 'Mordida (Leão)' }],
    });
    expect(sheet.raca.abilities?.some((a) => a?.name === 'Mordida')).toBe(true);
    expect(sheet.osteonMemoriaPostumaChoice).toEqual({
      type: 'raceAbility',
      value: 'Mordida (Leão)',
    });
  });

  it('caminho aleatório: não empurra undefined (bug latente da geração)', () => {
    for (let i = 0; i < 10; i += 1) {
      const sheet = buildSheetWithMoreauPast();
      applyOsteonMemoriaPostuma(sheet);
      expect(sheet.raca.abilities?.length).toBe(1);
      expect(sheet.raca.abilities?.[0]).toBeDefined();
      const choice = sheet.osteonMemoriaPostumaChoice;
      expect(choice && choice.type !== 'cleared' ? choice.value : '').toMatch(
        /^.+ \(.+\)$/
      );
    }
  });

  it('replay determinístico: reaplica sem duplicar', () => {
    const sheet = buildSheetWithMoreauPast();
    sheet.osteonMemoriaPostumaChoice = {
      type: 'raceAbility',
      value: 'Mordida (Leão)',
    };
    applyOsteonMemoriaPostuma(sheet);
    applyOsteonMemoriaPostuma(sheet);
    const mordidas = sheet.raca.abilities?.filter((a) => a?.name === 'Mordida');
    expect(mordidas?.length).toBe(1);
  });

  it('Natureza Orgânica: caminho aleatório com Moreau não quebra', () => {
    for (let i = 0; i < 10; i += 1) {
      const sheet = buildSheetWithMoreauPast();
      applyYidishanNaturezaOrganica(sheet);
      expect(sheet.raca.abilities?.length).toBe(1);
      expect(sheet.raca.abilities?.[0]).toBeDefined();
      const choice = sheet.yidishanNaturezaChoice;
      expect(choice && choice.type !== 'cleared' ? choice.value : '').toMatch(
        /^.+ \(.+\)$/
      );
    }
  });

  it('Natureza Orgânica: caminho manual com value composto', () => {
    const sheet = buildSheetWithMoreauPast();
    applyYidishanNaturezaOrganica(sheet, {
      raceAbilities: [{ raceName: 'Moreau', abilityName: 'Faro (Lobo)' }],
    });
    expect(sheet.raca.abilities?.some((a) => a?.name === 'Faro')).toBe(true);
    expect(sheet.yidishanNaturezaChoice).toEqual({
      type: 'raceAbility',
      value: 'Faro (Lobo)',
    });
  });
});
