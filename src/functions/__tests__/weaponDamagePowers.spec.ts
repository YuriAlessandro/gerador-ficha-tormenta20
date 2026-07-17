import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';

/**
 * Automação de Arqueiro (Sabedoria no dano à distância, limitado pelo nível),
 * Esgrimista (Inteligência no dano com armas leves/ágeis, limitado pelo nível)
 * e Estilo de Disparo (Destreza no dano com armas de disparo, sem limite).
 * Bônus bakeados no `dano` da arma para armas puras; armas híbridas de
 * arremesso ficam para o cálculo por modo em Weapon.tsx (não bakeadas).
 */
const ARQUEIRO = GUERREIRO.powers.find((p) => p.name === 'Arqueiro')!;
const ESGRIMISTA = GUERREIRO.powers.find((p) => p.name === 'Esgrimista')!;
const ESTILO_DISPARO = combatPowers.ESTILO_DE_DISPARO;

const arcoCurto: Equipment = {
  id: 'w-arco',
  nome: 'Arco Curto',
  group: 'Arma',
  dano: '1d6',
  critico: 'x3',
  alcance: 'Médio',
};
const arcoLongo: Equipment = {
  id: 'w-arco-longo',
  nome: 'Arco Longo',
  group: 'Arma',
  dano: '1d8',
  critico: 'x3',
  alcance: 'Longo',
};
const espadaLonga: Equipment = {
  id: 'w-espada-longa',
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: 'x2',
  alcance: '-',
};
const espadaCurta: Equipment = {
  id: 'w-espada-curta',
  nome: 'Espada Curta',
  group: 'Arma',
  dano: '1d6',
  critico: '19/x2',
  alcance: '-',
};
const adaga: Equipment = {
  id: 'w-adaga',
  nome: 'Adaga',
  group: 'Arma',
  dano: '1d4',
  critico: '19/x2',
  alcance: 'Curto',
  arremesso: true,
};

const danoOf = (sheet: CharacterSheet, id: string): string | undefined =>
  sheet.bag.equipments.Arma.find((w) => w.id === id)?.dano;

const setAttr = (
  sheet: CharacterSheet,
  attr: Atributo,
  value: number
): void => {
  sheet.atributos[attr] = { name: attr, value };
};

describe('Arqueiro — Sabedoria no dano à distância (limitado pelo nível)', () => {
  const mkSheet = (nivel: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    setAttr(sheet, Atributo.SABEDORIA, 3);
    sheet.bag = new Bag({
      Arma: [
        _.cloneDeep(arcoCurto),
        _.cloneDeep(espadaLonga),
        _.cloneDeep(adaga),
      ],
    });
    sheet.classPowers = [_.cloneDeep(ARQUEIRO)];
    return sheet;
  };

  it('nível 1: soma +1 (Sab 3 limitada ao nível) no arco', () => {
    const r = recalculateSheet(mkSheet(1));
    expect(danoOf(r, 'w-arco')).toBe('1d6+1');
  });

  it('nível 5: soma +3 (Sab 3, abaixo do cap) no arco', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-arco')).toBe('1d6+3');
  });

  it('não afeta arma corpo a corpo (Espada Longa)', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8');
  });

  it('não bakeia em arma híbrida de arremesso (Adaga fica por modo)', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-adaga')).toBe('1d4');
  });
});

describe('Esgrimista — Inteligência no dano com armas leves/ágeis', () => {
  const mkSheet = (nivel: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    setAttr(sheet, Atributo.INTELIGENCIA, 2);
    sheet.bag = new Bag({
      Arma: [
        _.cloneDeep(espadaCurta),
        _.cloneDeep(espadaLonga),
        _.cloneDeep(adaga),
      ],
    });
    sheet.classPowers = [_.cloneDeep(ESGRIMISTA)];
    return sheet;
  };

  it('soma +2 (Int 2) em arma corpo a corpo leve/ágil (Espada Curta)', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-espada-curta')).toBe('1d6+2');
  });

  it('não afeta arma corpo a corpo não leve/ágil (Espada Longa)', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8');
  });

  it('não bakeia em arma híbrida de arremesso (Adaga fica por modo)', () => {
    const r = recalculateSheet(mkSheet(5));
    expect(danoOf(r, 'w-adaga')).toBe('1d4');
  });
});

describe('Estilo de Disparo — Destreza no dano com armas de disparo (sem cap)', () => {
  const mkSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 2;
    setAttr(sheet, Atributo.DESTREZA, 4);
    sheet.bag = new Bag({
      Arma: [
        _.cloneDeep(arcoLongo),
        _.cloneDeep(adaga),
        _.cloneDeep(espadaLonga),
      ],
    });
    sheet.generalPowers = [_.cloneDeep(ESTILO_DISPARO)];
    return sheet;
  };

  it('soma +4 (Des 4, sem limite de nível) no arco', () => {
    const r = recalculateSheet(mkSheet());
    expect(danoOf(r, 'w-arco-longo')).toBe('1d8+4');
  });

  it('não afeta arma de arremesso (Adaga) nem corpo a corpo (Espada Longa)', () => {
    const r = recalculateSheet(mkSheet());
    expect(danoOf(r, 'w-adaga')).toBe('1d4');
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8');
  });

  it('é idempotente (recalcular duas vezes não acumula)', () => {
    const first = recalculateSheet(mkSheet());
    const second = recalculateSheet(first);
    expect(danoOf(second, 'w-arco-longo')).toBe('1d8+4');
  });
});

describe('normalizeSheet — refresh de cópia embutida stale', () => {
  it('injeta os sheetBonuses do Arqueiro numa cópia salva sem automação', () => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    setAttr(sheet, Atributo.SABEDORIA, 3);
    sheet.bag = new Bag({ Arma: [_.cloneDeep(arcoCurto)] });
    // Ficha salva antes da automação: cópia do poder sem sheetBonuses.
    sheet.classPowers = [
      { name: 'Arqueiro', text: 'texto antigo', requirements: [] },
    ];

    normalizeSheet(sheet);

    expect(sheet.classPowers?.[0].sheetBonuses).toBeDefined();

    const r = recalculateSheet(sheet);
    expect(danoOf(r, 'w-arco')).toBe('1d6+3');
  });
});
