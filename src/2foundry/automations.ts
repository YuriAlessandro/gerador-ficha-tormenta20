import {
  getActiveEffectForSpell,
  getActivePowerForSheetEntry,
} from '@/premium/data/activePowers';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import { calculateBonusValue } from '../functions/recalculateSheet';
import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
  StatModifierTarget,
} from '../interfaces/CharacterSheet';
import { buildChange, buildPassiveEffect } from './effects';
import { ATTRIBUTE_KEYS, toDamageTypeKey } from './enums';
import { FOUNDRY_SKILLS } from './skills';
import { FoundryEffect, FoundryEffectChange } from './types';

/**
 * Automações próprias: os bônus estruturados da ficha convertidos em efeitos do
 * Foundry. Nada vem do compêndio do sistema — as fontes são os mesmos dados que
 * a ficha usa para calcular seus totais:
 *
 * - **Passivos** (`sheet.sheetBonuses`): bônus permanentes de poderes, raça,
 *   itens… Viram efeitos sempre ligados.
 * - **Ativáveis** (catálogo de efeitos ativos, o do botão "Usar" da ficha):
 *   poderes e magias com bônus temporário. Viram efeitos DESLIGADOS no item,
 *   que o jogador liga e desliga na aba de efeitos do ator.
 */
export interface BonusGroup {
  /** Nome mostrado no efeito: o poder, o item, a raça… que concede o bônus. */
  label: string;
  /** Preenchido quando a fonte é um poder — o efeito vai no item do poder. */
  powerName?: string;
  changes: FoundryEffectChange[];
}

export interface SheetAutomations {
  groups: BonusGroup[];
  /** Soma dos bônus de Defesa que o Foundry aplica sozinho via efeito. */
  defense: number;
  /** Bônus de perícia sem fonte exportável, por chave de perícia do Foundry. */
  skillOthers: Record<string, number>;
}

/** Poderes e magias da ficha que têm efeito ativável, pelo nome na ficha. */
export interface SheetToggles {
  powers: Map<string, ActivePowerDefinition>;
  spells: Map<string, ActivePowerDefinition>;
}

type WeaponScope = Extract<
  StatModifierTarget,
  { type: 'WeaponAttack' | 'WeaponDamage' }
>;

/**
 * Bônus de arma → sufixo do modificador do Foundry (`geral`, `cac`, `ad`).
 * `undefined` quando o bônus é restrito a armas específicas (nome, tag,
 * categoria…): o Foundry não tem modificador equivalente, e aplicá-lo a todas
 * as armas seria errado.
 */
function getWeaponScope(target: WeaponScope): string | undefined {
  const isRestricted =
    !!target.weaponName ||
    !!target.weaponTags?.length ||
    !!target.weaponCategories?.length ||
    target.proficiencyRequired ||
    target.lightOrAgileOnly ||
    target.twoHandedOnly ||
    target.swordOnly ||
    target.thrownOnly ||
    target.firingOnly;
  if (isRestricted) return undefined;
  if (target.meleeOnly) return 'cac';
  if (target.rangedOnly) return 'ad';
  return 'geral';
}

/**
 * Chave de mudança do Foundry para o alvo de um bônus.
 *
 * Passivos só cobrem perícias e Defesa: PV, PM, atributos, deslocamento e RD já
 * saem como totais prontos no ator, e bônus de ataque e dano permanentes já
 * estão nos números das armas. Um efeito ativável nasce desligado — nada dele
 * está nos totais —, então pode usar todas as chaves.
 */
function getChangeKey(
  target: StatModifierTarget,
  isToggle: boolean
): string | undefined {
  if (target.type === 'Defense') return 'system.attributes.defesa.bonus';
  if (target.type === 'Skill') {
    const skill = FOUNDRY_SKILLS[target.name];
    return skill ? `system.pericias.${skill}.bonus` : undefined;
  }
  if (!isToggle) return undefined;

  switch (target.type) {
    case 'Attribute':
      return `system.atributos.${ATTRIBUTE_KEYS[target.attribute]}.bonus`;
    case 'DamageReduction': {
      const type = toDamageTypeKey(target.damageType);
      return type ? `system.tracos.resistencias.${type}.bonus` : undefined;
    }
    case 'Displacement':
      // O sistema direciona um `add` nesta chave para o bônus do deslocamento.
      return 'system.attributes.movement.walk';
    case 'AllAttackBonus':
      return 'system.modificadores.ataque.geral';
    case 'WeaponAttack': {
      const scope = getWeaponScope(target);
      return scope ? `system.modificadores.ataque.${scope}` : undefined;
    }
    case 'WeaponDamage': {
      const scope = getWeaponScope(target);
      return scope ? `system.modificadores.dano.${scope}` : undefined;
    }
    default:
      return undefined;
  }
}

function toChanges(
  sheet: CharacterSheet,
  bonuses: Omit<SheetBonus, 'source'>[],
  isToggle: boolean,
  source?: SheetChangeSource
): FoundryEffectChange[] {
  return bonuses.flatMap((bonus) => {
    const key = getChangeKey(bonus.target, isToggle);
    if (!key) return [];
    // O valor é resolvido agora, com o nível e os atributos atuais da ficha.
    const value = calculateBonusValue(sheet, bonus.modifier, source);
    return value ? [buildChange(key, value, 'add')] : [];
  });
}

