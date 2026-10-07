import { describe, it, expect } from 'vitest';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { buildClassPowerGraph } from '../../powerTree';
import { resolveItem, treeNodeItemId } from '../resolveItems';

const ALL = Object.values(SupplementId);

describe('treeNodeItemId', () => {
  it('todo nó de poder, habilidade e poder geral da árvore resolve no índice', () => {
    const generalPowers = dataRegistry.getAllPowersBySupplements(ALL);
    const problems: string[] = [];
    let checked = 0;
    dataRegistry.getClassesWithSupplementInfo(ALL).forEach((classe) => {
      const graph = buildClassPowerGraph({ classe, generalPowers });
      Object.values(graph.nodes).forEach((node) => {
        const id = treeNodeItemId(classe, node);
        if (['power', 'ability', 'general'].includes(node.kind)) {
          checked += 1;
          if (!id || resolveItem(id).kind === 'missing') {
            problems.push(`${classe.name} › ${node.kind} › ${node.name}`);
          }
        }
      });
    });
    expect(checked).toBeGreaterThan(100);
    expect(problems).toEqual([]);
  });

  it('opções de habilidade e nós externos não têm id', () => {
    expect(
      treeNodeItemId(
        { name: 'Arcanista' },
        { kind: 'abilityOption', name: 'X' }
      )
    ).toBeUndefined();
    expect(
      treeNodeItemId({ name: 'Arcanista' }, { kind: 'external', name: 'X' })
    ).toBeUndefined();
  });
});
