import { describe, it, expect } from 'vitest';
import { accentLabel, presentItem } from '../cards/itemPresentation';
import {
  getFullEncyclopediaIndex,
  getGrimoireCatalog,
  resolveItem,
} from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';

const firstId = (prefix: string) =>
  getFullEncyclopediaIndex().find((e) => prefixOf(e.id) === prefix)?.id ?? '';

describe('presentItem', () => {
  it('magia: estatísticas com ícone, círculo, aprimoramentos e tom arcano', () => {
    const view = presentItem(resolveItem('spell:Bola de Fogo'));
    expect(view).toMatchObject({
      title: 'Bola de Fogo',
      subtitle: 'Evoc · Arcana',
      circle: 2,
      accent: 'arcane',
    });
    expect(view.stats).toEqual([
      { kind: 'execution', value: 'Padrão' },
      { kind: 'range', value: 'Médio' },
      { kind: 'duration', value: 'Instantânea' },
      { kind: 'area', value: 'Esfera com 6m de raio' },
      { kind: 'resistance', value: 'Reflexos reduz à metade' },
    ]);
    expect(view.aprimoramentos).toHaveLength(3);
    expect(view.aprimoramentos[0].cost).toBe('+2 PM');
  });

  it('magia arcana e divina tem tom próprio', () => {
    const both = Array.from(getGrimoireCatalog().spells.values()).find(
      (s) => s.spellTypes.length === 2
    );
    expect(presentItem(resolveItem(`spell:${both?.nome}`)).accent).toBe(
      'arcaneDivine'
    );
  });

  it('poder geral: pré-requisito como estatística', () => {
    const view = presentItem(resolveItem('power:MAGIA:Magia Acelerada'));
    expect(view.accent).toBe('power');
    expect(view.stats[0].kind).toBe('requirement');
    expect(view.aprimoramentos).toEqual([]);
  });

  it('habilidade de classe e entidade inteira têm tons diferentes', () => {
    expect(presentItem(resolveItem(firstId('class-power'))).accent).toBe(
      'feature'
    );
    expect(presentItem(resolveItem(firstId('class'))).accent).toBe('entity');
  });

  it('item não encontrado', () => {
    expect(presentItem(resolveItem('spell:Sumida'))).toMatchObject({
      title: 'Sumida',
      accent: 'missing',
    });
  });
});

describe('accentLabel', () => {
  it('nomeia cada tom para a legenda e as dicas', () => {
    expect(accentLabel('arcane')).toBe('Magia arcana');
    expect(accentLabel('divine')).toBe('Magia divina');
    expect(accentLabel('arcaneDivine')).toBe('Magia arcana e divina');
    expect(accentLabel('power')).toBe('Poder geral');
  });
});
