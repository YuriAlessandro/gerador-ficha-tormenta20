import Equipment, {
  DefenseEquipment,
  equipGroup,
  BagEquipments,
} from '@/interfaces/Equipment';
import { MarketEquipment } from '@/interfaces/MarketEquipment';
import { isDefenseEquipment } from '@/functions/itemEnhancements/core';
import { WEAPON_CATEGORY_SHORT_LABELS } from '@/functions/proficiencies';
import {
  EquipmentStat,
  STAT_ESPACOS,
  getStatsForGroup,
} from '@/functions/equipmentStats';

/**
 * Modelo dirigido por dados do mercado.
 *
 * Cada categoria descreve QUAIS colunas mostra, quais selos o item pode
 * receber e como pode ser filtrada. As linhas do mercado não têm nenhuma
 * lógica de categoria: elas percorrem `descriptor.stats`. Adicionar uma coluna
 * a Armas é editar uma linha de array aqui — resista à tentação de espalhar
 * `if (categoria === 'weapons')` pelos componentes.
 */

export type MarketCategoryKey = keyof MarketEquipment;

/** As colunas do mercado usam os descritores compartilhados. */
export type MarketStat = EquipmentStat;

export interface MarketBadge {
  key: string;
  label: string;
  test: (item: Equipment | DefenseEquipment) => boolean;
}

export interface MarketSubFilter {
  key: string;
  label: string;
  test: (item: Equipment) => boolean;
}

export interface MarketCategoryDescriptor {
  key: MarketCategoryKey;
  /** Só para pegar ícone/cor de `itemTypeStyles`. */
  group: equipGroup;
  label: string;
  stats: MarketStat[];
  badges: MarketBadge[];
  showDescription: boolean;
  /** Itens que fazem sentido comprar aos montes ganham seletor de quantidade. */
  allowsQuantity: (item: Equipment) => boolean;
  subFilters?: MarketSubFilter[];
}

const NEVER = () => false;

/** Categorias mundanas: só espaços + descrição. */
const mundane = (
  key: MarketCategoryKey,
  group: equipGroup,
  label: string,
  allowsQuantity: (item: Equipment) => boolean = NEVER
): MarketCategoryDescriptor => ({
  key,
  group,
  label,
  stats: [STAT_ESPACOS],
  badges: [],
  showDescription: true,
  allowsQuantity,
});

export const MARKET_CATEGORIES: MarketCategoryDescriptor[] = [
  {
    key: 'weapons',
    group: 'Arma',
    label: 'Armas',
    stats: [...getStatsForGroup('Arma'), STAT_ESPACOS],
    badges: [
      { key: 'twoHanded', label: 'Duas mãos', test: (i) => !!i.twoHanded },
      { key: 'ammo', label: 'Munição', test: (i) => !!i.isAmmo },
    ],
    showDescription: false,
    // Munição é o caso clássico de comprar 20 de uma vez.
    allowsQuantity: (item) => !!item.isAmmo,
    subFilters: (['simple', 'martial', 'exotic', 'firearm'] as const).map(
      (category) => ({
        key: category,
        label: WEAPON_CATEGORY_SHORT_LABELS[category],
        test: (item: Equipment) => item.weaponCategory === category,
      })
    ),
  },
  {
    key: 'armors',
    group: 'Armadura',
    label: 'Armaduras',
    stats: [...getStatsForGroup('Armadura'), STAT_ESPACOS],
    badges: [
      {
        key: 'heavy',
        label: 'Pesada',
        test: (i) => isDefenseEquipment(i) && !!i.isHeavyArmor,
      },
    ],
    showDescription: true,
    allowsQuantity: NEVER,
    subFilters: [
      {
        key: 'light',
        label: 'Leves',
        test: (item) => !(item as DefenseEquipment).isHeavyArmor,
      },
      {
        key: 'heavy',
        label: 'Pesadas',
        test: (item) => !!(item as DefenseEquipment).isHeavyArmor,
      },
    ],
  },
  {
    key: 'shields',
    group: 'Escudo',
    label: 'Escudos',
    stats: [...getStatsForGroup('Escudo'), STAT_ESPACOS],
    badges: [],
    showDescription: true,
    allowsQuantity: NEVER,
  },
  mundane('generalItems', 'Item Geral', 'Itens Gerais'),
  mundane('esoteric', 'Esotérico', 'Esotéricos'),
  mundane('clothing', 'Vestuário', 'Vestuário'),
  mundane('alchemy', 'Alquimía', 'Alquimia', () => true),
  mundane('food', 'Alimentação', 'Alimentação', () => true),
  mundane('animals', 'Animal', 'Animais'),
];

export const DEFAULT_CATEGORY: MarketCategoryKey = 'weapons';

const DESCRIPTOR_BY_KEY = new Map<MarketCategoryKey, MarketCategoryDescriptor>(
  MARKET_CATEGORIES.map((descriptor) => [descriptor.key, descriptor])
);

export const getDescriptor = (
  key: MarketCategoryKey
): MarketCategoryDescriptor =>
  DESCRIPTOR_BY_KEY.get(key) ?? MARKET_CATEGORIES[0];

/**
 * Destino de cada grupo de equipamento na mochila. Substitui a cadeia de nove
 * `else if` que existia antes.
 */
export const BAG_KEY_BY_GROUP: Record<equipGroup, keyof BagEquipments> = {
  Arma: 'Arma',
  Armadura: 'Armadura',
  Escudo: 'Escudo',
  'Item Geral': 'Item Geral',
  Alquimía: 'Alquimía',
  Esotérico: 'Esotérico',
  Vestuário: 'Vestuário',
  Hospedagem: 'Hospedagem',
  Alimentação: 'Alimentação',
  Animal: 'Animal',
  Veículo: 'Veículo',
  Serviço: 'Serviço',
};

export const BAG_CATEGORY_LABELS: Record<keyof BagEquipments, string> = {
  Arma: 'Armas',
  Armadura: 'Armaduras',
  Escudo: 'Escudos',
  'Item Geral': 'Itens Gerais',
  Alquimía: 'Alquimia',
  Esotérico: 'Esotéricos',
  Vestuário: 'Vestuário',
  Hospedagem: 'Hospedagem',
  Alimentação: 'Alimentação',
  Animal: 'Animais',
  Veículo: 'Veículos',
  Serviço: 'Serviços',
};

/** Chave estável de um item de catálogo (o nome sozinho colide entre suplementos). */
export const getItemKey = (item: Equipment): string =>
  `${item.supplementId ?? 'core'}::${item.group}::${item.nome}`;

export type MarketSortKey = 'nome' | 'precoAsc' | 'precoDesc';

export const MARKET_SORTERS: Record<
  MarketSortKey,
  (a: Equipment, b: Equipment) => number
> = {
  nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
  precoAsc: (a, b) =>
    (a.preco ?? 0) - (b.preco ?? 0) || a.nome.localeCompare(b.nome, 'pt-BR'),
  precoDesc: (a, b) =>
    (b.preco ?? 0) - (a.preco ?? 0) || a.nome.localeCompare(b.nome, 'pt-BR'),
};

export const SORT_LABELS: Record<MarketSortKey, string> = {
  nome: 'Nome',
  precoAsc: 'Menor preço',
  precoDesc: 'Maior preço',
};

/** Teto de resultados numa busca global, para buscas de 1-2 letras. */
export const SEARCH_RESULT_LIMIT = 80;
