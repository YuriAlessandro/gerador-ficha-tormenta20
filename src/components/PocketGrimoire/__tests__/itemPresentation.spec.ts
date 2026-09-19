import { describe, it, expect } from 'vitest';
import { presentItem } from '../cards/itemPresentation';
import {
  getFullEncyclopediaIndex,
  resolveItem,
} from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';

const firstId = (prefix: string) =>
  getFullEncyclopediaIndex().find((e) => prefixOf(e.id) === prefix)?.id ?? '';

describe('presentItem', () => {
  it('magia: linha de mesa, círculo, aprimoramentos e tom arcano', () => {
    const view = presentItem(resolveItem('spell:Bola de Fogo'));
    expect(view).toMatchObject({
      title: 'Bola de Fogo',
      subtitle: 'Evoc · Arcana',
      metaLine: 'Padrão · Médio · Instantânea',
      circle: 2,
      footer: '+3 aprimoramentos',
      accent: 'arcane',
    });
  });

  it('poder geral: rodapé com pré-requisito', () => {
    const view = presentItem(resolveItem('power:MAGIA:Magia Acelerada'));
    expect(view.accent).toBe('power');
    expect(view.footer).toMatch(/^Req\.: /);
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
