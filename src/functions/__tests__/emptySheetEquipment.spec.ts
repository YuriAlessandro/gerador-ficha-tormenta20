/**
 * Testes de equipamento inicial na criação customizada (wizard).
 *
 * O wizard tem dois caminhos para o bag:
 * - Com marketSelections: o bag do Mercado (já pré-populado no modal) é usado
 *   como está — nada extra deve ser injetado (anti-duplicação).
 * - Sem marketSelections (usuário atravessou o Mercado sem interagir):
 *   generateEmptySheet deve adicionar o equipamento de classe (escolhido no
 *   step "Equipamento Inicial" ou sorteado) e os itens/dinheiro da origem.
 */
import { describe, it, expect } from 'vitest';
import { SupplementId } from '../../types/supplement.types';
import {
  generateEmptySheet,
  buildClassEquipmentsFromChoices,
  convertOriginItemsToBagEquipments,
} from '../general';
import { dataRegistry } from '../../data/registry';
import SelectOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import Bag from '../../interfaces/Bag';
import { BagEquipments } from '../../interfaces/Equipment';
import EQUIPAMENTOS, {
  Armas,
  Armaduras,
  Escudos,
} from '../../data/systems/tormenta20/equipamentos';
import { Items } from '../../interfaces/Origin';

const BASE_OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

function getClass(name: string) {
  const classe = dataRegistry
    .getClassesBySupplements([SupplementId.TORMENTA20_CORE])
    .find((c) => c.name === name);
  if (!classe) throw new Error(`${name} not found in registry`);
  return classe;
}

function bagNames(sheet: { bag: Bag }, group: keyof BagEquipments): string[] {
  return sheet.bag.equipments[group].map((e) => e.nome);
}

describe('generateEmptySheet - equipamento inicial de classe', () => {
  it('usa o equipamento escolhido no step Equipamento Inicial', () => {
    const wizSel: WizardSelections = {
      classEquipment: {
        simpleWeapon: Armas.ADAGA,
        martialWeapon: Armas.ESPADA_LONGA,
      },
    };

    const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

    expect(bagNames(sheet, 'Arma')).toContain('Adaga');
    expect(bagNames(sheet, 'Arma')).toContain('Espada Longa');
    // Guerreiro é proficiente em armaduras pesadas: Brunea automática
    expect(bagNames(sheet, 'Armadura')).toContain('Brunea');
    // Guerreiro é proficiente em escudos: Escudo Leve automático
    expect(bagNames(sheet, 'Escudo')).toContain('Escudo Leve');
  });

  it('empunha o equipamento inicial (mainHand e armadura vestida)', () => {
    const wizSel: WizardSelections = {
      classEquipment: {
        simpleWeapon: Armas.ADAGA,
        martialWeapon: Armas.ESPADA_LONGA,
      },
    };

    const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

    expect(sheet.mainHandItemId).toBeDefined();
    expect(sheet.wornArmorId).toBeDefined();
  });

  it('sorteia equipamento de classe como fallback (sem escolhas e sem Mercado)', () => {
    const sheet = generateEmptySheet(BASE_OPTIONS, {});

    // 1 arma simples + 1 marcial (Guerreiro é proficiente em marciais)
    expect(sheet.bag.equipments.Arma.length).toBeGreaterThanOrEqual(2);
    expect(bagNames(sheet, 'Armadura')).toContain('Brunea');
    expect(bagNames(sheet, 'Escudo')).toContain('Escudo Leve');
    expect(sheet.mainHandItemId).toBeDefined();
  });

  it('não injeta equipamento quando o usuário interagiu com o Mercado', () => {
    const marketBag = new Bag().equipments;
    const wizSel: WizardSelections = {
      classEquipment: {
        simpleWeapon: Armas.ADAGA,
        martialWeapon: Armas.ESPADA_LONGA,
      },
      marketSelections: {
        initialMoney: 100,
        remainingMoney: 60,
        bagEquipments: marketBag,
      },
    };

    const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

    // O bag deve ser exatamente o do mercado (defaults, sem armas injetadas)
    expect(sheet.bag.equipments.Arma).toHaveLength(0);
    expect(sheet.bag.equipments.Armadura).toHaveLength(0);
    expect(sheet.dinheiro).toBe(60);
  });
});

