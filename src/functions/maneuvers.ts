import { CharacterAttributes } from '../interfaces/Character';
import CharacterSheet, {
  EnabledManeuver,
  ManeuverId,
} from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { CompleteSkill } from '../interfaces/Skills';
import { Armas } from '../data/systems/tormenta20/equipamentos';
import { sheetHasPowerNamed } from './powers/hasPowerNamed';
import { getWeaponNonProficiencyPenalty } from './proficiencies';
import { countTormentaPowers } from './randomUtils';
import {
  evaluateSimpleModifier,
  isModeScopedForWeapon,
  sumLiveWeaponBonuses,
  weaponMatchesScope,
  WeaponBonusScope,
} from './weaponBonusScope';
import { getWeaponAttackSkillBonus, isWeaponMelee } from './weaponSkill';

export interface ManeuverDefinition {
  id: ManeuverId;
  name: string;
  description: string;
  /** "Você só pode agarrar com um ataque desarmado ou arma natural." */
  requiresUnarmedOrNatural?: boolean;
}

/** Tormenta20, Manobras de Combate (p. 234) e Atropelar (p. 233). */
export const MANEUVERS: ManeuverDefinition[] = [
  {
    id: 'agarrar',
    name: 'Agarrar',
    description:
      'A criatura fica desprevenida e imóvel, sofre –2 nos testes de ataque e só ataca com armas leves. Só com ataque desarmado ou arma natural. Depois de agarrar, você pode trocar um ataque por um teste de agarrar: se vencer, causa dano de impacto igual ao do ataque desarmado ou da arma natural.',
    requiresUnarmedOrNatural: true,
  },
  {
    id: 'atropelar',
    name: 'Atropelar',
    description:
      'Ação padrão durante um movimento (ação livre em uma investida) para avançar pelo espaço de uma criatura. Se ela resistir e você vencer o teste, ela fica caída e você continua o avanço.',
  },
  {
    id: 'derrubar',
    name: 'Derrubar',
    description:
      'O alvo fica caído. Vencendo o teste por 5 ou mais, também é empurrado um quadrado na direção que você escolher.',
  },
  {
    id: 'desarmar',
    name: 'Desarmar',
    description:
      'Você derruba um item que a criatura esteja segurando. Vencendo o teste por 5 ou mais, também empurra o item um quadrado na direção que você escolher.',
  },
  {
    id: 'empurrar',
    name: 'Empurrar',
    description:
      'Você empurra a criatura 1,5m, mais 1,5m para cada 5 pontos de diferença entre os testes. Pode gastar uma ação de movimento para avançar junto.',
  },
  {
    id: 'quebrar',
    name: 'Quebrar',
    description:
      'Você atinge um item que a criatura esteja segurando (veja "Quebrando Objetos").',
  },
];

export const isManeuverId = (value: unknown): value is ManeuverId =>
  MANEUVERS.some((maneuver) => maneuver.id === value);

export const getManeuverDefinition = (id: ManeuverId): ManeuverDefinition =>
  MANEUVERS.find((maneuver) => maneuver.id === id) as ManeuverDefinition;

export const UNARMED_MANEUVER_WEAPON_ID = 'maneuver-unarmed';

/**
 * Quem não é Lutador não tem Ataque Desarmado na mochila, mas pode fazer manobra
 * desarmado. Virtual para não ocupar espaço de arma no PDF nem no inventário.
 */
const VIRTUAL_UNARMED_WEAPON: Equipment = {
  ...Armas.ATAQUE_DESARMADO,
  id: UNARMED_MANEUVER_WEAPON_ID,
  canBeWielded: false,
};

/** Armas que dizem no próprio texto que podem agarrar (Heróis de Arton). */
const GRAPPLING_WEAPON_NAMES = ['Desmontador'];

/** Bônus escritos na descrição das armas de Heróis de Arton. */
const WEAPON_MANEUVER_BONUSES: Record<string, ManeuverId[]> = {
  Malho: ['derrubar', 'empurrar'],
  'Tan-korak': ['derrubar', 'desarmar'],
  Khopesh: ['derrubar'],
};

/** Poderes com bônus fixo em manobras, todos só como texto nos dados. */
const POWER_MANEUVER_BONUSES: {
  power: string;
  maneuvers: ManeuverId[] | 'all';
}[] = [
  { power: 'Derrubar Aprimorado', maneuvers: ['derrubar'] },
  { power: 'Desarmar Aprimorado', maneuvers: ['desarmar'] },
  { power: 'Quebrar Aprimorado', maneuvers: ['quebrar'] },
  { power: 'Quebrar Encanto', maneuvers: ['quebrar'] },
  { power: 'Lutador de Chão', maneuvers: ['agarrar', 'derrubar'] },
  { power: 'Mão na Boca', maneuvers: ['agarrar'] },
  { power: 'Herança de Kundali', maneuvers: 'all' },
];

const canGrapple = (weapon: Equipment): boolean =>
  !!weapon.weaponTags?.some(
    (tag) => tag === 'desarmado' || tag === 'natural'
  ) || GRAPPLING_WEAPON_NAMES.includes(weapon.nome);

/**
 * Armas que podem fazer a manobra: corpo a corpo da mochila e virtuais (Forma
 * Selvagem), mais o desarmado virtual quando a mochila não tem um.
 */
