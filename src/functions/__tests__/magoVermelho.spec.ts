import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import BARDO from '../../data/systems/tormenta20/classes/bardo';
import BARDO_HA_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/bardo';

/**
 * Mago Vermelho (Bardo, Heróis de Arton): soma o círculo máximo de magias nos
 * testes de ataque e nas rolagens de dano com armas leves ou ágeis.
 */
const MAGO_VERMELHO = BARDO_HA_POWERS.find((p) => p.name === 'Mago Vermelho')!;

const espadaCurta: Equipment = {
  id: 'w-espada-curta',
  nome: 'Espada Curta',
  group: 'Arma',
  dano: '1d6',
  critico: '19/x2',
  alcance: '-',
  weaponTags: ['leve', 'espada'],
};
const espadaLonga: Equipment = {
  id: 'w-espada-longa',
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: '19/x2',
  alcance: '-',
};

const weapon = (sheet: CharacterSheet, id: string): Equipment | undefined =>
  sheet.bag.equipments.Arma.find((w) => w.id === id);

const mkBardo = (nivel: number, power = _.cloneDeep(MAGO_VERMELHO)) => {
  const sheet = createMockCharacterSheet();
  sheet.classe = BARDO.setup ? BARDO.setup(BARDO) : { ...BARDO };
  sheet.nivel = nivel;
  sheet.bag = new Bag({
    Arma: [_.cloneDeep(espadaCurta), _.cloneDeep(espadaLonga)],
  });
  sheet.classPowers = [power];
  return sheet;
};

describe('Mago Vermelho', () => {
  it('nível 6 (2º círculo): +2 no ataque e no dano com arma leve', () => {
    const r = recalculateSheet(mkBardo(6));
    expect(weapon(r, 'w-espada-curta')?.dano).toBe('1d6+2');
    expect(weapon(r, 'w-espada-curta')?.atkBonus).toBe(2);
  });

  it('acompanha o círculo: nível 1 soma +1', () => {
    const r = recalculateSheet(mkBardo(1));
    expect(weapon(r, 'w-espada-curta')?.dano).toBe('1d6+1');
  });

  it('não afeta arma que não é leve nem ágil', () => {
    const r = recalculateSheet(mkBardo(6));
    expect(weapon(r, 'w-espada-longa')?.dano).toBe('1d8');
    expect(weapon(r, 'w-espada-longa')?.atkBonus ?? 0).toBe(0);
  });

  it('ficha antiga (cópia só com texto) recebe a automação no normalize', () => {
    const sheet = mkBardo(6, {
      name: 'Mago Vermelho',
      text: 'texto antigo',
      requirements: [],
    });
    normalizeSheet(sheet);
    expect(sheet.classPowers?.[0].sheetBonuses).toBeDefined();
    const r = recalculateSheet(sheet);
    expect(weapon(r, 'w-espada-curta')?.dano).toBe('1d6+2');
  });
});
