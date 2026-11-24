/**
 * Itens de origem escritos como TEXTO só ganham efeito quando existe um item de
 * mesmo nome no índice de catálogo (`convertOriginItemsToBagEquipments` na
 * criação, `refreshBagItemsFromCatalog` na carga). A tatuagem do Capanga
 * (Jogo do Ano p. 88: "+1 em Intimidação") não tinha — a ficha "Jão" saía com
 * Intimidação +8 em vez de +9. Mesmo problema: as bolas do Circense (JdA p. 89,
 * +1 em Atuação) e a tatuagem do Grumete Pirata (Atlas de Arton p. 475, +1 em
 * Intimidação).
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { buildJao, skillTotal } from './fixtures/fichaJao';
import { recalculateSheet } from '../recalculateSheet';
import {
  buildCatalogIndex,
  refreshBagItemsFromCatalog,
} from '../bagCatalogRefresh';
import { convertOriginItemsToBagEquipments } from '../originItems';
import { dataRegistry } from '../../data/registry';
import { ORIGIN_ITEMS_WITH_BONUS } from '../../data/systems/tormenta20/originItemBonuses';
import { ORIGINS } from '../../data/systems/tormenta20/origins';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';

const TATUAGEM_CAPANGA =
  'Tatuagem ou outro adereço de sua gangue (+1 em Intimidação)';

const skillBonusOf = (item: Equipment | undefined) =>
  item?.sheetBonuses?.map((b) => [
    b.target.type === 'Skill' ? b.target.name : b.target.type,
    b.modifier.type === 'Fixed' ? b.modifier.value : undefined,
  ]);

/** Ficha salva antes da correção: item de texto sem efeito nenhum. */
const withOldItem = (sheet: CharacterSheet, nome: string): CharacterSheet => {
  const old = _.cloneDeep(sheet);
  old.bag.equipments['Item Geral'] = [
    ...old.bag.equipments['Item Geral'].filter(
      (i) => !i.nome.startsWith('Tatuagem')
    ),
    { nome, group: 'Item Geral' },
  ];
  return old;
};

describe('itens de origem com bônus fixo em perícia', () => {
  it('Jão: Intimidação = 2 + Car 4 + 2 (treino) + 1 (tatuagem) = +9', () => {
    const jao = buildJao();
    const tatuagem = jao.bag.equipments['Item Geral'].find(
      (i) => i.nome === TATUAGEM_CAPANGA
    );

    expect(skillBonusOf(tatuagem)).toEqual([[Skill.INTIMIDACAO, 1]]);
    expect(skillTotal(jao, Skill.INTIMIDACAO)).toBe(9);
  });

  it('o texto do item do Capanga é o do livro (sem "aprimorado")', () => {
    const texts = ORIGINS.Capanga.getItems().map((i) => i.equipment);
    expect(texts).toContain(TATUAGEM_CAPANGA);
  });

  it.each([
    // Nome gravado pelas fichas criadas antes da correção.
    'Tatuagem ou outro adereço de sua gangue aprimorado (+1 em Intimidação)',
    TATUAGEM_CAPANGA,
  ])('ficha salva com "%s" passa a somar na carga', (nome) => {
    const old = withOldItem(buildJao(), nome);
    expect(skillTotal(recalculateSheet(old), Skill.INTIMIDACAO)).toBe(8);

    refreshBagItemsFromCatalog(old);

    expect(skillTotal(recalculateSheet(old), Skill.INTIMIDACAO)).toBe(9);
  });

  it.each([
    ['Bola Colorida (+1 em Atuação)', Skill.ATUACAO],
    ['3x Bola Colorida (+1 em Atuação)', Skill.ATUACAO],
    ['Tatuagem de tripulação', Skill.INTIMIDACAO],
    ['1x Tatuagem de tripulação', Skill.INTIMIDACAO],
  ])('"%s" dá +1 em %s', (nome, skill) => {
    expect(skillBonusOf(buildCatalogIndex().get(nome))).toEqual([[skill, 1]]);
  });

  it('item novo do Circense nasce com o bônus', () => {
    const bag = convertOriginItemsToBagEquipments(
      ORIGINS.Circense.getItems(),
      'Circense'
    );
    const bolas = bag['Item Geral']?.find((i) =>
      i.nome.includes('Bola Colorida')
    );
    expect(skillBonusOf(bolas)).toEqual([[Skill.ATUACAO, 1]]);
  });

  it('os itens de origem não aparecem na loja', () => {
    const catalog = dataRegistry.getEquipmentBySupplements(
      Object.values(SupplementId)
    );
    const shopNames = new Set(
      Object.values(catalog)
        .filter((items): items is Equipment[] => Array.isArray(items))
        .flat()
        .map((i) => i.nome)
    );
    ORIGIN_ITEMS_WITH_BONUS.forEach(({ item }) => {
      expect(shopNames.has(item.nome)).toBe(false);
    });
  });
});
