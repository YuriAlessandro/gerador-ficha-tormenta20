import _ from 'lodash';
import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import { AMEACAS_ARTON_WEAPONS } from '../../../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';
import { BackpackStagedState, reducer } from '../useBackpackState';

/**
 * Preço de item superior (Jogo do Ano p. 164, Tabela 3-7: 1 melhoria = +T$ 300).
 * O único caminho público que cria item superior é editar o item na mochila
 * (melhorias no editor), e ele gravava as melhorias sem tirar nada do dinheiro:
 * os dois porretes com Cruel da ficha "Jão" saíam de graça.
 *
 * Cobra só o ACRÉSCIMO de aprimoramento, quando o desconto automático está
 * ligado. Tirar melhoria não reembolsa (o modal é staged: desfazer = cancelar).
 */

function emptyBag(): BagEquipments {
  return {
    Arma: [],
    Armadura: [],
    Escudo: [],
    'Item Geral': [],
    Alquimía: [],
    Esotérico: [],
    Vestuário: [],
    Hospedagem: [],
    Alimentação: [],
    Animal: [],
    Veículo: [],
    Serviço: [],
  };
}

const porrete = (over: Partial<Equipment> = {}): Equipment => ({
  ..._.cloneDeep(AMEACAS_ARTON_WEAPONS.PORRETE),
  id: 'porrete',
  ...over,
});

const CRUEL = [{ mod: 'Cruel' }];

function makeState(
  items: Equipment[],
  over: Partial<BackpackStagedState> = {}
): BackpackStagedState {
  const equipments = emptyBag();
  items.forEach((item) => {
    (equipments[item.group] as Equipment[]).push(item);
  });
  return {
    equipments,
    displayOrder: items.map((item) => item.id ?? ''),
    money: { dinheiro: 1000, dinheiroTC: 0, dinheiroTO: 0 },
    maxSpacesAttribute: Atributo.FORCA,
    customMaxSpaces: undefined,
    autoDeductMoney: true,
    paidUnits: {},
    mainHandItemId: undefined,
    offHandItemId: undefined,
    wornArmorId: undefined,
    groupByCategory: false,
    ...over,
  };
}

const allItems = (state: BackpackStagedState) =>
  Object.values(state.equipments).flat() as Equipment[];

describe('item superior: preço das melhorias sai do dinheiro', () => {
  it('Porrete (T$ 2) + Cruel cobra T$ 300 (porrete superior = T$ 302)', () => {
    const state = makeState([porrete()]);

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete({ modifications: CRUEL }),
    });

    expect(next.money.dinheiro).toBe(700);
  });

  it('Jão: pilha de 2 porretes editada inteira cobra 2 × T$ 300', () => {
    const state = makeState([porrete({ quantity: 2 })]);

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete({ quantity: 2, modifications: CRUEL }),
    });

    expect(next.money.dinheiro).toBe(400);
  });

  it('editar só uma unidade da pilha cobra uma melhoria', () => {
    const state = makeState([porrete({ quantity: 2 })]);

    const next = reducer(state, {
      type: 'SPLIT_EDIT_ITEM',
      id: 'porrete',
      next: porrete({ modifications: CRUEL }),
      newId: 'porrete-cruel',
    });

    expect(next.money.dinheiro).toBe(700);
    expect(allItems(next).map((i) => [i.id, i.quantity])).toEqual([
      ['porrete', 1],
      ['porrete-cruel', 1],
    ]);
  });

  it('segunda melhoria cobra a diferença da tabela (T$ 3.000 − T$ 300)', () => {
    const state = makeState([porrete({ modifications: CRUEL })]);

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete({ modifications: [...CRUEL, { mod: 'Precisa' }] }),
    });

    expect(next.money.dinheiro).toBe(1000 - 2700);
  });

  it('desconto automático desligado: não cobra', () => {
    const state = makeState([porrete()], { autoDeductMoney: false });

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete({ modifications: CRUEL }),
    });

    expect(next.money.dinheiro).toBe(1000);
  });

  it('tirar a melhoria não devolve dinheiro', () => {
    const state = makeState([porrete({ modifications: CRUEL })]);

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete(),
    });

    expect(next.money.dinheiro).toBe(1000);
  });

  it('edição que não mexe em melhoria não cobra nada', () => {
    const state = makeState([porrete({ modifications: CRUEL })]);

    const next = reducer(state, {
      type: 'UPDATE_ITEM',
      id: 'porrete',
      next: porrete({ modifications: CRUEL, customDisplayName: 'Tacape' }),
    });

    expect(next.money.dinheiro).toBe(1000);
  });
});
