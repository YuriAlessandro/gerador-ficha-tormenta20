import { isHeavyArmor } from '../../data/systems/tormenta20/equipamentos';
import { getEffectiveWeaponCategory } from '../../functions/proficiencies';
import {
  getWeaponPurpose,
  normalizeReach,
} from '../../functions/weaponPurpose';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
  equipGroup,
  WeaponAttribute,
  WeaponCategory,
} from '../../interfaces/Equipment';
import { isRecord } from '../effects';
import { ATTRIBUTE_KEYS, toDamageTypeKey } from '../enums';
import { foundryId, textToHtml } from '../normalize';
import { FOUNDRY_SKILLS } from '../skills';
import { FoundryItem, FoundryRoll, FoundryValue } from '../types';
import { buildFormulaRolls } from './spells';

/** Grupos da mochila que não são objetos carregados — não viram item. */
const NON_PHYSICAL_GROUPS: equipGroup[] = ['Hospedagem', 'Serviço'];

const CONSUMABLE_GROUPS: equipGroup[] = ['Alquimía', 'Alimentação'];

const PROFICIENCY_KEYS: Record<WeaponCategory, string> = {
  simple: 'simples',
  martial: 'marcial',
  exotic: 'exotica',
  firearm: 'fogo',
};

const REACH_KEYS: Record<string, string> = {
  Curto: 'short',
  Médio: 'medium',
  Longo: 'long',
};

/** Grupo da mochila → `tipo` do item `consumivel` do sistema. */
const CONSUMABLE_TYPE_KEYS: Partial<Record<equipGroup, string>> = {
  // Poções e óleos são itens alquímicos no T20; a ficha não distingue "poção"
  // de outro alquímico, e `alchemy` vale para os dois.
  Alquimía: 'alchemy',
  Alimentação: 'food',
};

/**
 * Tag de arma da ficha → propriedade do sistema (`T20.weaponProperties`). Só
 * as que existem nos dois lados: `espada`, `natural`, `desarmado`, `heredrimm`,
 * `armaDeMar` e `armaDeFogo` são conceitos nossos, usados para elegibilidade de
 * poder, e não têm equivalente. `leve` vira `empunhadura`, não propriedade.
 */
const WEAPON_PROPERTY_KEYS: Record<string, string> = {
  agil: 'agi',
  alongada: 'alo',
};

/**
 * Slots de equipamento, o segundo modelo do sistema (`equipado2`), usado quando
 * o mestre liga a opção "slots de equipamento". Nesse modo `prepareDefense` só
 * conta armadura e escudo com `slot` preenchido e ignora `equipado`, que basta
 * no modo clássico — sem isto a Defesa sai baixa justamente nessas mesas.
 *
 * O `slot` é codificado em decimal: a parte inteira é o índice e a casa decimal
 * diz o grupo (`.1` mão, `.2` corpo). `12.1` é a arma de duas mãos, que ocupa
 * as duas mãos. Ver `_onToggleItem` em `module/sheets/actor-base.mjs`.
 */
const TWO_HANDED_SLOT = 12.1;
/** `equipamentos.limiteEmpunhado` e `limiteVestido` do sistema. */
const HAND_SLOT_LIMIT = 2;
const BODY_SLOT_LIMIT = 4;

function assignEquipmentSlots(items: FoundryItem[]): void {
  let handsUsed = 0;
  let bodyUsed = 0;

  items.forEach((item) => {
    if (item.type !== 'arma' && item.type !== 'equipamento') return;
    const usesHand = item.type === 'arma' || item.system.tipo === 'escudo';
    const type = usesHand ? 'hand' : 'body';

    if (!item.system.equipado) {
      item.system.equipado2 = { slot: 0, type };
      return;
    }

    let slot = 0;
    if (!usesHand) {
      if (bodyUsed < BODY_SLOT_LIMIT) {
        bodyUsed += 1;
        slot = bodyUsed + 0.2;
      }
    } else if (item.system.empunhadura === 'duas') {
      if (handsUsed === 0) {
        handsUsed = HAND_SLOT_LIMIT;
        slot = TWO_HANDED_SLOT;
      }
    } else if (handsUsed < HAND_SLOT_LIMIT) {
      handsUsed += 1;
      slot = handsUsed + 0.1;
    }

    item.system.equipado2 = { slot, type };
  });
}

function getExpectedType(equipment: Equipment): string {
  if (equipment.group === 'Arma')
    return equipment.isAmmo ? 'consumivel' : 'arma';
  if (equipment.group === 'Armadura' || equipment.group === 'Escudo') {
    return 'equipamento';
  }
  return CONSUMABLE_GROUPS.includes(equipment.group) ? 'consumivel' : 'tesouro';
}

/** `'19/x3'`, `'x3'`, `'19'` → margem de ameaça e multiplicador. */
export function parseCritical(critico: string | undefined): {
  criticoM: number;
  criticoX: number;
} {
  const text = critico ?? '';
  const multiplier = text.match(/x\s*(\d+)/i);
  const threat = text.replace(/x\s*\d+/i, '').match(/\d+/);
  return {
    criticoM: threat ? Number(threat[0]) : 20,
    criticoX: multiplier ? Number(multiplier[1]) : 2,
  };
}

