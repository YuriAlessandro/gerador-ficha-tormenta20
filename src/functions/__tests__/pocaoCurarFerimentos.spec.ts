/**
 * Poção de Curar Ferimentos (2d8+2 PV): Jogo do Ano p. 341, Tabela 8-12 —
 * T$ 30. Poções ocupam meio espaço (JdA p. 141). Só existia nas tabelas de
 * recompensa; não dava para comprar nem adicionar à ficha.
 */
import { describe, it, expect } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { buildCatalogIndex } from '../bagCatalogRefresh';

const NOME = 'Poção de Curar Ferimentos (2d8+2 PV)';

describe('Poção de Curar Ferimentos', () => {
  it('está no catálogo do livro básico: T$ 30, meio espaço, cura 2d8+2', () => {
    const { generalItems } = dataRegistry.getEquipmentBySupplements([
      SupplementId.TORMENTA20_CORE,
    ]);
    const pocao = generalItems.find((item) => item.nome === NOME);

    expect(pocao).toMatchObject({
      group: 'Item Geral',
      preco: 30,
      spaces: 0.5,
    });
    expect(pocao?.rolls?.[0]?.dice).toBe('2d8+2');
  });

  it('fichas com a poção recebem o dado do catálogo', () => {
    expect(buildCatalogIndex().get(NOME)?.preco).toBe(30);
  });
});
