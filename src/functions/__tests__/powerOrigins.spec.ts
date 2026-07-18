/**
 * Testes da classificação e do agrupamento de poderes por origem.
 *
 * O invariante mais importante aqui é o último bloco: agrupar NÃO pode
 * reordenar. `sheet.powersOrder` é uma lista plana e o agrupamento é só uma
 * view — se a partição não for estável, a ordem manual do usuário some em
 * silêncio dentro de cada grupo.
 */
import { describe, it, expect } from 'vitest';
import {
  classifyPowers,
  groupPowersByOrigin,
  originGroupKey,
  originLabel,
  POWER_ORIGINS,
  PowerSourceArrays,
} from '../powers/powerOrigins';
import { applyPowersOrder } from '../powers/applyPowersOrder';
import {
  GeneralPower,
  GeneralPowerType,
  OriginPower,
} from '../../interfaces/Poderes';
import { ClassAbility, ClassPower } from '../../interfaces/Class';
import { RaceAbility } from '../../interfaces/Race';

const classPower = (name: string, className?: string): ClassPower => ({
  name,
  text: `texto de ${name}`,
  ...(className ? { className } : {}),
});

const classAbility = (
  name: string,
  sourceClassName?: string
): ClassAbility => ({
  name,
  text: `texto de ${name}`,
  nivel: 1,
  ...(sourceClassName ? { sourceClassName } : {}),
});

const raceAbility = (name: string): RaceAbility => ({
  name,
  description: `descrição de ${name}`,
});

const originPower = (name: string): OriginPower => ({
  name,
  description: `descrição de ${name}`,
  type: 'origem',
});

const generalPower = (name: string, type: GeneralPowerType): GeneralPower => ({
  name,
  type,
  description: `descrição de ${name}`,
  requirements: [],
});

const emptySources = (
  overrides: Partial<PowerSourceArrays> = {}
): PowerSourceArrays => ({
  classPowers: [],
  raceAbilities: [],
  classAbilities: [],
  originPowers: [],
  deityPowers: [],
  generalPowers: [],
  customPowers: [],
  customGrantedPowers: [],
  className: 'Arcanista',
  raceName: 'Soterrado',
  ...overrides,
});

describe('classifyPowers', () => {
  it('classifica cada fonte no seu kind', () => {
    const origins = classifyPowers(
      emptySources({
        classPowers: [classPower('Raio Arcano')],
        raceAbilities: [raceAbility('Abraço Gélido')],
        classAbilities: [classAbility('Magias')],
        originPowers: [originPower('Herança')],
        deityPowers: [generalPower('Bênção', GeneralPowerType.CONCEDIDOS)],
        generalPowers: [generalPower('Fome de Mana', GeneralPowerType.MAGIA)],
        customPowers: [{ id: '1', name: 'Meu Poder', description: 'x' }],
        customGrantedPowers: [{ id: '2', name: 'Concedido', description: 'x' }],
      })
    );

    expect(origins.get('Raio Arcano')).toEqual({
      kind: 'classPower',
      source: 'Arcanista',
    });
    expect(origins.get('Abraço Gélido')).toEqual({
      kind: 'raceAbility',
      source: 'Soterrado',
    });
    expect(origins.get('Magias')).toEqual({
      kind: 'classAbility',
      source: 'Arcanista',
    });
    expect(origins.get('Herança')?.kind).toBe('originPower');
    expect(origins.get('Bênção')?.kind).toBe('deityPower');
    expect(origins.get('Fome de Mana')?.kind).toBe('generalMagia');
    expect(origins.get('Meu Poder')?.kind).toBe('custom');
    expect(origins.get('Concedido')?.kind).toBe('customGranted');
  });

  it('aplica first-writer-wins quando o mesmo nome vem de duas fontes', () => {
    // Precedência antiga: poder de classe ganha de poder geral.
    const origins = classifyPowers(
      emptySources({
        classPowers: [classPower('Ataque Poderoso')],
        generalPowers: [
          generalPower('Ataque Poderoso', GeneralPowerType.COMBATE),
        ],
      })
    );

    expect(origins.get('Ataque Poderoso')?.kind).toBe('classPower');
  });

  it('classifica por nome mesmo quando o objeto foi clonado', () => {
    // `processedClassPowers` clona para injetar `dynamicText`; a comparação por
    // referência que existia antes falhava exatamente aqui.
    const original = classPower('Autoridade Eclesiástica');
    const clone = { ...original, dynamicText: 'texto dinâmico' };

    const origins = classifyPowers(emptySources({ classPowers: [clone] }));

    expect(origins.get(original.name)?.kind).toBe('classPower');
  });

  it('subdivide poderes e habilidades por classe na multiclasse', () => {
    const origins = classifyPowers(
      emptySources({
        classPowers: [classPower('Raio Arcano', 'Arcanista')],
        classAbilities: [classAbility('Ataque Furtivo', 'Ladino')],
        className: 'Arcanista',
      })
    );

    expect(origins.get('Raio Arcano')?.source).toBe('Arcanista');
    expect(origins.get('Ataque Furtivo')?.source).toBe('Ladino');
  });

  it('separa os poderes gerais pelo GeneralPowerType', () => {
    const origins = classifyPowers(
      emptySources({
        generalPowers: [
          generalPower('Golpe Pesado', GeneralPowerType.COMBATE),
          generalPower('Sorte', GeneralPowerType.DESTINO),
          generalPower('Fome de Mana', GeneralPowerType.MAGIA),
          generalPower('Corrupção', GeneralPowerType.TORMENTA),
          generalPower('Sangue de Ferro', GeneralPowerType.RACA),
        ],
      })
    );

    expect(origins.get('Golpe Pesado')?.kind).toBe('generalCombate');
    expect(origins.get('Sorte')?.kind).toBe('generalDestino');
    expect(origins.get('Fome de Mana')?.kind).toBe('generalMagia');
    expect(origins.get('Corrupção')?.kind).toBe('generalTormenta');
    expect(origins.get('Sangue de Ferro')?.kind).toBe('generalRaca');
  });
});