function toAbilityFormula(attribute: WeaponAttribute | undefined): string {
  if (!attribute || attribute === 'Nenhum') return '';
  const key = Object.entries(ATTRIBUTE_KEYS).find(
    ([name]) => name === attribute
  )?.[1];
  return key ? `@${key}` : '';
}

/** Rolagens de ataque e dano da arma. */
function buildWeaponRolls(weapon: Equipment): FoundryRoll[] {
  const purpose = getWeaponPurpose(weapon);
  const isRanged = purpose === 'firing';

  const attack: FoundryRoll = {
    name: 'Ataque',
    key: 'ataque0',
    type: 'ataque',
    parts: [
      ['1d20', '', ''],
      [isRanged ? 'pont' : 'luta', '', ''],
      ['0', '', ''],
    ],
    versatil: '',
    adaptavel: '',
  };
  // Perícia de ataque escolhida pelo jogador no editor da arma (ex.: Atuação).
  const customSkill = weapon.customSkill && FOUNDRY_SKILLS[weapon.customSkill];
  if (customSkill) attack.parts[1][0] = customSkill;
  if (weapon.attackAttribute && weapon.attackAttribute !== 'Nenhum') {
    attack.parts[1][1] = toAbilityFormula(weapon.attackAttribute).slice(1);
  }
  attack.parts[2] = [String(weapon.atkBonus ?? 0), '', ''];

  const damage: FoundryRoll = {
    name: 'Dano',
    key: 'dano1',
    type: 'dano',
    parts: [
      ['0', '', ''],
      [isRanged ? '' : '@for', '', ''],
    ],
    versatil: '',
    adaptavel: '',
  };
  const dice = weapon.dano?.trim();
  if (dice && dice !== '-') damage.parts[0][0] = dice;
  // 'Corte/Perfuração' → o primeiro tipo; o sistema guarda um por parte.
  const damageType = toDamageTypeKey(weapon.tipo?.split(/\/| ou /)[0]);
  if (damageType) damage.parts[0][1] = damageType;
  if (weapon.damageAttribute) {
    damage.parts[1] = [toAbilityFormula(weapon.damageAttribute), '', ''];
  }
  // Dano extra (encantos/melhorias) entra como partes tipadas adicionais.
  damage.parts = [
    ...damage.parts.slice(0, 2),
    ...(weapon.extraDamage ?? []).map((extra) => [
      extra.dice,
      toDamageTypeKey(extra.damageType),
      extra.sourceName ?? '',
    ]),
  ];

  return [attack, damage];
}

function applyWeapon(
  sheet: CharacterSheet,
  weapon: Equipment,
  item: FoundryItem
): void {
  const { system } = item;
  system.rolls = buildWeaponRolls(weapon);

  const { criticoM, criticoX } = parseCritical(weapon.critico);
  system.criticoM = criticoM;
  system.criticoX = criticoX;

  // Arma sem categoria resolvível (custom/homebrew) entra como simples: é a
  // que todo personagem sabe usar.
  const category = getEffectiveWeaponCategory(weapon);
  system.proficiencia = category ? PROFICIENCY_KEYS[category] : 'simples';

  const purpose = getWeaponPurpose(weapon);
  if (purpose === 'melee') system.proposito = 'corpo-a-corpo';
  else if (purpose === 'thrown') system.proposito = 'corpo-a-corpo-arremesso';
  else system.proposito = 'disparo';
  // `leve` não é só rótulo: o sistema troca Força por Destreza em arma leve
  // quando o personagem tem Acuidade (`item.mjs`, `usarAcuidade`).
  const tags = weapon.weaponTags ?? [];
  if (weapon.twoHanded) system.empunhadura = 'duas';
  else system.empunhadura = tags.includes('leve') ? 'leve' : 'uma';

  const properties = tags
    .map((tag) => WEAPON_PROPERTY_KEYS[tag])
    .filter(Boolean);
  if (properties.length > 0) {
    system.propriedades = Object.fromEntries(
      properties.map((key) => [key, true])
    );
  }

  const reach = normalizeReach(weapon.alcance);
  if (reach && REACH_KEYS[reach]) system.alcance = REACH_KEYS[reach];

  // `equipado` de arma é numérico: 0 = guardada, 1 = uma mão, 2 = duas mãos.
  const isHeld =
    !!weapon.id &&
    (weapon.id === sheet.mainHandItemId || weapon.id === sheet.offHandItemId);
  if (!isHeld) system.equipado = 0;
  else system.equipado = weapon.twoHanded ? 2 : 1;
}

/**
 * Mochila da ficha. Fichas vindas do armazenamento podem trazer `bag` como
 * objeto puro (sem os métodos da classe) ou nem trazer — exportar não pode
 * quebrar por isso.
 */
function getBagEquipments(sheet: CharacterSheet): Partial<BagEquipments> {
  return sheet.bag?.equipments ?? {};
}