describe('generateEmptySheet - itens e dinheiro de origem', () => {
  const ATLAS_OPTIONS: SelectOptions = {
    nivel: 1,
    raca: 'Humano',
    classe: 'Guerreiro',
    origin: 'Agricultor Sambur (Sambúrdia)',
    devocao: { label: '--', value: '--' },
    supplements: [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_ATLAS_ARTON,
    ],
  };

  it('origem regional: adiciona itens e dinheiro extra sem interação com o Mercado', () => {
    const sheet = generateEmptySheet(ATLAS_OPTIONS, {});

    // Agricultor Sambur dá uma Lança (ferramenta agrícola) e T$ 100 extras.
    // Dinheiro base de nível 1 é 4d6 (4-24), então o total fica em 104-124.
    expect(bagNames(sheet, 'Arma')).toContain('Lança');
    expect(sheet.dinheiro).toBeGreaterThanOrEqual(104);
    expect(sheet.dinheiro).toBeLessThanOrEqual(124);
  });

  it('benefício de origem tipo item: adiciona o item escolhido ao bag', () => {
    const wizSel: WizardSelections = {
      originBenefits: [
        { type: 'item', name: 'Símbolo sagrado' },
        { type: 'item', name: 'Traje de Sacerdote' },
      ],
    };

    const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

    expect(bagNames(sheet, 'Item Geral')).toContain('Símbolo sagrado');
    expect(bagNames(sheet, 'Item Geral')).toContain('Traje de Sacerdote');
  });
});

describe('buildClassEquipmentsFromChoices', () => {
  it('Guerreiro: armas escolhidas + Brunea + Escudo Leve', () => {
    const result = buildClassEquipmentsFromChoices(getClass('Guerreiro'), {
      simpleWeapon: Armas.ADAGA,
      martialWeapon: Armas.ESPADA_LONGA,
    });

    expect(result.Arma.map((w) => w.nome)).toEqual(['Adaga', 'Espada Longa']);
    expect(result.Armadura.map((a) => a.nome)).toEqual(['Brunea']);
    expect(result.Escudo.map((s) => s.nome)).toEqual(['Escudo Leve']);
  });

  it('ignora arma marcial se a classe não é proficiente', () => {
    const result = buildClassEquipmentsFromChoices(getClass('Arcanista'), {
      simpleWeapon: Armas.ADAGA,
      martialWeapon: Armas.ESPADA_LONGA,
    });

    expect(result.Arma.map((w) => w.nome)).toEqual(['Adaga']);
  });

  it('Arcanista não recebe armadura mesmo com escolha', () => {
    const result = buildClassEquipmentsFromChoices(getClass('Arcanista'), {
      simpleWeapon: Armas.ADAGA,
      armor: Armaduras.ARMADURA_ACOLCHOADA,
    });

    expect(result.Armadura).toHaveLength(0);
  });

  it('usa a armadura leve escolhida quando a classe não usa pesadas', () => {
    const result = buildClassEquipmentsFromChoices(getClass('Ladino'), {
      simpleWeapon: Armas.ADAGA,
      armor: Armaduras.ARMADURA_ACOLCHOADA,
    });

    expect(result.Armadura.map((a) => a.nome)).toEqual(['Armadura Acolchoada']);
  });

  it('não adiciona armadura se o bag já tem uma (dedup)', () => {
    const bag = new Bag({ Armadura: [Armaduras.ARMADURA_ACOLCHOADA] });
    const result = buildClassEquipmentsFromChoices(
      getClass('Guerreiro'),
      { simpleWeapon: Armas.ADAGA, martialWeapon: Armas.ESPADA_LONGA },
      bag
    );

    expect(result.Armadura).toHaveLength(0);
  });

  it('Bardo recebe o instrumento escolhido', () => {
    const result = buildClassEquipmentsFromChoices(getClass('Bardo'), {
      simpleWeapon: Armas.ADAGA,
      martialWeapon: Armas.ESPADA_LONGA,
      armor: Armaduras.ARMADURA_ACOLCHOADA,
      instrument: 'Harpa',
    });

    expect(result['Item Geral'].map((i) => i.nome)).toEqual(['Harpa']);
  });
});