describe('originLabel', () => {
  it('interpola a classe e a raça', () => {
    expect(originLabel({ kind: 'classPower', source: 'Arcanista' })).toBe(
      'Poder de Arcanista'
    );
    expect(originLabel({ kind: 'raceAbility', source: 'Soterrado' })).toBe(
      'Habilidade de Soterrado'
    );
    expect(originLabel({ kind: 'originPower' })).toBe('Poder de Origem');
  });
});

describe('groupPowersByOrigin', () => {
  it('ordena os grupos pela ordem canônica dos descritores', () => {
    const powers = [
      generalPower('Fome de Mana', GeneralPowerType.MAGIA),
      raceAbility('Abraço Gélido'),
      classPower('Raio Arcano'),
    ];
    const origins = classifyPowers(
      emptySources({
        classPowers: [classPower('Raio Arcano')],
        raceAbilities: [raceAbility('Abraço Gélido')],
        generalPowers: [generalPower('Fome de Mana', GeneralPowerType.MAGIA)],
      })
    );

    const groups = groupPowersByOrigin(powers, origins);

    expect(groups.map((g) => g.origin.kind)).toEqual([
      'classPower',
      'raceAbility',
      'generalMagia',
    ]);
    expect(POWER_ORIGINS.classPower.order).toBeLessThan(
      POWER_ORIGINS.raceAbility.order
    );
  });

  it('gera um grupo por classe na multiclasse, em ordem alfabética', () => {
    const powers = [classPower('Raio Arcano'), classPower('Esquiva')];
    const origins = new Map([
      ['Raio Arcano', { kind: 'classPower' as const, source: 'Arcanista' }],
      ['Esquiva', { kind: 'classPower' as const, source: 'Ladino' }],
    ]);

    const groups = groupPowersByOrigin(powers, origins);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.label)).toEqual([
      'Poder de Arcanista',
      'Poder de Ladino',
    ]);
  });

  it('PRESERVA a ordem manual do usuário dentro de cada grupo', () => {
    // O invariante crítico: agrupar é uma view, não pode reordenar.
    const powers = [
      classPower('Zebra'),
      classPower('Alfa'),
      raceAbility('Yankee'),
      raceAbility('Bravo'),
    ];
    const origins = classifyPowers(
      emptySources({
        classPowers: [classPower('Zebra'), classPower('Alfa')],
        raceAbilities: [raceAbility('Yankee'), raceAbility('Bravo')],
      })
    );

    // Ordem manual deliberadamente anti-alfabética.
    const powersOrder = ['Zebra', 'Yankee', 'Alfa', 'Bravo'];
    const ordered = applyPowersOrder(powers, powersOrder);
    const groups = groupPowersByOrigin(ordered, origins);

    const byKind = (kind: string) =>
      groups.find((g) => g.origin.kind === kind)?.powers.map((p) => p.name);

    expect(byKind('classPower')).toEqual(['Zebra', 'Alfa']);
    expect(byKind('raceAbility')).toEqual(['Yankee', 'Bravo']);
  });

  it('cai na ordem alfabética quando não há ordem manual', () => {
    const powers = [classPower('Zebra'), classPower('Alfa')];
    const origins = classifyPowers(
      emptySources({ classPowers: [classPower('Zebra'), classPower('Alfa')] })
    );

    const groups = groupPowersByOrigin(
      applyPowersOrder(powers, undefined),
      origins
    );

    expect(groups[0].powers.map((p) => p.name)).toEqual(['Alfa', 'Zebra']);
  });

  it('gera chaves de grupo distintas por classe', () => {
    expect(
      originGroupKey({ kind: 'classPower', source: 'Arcanista' })
    ).not.toBe(originGroupKey({ kind: 'classPower', source: 'Ladino' }));
  });
});