function isDefenseEquipment(
  equipment: Equipment
): equipment is DefenseEquipment {
  return equipment.group === 'Armadura' || equipment.group === 'Escudo';
}

function isWorn(sheet: CharacterSheet, equipment: DefenseEquipment): boolean {
  if (equipment.group === 'Escudo') {
    return (
      !!equipment.id &&
      (equipment.id === sheet.offHandItemId ||
        equipment.id === sheet.mainHandItemId)
    );
  }
  if (sheet.wornArmorId) return equipment.id === sheet.wornArmorId;
  // Sem escolha registrada, uma única armadura na mochila conta como vestida
  // (mesma regra do PDF).
  return (getBagEquipments(sheet).Armadura ?? []).length === 1;
}

function applyDefense(
  sheet: CharacterSheet,
  equipment: DefenseEquipment,
  item: FoundryItem
): void {
  const { system } = item;
  if (equipment.group === 'Escudo') system.tipo = 'escudo';
  else system.tipo = isHeavyArmor(equipment) ? 'pesada' : 'leve';

  system.armadura = {
    value: equipment.defenseBonus ?? 0,
    // O sistema guarda a penalidade como número negativo.
    penalidade: -Math.abs(equipment.armorPenalty ?? 0),
    maxAtr: 0,
  };
  system.equipado = isWorn(sheet, equipment);
}

/** Melhorias e encantos vão para a descrição: os números já estão no item. */
function describeEnhancements(equipment: Equipment): string {
  const lines: string[] = [];
  const mods = (equipment.modifications ?? []).map((mod) =>
    mod.specialMaterial ? `${mod.mod} (${mod.specialMaterial})` : mod.mod
  );
  if (mods.length > 0) lines.push(`Melhorias: ${mods.join(', ')}`);
  const enchantments = (equipment.enchantments ?? []).map((enchantment) =>
    enchantment.selectedSpell
      ? `${enchantment.enchantment} (${enchantment.selectedSpell})`
      : enchantment.enchantment
  );
  if (enchantments.length > 0)
    lines.push(`Encantos: ${enchantments.join(', ')}`);
  return lines.join('\n');
}

function buildEquipmentItem(
  sheet: CharacterSheet,
  equipment: Equipment
): FoundryItem {
  const notes = [equipment.descricao, describeEnhancements(equipment)]
    .filter(Boolean)
    .join('\n');

  const item: FoundryItem = {
    _id: foundryId(),
    name: equipment.customDisplayName?.trim() || equipment.nome,
    type: getExpectedType(equipment),
    effects: [],
    flags: {},
    system: {
      description: { value: textToHtml(notes), unidentified: '' },
      rolls: buildFormulaRolls(equipment.rolls),
    },
  };
  const { system } = item;

  system.qtd = equipment.quantity ?? 1;
  system.carregado = true;
  if (equipment.spaces !== undefined) system.espacos = equipment.spaces;
  if (equipment.preco !== undefined) system.preco = equipment.preco;
  // As melhorias da ficha já estão nos números exportados; a automação de
  // melhorias do sistema aplicaria tudo de novo.
  const hasEnhancements =
    (equipment.modifications?.length ?? 0) > 0 ||
    (equipment.enchantments?.length ?? 0) > 0;
  if (hasEnhancements) system.enableAutoUpgrades = false;

  if (item.type === 'arma') applyWeapon(sheet, equipment, item);
  else if (isDefenseEquipment(equipment)) {
    applyDefense(sheet, equipment, item);
  } else if (item.type === 'consumivel' && !equipment.isAmmo) {
    const tipo = CONSUMABLE_TYPE_KEYS[equipment.group];
    if (tipo) system.tipo = tipo;
  } else if (equipment.isAmmo && item.type === 'consumivel') {
    system.tipo = 'ammo';
    const units = equipment.unitsRemaining;
    if (units !== undefined && units > 0) {
      // A ficha conta munição por unidade e espaço pela pilha; o Foundry
      // multiplica `espacos` por `qtd`.
      system.qtd = units;
      const perSpace = equipment.ammoUnitsPerSpace ?? 20;
      system.espacos = perSpace > 0 ? 1 / perSpace : 0;
    }
  }

  return item;
}

export function buildEquipmentItems(sheet: CharacterSheet): FoundryItem[] {
  const equipments = getBagEquipments(sheet);
  const groups = Object.keys(equipments) as equipGroup[];

  const items = groups
    .filter((group) => !NON_PHYSICAL_GROUPS.includes(group))
    .flatMap((group) => (equipments[group] ?? []) as Equipment[])
    .filter((equipment) => !!equipment?.nome)
    .map((equipment) => buildEquipmentItem(sheet, equipment));

  assignEquipmentSlots(items);
  return items;
}

/** Valor de um campo `armadura` para o cálculo de Defesa do exportador. */
export function getArmorField(item: FoundryItem, field: string): number {
  const armor: FoundryValue = item.system.armadura;
  if (!isRecord(armor)) return 0;
  const value = armor[field];
  return typeof value === 'number' ? value : 0;
}
