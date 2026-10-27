/**
 * Item de origem escrito como texto ("Mochila de aventureiro", "Manto
 * eclesiástico", "Símbolo sagrado") entrava na mochila só com nome, grupo e a
 * nota de procedência. Os `sheetBonuses` do catálogo só chegavam quando a
 * ficha era REABERTA (`refreshBagItemsFromCatalog`, em `restoreSpellPath`): a
 * ficha nova mostrava uma carga/perícia e, depois de salvar e abrir, outra.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { convertOriginItemsToBagEquipments } from '../originItems';
import generateRandomSheet, { restoreSpellPath } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import {
  equipamentoAventureiro,
  vestuario,
} from '../../data/systems/tormenta20/equipamentos-gerais';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const generalItem = (
  bag: ReturnType<typeof convertOriginItemsToBagEquipments>,
  nome: string
): Equipment | undefined => bag['Item Geral']?.find((i) => i.nome === nome);

describe('item de origem em texto nasce com os dados do catálogo', () => {
  it('Mochila de aventureiro: +2 espaços de carga', () => {
    const bag = convertOriginItemsToBagEquipments(
      [{ equipment: 'Mochila de aventureiro' }],
      'Mensageiro'
    );
    const mochila = generalItem(bag, 'Mochila de aventureiro');

    expect(mochila?.sheetBonuses).toEqual([
      expect.objectContaining({
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 2 },
      }),
    ]);
    // A nota de procedência da origem continua valendo.
    expect(mochila?.descricao).toContain('Recebido da origem: Mensageiro');
  });

  it('Manto eclesiástico: +1 em Religião', () => {
    const bag = convertOriginItemsToBagEquipments([
      { equipment: 'Manto eclesiástico' },
    ]);

    expect(generalItem(bag, 'Manto eclesiástico')?.sheetBonuses).toEqual([
      expect.objectContaining({
        target: { type: 'Skill', name: Skill.RELIGIAO },
        modifier: { type: 'Fixed', value: 1 },
      }),
    ]);
  });

  it('Símbolo sagrado: os três bônus de resistência do catálogo', () => {
    const bag = convertOriginItemsToBagEquipments([
      { equipment: 'Símbolo sagrado' },
    ]);
    const catalogo = equipamentoAventureiro.find(
      (e) => e.nome === 'Símbolo sagrado'
    );

    expect(generalItem(bag, 'Símbolo sagrado')?.sheetBonuses).toEqual(
      catalogo?.sheetBonuses
    );
  });

  it('copia os bônus: mexer no item não vaza para o catálogo', () => {
    const bag = convertOriginItemsToBagEquipments([
      { equipment: 'Manto eclesiástico' },
    ]);
    const manto = generalItem(bag, 'Manto eclesiástico')!;
    const catalogo = vestuario.find((e) => e.nome === 'Manto eclesiástico')!;

    expect(manto.sheetBonuses).not.toBe(catalogo.sheetBonuses);
    expect(manto.sheetBonuses?.[0]).not.toBe(catalogo.sheetBonuses?.[0]);
  });

  it('item sem par no catálogo segue só com nome e procedência', () => {
    const bag = convertOriginItemsToBagEquipments(
      [{ equipment: 'Carta de recomendação' }],
      'Mensageiro'
    );
    const carta = generalItem(bag, 'Carta de recomendação');

    expect(carta?.sheetBonuses).toBeUndefined();
    expect(carta?.descricao).toBe('Recebido da origem: Mensageiro');
  });
});

describe('ficha nova = ficha reaberta', () => {
  /** O que `restoreSpellPath` faz ao abrir uma ficha salva. */
  const reopen = (sheet: CharacterSheet): CharacterSheet => {
    const copy = _.cloneDeep(sheet);
    restoreSpellPath(copy, dataRegistry.getClassesBySupplements(SUPPLEMENTS));
    return recalculateSheet(copy);
  };

  it.each(['Mensageiro', 'Freira'])(
    '%s: carga e perícias não mudam ao reabrir',
    (origin) => {
      const created = recalculateSheet(
        generateRandomSheet({
          nivel: 1,
          raca: 'Elfo',
          classe: 'Guerreiro',
          origin,
          devocao: { label: '--', value: '--' },
          supplements: SUPPLEMENTS,
        })
      );
      const reopened = reopen(created);

      const others = (sheet: CharacterSheet) =>
        Object.fromEntries(
          (sheet.completeSkills ?? []).map((s) => [s.name, s.others])
        );

      expect(reopened.maxSpaces).toBe(created.maxSpaces);
      expect(others(reopened)).toEqual(others(created));
    }
  );

  it('Mensageiro: a mochila de aventureiro já soma na carga da ficha nova', () => {
    const options = {
      nivel: 1,
      raca: 'Elfo',
      classe: 'Guerreiro',
      devocao: { label: '--', value: '--' },
      supplements: SUPPLEMENTS,
    };
    const created = recalculateSheet(
      generateRandomSheet({ ...options, origin: 'Mensageiro' })
    );

    expect(
      created.sheetBonuses.filter(
        (b) =>
          b.target.type === 'MaxSpaces' &&
          b.source.type === 'equipment' &&
          b.source.equipmentName === 'Mochila de aventureiro'
      )
    ).toHaveLength(1);
  });
});
