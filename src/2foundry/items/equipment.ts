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
import Skill from '../../interfaces/Skills';
import { isRecord } from '../effects';
import { ATTRIBUTE_KEYS, toDamageTypeKey } from '../enums';
import { foundryId, textToHtml } from '../normalize';
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
  if (weapon.customSkill === Skill.PONTARIA) attack.parts[1][0] = 'pont';
  if (weapon.customSkill === Skill.LUTA) attack.parts[1][0] = 'luta';
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
  system.empunhadura = weapon.twoHanded ? 'duas' : 'uma';

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

  return groups
    .filter((group) => !NON_PHYSICAL_GROUPS.includes(group))
    .flatMap((group) => (equipments[group] ?? []) as Equipment[])
    .filter((equipment) => !!equipment?.nome)
    .map((equipment) => buildEquipmentItem(sheet, equipment));
}

/** Valor de um campo `armadura` para o cálculo de Defesa do exportador. */
export function getArmorField(item: FoundryItem, field: string): number {
  const armor: FoundryValue = item.system.armadura;
  if (!isRecord(armor)) return 0;
  const value = armor[field];
  return typeof value === 'number' ? value : 0;
}
