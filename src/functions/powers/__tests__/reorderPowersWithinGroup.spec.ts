import { describe, it, expect } from 'vitest';
import {
  classifyPowers,
  groupPowersByOrigin,
  PowerGroup,
} from '../powerOrigins';
import { applyPowersOrder } from '../applyPowersOrder';
import { reorderPowersWithinGroup } from '../reorderPowersWithinGroup';

type FakePower = { name: string };

const group = (key: string, names: string[]): PowerGroup<FakePower> =>
  ({
    key,
    powers: names.map((name) => ({ name })),
  } as PowerGroup<FakePower>);

const groups = [
  group('classPower::Arcanista', ['Raio', 'Estudo', 'Foco']),
  group('generalCombate', ['Ataque Poderoso', 'Arma Secundária']),
];

describe('reorderPowersWithinGroup', () => {
  it('reordena dentro do grupo e concatena na ordem dos grupos', () => {
    const result = reorderPowersWithinGroup(
      groups,
      'classPower::Arcanista',
      2,
      0
    );

    expect(result).toEqual([
      'Foco',
      'Raio',
      'Estudo',
      'Ataque Poderoso',
      'Arma Secundária',
    ]);
  });

  it('não toca nos outros grupos', () => {
    const result = reorderPowersWithinGroup(groups, 'generalCombate', 0, 1);

    expect(result.slice(0, 3)).toEqual(['Raio', 'Estudo', 'Foco']);
    expect(result.slice(3)).toEqual(['Arma Secundária', 'Ataque Poderoso']);
  });

  it('devolve a ordem atual quando o movimento é nulo ou inválido', () => {
    const flat = [
      'Raio',
      'Estudo',
      'Foco',
      'Ataque Poderoso',
      'Arma Secundária',
    ];

    expect(
      reorderPowersWithinGroup(groups, 'classPower::Arcanista', 1, 1)
    ).toEqual(flat);
    expect(reorderPowersWithinGroup(groups, 'grupo-inexistente', 0, 1)).toEqual(
      flat
    );
    expect(reorderPowersWithinGroup(groups, 'generalCombate', 0, 9)).toEqual(
      flat
    );
    expect(reorderPowersWithinGroup(groups, 'generalCombate', -1, 0)).toEqual(
      flat
    );
  });

  it('round-trip: a ordem salva reproduz o que o usuário arrastou', () => {
    // O invariante que sustenta o desenho: `powersOrder` é plano, mas passar
    // por applyPowersOrder + groupPowersByOrigin tem que devolver exatamente a
    // ordem intra-grupo escolhida.
    const classPowers = [
      { name: 'Raio', text: '' },
      { name: 'Estudo', text: '' },
      { name: 'Foco', text: '' },
    ];
    const raceAbilities = [
      { name: 'Visão no Escuro', description: '' },
      { name: 'Faro Aguçado', description: '' },
    ];

    const origins = classifyPowers({
      classPowers,
      raceAbilities,
      classAbilities: [],
      originPowers: [],
      deityPowers: [],
      generalPowers: [],
      className: 'Arcanista',
      raceName: 'Qareen',
    });

    const all = [...classPowers, ...raceAbilities];
    const initialGroups = groupPowersByOrigin(
      applyPowersOrder(all, undefined),
      origins
    );

    const classGroup = initialGroups.find((g) =>
      g.key.startsWith('classPower')
    );
    expect(classGroup).toBeDefined();

    // Move o último poder de classe para o topo do próprio grupo.
    const lastIdx = (classGroup as PowerGroup<FakePower>).powers.length - 1;
    const movedName = (classGroup as PowerGroup<FakePower>).powers[lastIdx]
      .name;
    const newOrder = reorderPowersWithinGroup(
      initialGroups,
      (classGroup as PowerGroup<FakePower>).key,
      lastIdx,
      0
    );

    const rendered = groupPowersByOrigin(
      applyPowersOrder(all, newOrder),
      origins
    );
    const renderedClassGroup = rendered.find((g) =>
      g.key.startsWith('classPower')
    );

    expect(renderedClassGroup?.powers[0].name).toBe(movedName);
    // E os grupos continuam na ordem canônica: classe antes de raça.
    expect(rendered.map((g) => g.key)).toEqual(initialGroups.map((g) => g.key));
  });
});