export function getManeuverWeaponOptions(
  id: ManeuverId,
  weapons: Equipment[]
): Equipment[] {
  const melee = weapons.filter(
    (weapon) => !weapon.isAmmo && isWeaponMelee(weapon)
  );
  const hasUnarmed = melee.some((weapon) =>
    weapon.weaponTags?.includes('desarmado')
  );
  const options = hasUnarmed ? melee : [...melee, VIRTUAL_UNARMED_WEAPON];
  return getManeuverDefinition(id).requiresUnarmedOrNatural
    ? options.filter(canGrapple)
    : options;
}

/**
 * Arma da linha: a escolhida, se ainda for opção (pode ter sido vendida); senão
 * a empunhada; senão a primeira opção.
 */
export function resolveManeuverWeapon(
  maneuver: EnabledManeuver,
  options: Equipment[],
  mainHandItemId?: string,
  offHandItemId?: string
): Equipment {
  const byId = (id?: string) =>
    id ? options.find((weapon) => weapon.id === id) : undefined;
  return (
    byId(maneuver.weaponId) ??
    byId(mainHandItemId) ??
    byId(offHandItemId) ??
    options[0]
  );
}

export interface ManeuverBonusPart {
  label: string;
  value: number;
}

export interface ManeuverBonus {
  total: number;
  parts: ManeuverBonusPart[];
}

export interface ManeuverBonusContext {
  sheet: CharacterSheet;
  completeSkills: CompleteSkill[] | undefined;
  atributos: CharacterAttributes;
  classLevels?: Map<string, number>;
  proficiencias?: string[];
}

/**
 * `applyWeaponBonuses` só baka em armas da mochila. Arma virtual não tem
 * `atkBonus` com Fúria e afins, então eles são somados aqui. Os de escopo por
 * modo ficam com `sumLiveWeaponBonuses`, senão contariam duas vezes.
 */
function sumBonusesNotBakedInVirtualWeapon(
  weapon: Equipment,
  { sheet, atributos, classLevels }: ManeuverBonusContext,
  isProficient: boolean
): number {
  return (sheet.sheetBonuses ?? []).reduce((sum, bonus) => {
    if (bonus.target.type !== 'WeaponAttack') return sum;
    const scope = bonus.target as WeaponBonusScope & {
      proficiencyRequired?: boolean;
    };
    if (isModeScopedForWeapon(weapon, scope)) return sum;
    if (!weaponMatchesScope(weapon, scope)) return sum;
    if (scope.proficiencyRequired && !isProficient) return sum;
    return (
      sum +
      evaluateSimpleModifier(bonus.modifier, atributos, sheet.nivel, {
        classLevels,
        source: bonus.source,
      })
    );
  }, 0);
}

/**
 * Bônus do teste de manobra: "um teste de ataque corpo a corpo", logo os mesmos
 * componentes da linha da arma (`Weapon.tsx`), mais o que só vale para manobra.
 */
export function getManeuverBonus(
  id: ManeuverId,
  weapon: Equipment,
  context: ManeuverBonusContext
): ManeuverBonus {
  const { sheet, completeSkills, atributos, classLevels, proficiencias } =
    context;
  const proficiencyPenalty = proficiencias
    ? getWeaponNonProficiencyPenalty(weapon, proficiencias)
    : 0;
  const isProficient = proficiencyPenalty === 0;
  const isBagWeapon = (sheet.bag?.equipments?.Arma ?? []).some(
    (item) => item.id === weapon.id
  );

  const weaponBonus =
    (weapon.atkBonus ?? 0) +
    sumLiveWeaponBonuses(weapon, sheet.sheetBonuses, 'WeaponAttack', {
      atributos,
      nivel: sheet.nivel,
      classLevels,
      isProficient,
    }) +
    (isBagWeapon
      ? 0
      : sumBonusesNotBakedInVirtualWeapon(weapon, context, isProficient));

  const parts: ManeuverBonusPart[] = [
    {
      label: 'Perícia',
      value: getWeaponAttackSkillBonus(weapon, completeSkills, atributos),
    },
    { label: 'Bônus de ataque', value: weaponBonus },
    { label: 'Sem proficiência', value: proficiencyPenalty },
    { label: 'Tamanho', value: sheet.size?.modifiers?.maneuver ?? 0 },
  ];

  POWER_MANEUVER_BONUSES.forEach(({ power, maneuvers }) => {
    if (
      (maneuvers === 'all' || maneuvers.includes(id)) &&
      sheetHasPowerNamed(sheet, power)
    ) {
      parts.push({ label: power, value: 2 });
    }
  });

  // +1, mais +1 para cada dois OUTROS poderes da Tormenta.
  if (id === 'agarrar' && sheetHasPowerNamed(sheet, 'Mãos Membranosas')) {
    parts.push({
      label: 'Mãos Membranosas',
      value: 1 + Math.floor(Math.max(countTormentaPowers(sheet) - 1, 0) / 2),
    });
  }

  if (weapon.modifications?.some((mod) => mod.mod === 'Equilibrada')) {
    parts.push({ label: 'Equilibrada', value: 2 });
  }

  if (WEAPON_MANEUVER_BONUSES[weapon.nome]?.includes(id)) {
    parts.push({ label: weapon.nome, value: 2 });
  }

  const nonZeroParts = parts.filter((part) => part.value !== 0);
  return {
    total: nonZeroParts.reduce((sum, part) => sum + part.value, 0),
    parts: nonZeroParts,
  };
}
