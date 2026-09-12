import Equipment, {
  AmmoType,
  BagEquipments,
  CORE_AMMO_TYPES,
  CoreAmmoType,
  equipGroup,
} from '../../../interfaces/Equipment';

/**
 * Tipos SUGERIDOS nos seletores de autoria. É a base a que
 * `getAmmoTypeSuggestions` acrescenta o que já existe na mochila e no catálogo
 * — o vocabulário em si é aberto (ver `AmmoType`).
 */
export const AMMO_TYPE_OPTIONS: readonly CoreAmmoType[] = CORE_AMMO_TYPES;

/**
 * Rótulos dos tipos CONHECIDOS. Tipado em `CoreAmmoType` de propósito: com
 * `AmmoType` aberto isto viraria um índice de string e um tipo autoral
 * devolveria `undefined` em silêncio. Use `ammoTypeLabel`, nunca este mapa
 * direto.
 */
export const AMMO_LABELS: Record<CoreAmmoType, string> = {
  Flechas: 'Flechas',
  Virotes: 'Virotes',
  Balas: 'Balas',
  Pedras: 'Pedras',
  'Bola de Ferro': 'Bolas de Ferro',
};

/**
 * Rótulo de exibição de um tipo de munição. Tipo autoral não tem entrada em
 * `AMMO_LABELS`, e aí o próprio nome cunhado pelo autor é o rótulo.
 */
export function ammoTypeLabel(ammoType: AmmoType): string {
  return AMMO_LABELS[ammoType as CoreAmmoType] ?? ammoType;
}

/**
 * Catalog flags for the legacy ammo items that already existed before the
 * ammo system was added. When a bag is rehydrated and an item matches one of
 * these names, we enrich it with the ammo metadata so migration can proceed.
 */
export const AMMO_BY_LEGACY_NAME: Record<
  string,
  { ammoType?: CoreAmmoType; ammoPackSize: number; ammoUnitsPerSpace: number }
> = {
  // Munição genérica da tabela de tesouro. `ammoType` ausente de propósito: a
  // linha do livro não tem tipo. Ela ganha contador e espaços como as outras;
  // só não auto-vincula a uma arma até o jogador escolher o tipo no editor.
  'Munição (20)': { ammoPackSize: 20, ammoUnitsPerSpace: 20 },
  'Flechas (20)': {
    ammoType: 'Flechas',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Virotes (20)': {
    ammoType: 'Virotes',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Balas (20)': { ammoType: 'Balas', ammoPackSize: 20, ammoUnitsPerSpace: 20 },
  'Pedras (20)': {
    ammoType: 'Pedras',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Bola de ferro (1)': {
    ammoType: 'Bola de Ferro',
    ammoPackSize: 1,
    ammoUnitsPerSpace: 2,
  },
};

/**
 * Maps catalog weapon names to the ammo type they consume. Used to retrofit
 * legacy bags (weapons that already exist on a sheet but lack the new
 * `ammoType` flag because they were added before the ammo system).
 */
export const WEAPON_AMMO_BY_LEGACY_NAME: Record<string, CoreAmmoType> = {
  // Core
  'Besta Leve': 'Virotes',
  Funda: 'Pedras',
  'Arco Curto': 'Flechas',
  'Arco Longo': 'Flechas',
  'Besta Pesada': 'Virotes',
  Mosquete: 'Balas',
  Pistola: 'Balas',
  // Ameaças de Arton
  Traque: 'Balas',
  Arcabuz: 'Balas',
  Bacamarte: 'Balas',
  'Pistola-punhal': 'Balas',
  // Heróis de Arton
  'Besta de mão': 'Virotes',
  'Arco montado': 'Flechas',
  'Besta dupla': 'Virotes',
  'Arco de guerra': 'Flechas',
  Balestra: 'Virotes',
  'Besta de repetição': 'Virotes',
  Garrucha: 'Balas',
  'Canhão portátil': 'Bola de Ferro',
};

const BAG_CATEGORIES: equipGroup[] = [
  'Arma',
  'Armadura',
  'Escudo',
  'Item Geral',
  'Alquimía',
  'Esotérico',
  'Vestuário',
  'Hospedagem',
  'Alimentação',
  'Animal',
  'Veículo',
  'Serviço',
];

/**
 * In-place migration: enriches legacy ammo items with the new metadata flags
 * (`isAmmo`, `ammoType`, `ammoPackSize`) and seeds `unitsRemaining` from the
 * old `quantity * packSize` model. Idempotent — runs once per item by checking
 * `unitsRemaining === undefined`.
 */
export function seedAmmoUnits(bagEquipments: BagEquipments): void {
  BAG_CATEGORIES.forEach((category) => {
    const list = bagEquipments[category];
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (!item || typeof item !== 'object') return;

      const legacyMatch = AMMO_BY_LEGACY_NAME[item.nome];
      if (legacyMatch && !item.isAmmo) {
        item.isAmmo = true;
        // Guardado: a munição genérica não tem tipo, e escrever `undefined`
        // por cima apagaria um tipo que o jogador já tivesse escolhido à mão.
        if (legacyMatch.ammoType) item.ammoType = legacyMatch.ammoType;
        item.ammoPackSize = legacyMatch.ammoPackSize;
        item.ammoUnitsPerSpace = legacyMatch.ammoUnitsPerSpace;
      }

      if (item.isAmmo && item.unitsRemaining === undefined) {
        const packSize = item.ammoPackSize ?? 20;
        const stacks = item.quantity ?? 1;
        item.unitsRemaining = packSize * stacks;
        item.quantity = 1;
      }

      // Retrofit legacy weapons with their ammoType so old sheets get the
      // ammo prompt and the sub-row in Ataques without re-adding the weapon.
      if (!item.isAmmo && !item.ammoType) {
        const weaponMatch = WEAPON_AMMO_BY_LEGACY_NAME[item.nome];
        if (weaponMatch) item.ammoType = weaponMatch;
      }
    });
  });
}