/**
 * Rótulo da fonte. `undefined` = estado passageiro da ficha (condição, efeito
 * ativo ligado): não vira efeito permanente no Foundry.
 */
function getSourceLabel(source: SheetChangeSource): string | undefined {
  switch (source.type) {
    case 'power':
      return source.name;
    case 'equipment':
      return source.equipmentName;
    case 'race':
      return source.raceName;
    case 'class':
      return source.className;
    case 'origin':
      return source.originName;
    case 'divinity':
      return source.divinityName;
    case 'complication':
      return source.complicationName;
    case 'age':
      return source.ageLabel;
    case 'size':
      return `Tamanho ${source.sizeName}`;
    case 'levelUp':
      return `Nível ${source.level}`;
    case 'manualEdit':
      return 'Ajuste manual';
    default:
      return undefined;
  }
}

/** Efeitos ativáveis que valem para os poderes e magias desta ficha. */
export function findToggles(
  sheet: CharacterSheet,
  powerNames: string[]
): SheetToggles {
  const powers = new Map<string, ActivePowerDefinition>();
  powerNames.forEach((name) => {
    // Primeiro pela classe da ficha (poderes de classe exigem a classe certa);
    // depois só pelo nome, que cobre multiclasse e poderes gerais.
    const definition =
      getActivePowerForSheetEntry(sheet.classe, name) ??
      getActivePowerForSheetEntry(undefined, name);
    if (definition) powers.set(name, definition);
  });

  const spells = new Map<string, ActivePowerDefinition>();
  (sheet.spells ?? []).forEach((spell) => {
    const definition = getActiveEffectForSpell(spell.nome);
    if (definition) spells.set(spell.nome, definition);
  });

  return { powers, spells };
}

/**
 * Opções de uso com valor definido. A opção "customizada" (`scale`) pede um
 * número ao jogador na hora do uso — não há valor para pôr num efeito fixo.
 */
function getFixedOptions(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition
): ActiveEffectUsageOption[] {
  return definition.getUsageOptions(sheet).filter((option) => !option.scale);
}

/** A opção está ligada na ficha neste momento? */
function isActiveNow(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition,
  optionId: string
): boolean {
  return (sheet.activeEffects ?? []).some(
    (effect) =>
      effect.powerKey === definition.key && effect.optionId === optionId
  );
}

/**
 * Um efeito de ligar/desligar por opção de uso do poder ou magia (ex.: os
 * níveis de Fúria). Sai ligado quando a opção está ativa na ficha.
 */
export function buildToggleEffects(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition | undefined
): FoundryEffect[] {
  if (!definition) return [];

  return getFixedOptions(sheet, definition).flatMap((option) => {
    const changes = toChanges(sheet, option.bonuses, true);
    if (changes.length === 0) return [];

    const effect = buildPassiveEffect(
      `${definition.name}: ${option.label}`,
      changes,
      true
    );
    effect.disabled = !isActiveNow(sheet, definition, option.id);
    return [effect];
  });
}

/** Chaves (`powerKey::optionId`) das opções exportadas como efeito ligado. */
function getExportedActiveKeys(
  sheet: CharacterSheet,
  toggles: SheetToggles
): Set<string> {
  const keys = new Set<string>();
  [...toggles.powers.values(), ...toggles.spells.values()].forEach(
    (definition) => {
      getFixedOptions(sheet, definition).forEach((option) => {
        if (
          isActiveNow(sheet, definition, option.id) &&
          toChanges(sheet, option.bonuses, true).length > 0
        ) {
          keys.add(definition.key);
        }
      });
    }
  );
  return keys;
}

export function buildAutomations(
  sheet: CharacterSheet,
  toggles: SheetToggles
): SheetAutomations {
  const groups = new Map<string, BonusGroup>();
  const skillOthers: Record<string, number> = {};
  const exportedActive = getExportedActiveKeys(sheet, toggles);
  let defense = 0;

  // `sheet.sheetBonuses` já chega filtrado por condição e é exatamente o que o
  // recálculo somou: espelhar a lista inteira mantém os totais iguais.
  (sheet.sheetBonuses ?? []).forEach((bonus) => {
    const { source, target } = bonus;
    if (target.type !== 'Defense' && target.type !== 'Skill') return;

    const [change] = toChanges(sheet, [bonus], false, source);
    if (!change) return;
    const value = Number(change.value);

    // Efeito ativo ligado na ficha e exportado como efeito ligado: o Foundry
    // aplica o bônus sozinho.
    if (source.type === 'activeEffect' && exportedActive.has(source.powerKey)) {
      if (target.type === 'Defense') defense += value;
      return;
    }

    const label = getSourceLabel(source);
    if (!label) {
      // A Defesa fecha sozinha pelo `outros` do ator; a perícia precisa levar
      // o valor no `outros` dela.
      if (target.type === 'Skill') {
        const skill = FOUNDRY_SKILLS[target.name];
        if (skill) skillOthers[skill] = (skillOthers[skill] ?? 0) + value;
      }
      return;
    }

    const groupKey = `${source.type}::${label}`;
    const group = groups.get(groupKey) ?? {
      label,
      powerName: source.type === 'power' ? source.name : undefined,
      changes: [],
    };
    group.changes.push(change);
    groups.set(groupKey, group);

    if (target.type === 'Defense') defense += value;
  });

  return { groups: Array.from(groups.values()), defense, skillOthers };
}
