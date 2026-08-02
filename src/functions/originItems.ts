import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '../interfaces/Equipment';
import Origin, { Items } from '../interfaces/Origin';
import CharacterSheet from '../interfaces/CharacterSheet';
import Bag from '../interfaces/Bag';
import { Armaduras, Escudos } from '../data/systems/tormenta20/equipamentos';

/**
 * Escolhas de item da origem: `choice.key` -> nome do item escolhido.
 * Guardamos o nome (e não o objeto) para manter a seleção serializável e
 * imune a cópias defasadas do catálogo.
 */
export type OriginItemChoices = Record<string, string>;

export function getOriginItemOptionName(option: Equipment | string): string {
  return typeof option === 'string' ? option : option.nome;
}

/**
 * Anotação de procedência gravada em `Equipment.descricao`. Aparece no tooltip
 * da tabela de equipamentos e no card da mochila, deixando claro que o item veio
 * de graça pela origem (e qual escolha ele representa).
 */
function buildOriginItemDescription(
  item: Items,
  originName?: string
): string | undefined {
  const source = originName ? `Recebido da origem: ${originName}` : undefined;
  const label = item.choice?.label || item.description;

  if (source && label) return `${source} — ${label}`;
  return source || label;
}

export function convertOriginItemsToBagEquipments(
  items: Items[] | undefined,
  originName?: string
): Partial<BagEquipments> {
  const equipments: Partial<BagEquipments> = {
    'Item Geral': [],
  };

  items?.forEach((equip) => {
    const descricao = buildOriginItemDescription(equip, originName);

    if (typeof equip.equipment === 'string') {
      equipments['Item Geral']?.push({
        nome: `${equip.qtd ? `${equip.qtd}x ` : ''}${equip.equipment}`,
        group: 'Item Geral',
        descricao,
      });
    } else if (equip.equipment) {
      // Clona: os objetos vêm dos catálogos, que são singletons compartilhados
      // e cacheados. Colocá-los na mochila por referência faz `ensureIds`
      // gravar o `id` no catálogo e vazar estado entre fichas.
      const equipValue = { ...equip.equipment, descricao };

      // Verifica se é uma armadura (comparação por nome)
      if (
        Object.values(Armaduras).some((armor) => armor.nome === equipValue.nome)
      ) {
        if (!equipments.Armadura) {
          equipments.Armadura = [];
        }
        equipments.Armadura.push(equipValue as DefenseEquipment);
      }
      // Verifica se é um escudo
      else if (
        Object.values(Escudos).some((shield) => shield.nome === equipValue.nome)
      ) {
        if (!equipments.Escudo) {
          equipments.Escudo = [];
        }
        equipments.Escudo.push(equipValue as DefenseEquipment);
      }
      // Arma ou item geral, conforme o grupo
      else if (equipValue.group === 'Arma') {
        if (!equipments.Arma) {
          equipments.Arma = [];
        }
        equipments.Arma.push(equipValue);
      } else {
        equipments['Item Geral']?.push(equipValue);
      }
    }
  });

  return equipments;
}

/**
 * Substitui o sorteio de `getItems()` pela escolha do jogador quando houver uma.
 * Sem escolha (ou com escolha inválida — item fora do pool), mantém o sorteio,
 * que é o comportamento da geração aleatória.
 */
export function resolveOriginItems(
  items: Items[] | undefined,
  choices?: OriginItemChoices
): Items[] {
  if (!items) return [];
  if (!choices) return items;

  return items.map((item) => {
    if (!item.choice) return item;

    const chosenName = choices[item.choice.key];
    if (!chosenName) return item;

    const chosen = item.choice.options.find(
      (option) => getOriginItemOptionName(option) === chosenName
    );
    if (!chosen) return item;

    return { ...item, equipment: chosen };
  });
}

/** true quando a origem tem ao menos um item que o jogador precisa escolher. */
export function originHasItemChoices(origin: Origin | undefined): boolean {
  return !!origin?.getItems().some((item) => item.choice);
}

/**
 * Itens da origem prontos para a mochila, já resolvidos pelas escolhas do
 * jogador e anotados com a procedência.
 *
 * Ponto único de concessão: os dois motores de derivação (geração aleatória e
 * assistente) chamam esta função, para não divergirem em silêncio.
 *
 * `cachedItems` permite reaproveitar a lista congelada pelo assistente — sem
 * ela, cada chamada a `getItems()` re-sorteia e a mochila discorda da UI.
 */
export function getOriginBagEquipments(
  origin: Origin | undefined,
  opts?: { choices?: OriginItemChoices; cachedItems?: Items[] }
): Partial<BagEquipments> {
  if (!origin) return {};

  const items = resolveOriginItems(
    opts?.cachedItems || origin.getItems(),
    opts?.choices
  );

  return convertOriginItemsToBagEquipments(items, origin.name);
}

/**
 * Adiciona os itens da origem à mochila e devolve os ids com que eles ficaram
 * guardados, para que possam ser trocados ou removidos depois.
 *
 * Os ids são atribuídos pelo próprio `Bag` (`ensureIds`), então precisam ser
 * recolhidos após o `addEquipment`, casando por nome dentro de cada grupo.
 */
export function grantOriginItemsToBag(
  bag: Bag,
  origin: Origin | undefined,
  opts?: { choices?: OriginItemChoices; cachedItems?: Items[] }
): string[] {
  const granted = getOriginBagEquipments(origin, opts);
  bag.addEquipment(granted);

  const grantedItemIds: string[] = [];
  Object.entries(granted).forEach(([group, items]) => {
    (items as Equipment[] | undefined)?.forEach((grantedItem) => {
      const stored = (
        bag.equipments[group as keyof BagEquipments] as Equipment[] | undefined
      )?.find((item) => item.nome === grantedItem.nome);
      if (stored?.id) grantedItemIds.push(stored.id);
    });
  });

  return grantedItemIds;
}

/**
 * Devolve a ficha sem os itens que a origem havia concedido. Usado ao trocar de
 * origem ou de escolha — sem isso, a arma antiga ficaria órfã na mochila.
 */
export function removeGrantedOriginItems(
  sheet: CharacterSheet
): CharacterSheet {
  const previousIds = sheet.origin?.grantedItemIds;
  if (!previousIds || previousIds.length === 0) return { ...sheet };

  const toRemove = new Set(previousIds);
  const remaining = Object.fromEntries(
    Object.entries(sheet.bag.equipments).map(([group, items]) => [
      group,
      (items as Equipment[]).filter(
        (item) => !item.id || !toRemove.has(item.id)
      ),
    ])
  ) as unknown as BagEquipments;

  return {
    ...sheet,
    bag: new Bag(remaining, true, sheet.bag.displayOrder),
  };
}

/**
 * Troca as escolhas de item numa ficha já criada: remove da mochila os itens
 * concedidos anteriormente pela origem e adiciona os novos.
 */
export function applyOriginItemChoices(
  sheet: CharacterSheet,
  origin: Origin,
  choices: OriginItemChoices
): CharacterSheet {
  const cleaned = removeGrantedOriginItems(sheet);
  const grantedItemIds = grantOriginItemsToBag(cleaned.bag, origin, {
    choices,
  });

  return {
    ...cleaned,
    origin: cleaned.origin
      ? { ...cleaned.origin, itemChoices: choices, grantedItemIds }
      : cleaned.origin,
  };
}