describe('convertOriginItemsToBagEquipments', () => {
  it('converte string em Item Geral com prefixo de quantidade', () => {
    const items: Items[] = [{ equipment: 'Corda', qtd: 2 }];
    const result = convertOriginItemsToBagEquipments(items);

    expect(result['Item Geral']?.map((i) => i.nome)).toEqual(['2x Corda']);
  });

  it('roteia armadura, escudo, arma e item geral para os grupos corretos', () => {
    const items: Items[] = [
      { equipment: Armaduras.ARMADURA_ACOLCHOADA },
      { equipment: Escudos.ESCUDOLEVE },
      { equipment: Armas.ESPADA_LONGA },
      { equipment: { nome: 'Bandeira', group: 'Item Geral' } },
    ];
    const result = convertOriginItemsToBagEquipments(items);

    expect(result.Armadura?.map((i) => i.nome)).toEqual([
      'Armadura Acolchoada',
    ]);
    expect(result.Escudo?.map((i) => i.nome)).toEqual(['Escudo Leve']);
    expect(result.Arma?.map((i) => i.nome)).toEqual(['Espada Longa']);
    expect(result['Item Geral']?.map((i) => i.nome)).toEqual(['Bandeira']);
  });

  it('não muta o objeto do catálogo ao colocá-lo na mochila', () => {
    const result = convertOriginItemsToBagEquipments([
      { equipment: Armas.ESPADA_LONGA },
    ]);

    const naMochila = result.Arma?.[0];
    expect(naMochila).not.toBe(Armas.ESPADA_LONGA);

    // Escrever na cópia (como faz ensureIds) não pode vazar para o catálogo,
    // que é um singleton compartilhado entre fichas.
    const idDoCatalogoAntes = Armas.ESPADA_LONGA.id;
    if (naMochila) naMochila.id = 'id-de-teste';
    expect(Armas.ESPADA_LONGA.id).toBe(idDoCatalogoAntes);
  });

  /**
   * Regressão do bug reportado: a Pistola concedida pela origem "Procurado:
   * Vivo ou Morto" ia para "Item Geral" como texto e sumia da lista de
   * Ataques, que filtra por `group === 'Arma'`.
   */
  it('entrega a Pistola da origem Procurado: Vivo ou Morto como Arma', () => {
    const origem = dataRegistry
      .getOriginsBySupplements([
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_ATLAS_ARTON,
      ])
      .find((o) => o.name === 'Procurado: Vivo ou Morto (Smokestone)');
    expect(origem).toBeDefined();

    const result = convertOriginItemsToBagEquipments(origem?.getItems?.());

    const pistola = result.Arma?.find((i) => i.nome === 'Pistola');
    expect(pistola).toBeDefined();
    expect(pistola?.group).toBe('Arma');
    expect(pistola?.dano).toBe('2d6');
    expect(pistola?.weaponCategory).toBe('firearm');

    // Munição rastreável, para o sub-item de balas da Pistola na Mochila.
    const balas = result.Arma?.find((i) => i.isAmmo);
    expect(balas?.ammoType).toBe('Balas');

    expect(result['Item Geral']).toEqual([]);
  });

  it('retorna apenas Item Geral vazio para lista indefinida', () => {
    const result = convertOriginItemsToBagEquipments(undefined);
    expect(result['Item Geral']).toEqual([]);
    expect(result.Arma).toBeUndefined();
  });

  it('lista sorteada de armas simples/marciais/armaduras leves segue disponível', () => {
    // Sanidade: as listas usadas pelo step Equipamento Inicial não estão vazias
    expect(EQUIPAMENTOS.armasSimples.length).toBeGreaterThan(0);
    expect(EQUIPAMENTOS.armasMarciais.length).toBeGreaterThan(0);
    expect(EQUIPAMENTOS.armadurasLeves.length).toBeGreaterThan(0);
  });
});
