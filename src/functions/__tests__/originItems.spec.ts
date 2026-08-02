/**
 * Itens de origem: escolha do jogador, concessão automática e rastreio.
 *
 * Regra do JDA ("Itens de Origem"): o personagem começa com TODOS os itens da
 * linha "Itens" da origem sem pagar por eles — itens não são um dos 2 benefícios.
 * Quando o livro diz "uma arma marcial ou exótica", quem escolhe é o jogador; a
 * geração aleatória sorteia como fallback.
 */
import { describe, it, expect } from 'vitest';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import Origin, { Items } from '../../interfaces/Origin';
import Bag from '../../interfaces/Bag';
import Equipment from '../../interfaces/Equipment';
import {
  applyOriginItemChoices,
  getOriginBagEquipments,
  originHasItemChoices,
  resolveOriginItems,
} from '../originItems';
import generateRandomSheet from '../general';
import CharacterSheet from '../../interfaces/CharacterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';

const CORE = [SupplementId.TORMENTA20_CORE];

function getOrigin(name: string): Origin {
  const origin = dataRegistry
    .getOriginsBySupplements(CORE)
    .find((o) => o.name === name);
  if (!origin) throw new Error(`Origem ${name} não encontrada no registry`);
  return origin;
}

function weaponNames(bag: Bag): string[] {
  return bag.equipments.Arma.map((w) => w.nome);
}

describe('resolveOriginItems', () => {
  const gladiador = getOrigin('Gladiador');

  it('usa a arma escolhida pelo jogador no lugar do sorteio', () => {
    const items = gladiador.getItems();
    const choiceItem = items.find((i) => i.choice);
    const option = choiceItem?.choice?.options[3] as Equipment;

    const resolved = resolveOriginItems(items, { arma: option.nome });
    const resolvedChoice = resolved.find((i) => i.choice);

    expect((resolvedChoice?.equipment as Equipment).nome).toBe(option.nome);
  });

  it('sem escolha, mantém o sorteio de getItems (caminho aleatório)', () => {
    const items = gladiador.getItems();
    const rolled = items.find((i) => i.choice)?.equipment as Equipment;

    const resolved = resolveOriginItems(items, undefined);

    expect((resolved.find((i) => i.choice)?.equipment as Equipment).nome).toBe(
      rolled.nome
    );
  });

  it('escolha inválida (fora do pool) cai no sorteio', () => {
    const items = gladiador.getItems();
    const rolled = items.find((i) => i.choice)?.equipment as Equipment;

    const resolved = resolveOriginItems(items, { arma: 'Vara de Pescar' });

    expect((resolved.find((i) => i.choice)?.equipment as Equipment).nome).toBe(
      rolled.nome
    );
  });

  it('não mexe em itens sem escolha', () => {
    const items: Items[] = [{ equipment: 'Barraca' }];
    expect(resolveOriginItems(items, { arma: 'Espada Longa' })).toEqual(items);
  });
});

describe('originHasItemChoices', () => {
  it('true para Gladiador (arma marcial ou exótica)', () => {
    expect(originHasItemChoices(getOrigin('Gladiador'))).toBe(true);
  });

  it('false para Acólito (só itens fixos)', () => {
    expect(originHasItemChoices(getOrigin('Acólito'))).toBe(false);
  });
});

describe('getOriginBagEquipments', () => {
  it('Gladiador: entrega a arma escolhida + o item sem valor', () => {
    const gladiador = getOrigin('Gladiador');
    const cachedItems = gladiador.getItems();
    const option = cachedItems.find((i) => i.choice)?.choice
      ?.options[0] as Equipment;

    const equipments = getOriginBagEquipments(gladiador, {
      choices: { arma: option.nome },
      cachedItems,
    });

    expect(equipments.Arma?.map((w) => w.nome)).toEqual([option.nome]);
    expect(equipments['Item Geral']?.map((i) => i.nome)).toContain(
      'Item sem valor recebido de um admirador'
    );
  });

  it('anota a procedência e o rótulo da escolha em descricao', () => {
    const gladiador = getOrigin('Gladiador');
    const equipments = getOriginBagEquipments(gladiador);

    expect(equipments.Arma?.[0].descricao).toBe(
      'Recebido da origem: Gladiador — Uma arma marcial ou exótica'
    );
  });
});

describe('applyOriginItemChoices', () => {
  const gladiador = getOrigin('Gladiador');

  function sheetWithGladiadorItems(): CharacterSheet {
    const sheet = {
      bag: new Bag({}, true),
      origin: { name: 'Gladiador', powers: [] },
    } as unknown as CharacterSheet;

    const first = gladiador.getItems().find((i) => i.choice)?.choice
      ?.options[0] as Equipment;

    return applyOriginItemChoices(sheet, gladiador, { arma: first.nome });
  }

  it('troca a arma concedida sem deixar a antiga na mochila', () => {
    const before = sheetWithGladiadorItems();
    const oldWeapon = weaponNames(before.bag)[0];

    const options = gladiador.getItems().find((i) => i.choice)?.choice
      ?.options as Equipment[];
    const newWeapon = options.find((o) => o.nome !== oldWeapon) as Equipment;

    const after = applyOriginItemChoices(before, gladiador, {
      arma: newWeapon.nome,
    });

    expect(weaponNames(after.bag)).toEqual([newWeapon.nome]);
    expect(weaponNames(after.bag)).not.toContain(oldWeapon);
  });

  it('rastreia os ids concedidos para permitir a troca', () => {
    const sheet = sheetWithGladiadorItems();

    expect(sheet.origin?.grantedItemIds?.length).toBeGreaterThan(0);
    const bagIds = Object.values(sheet.bag.equipments)
      .flat()
      .map((i) => (i as Equipment).id);
    sheet.origin?.grantedItemIds?.forEach((id) => {
      expect(bagIds).toContain(id);
    });
  });
});

describe('geração aleatória', () => {
  it('Gladiador recebe uma arma marcial ou exótica na mochila', () => {
    const options: SelectOptions = {
      nivel: 1,
      raca: 'Humano',
      classe: 'Guerreiro',
      origin: 'Gladiador',
      devocao: { label: '--', value: '--' },
      supplements: CORE,
    };

    const sheet = generateRandomSheet(options);
    const allowed = getOrigin('Gladiador')
      .getItems()
      .find((i) => i.choice)
      ?.choice?.options.map((o) => (o as Equipment).nome) as string[];

    expect(weaponNames(sheet.bag).some((n) => allowed.includes(n))).toBe(true);
  });
});
