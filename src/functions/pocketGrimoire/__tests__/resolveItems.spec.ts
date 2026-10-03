import { describe, it, expect } from 'vitest';
import {
  encyclopediaPath,
  getFullEncyclopediaIndex,
  getGrimoireCatalog,
  groupResolvedItems,
  itemTitle,
  matchesFilter,
  resolveItem,
  resolveItems,
} from '../resolveItems';
import { buildEncyclopediaIndex } from '../../encyclopediaSearch';
import { prefixOf } from '../itemId';

const firstIdWithPrefix = (prefix: string) => {
  const entry = getFullEncyclopediaIndex().find(
    (e) => prefixOf(e.id) === prefix
  );
  if (!entry) throw new Error(`nenhum item com prefixo ${prefix}`);
  return entry.id;
};

describe('resolveItem', () => {
  it('magia vem completa', () => {
    const item = resolveItem('spell:Bola de Fogo');
    expect(item.kind).toBe('spell');
    if (item.kind === 'spell') {
      expect(item.spell.alcance).toBe('Médio');
      expect(item.spell.circle).toBe(2);
      expect(item.spell.aprimoramentos?.length).toBeGreaterThan(0);
    }
  });

  it('cada prefixo resolve para o tipo certo', () => {
    const expected: Record<string, string> = {
      spell: 'spell',
      power: 'power',
      'class-power': 'generic',
      'class-ability': 'generic',
      'race-ability': 'generic',
      'origin-power': 'generic',
      'deity-power': 'generic',
      class: 'summary',
      race: 'summary',
      origin: 'summary',
      deity: 'summary',
    };
    Object.entries(expected).forEach(([prefix, kind]) => {
      expect(resolveItem(firstIdWithPrefix(prefix)).kind).toBe(kind);
    });
  });

  it('id inexistente vira missing com nome legível', () => {
    expect(resolveItem('spell:Magia Que Não Existe')).toEqual({
      kind: 'missing',
      id: 'spell:Magia Que Não Existe',
      name: 'Magia Que Não Existe',
    });
  });

  it('magia arcana e divina vira um item só com os dois tipos', () => {
    const both = Array.from(getGrimoireCatalog().spells.values()).find(
      (s) => s.spellTypes.length === 2
    );
    expect(both).toBeDefined();
    const item = resolveItem(`spell:${both?.nome}`);
    expect(item.kind === 'spell' && item.spell.spellTypes).toEqual([
      'Arcana',
      'Divina',
    ]);
  });

  it('resolve itens fora do conjunto padrão de suplementos', () => {
    const defaultIds = new Set(buildEncyclopediaIndex().map((e) => e.id));
    const extra = getFullEncyclopediaIndex().find((e) => !defaultIds.has(e.id));
    expect(extra).toBeDefined();
    expect(resolveItem(extra?.id ?? '').kind).not.toBe('missing');
  });
});

describe('proteção contra regressão do índice', () => {
  it('toda magia e todo poder geral do índice têm dados completos', () => {
    const problems = getFullEncyclopediaIndex()
      .filter((e) => ['spell', 'power'].includes(prefixOf(e.id)))
      .map((e) => ({ id: e.id, kind: resolveItem(e.id).kind }))
      .filter(({ id, kind }) => kind !== prefixOf(id));
    expect(problems).toEqual([]);
  });
});

describe('groupResolvedItems', () => {
  it('ordena grupos e itens', () => {
    const items = resolveItems([
      'spell:Bola de Fogo',
      'spell:Magia Fantasma',
      firstIdWithPrefix('class-power'),
      'spell:Seta Infalível de Talude',
      firstIdWithPrefix('class'),
    ]);
    const groups = groupResolvedItems(items);
    const keys = groups.map((g) => g.key);
    expect(keys.indexOf('spell-1')).toBeLessThan(keys.indexOf('spell-2'));
    expect(keys.indexOf('spell-2')).toBeLessThan(keys.indexOf('class-power'));
    expect(keys.indexOf('class-power')).toBeLessThan(keys.indexOf('class'));
    expect(keys[keys.length - 1]).toBe('missing');
    expect(groups.find((g) => g.key === 'missing')?.label).toBe(
      'Não encontrados'
    );
  });

  it('ordem alfabética dentro do grupo', () => {
    const groups = groupResolvedItems(
      resolveItems(['spell:Zzz inexistente', 'spell:Aaa inexistente'])
    );
    expect(groups[0].items.map(itemTitle)).toEqual([
      'Aaa inexistente',
      'Zzz inexistente',
    ]);
  });
});

describe('matchesFilter', () => {
  it('filtra por categoria e mostra missing em todos', () => {
    const spell = resolveItem('spell:Bola de Fogo');
    const missing = resolveItem('spell:Nada');
    expect(matchesFilter(spell, 'spells')).toBe(true);
    expect(matchesFilter(spell, 'powers')).toBe(false);
    expect(matchesFilter(spell, 'all')).toBe(true);
    expect(matchesFilter(missing, 'powers')).toBe(true);
  });
});

describe('encyclopediaPath', () => {
  it('aponta para a aba e o item', () => {
    const item = resolveItem('spell:Bola de Fogo');
    expect(item.kind !== 'missing' && encyclopediaPath(item.entry)).toBe(
      '/database/magias/Bola%20de%20Fogo'
    );
  });
});