/** Iterates every item in the bag's category buckets. */
function forEachItem(
  bagEquipments: BagEquipments,
  fn: (item: Equipment) => void
): void {
  BAG_CATEGORIES.forEach((category) => {
    const list = bagEquipments[category];
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (item && typeof item === 'object') fn(item);
    });
  });
}

/**
 * Primeira pilha de munição do tipo pedido, tenha ela unidades ou não.
 *
 * Use para IDENTIDADE (existe munição desse tipo? qual o nome dela?). Para
 * gastar um projétil use `findConsumableAmmoStack`, que pula pilha vazia.
 */
export function findAmmoStack(
  bagEquipments: BagEquipments,
  ammoType: AmmoType
): Equipment | undefined {
  let found: Equipment | undefined;
  forEachItem(bagEquipments, (item) => {
    if (found) return;
    if (item.isAmmo && item.ammoType === ammoType) found = item;
  });
  return found;
}

/**
 * Pilha de onde tirar o próximo projétil: a primeira do tipo que ainda tenha
 * unidades.
 *
 * Existe porque pilhas do mesmo tipo convivem — munição autoral ("Virotes de
 * prata (10)") ao lado da oficial, e duas pilhas `isCustom`, que nunca empilham
 * entre si. Usar a primeira pilha sem checar o saldo fazia o ataque virar um
 * no-op silencioso assim que ela zerava, mesmo com munição na pilha seguinte.
 */
export function findConsumableAmmoStack(
  bagEquipments: BagEquipments,
  ammoType: AmmoType
): Equipment | undefined {
  let found: Equipment | undefined;
  forEachItem(bagEquipments, (item) => {
    if (found) return;
    if (item.isAmmo && item.ammoType === ammoType) {
      if ((item.unitsRemaining ?? 0) > 0) found = item;
    }
  });
  return found;
}

/**
 * Total de projéteis do tipo na mochila, somando TODAS as pilhas — é o número
 * que o contador da aba Ataques mostra, e mostrar só o da primeira pilha
 * escondia metade do estoque de quem tem munição autoral junto da oficial.
 */
export function getAmmoUnits(
  bagEquipments: BagEquipments,
  ammoType: AmmoType
): number {
  let total = 0;
  forEachItem(bagEquipments, (item) => {
    if (item.isAmmo && item.ammoType === ammoType) {
      total += item.unitsRemaining ?? 0;
    }
  });
  return total;
}

/**
 * Tipos de munição oferecidos nos seletores de autoria: os cinco do livro mais
 * todo tipo já presente na mochila e no catálogo ativo (pacotes de munição
 * homebrew inclusos).
 *
 * É o que permite criar "Cartuchos a vapor" e depois apontar uma arma para ele
 * escolhendo na lista em vez de redigitar — um erro de digitação quebraria o
 * vínculo arma↔munição em silêncio.
 */
export function getAmmoTypeSuggestions(
  ...sources: (BagEquipments | Equipment[] | undefined)[]
): AmmoType[] {
  const seen = new Set<AmmoType>(CORE_AMMO_TYPES);
  const collect = (item: Equipment) => {
    if (item?.isAmmo && item.ammoType) seen.add(item.ammoType);
  };

  sources.forEach((source) => {
    if (!source) return;
    if (Array.isArray(source)) source.forEach(collect);
    else forEachItem(source, collect);
  });

  return [...seen];
}

/** Returns the space cost of an ammo item using the ceil(units / unitsPerSpace) rule. */
export function calcAmmoSpaces(item: Equipment): number {
  if (!item.isAmmo) return 0;
  const unitsPerSpace = item.ammoUnitsPerSpace ?? 20;
  const units = item.unitsRemaining ?? 0;
  if (units <= 0) return 0;
  return Math.ceil(units / unitsPerSpace);
}
